import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const session: any = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const users = await db.listUsers();
        // Remove passwords from response
        const sanitizedUsers = users.map(({ password, ...rest }) => rest);

        return NextResponse.json(sanitizedUsers);
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session: any = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { email, name, role, status = 'active', tokens = 0 } = body;

        if (!email || !name) {
            return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
        }

        const newUser = {
            email,
            name,
            role: role || 'user',
            status,
            tokens,
            createdAt: new Date().toISOString(),
            // Default empty features
            disabledFeatures: []
        };

        await db.saveUser(newUser);

        // Also initialize token balance if tokens > 0
        if (tokens > 0) {
            try {
                await db.updateTokenBalance(email, tokens, 'add', 'Initial allocation');
            } catch (e) {
                console.error("Failed to initialize tokens", e);
                // Non-fatal, user created
            }
        }

        return NextResponse.json({ success: true, user: newUser });
    } catch (error: any) {
        console.error("Create user error:", error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session: any = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { email, updates } = await req.json();
        const user = await db.getUser(email);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updatedUser = { ...user, ...updates };
        // Ensure strictly limited updates if needed, but for admin, ...updates is fine as long as we sanitized input or trust admin.
        // Specifically for disabledFeatures:
        if (updates.disabledFeatures) {
            updatedUser.disabledFeatures = updates.disabledFeatures;
        }

        await db.saveUser(updatedUser);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session: any = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        await db.deleteUser(email);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete user error:", error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
