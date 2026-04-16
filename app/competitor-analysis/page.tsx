"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Search } from "lucide-react";

export default function CompetitorAnalysisPage() {
    return (
        <ToolPage
            toolId="competitor-analysis"
            title="Competitor Analysis Generator"
            description="Analyze competitors and identify strategic opportunities."
            icon={Search}
            placeholder="List your competitors and describe your industry/market..."
            examplePrompts={[
                "Analyze competitors in the project management software space",
                "Compare my coffee shop to Starbucks and local cafes",
                "Competitive analysis for a new fintech app",
            ]}
            tokenCost={30}
            gradient="from-slate-600 to-slate-800"
            category="Marketing"
        />
    );
}
