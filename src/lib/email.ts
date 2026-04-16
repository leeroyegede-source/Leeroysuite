import nodemailer from 'nodemailer';
import { db } from './db';

// Create a reusable transporter using dynamic settings or env vars
async function createTransporter() {
    try {
        const settings = await db.getSettings();
        const smtp = settings.metadata?.smtp;

        if (smtp?.host && smtp?.user && smtp?.pass) {
            return nodemailer.createTransport({
                host: smtp.host,
                port: Number(smtp.port) || 587,
                secure: Number(smtp.port) === 465, // true for 465, false for other ports
                auth: {
                    user: smtp.user,
                    pass: smtp.pass,
                },
            });
        }
    } catch (error) {
        console.error("Failed to load SMTP settings from DB:", error);
    }

    // Fallback to environment variables
    console.warn("Using environment variables for SMTP fallback");
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
    try {
        const transporter = await createTransporter();
        const settings = await db.getSettings();
        const from = settings.metadata?.smtp?.from || process.env.SMTP_FROM || 'noreply@yourdomain.com';

        const info = await transporter.sendMail({
            from: `"${settings.metadata?.siteName || 'AI Suite'}" <${from}>`,
            to,
            subject,
            html,
        });

        console.log("Message sent: %s", info.messageId);
        return { success: true };
    } catch (error: any) {
        console.error("Error sending email:", error);
        return { success: false, error: error.message || "Unknown SMTP Error" };
    }
}
