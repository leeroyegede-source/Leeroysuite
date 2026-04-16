"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { ScrollText } from "lucide-react";

export default function TermsOfServicePage() {
    return (
        <ToolPage
            toolId="terms-of-service"
            title="Terms of Service Generator"
            description="Generate comprehensive terms of service for your platform."
            icon={ScrollText}
            placeholder="Describe your service, user obligations, and key policies..."
            examplePrompts={[
                "Terms of service for a SaaS platform",
                "User agreement for a social media app",
                "Terms and conditions for an online marketplace",
            ]}
            tokenCost={30}
            gradient="from-gray-700 to-gray-900"
            category="Legal"
        />
    );
}
