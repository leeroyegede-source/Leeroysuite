"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { ListChecks } from "lucide-react";

export default function OnboardingChecklistPage() {
    return (
        <ToolPage
            toolId="onboarding-checklist"
            title="Onboarding Checklist"
            description="Create structured onboarding checklists for new employees, customers, or users with day-by-day plans and milestones."
            icon={ListChecks}
            placeholder="Describe the role, product, or context for the onboarding plan..."
            examplePrompts={[
                "Create a 30-day onboarding checklist for a new software engineer at a startup",
                "Build a customer onboarding flow for a SaaS analytics platform with 5 setup steps",
                "Generate a first-week onboarding plan for a new marketing manager including tools and training",
            ]}
            tokenCost={15}
            gradient="from-teal-500 to-cyan-600"
            category="Business"
        />
    );
}
