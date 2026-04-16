import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db, PaymentRecord, SubscriptionRecord } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const settings = await db.getSettings();
        const stripeKey = settings.stripeSecretKey || process.env.STRIPE_SECRET_KEY;
        if (!stripeKey) {
            console.error("Missing STRIPE_SECRET_KEY");
            return NextResponse.json({ error: 'Stripe configuration error' }, { status: 500 });
        }

        const stripe = new Stripe(stripeKey, {
            apiVersion: '2024-12-18.acacia' as any
        });

        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error("Missing STRIPE_WEBHOOK_SECRET");
            return NextResponse.json({ error: 'Stripe configuration error' }, { status: 500 });
        }

        const body = await req.text();
        const signature = req.headers.get('stripe-signature') as string;

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            console.error(`Webhook signature verification failed: ${err.message}`);
            return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            const userId = session.metadata?.userId || 'unknown-user-id';
            const userEmail = session.metadata?.userEmail || session.customer_details?.email;
            const planId = session.metadata?.planId;

            if (userEmail && planId) {
                // Check idempotency: ensure payment isn't already processed
                const payments = await db.getPayments(100);
                const existingPayment = payments.find(p => p.id === session.id);

                if (existingPayment) {
                    console.log(`Payment mapping already processed for session ${session.id}`);
                    return NextResponse.json({ message: 'Already processed' });
                }

                const plans = await db.getPlans();
                const plan = plans.find(p => p.id === planId);

                if (plan) {
                    // Save as new Payment, using Stripe session ID as true idempotency key
                    const payment: PaymentRecord = {
                        id: session.id,
                        userId: userId,
                        userEmail: userEmail,
                        planId: planId,
                        amount: plan.price,
                        status: 'succeeded',
                        createdAt: new Date().toISOString()
                    };
                    await db.savePayment(payment);

                    // Credit tokens
                    await db.updateTokenBalance(
                        userEmail,
                        plan.tokens,
                        'add',
                        `Purchase: ${plan.name}`
                    );

                    // Save Subscription so AI Tools unlock
                    const subscription: SubscriptionRecord = {
                        id: session.id,
                        userEmail: userEmail,
                        planId: planId,
                        status: 'active',
                        createdAt: new Date().toISOString()
                    };
                    await db.saveSubscription(subscription);

                    console.log(`Successfully credited ${plan.tokens} tokens to ${userEmail}`);
                }
            } else {
                console.error("Missing metadata in checkout session:", session.metadata);
            }
        }

        return NextResponse.json({ received: true });

    } catch (err: any) {
        console.error("Webhook processing error:", err);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
