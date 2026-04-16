import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const [translations, languages] = await Promise.all([
            db.getAllTranslations(),
            db.getLanguages(),
        ]);

        // Group translations by key
        const keyMap: Record<string, Record<string, string>> = {};
        translations.forEach((t) => {
            if (!keyMap[t.translationKey]) {
                keyMap[t.translationKey] = {};
            }
            keyMap[t.translationKey][t.languageCode] = t.value;
        });

        // Build array of { key, translations: { langCode: value } }
        const keys = Object.keys(keyMap).sort();
        const result = keys.map((key) => ({
            key,
            translations: keyMap[key],
        }));

        return NextResponse.json({ keys: result, languages });
    } catch (error) {
        console.error("Error fetching translations:", error);
        return NextResponse.json({ error: "Failed to fetch translations" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Supports both single and bulk save
        // Single: { translationKey, languageCode, value }
        // Bulk: { translations: [{ translationKey, languageCode, value }] }
        if (body.translations && Array.isArray(body.translations)) {
            await db.bulkSaveTranslations(body.translations);
        } else if (body.translationKey && body.languageCode) {
            await db.saveTranslation({
                translationKey: body.translationKey,
                languageCode: body.languageCode,
                value: body.value || "",
            });
        } else {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving translations:", error);
        return NextResponse.json({ error: "Failed to save translations" }, { status: 500 });
    }
}
