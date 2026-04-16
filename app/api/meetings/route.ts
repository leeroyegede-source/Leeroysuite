import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only';

async function getEmailFromRequest(req: NextRequest): Promise<string | null> {
    const session = req.cookies.get('session')?.value;
    if (!session) return null;
    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jose.jwtVerify(session, secret);
        return payload.email as string;
    } catch {
        return null;
    }
}

function generateMeetingId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const segments = [];
    for (let s = 0; s < 3; s++) {
        let segment = '';
        for (let i = 0; i < 4; i++) {
            segment += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        segments.push(segment);
    }
    return segments.join('-');
}

// POST /api/meetings - Create a new meeting
export async function POST(req: NextRequest) {
    try {
        const email = await getEmailFromRequest(req);
        if (!email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const title = body.title || 'Untitled Meeting';
        const meetingId = generateMeetingId();

        const meeting = await db.createMeeting(meetingId, title, email);

        return NextResponse.json({
            meeting,
            joinLink: `/ai-meeting/${meeting.id}`
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating meeting:', error);
        return NextResponse.json({ error: error.message || 'Failed to create meeting' }, { status: 500 });
    }
}

// GET /api/meetings - List user's meetings
export async function GET(req: NextRequest) {
    try {
        const email = await getEmailFromRequest(req);
        if (!email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const meetings = await db.listUserMeetings(email);
        return NextResponse.json({ meetings });
    } catch (error: any) {
        console.error('Error listing meetings:', error);
        return NextResponse.json({ error: error.message || 'Failed to list meetings' }, { status: 500 });
    }
}
