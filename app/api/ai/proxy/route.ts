import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { getModelById, AVAILABLE_MODELS } from '@/lib/models';

export async function POST(req: Request) {
    try {
        const session: any = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        // Support both structures
        const tool = body.tool || "unknown";
        const prompt = body.prompt;
        const modelId = body.model || 'gemini-2.5-flash';
        const aiModel = getModelById(modelId) || getModelById('gemini-2.5-flash') || AVAILABLE_MODELS[0];
        const provider = aiModel.provider;

        let content = body.content;

        // 0. Plan Entitlement Verification
        const user = await db.getUser(session.email);
        
        if (user && user.role !== 'admin' && tool !== 'support-agent' && tool !== 'dashboard' && tool !== 'unknown') {
             const userPlan = await db.getUserPlan(session.email);
             if (userPlan.planName !== 'Enterprise' && (!userPlan.aiTools || !userPlan.aiTools.includes(tool))) {
                 return NextResponse.json({ 
                     error: `Forbidden. The '${tool}' tool is not included in your current plan.` 
                 }, { status: 403 });
             }
        }

        // If simple prompt is provided, convert to Gemini/OpenAI format
        if (!content && prompt) {
            if (provider === "openai") {
                content = {
                    messages: [{ role: "user", content: prompt }],
                    model: aiModel.id
                };
            } else {
                content = {
                    contents: [{ parts: [{ text: prompt }] }]
                };
            }
        }

        console.log(`AI Proxy: ${tool} using ${aiModel.id} (${provider})`);

        // 1. Check token balance
        // Dynamic cost based on Admin Token Economics Settings
        const settings = await db.getSettings();
        const baseCost = settings.aiLimits[tool] || 10;

        // Applying a multiplier if it's the more expensive open_ai model
        let cost = baseCost;
        if (provider === "openai") cost = Math.ceil(baseCost * 1.5);

        const balance = await db.getTokenBalance(session.email);
        if (balance.balance < cost) {
            return NextResponse.json({
                error: 'Insufficient tokens. Please top up your balance.'
            }, { status: 402 });
        }

        // 2. Call AI Provider
        let result;

        if (provider === "openai") {
            const apiKey = process.env[aiModel.envKey || ''] || process.env.OPENAI_API_KEY;
            if (!apiKey || apiKey === "*************************") {
                throw new Error("in the demo we are not added the openAi key");
            }

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify(content)
            });

            if (!response.ok) {
                const err = await response.json();
                
                if (response.status === 429 || err.error?.message?.includes("exceeded your current quota") || err.error?.code === "insufficient_quota") {
                    throw new Error("Many users are currently using the project, so the API quota has been temporarily exceeded. There is no issue with the project. Please wait for a while and try again.");
                }

                throw new Error(err.error?.message || "OpenAI API Error");
            }

            const data = await response.json();
            result = {
                content: data.choices[0].message.content,
                raw: data
            };

        } else {
            // Default: Gemini
            const apiKey = process.env[aiModel.envKey || ''] || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
            if (!apiKey) throw new Error("Gemini API Key not configured");

            // Use generic Gemini model
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${aiModel.id}:generateContent`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "X-goog-api-key": apiKey,
                },
                body: JSON.stringify(content)
            });

            if (!response.ok) {
                const err = await response.json();
                console.error("Gemini Error:", JSON.stringify(err));

                // Handle Quota Error
                if (response.status === 429 || err.error?.message?.includes("exceeded your current quota") || err.error?.status === "RESOURCE_EXHAUSTED") {
                    throw new Error("Many users are currently using the project, so the API quota has been temporarily exceeded. There is no issue with the project. Please wait for a while and try again.");
                }

                throw new Error(err.error?.message || "Gemini API Error");
            }

            const data = await response.json();

            // Extract text from Gemini response
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            result = {
                content: text,
                text: text, // Compatibility
                result: text, // Compatibility
                raw: data
            };
        }

        // 3. Deduct tokens on success
        await db.updateTokenBalance(session.email, cost, 'consume', tool);

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('AI Proxy Error:', error);
        return NextResponse.json({
            error: error.message || 'AI request failed'
        }, { status: 500 });
    }
}
