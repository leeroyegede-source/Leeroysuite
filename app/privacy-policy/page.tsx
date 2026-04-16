"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
    return (
        <ToolPage
            toolId="privacy-policy"
            title="Privacy Policy Generator"
            description="Generate comprehensive privacy policies for your website or app."
            icon={Shield}
            placeholder="Describe your business, data collection practices, and jurisdiction..."
            examplePrompts={[
                "Privacy policy for an e-commerce website",
                "GDPR-compliant privacy policy for a SaaS app",
                "Privacy policy for a mobile fitness app",
            ]}
            tokenCost={30}
            gradient="from-slate-600 to-slate-800"
            category="Legal"
        />
    );
}
