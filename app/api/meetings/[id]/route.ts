import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session: any = await getSession();
        if (!session || !session.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await params;
        const meetingId = resolvedParams.id;
        const meeting = await db.getMeeting(meetingId);

        if (!meeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        return NextResponse.json({ meeting });
    } catch (error) {
        console.error("Error fetching meeting:", error);
        return NextResponse.json(
            { error: "Failed to fetch meeting" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session: any = await getSession();
        if (!session || !session.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await params;
        const meetingId = resolvedParams.id;
        const body = await request.json();
        
        const meeting = await db.getMeeting(meetingId);

        if (!meeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        // Only host can end meeting
        if (body.action === "end") {
            if (meeting.hostEmail !== session.email) {
                return NextResponse.json({ error: "Forbidden: Only host can end meeting" }, { status: 403 });
            }
            await db.endMeeting(meetingId);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating meeting:", error);
        return NextResponse.json(
            { error: "Failed to update meeting" },
            { status: 500 }
        );
    }
}
