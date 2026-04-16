"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Briefcase } from "lucide-react";

export default function BusinessPlanPage() {
    return (
        <ToolPage
            toolId="business-plan"
            title="Business Plan Generator"
            description="Create comprehensive business plans with executive summaries and financial projections."
            icon={Briefcase}
            placeholder="Describe your business idea, target market, and goals..."
            examplePrompts={[
                "Business plan for a food delivery startup",
                "Executive summary for a tech consulting firm",
                "Business plan for a sustainable fashion brand",
            ]}
            tokenCost={50}
            gradient="from-blue-600 to-indigo-700"
            category="Business"
        />
    );
}
