import { NextResponse } from 'next/server';
import axios from 'axios';
import { db, PaymentRecord, SubscriptionRecord } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const settings = await db.getSettings();

        // Verify the webhook event by checking with PayPal
        const eventType = body.event_type;
        if (eventType !== 'CHECKOUT.ORDER.APPROVED' && eventType !== 'PAYMENT.CAPTURE.COMPLETED') {
            return NextResponse.json({ received: true });
        }

        const resource = body.resource;
        const orderId = resource?.id || resource?.supplementary_data?.related_ids?.order_id;

        if (!orderId) {
            return NextResponse.json({ received: true });
        }

        // Verify order with PayPal
        const paypalMode = settings.paypalMode || 'sandbox';
        const paypalBase = paypalMode === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';

        const auth = Buffer.from(`${settings.paypalClientId}:${settings.paypalClientSecret}`).toString('base64');
        const tokenRes = await axios.post(`${paypalBase}/v1/oauth2/token`, 'grant_type=client_credentials', {
            headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        // Capture the order if not already captured
        try {
            await axios.post(`${paypalBase}/v2/checkout/orders/${orderId}/capture`, {}, {
                headers: { Authorization: `Bearer ${tokenRes.data.access_token}`, 'Content-Type': 'application/json' }
            });
        } catch (err: any) {
            if (err?.response?.data?.details?.[0]?.issue !== 'ORDER_ALREADY_CAPTURED') {
                console.error('PayPal capture error:', err?.response?.data);
            }
        }

        // Get order details
        const orderRes = await axios.get(`${paypalBase}/v2/checkout/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${tokenRes.data.access_token}` }
        });

        if (orderRes.data.status !== 'COMPLETED') {
            return NextResponse.json({ received: true });
        }

        const customId = orderRes.data.purchase_units?.[0]?.custom_id;
        if (!customId) return NextResponse.json({ received: true });

        let userId = '', userEmail = '', planId = '';
        try {
            const meta = JSON.parse(customId);
            userId = meta.userId || '';
            userEmail = meta.userEmail || '';
            planId = meta.planId || '';
        } catch { return NextResponse.json({ received: true }); }

        if (!userEmail || !planId) return NextResponse.json({ received: true });

        // Idempotency check
        const payments = await db.getPayments(100);
        if (payments.find(p => p.id === orderId)) {
            return NextResponse.json({ message: 'Already processed' });
        }

        const plans = await db.getPlans();
        const plan = plans.find(p => p.id === planId);
        if (!plan) return NextResponse.json({ received: true });

        const payment: PaymentRecord = {
            id: orderId, userId, userEmail, planId,
            amount: plan.price, status: 'succeeded',
            paymentGateway: 'paypal',
            createdAt: new Date().toISOString()
        };
        await db.savePayment(payment);
        await db.updateTokenBalance(userEmail, plan.tokens, 'add', `Purchase: ${plan.name}`);

        const subscription: SubscriptionRecord = {
            id: orderId, userEmail, planId, status: 'active',
            createdAt: new Date().toISOString()
        };
        await db.saveSubscription(subscription);

        console.log(`[PayPal Webhook] Credited ${plan.tokens} tokens to ${userEmail}`);
        return NextResponse.json({ received: true });

    } catch (err: any) {
        console.error("PayPal webhook error:", err);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
