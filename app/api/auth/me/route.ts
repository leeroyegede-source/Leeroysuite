import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session: any = await getSession();

    // ✅ Always return consistent response (NEVER break frontend)
    if (!session?.email) {
      return NextResponse.json({
        user: null,
        authenticated: false,
      });
    }

    const user = await db.getUser(session.email);

    // ✅ Even if user not found, don't break app
    if (!user) {
      return NextResponse.json({
        user: null,
        authenticated: false,
      });
    }

    const tokens = await db.getTokenBalance(session.email);
    const planDetails = await db.getUserPlan(session.email);

    return NextResponse.json({
      authenticated: true,
      user: {
        email: user.email,
        name: user.name || "User",
        role: user.role || "user",

        // ✅ safe defaults
        tokens: tokens?.balance ?? 0,
        disabledFeatures: user.disabledFeatures ?? [],
        planName: planDetails?.planName ?? "free",
        aiTools: planDetails?.aiTools ?? [],
      },
    });
  } catch (error) {
    console.error("Auth /me error:", error);

    // ✅ NEVER crash frontend
    return NextResponse.json({
      user: null,
      authenticated: false,
    });
  }
}