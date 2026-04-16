import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const languages = await db.getLanguages();
        return NextResponse.json(languages);
    } catch (error) {
        console.error("Error fetching languages:", error);
        return NextResponse.json({ error: "Failed to fetch languages" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { code, name, direction, isEnabled } = body;

        if (!code || !name) {
            return NextResponse.json({ error: "Code and name are required" }, { status: 400 });
        }

        const language = await db.saveLanguage({
            code: code.toLowerCase().trim(),
            name: name.trim(),
            direction: direction || "ltr",
            isEnabled: isEnabled !== false,
        });

        return NextResponse.json(language);
    } catch (error: any) {
        console.error("Error saving language:", error);
        if (error.message?.includes("duplicate")) {
            return NextResponse.json({ error: "Language code already exists" }, { status: 409 });
        }
        return NextResponse.json({ error: "Failed to save language" }, { status: 500 });
    }
}
