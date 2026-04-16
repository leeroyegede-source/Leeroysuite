import { SystemSettings } from '@/lib/db';
import { StripeGateway } from './stripe';
import { PayPalGateway } from './paypal';

export interface CheckoutParams {
    planName: string;
    planId: string;
    price: number;           // in major currency units (e.g. 10.00 = $10)
    tokens: number;
    currency: string;
    customerEmail: string;
    userId: string;
    successUrl: string;
    cancelUrl: string;
}

export interface CheckoutResult {
    url: string;
    sessionId: string;
}

export interface VerifyResult {
    paid: boolean;
    sessionId: string;
    userId?: string;
    userEmail?: string;
    planId?: string;
    providerStatus?: string;
    error?: string;
    recoveryUrl?: string; // Standard for PayPal INSTRUMENT_DECLINED
}

export interface PaymentGateway {
    readonly name: string;
    createCheckout(params: CheckoutParams): Promise<CheckoutResult>;
    verifyPayment(sessionId: string, payerId?: string): Promise<VerifyResult>;
}

export function getGateway(settings: SystemSettings): PaymentGateway {
    const gateway = settings.paymentGateway || 'stripe';

    switch (gateway) {
        case 'stripe':
            return new StripeGateway(settings);
        case 'paypal':
            return new PayPalGateway(settings);
        default:
            throw new Error(`Unsupported payment gateway: ${gateway}`);
    }
}
