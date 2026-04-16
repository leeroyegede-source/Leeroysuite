import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db, PricingPlan } from '@/lib/db';

export async function GET() {
    try {
        const plans = await db.getPlans();
        const settings = await db.getSettings();

        // Filter out inactive plans for non-admin users if necessary, 
        // but usually we want to fetch all for display and let frontend filter, 
        // or just return active ones for public.
        // Let's return all for now, frontend can filter based on isActive.

        return NextResponse.json({
            plans,
            paymentEnabled: settings.paymentEnabled
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session: any = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const newPlan: PricingPlan = {
            id: body.id || crypto.randomUUID(),
            name: body.name,
            price: Number(body.price),
            tokens: Number(body.tokens),
            interval: body.interval || 'month',
            features: body.features || [],
            aiTools: body.aiTools || [],
            isActive: body.isActive !== false
        };

        await db.savePlan(newPlan);
        return NextResponse.json(newPlan);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
    }
}
