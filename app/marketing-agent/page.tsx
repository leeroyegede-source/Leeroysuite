"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { TrendingUp } from "lucide-react";

export default function MarketingAgentPage() {
    return (
        <ToolPage
            toolId="marketing-agent"
            title="Marketing Agent"
            description="Autonomous AI agent that plans and executes marketing campaigns."
            icon={TrendingUp}
            placeholder="Describe your marketing goals and target audience..."
            examplePrompts={[
                "Plan a product launch marketing campaign",
                "Create a full social media strategy for Q1",
                "Develop an email marketing funnel for lead nurturing",
            ]}
            tokenCost={80}
            gradient="from-orange-600 to-amber-700"
            category="AI Agents"
        />
    );
}
