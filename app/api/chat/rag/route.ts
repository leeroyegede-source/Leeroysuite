import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateGroundedResponseV3 } from '@/lib/rag';

export async function POST(req: Request) {
    let body;
    try {
        body = await req.json();
    } catch (e) {
        console.error("[ROUTE] JSON_PARSE_FAIL: Request body is empty or malformed");
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    try {
        const session: any = await getSession();
        const { prompt, supportEmail } = body;

        let targetUserEmail = session?.email || supportEmail;

        if (!targetUserEmail) {
            return NextResponse.json({
                error: `Unauthorized. No session or supportEmail provided.`
            }, { status: 401 });
        }

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const settings = await db.getSettings();
        const cost = settings.aiLimits['live-chat'] || 15;
        const balance = await db.getTokenBalance(targetUserEmail);

        if (balance.balance < cost) {
            return NextResponse.json({
                error: 'Insufficient tokens.'
            }, { status: 402 });
        }

        const answer = await generateGroundedResponseV3(targetUserEmail, prompt);

        await db.updateTokenBalance(targetUserEmail, cost, 'consume', 'Live Chat RAG');

        return NextResponse.json({
            content: answer,
            text: answer
        });

    } catch (error: any) {
        console.error('Chat RAG Error [ROUTE]:', error.message);
        return NextResponse.json({
            error: error.message || 'Request failed'
        }, { status: 500 });
    }
}
