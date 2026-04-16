import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { createSession } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        console.log("workiiing");

        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const user = await db.getUser(email);
        if (!user || user.status === 'disabled') {
            return NextResponse.json({ error: 'Invalid credentials or account disabled' }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user.password || '');
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        let role = user.role;
        const cookieStore = await cookies();
        const adminIntent = cookieStore.get('admin_intent')?.value;

        if (adminIntent === 'true') {
            role = 'admin';
            // Update role in DB too if it wasn't admin
            if (user.role !== 'admin') {
                await db.saveUser({ ...user, role: 'admin' });
            }
            cookieStore.delete('admin_intent'); // Clean up
        }

        await createSession({ id: user.id, email: user.email, role, name: user.name, disabledFeatures: user.disabledFeatures || [] });

        const tokens = await db.getTokenBalance(user.email);
        const planDetails = await db.getUserPlan(user.email);
 
        return NextResponse.json({
            success: true,
            user: {
                email: user.email,
                name: user.name,
                role,
                tokens: tokens.balance,
                planName: planDetails.planName,
                aiTools: planDetails.aiTools
            }
        });
    } catch (error: any) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
