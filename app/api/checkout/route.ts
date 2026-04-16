import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { getGateway } from '@/lib/gateways/gateway-factory';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const session: any = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { planId } = body;

        console.log("Checkout request for plan:", planId);

        const plans = await db.getPlans();
        const plan = plans.find(p => p.id === planId);

        if (!plan) {
            console.error("Plan not found:", planId);
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        console.log(`Plan data: ID=${plan.id}, Price=${plan.price}, Tokens=${plan.tokens}`);

        let userId = session.id;

        if (!userId) {
            const user = await db.getUser(session.email);
            if (user) userId = user.id;
        }

        if (!userId || !session.email) {
            return NextResponse.json({ error: 'User information missing' }, { status: 500 });
        }

        const settings = await db.getSettings();
        if (!settings.paymentEnabled) {
            return NextResponse.json({ error: 'Payments are currently disabled' }, { status: 400 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
        const currency = (settings.metadata?.platformCurrency || 'USD').toLowerCase();

        // Skip gateway for free plans ($0)
        if (plan.price <= 0) {
            console.log(`Bypassing gateway for free plan: ${plan.id}`);
            const successUrl = `${appUrl}/pricing?success=true&gateway=free&session_id=free_${Date.now()}&planId=${plan.id}`;
            return NextResponse.json({ url: successUrl, sessionId: `free_${Date.now()}` });
        }

        const gateway = getGateway(settings);
        const result = await gateway.createCheckout({
            planName: plan.name,
            planId: plan.id,
            price: plan.price,
            tokens: plan.tokens,
            currency,
            customerEmail: session.email,
            userId,
            successUrl: `${appUrl}/pricing?success=true&gateway=${gateway.name}&session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${appUrl}/pricing?canceled=true`,
        });

        return NextResponse.json({ url: result.url, sessionId: result.sessionId });

    } catch (error: any) {
        console.error("Checkout initialization failed:", error);
        return NextResponse.json({ error: `Checkout initialization failed: ${error.message}` }, { status: 500 });
    }
}
