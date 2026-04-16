import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { smtp } = await req.json();

        if (!smtp || !smtp.host || !smtp.user || !smtp.pass) {
            return NextResponse.json({ error: 'Incomplete SMTP configuration' }, { status: 400 });
        }

        const transporter = nodemailer.createTransport({
            host: smtp.host,
            port: Number(smtp.port) || 587,
            secure: Number(smtp.port) === 465,
            auth: {
                user: smtp.user,
                pass: smtp.pass,
            },
        });

        const info = await transporter.sendMail({
            from: smtp.from || smtp.user,
            to: smtp.from || smtp.user, // Send to self as a test
            subject: 'Test Email from AI Suite',
            html: '<p>This is a test email to verify your SMTP configuration.</p>',
        });

        return NextResponse.json({ success: true, message: 'Test email sent successfully' });

    } catch (error: any) {
        console.error('Test Email Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to send test email' }, { status: 500 });
    }
}
