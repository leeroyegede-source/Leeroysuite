import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export async function POST(req: Request) {
    try {
        if (!apiKey) {
            return NextResponse.json(
                { error: "Gemini API Key not configured" },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { key, sourceText, targetLanguages } = body;

        if (!key || !sourceText || !targetLanguages || !Array.isArray(targetLanguages) || targetLanguages.length === 0) {
            return NextResponse.json(
                { error: "key, sourceText, and targetLanguages[] are required" },
                { status: 400 }
            );
        }

        const ai = new GoogleGenAI({ apiKey });

        const languageList = targetLanguages
            .map((l: { code: string; name: string }) => `${l.name} (${l.code})`)
            .join(", ");

        const prompt = `You are a professional translator. Translate the following text into these languages: ${languageList}.

Text to translate: "${sourceText}"

Return ONLY a valid JSON object where keys are the language codes and values are the translated strings. Do not include any other text, explanation, or markdown formatting. Example format:
{"fr": "translated text", "ar": "translated text"}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const rawText = response.text?.trim() || "";
        
        // Try to extract JSON from the response
        let suggestions: Record<string, string> = {};
        try {
            // Remove markdown code fences if present
            const jsonStr = rawText
                .replace(/^```json?\s*/i, "")
                .replace(/\s*```$/i, "")
                .trim();
            suggestions = JSON.parse(jsonStr);
        } catch {
            console.error("Failed to parse AI response:", rawText);
            return NextResponse.json(
                { error: "AI returned invalid format. Please try again." },
                { status: 422 }
            );
        }

        return NextResponse.json({ suggestions });
    } catch (error: any) {
        console.error("AI translation error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate AI translations" },
            { status: 500 }
        );
    }
}
