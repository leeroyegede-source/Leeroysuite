import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const lang = searchParams.get("lang");

        if (!lang) {
            // Return all enabled languages
            const languages = await db.getLanguages();
            const enabled = languages.filter((l) => l.isEnabled);
            return NextResponse.json({ languages: enabled });
        }

        // Return translations for a specific language
        const translations = await db.getTranslationsForLanguage(lang);
        return NextResponse.json({ translations, locale: lang });
    } catch (error) {
        console.error("Error fetching translations:", error);
        return NextResponse.json(
            { error: "Failed to fetch translations" },
            { status: 500 }
        );
    }
}
