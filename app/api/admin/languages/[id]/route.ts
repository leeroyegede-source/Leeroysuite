import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        if (typeof body.isEnabled === "boolean") {
            await db.toggleLanguage(id, body.isEnabled);
            return NextResponse.json({ success: true });
        }

        // Full update
        if (body.code && body.name) {
            const language = await db.saveLanguage({
                id,
                code: body.code.toLowerCase().trim(),
                name: body.name.trim(),
                direction: body.direction || "ltr",
                isEnabled: body.isEnabled !== false,
            });
            return NextResponse.json(language);
        }

        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    } catch (error) {
        console.error("Error updating language:", error);
        return NextResponse.json({ error: "Failed to update language" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await db.deleteLanguage(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting language:", error);
        return NextResponse.json({ error: "Failed to delete language" }, { status: 500 });
    }
}
