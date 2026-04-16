import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Helper to manually parse .env (Local development only)
const getEnvManual = (key: string) => {
    try {
        const envPath = path.join(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            const lines = content.split('\n');
            for (const line of lines) {
                const [k, ...vParts] = line.trim().split('=');
                if (k === key) {
                    let val = vParts.join('=').trim();
                    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                        val = val.slice(1, -1);
                    }
                    return val;
                }
            }
        }
    } catch (e) {
        // Silent fail for manual read to avoid clutter during build
    }
    return undefined;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || getEnvManual('NEXT_PUBLIC_SUPABASE_URL') || getEnvManual('SUPABASE_URL');
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || getEnvManual('SUPABASE_SERVICE_ROLE_KEY') || getEnvManual('SUPABASE_SECRET_KEY');

const isVercel = process.env.VERCEL === '1';
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

if (!supabaseUrl || !supabaseServiceKey) {
    if (typeof window === 'undefined') {
        const missing = [];
        if (!supabaseUrl) missing.push("SUPABASE_URL");
        if (!supabaseServiceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");

        const errorMessage = isVercel 
            ? `Vercel Configuration Error: Missing ${missing.join(", ")}. Please add them to your Vercel Dashboard (Settings > Environment Variables).`
            : `Local Configuration Error: Missing ${missing.join(", ")} in .env file.`;

        if (isBuildPhase) {
            // Log a warning instead of throwing during build to allow the build to complete
            console.warn(`[Supabase Build Warning] ${errorMessage}`);
        } else {
            throw new Error(errorMessage);
        }
    }
}

// Create the client (using placeholders if missing during build to prevent crash)
export const supabaseAdmin = createClient(
    supabaseUrl || 'https://placeholder.supabase.co', 
    supabaseServiceKey || 'placeholder-key', 
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);
