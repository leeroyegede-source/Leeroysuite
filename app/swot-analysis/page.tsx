"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Target } from "lucide-react";

export default function SwotAnalysisPage() {
    return (
        <ToolPage
            toolId="swot-analysis"
            title="SWOT Analysis Generator"
            description="Generate comprehensive SWOT analyses with Strengths, Weaknesses, Opportunities, and Threats plus actionable recommendations."
            icon={Target}
            placeholder="Describe your business, industry, competitive landscape, and the context for this analysis..."
            examplePrompts={[
                "SWOT analysis for a new organic coffee shop opening in downtown Austin competing with Starbucks",
                "Generate a SWOT for a mobile app startup entering the meal delivery market in 2024",
                "Create a SWOT analysis for an established accounting firm considering AI automation adoption",
            ]}
            tokenCost={20}
            gradient="from-orange-500 to-red-600"
            category="Business"
        />
    );
}
