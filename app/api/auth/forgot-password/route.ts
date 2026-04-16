import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
}

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const user = await db.getUser(email);

        if (!user) {
            // Return success even if user not found to prevent email enumeration
            return NextResponse.json({ success: true, message: 'If the email is registered, an OTP will be sent.' });
        }

        const otp = generateOTP();

        // Save OTP to database (valid for 15 minutes)
        await db.createResetToken(email, otp, 15);

        // Send Email
        const htmlContext = `
            <h2>Password Reset Request</h2>
            <p>You have requested to reset your password.</p>
            <p>Your One-Time Password (OTP) is: <strong>${otp}</strong></p>
            <p>This OTP is valid for 15 minutes. Please do not share it with anyone.</p>
            <p>If you did not request this, please ignore this email.</p>
        `;

        const result = await sendEmail({
            to: email,
            subject: 'Your Password Reset OTP',
            html: htmlContext
        });

        if (!result.success) {
            return NextResponse.json({ error: `Failed to send OTP email: ${result.error}` }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'OTP sent successfully' });

    } catch (error) {
        console.error('Forgot Password API Error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
