import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db, PaymentRecord, SubscriptionRecord } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const settings = await db.getSettings();

        // Razorpay sends webhook with X-Razorpay-Signature header
        const receivedSignature = req.headers.get('x-razorpay-signature');
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (webhookSecret && receivedSignature) {
            const rawBody = JSON.stringify(body);
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(rawBody)
                .digest('hex');
            if (expectedSignature !== receivedSignature) {
                return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
            }
        }

        const event = body.event;
        if (event !== 'payment_link.paid') {
            return NextResponse.json({ received: true });
        }

        const payload = body.payload?.payment_link?.entity;
        if (!payload) return NextResponse.json({ received: true });

        const linkId = payload.id;
        const notes = payload.notes || {};
        const userId = notes.userId || '';
        const userEmail = notes.userEmail || '';
        const planId = notes.planId || '';

        if (!userEmail || !planId) return NextResponse.json({ received: true });

        // Idempotency check
        const payments = await db.getPayments(100);
        if (payments.find(p => p.id === linkId)) {
            return NextResponse.json({ message: 'Already processed' });
        }

        const plans = await db.getPlans();
        const plan = plans.find(p => p.id === planId);
        if (!plan) return NextResponse.json({ received: true });

        const payment: PaymentRecord = {
            id: linkId, userId, userEmail, planId,
            amount: plan.price, status: 'succeeded',
            paymentGateway: 'razorpay',
            createdAt: new Date().toISOString()
        };
        await db.savePayment(payment);
        await db.updateTokenBalance(userEmail, plan.tokens, 'add', `Purchase: ${plan.name}`);

        const subscription: SubscriptionRecord = {
            id: linkId, userEmail, planId, status: 'active',
            createdAt: new Date().toISOString()
        };
        await db.saveSubscription(subscription);

        console.log(`[Razorpay Webhook] Credited ${plan.tokens} tokens to ${userEmail}`);
        return NextResponse.json({ received: true });

    } catch (err: any) {
        console.error("Razorpay webhook error:", err);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
