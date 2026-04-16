import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db, PricingPlan } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session: any = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        // Retrieve existing plans to check existence if strict, but savePlan handles upsert.
        // We'll just overwrite with the provided data, ensuring ID matches
        const updatedPlan: PricingPlan = {
            id: id,
            name: body.name,
            price: Number(body.price),
            tokens: Number(body.tokens),
            interval: body.interval || 'month',
            features: body.features || [],
            aiTools: body.aiTools || [],
            isActive: body.isActive
        };

        await db.savePlan(updatedPlan);
        return NextResponse.json(updatedPlan);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session: any = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await db.deletePlan(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
    }
}
