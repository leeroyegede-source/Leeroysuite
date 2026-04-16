"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Target } from "lucide-react";

export default function FacebookAdsPage() {
    return (
        <ToolPage
            toolId="facebook-ads"
            title="Facebook Ads Copy Generator"
            description="Create scroll-stopping Facebook ad copy that converts."
            icon={Target}
            placeholder="Describe your offer, target audience, and the action you want users to take..."
            examplePrompts={[
                "Facebook ad for a weight loss program",
                "Ad copy for a SaaS free trial",
                "Retargeting ad for abandoned cart recovery",
            ]}
            tokenCost={15}
            gradient="from-blue-600 to-indigo-600"
            category="Marketing"
        />
    );
}
