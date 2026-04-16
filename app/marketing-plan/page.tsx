"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { BarChart3 } from "lucide-react";

export default function MarketingPlanPage() {
    return (
        <ToolPage
            toolId="marketing-plan"
            title="Marketing Plan Generator"
            description="Create comprehensive marketing plans with strategies and tactics."
            icon={BarChart3}
            placeholder="Describe your business, target market, goals, and budget..."
            examplePrompts={[
                "Marketing plan for launching a new mobile app",
                "Q4 marketing strategy for an e-commerce store",
                "Content marketing plan for a B2B SaaS company",
            ]}
            tokenCost={35}
            gradient="from-orange-500 to-red-600"
            category="Marketing"
        />
    );
}
