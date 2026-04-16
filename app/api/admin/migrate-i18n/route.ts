import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST() {
    try {
        // Create languages table
        const { error: langError } = await supabaseAdmin.rpc("exec_sql", {
            sql: `
                CREATE TABLE IF NOT EXISTS languages (
                    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                    code TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    direction TEXT DEFAULT 'ltr' CHECK (direction IN ('ltr', 'rtl')),
                    is_enabled BOOLEAN DEFAULT true,
                    created_at TIMESTAMPTZ DEFAULT now()
                );
            `,
        });

        // If rpc doesn't work, try direct SQL via rest
        if (langError) {
            // Fallback: use raw SQL via Supabase management API
            console.log("RPC not available, attempting direct table creation...");
            
            // Try creating via Supabase's built-in methods
            // First check if languages table exists
            const { error: checkError } = await supabaseAdmin
                .from("languages")
                .select("id")
                .limit(1);

            if (checkError && checkError.message.includes("does not exist")) {
                return NextResponse.json({
                    error: "Tables need to be created manually",
                    instructions: "Please run the SQL migration in your Supabase SQL Editor. Go to your Supabase Dashboard → SQL Editor → New Query, and paste the SQL provided.",
                    sql: getCreateTableSQL(),
                }, { status: 400 });
            }
        }

        // Check if translations table exists
        const { error: transCheck } = await supabaseAdmin
            .from("translations")
            .select("id")
            .limit(1);

        if (transCheck && transCheck.message.includes("does not exist")) {
            return NextResponse.json({
                error: "Translations table needs to be created",
                instructions: "Please run the SQL migration in your Supabase SQL Editor.",
                sql: getCreateTableSQL(),
            }, { status: 400 });
        }

        return NextResponse.json({ 
            success: true, 
            message: "i18n tables are ready" 
        });
    } catch (error: any) {
        console.error("Migration error:", error);
        return NextResponse.json({
            error: "Migration failed. Please create tables manually.",
            instructions: "Go to your Supabase Dashboard → SQL Editor → New Query, paste the SQL below and run it.",
            sql: getCreateTableSQL(),
        }, { status: 500 });
    }
}

function getCreateTableSQL() {
    return `
-- Run this in your Supabase SQL Editor

-- 1. Languages table
CREATE TABLE IF NOT EXISTS languages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    direction TEXT DEFAULT 'ltr' CHECK (direction IN ('ltr', 'rtl')),
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Translations table
CREATE TABLE IF NOT EXISTS translations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    translation_key TEXT NOT NULL,
    language_code TEXT REFERENCES languages(code) ON DELETE CASCADE,
    value TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(translation_key, language_code)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_translations_key ON translations(translation_key);
CREATE INDEX IF NOT EXISTS idx_translations_lang ON translations(language_code);

-- 4. RLS (disable for service role access)
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- 5. Allow service role full access (needed for API routes)
CREATE POLICY "Service role full access on languages" ON languages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on translations" ON translations FOR ALL USING (true) WITH CHECK (true);
`;
}

export async function GET() {
    return NextResponse.json({ sql: getCreateTableSQL() });
}
