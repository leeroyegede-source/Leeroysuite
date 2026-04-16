import Stripe from 'stripe';
import { SystemSettings } from '@/lib/db';
import { PaymentGateway, CheckoutParams, CheckoutResult, VerifyResult } from './gateway-factory';

export class StripeGateway implements PaymentGateway {
    readonly name = 'stripe';
    private stripe: Stripe;

    constructor(private settings: SystemSettings) {
        const key = settings.stripeSecretKey || process.env.STRIPE_SECRET_KEY;
        if (!key) throw new Error('Stripe secret key is not configured.');
        this.stripe = new Stripe(key, { apiVersion: '2024-12-18.acacia' as any });
    }

    async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: params.customerEmail,
            line_items: [
                {
                    price_data: {
                        currency: params.currency.toLowerCase(),
                        product_data: {
                            name: `AI Suite - ${params.planName}`,
                            description: `${params.tokens.toLocaleString()} tokens`,
                        },
                        unit_amount: Math.round(params.price * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
            metadata: {
                userId: params.userId,
                userEmail: params.customerEmail,
                planId: params.planId,
            },
        });

        return { url: session.url!, sessionId: session.id };
    }

    async verifyPayment(sessionId: string, _payerId?: string): Promise<VerifyResult> {
        const session = await this.stripe.checkout.sessions.retrieve(sessionId);
        return {
            paid: session.payment_status === 'paid',
            sessionId: session.id,
            userId: session.metadata?.userId || '',
            userEmail: session.metadata?.userEmail || session.customer_details?.email || '',
            planId: session.metadata?.planId || '',
        };
    }
}
