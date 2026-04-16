"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { FileKey } from "lucide-react";

export default function EnvTemplatePage() {
    return (
        <ToolPage
            toolId="env-template"
            title=".env Template Builder"
            description="Generate well-documented .env template files with variable names, sensible defaults, and inline documentation for any tech stack."
            icon={FileKey}
            placeholder="Describe your tech stack and the services/APIs your app connects to..."
            examplePrompts={[
                "Next.js app with Supabase auth, Stripe payments, SendGrid email, and Vercel deployment",
                "Django project with PostgreSQL, AWS S3, Redis, and Sentry error tracking",
                "Express.js API with MongoDB, JWT auth, Cloudinary uploads, and Twilio SMS",
            ]}
            tokenCost={10}
            gradient="from-yellow-500 to-amber-600"
            category="Development"
        />
    );
}
