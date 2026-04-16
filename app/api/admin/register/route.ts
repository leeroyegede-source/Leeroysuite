import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { createSession } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const existingUser = await db.getUser(email);
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Force admin role for this route
        const role = 'admin';

        const newUser: any = {
            name,
            email,
            password: hashedPassword,
            role,
            status: 'active',
            createdAt: new Date().toISOString()
        };

        const savedUser = await db.saveUser(newUser);
 
        // Auto-login after registration
        const tokens = await db.getTokenBalance(email);
        const planDetails = await db.getUserPlan(email);
 
        await createSession({ 
            id: savedUser.id, 
            email, 
            role, 
            name, 
            disabledFeatures: [],
            planName: planDetails.planName,
            aiTools: planDetails.aiTools
        });
 
        return NextResponse.json({
            success: true,
            user: { 
                email, 
                name, 
                role,
                tokens: tokens.balance,
                planName: planDetails.planName,
                aiTools: planDetails.aiTools
            }
        });
    } catch (error: any) {
        console.error('Admin Registration Error:', error);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
