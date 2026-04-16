import { NextResponse } from 'next/server';
import { PayPalGateway } from '@/lib/gateways/paypal';
import { SystemSettings } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { paypalClientId, paypalClientSecret, paypalMode } = await req.json();

        if (!paypalClientId || !paypalClientSecret) {
            return NextResponse.json({ error: 'Incomplete PayPal configuration' }, { status: 400 });
        }

        // Mock the settings object for the gateway
        const mockSettings: SystemSettings = {
            defaultTokens: 0,
            aiLimits: {},
            paymentEnabled: true,
            paypalClientId,
            paypalClientSecret,
            paypalMode,
        };

        const gateway = new PayPalGateway(mockSettings);
        await gateway.testConnection();

        return NextResponse.json({ success: true, message: 'PayPal connection successful!' });

    } catch (error: any) {
        console.error('Test PayPal Error:', error);
        return NextResponse.json({ 
            error: error.message || 'Failed to connect to PayPal',
        }, { status: 500 });
    }
}
