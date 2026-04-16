"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Target } from "lucide-react";

export default function GoogleAdsPage() {
    return (
        <ToolPage
            toolId="google-ads"
            title="Google Ads Copy Generator"
            description="Create high-converting Google Ads copy that drives clicks."
            icon={Target}
            placeholder="Describe your product/service, target audience, and unique selling points..."
            examplePrompts={[
                "Google Ads for an online course platform",
                "Ad copy for a local plumbing service",
                "Search ads for an e-commerce clothing store",
            ]}
            tokenCost={15}
            gradient="from-blue-500 to-green-500"
            category="Marketing"
        />
    );
}
