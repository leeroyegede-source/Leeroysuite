
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Ideally we should check if the user is an admin here
        // const userRole = (session as any).role;
        // if (userRole !== 'admin') {
        //     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        // }

        const { email, amount, action } = await req.json();

        if (!email || !amount || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (action !== 'add') {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        await db.updateTokenBalance(email, amount, 'add', 'admin-adjustment');

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Token addition error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
