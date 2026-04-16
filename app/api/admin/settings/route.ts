
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from("system_settings")
            .select("*")
            .eq("id", 1)
            .single();

        if (error) {
            // If no settings found, try to insert defaults (self-healing)
            if (error.code === 'PGRST116') { // JSON object requested, multiple (or no) rows returned
                const { data: newData, error: insertError } = await supabaseAdmin
                    .from("system_settings")
                    .insert([{ id: 1 }])
                    .select()
                    .single();

                if (insertError) throw insertError;
                return NextResponse.json({
                    defaultTokens: newData.default_tokens,
                    aiLimits: newData.ai_limits,
                    paymentEnabled: newData.payment_enabled,
                    paymentGateway: newData.payment_gateway || 'stripe',
                    stripePublicKey: newData.stripe_public_key,
                    stripeSecretKey: newData.stripe_secret_key,
                    paypalClientId: newData.paypal_client_id,
                    paypalClientSecret: newData.paypal_client_secret,
                    paypalMode: newData.paypal_mode || 'sandbox',

                    metadata: {
                        ...newData.metadata,
                        siteName: newData.site_name,
                        siteUrl: newData.site_url,
                        smtp: newData.smtp_config,
                    }
                });
            }
            throw error;
        }

        // Map DB to frontend interface
        const settings = {
            defaultTokens: data.default_tokens,
            aiLimits: data.ai_limits,
            paymentEnabled: data.payment_enabled,
            paymentGateway: data.payment_gateway || 'stripe',
            stripePublicKey: data.stripe_public_key,
            stripeSecretKey: data.stripe_secret_key,
            paypalClientId: data.paypal_client_id,
            paypalClientSecret: data.paypal_client_secret,
            paypalMode: data.paypal_mode || 'sandbox',

            metadata: {
                ...data.metadata,
                siteName: data.site_name,
                siteUrl: data.site_url,
                smtp: data.smtp_config,
            }
        };

        return NextResponse.json(settings);
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const meta = body.metadata || {};

        // Prepare metadata to store in jsonb (excluding fields that have dedicated columns)
        const storedMetadata = { ...meta };
        delete storedMetadata.siteName;
        delete storedMetadata.siteUrl;
        delete storedMetadata.smtp;

        const updateData = {
            default_tokens: body.defaultTokens,
            ai_limits: body.aiLimits,
            payment_enabled: body.paymentEnabled,
            payment_gateway: body.paymentGateway || 'stripe',
            stripe_public_key: body.stripePublicKey,
            stripe_secret_key: body.stripeSecretKey,
            paypal_client_id: body.paypalClientId,
            paypal_client_secret: body.paypalClientSecret,
            paypal_mode: body.paypalMode,

            site_name: meta.siteName,
            site_url: meta.siteUrl,
            smtp_config: meta.smtp,
            metadata: storedMetadata,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabaseAdmin
            .from("system_settings")
            .update(updateData)
            .eq("id", 1);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving settings:", error);
        return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
    }
}
