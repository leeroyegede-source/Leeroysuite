"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Hash } from "lucide-react";

export default function HashtagGeneratorPage() {
    return (
        <ToolPage
            toolId="hashtag-generator"
            title="Hashtag Generator"
            description="Generate relevant and trending hashtags for maximum reach."
            icon={Hash}
            placeholder="Describe your content or paste your caption to get relevant hashtags..."
            examplePrompts={[
                "Hashtags for a fitness motivation post",
                "Best hashtags for travel photography",
                "Trending hashtags for tech startup content",
            ]}
            tokenCost={5}
            gradient="from-teal-500 to-emerald-600"
            category="Social Media"
        />
    );
}
