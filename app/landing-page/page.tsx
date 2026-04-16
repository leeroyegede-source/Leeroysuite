"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Layout } from "lucide-react";

export default function LandingPagePage() {
    return (
        <ToolPage
            toolId="landing-page-copy"
            title="Landing Page Copy Generator"
            description="Create persuasive landing page copy that converts visitors into customers."
            icon={Layout}
            placeholder="Describe your product/service, target audience, and key benefits..."
            examplePrompts={[
                "Landing page for a project management SaaS",
                "Sales page for an online fitness coaching program",
                "Lead generation page for a marketing agency",
            ]}
            tokenCost={25}
            gradient="from-purple-500 to-pink-600"
            category="Marketing"
        />
    );
}
