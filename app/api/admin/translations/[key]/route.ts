import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ key: string }> }
) {
    try {
        const { key } = await params;
        const decodedKey = decodeURIComponent(key);
        await db.deleteTranslationKey(decodedKey);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting translation key:", error);
        return NextResponse.json({ error: "Failed to delete translation key" }, { status: 500 });
    }
}
