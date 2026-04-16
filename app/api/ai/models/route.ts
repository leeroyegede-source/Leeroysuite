
import { NextResponse } from 'next/server';
import { AVAILABLE_MODELS } from '@/lib/models';

export async function GET() {
    try {
        const models = AVAILABLE_MODELS.map(model => {
            const keyValue = model.envKey ? process.env[model.envKey] : null;
            const isEnvConfigured = !!keyValue && !keyValue.startsWith('*****');
            return {
                ...model,
                isEnvConfigured
            };
        });

        return NextResponse.json({ models });
    } catch (error) {
        console.error('Failed to fetch models:', error);
        return NextResponse.json(
            { error: 'Failed to fetch models' },
            { status: 500 }
        );
    }
}
