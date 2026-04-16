"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Search } from "lucide-react";

export default function ResearchAgentPage() {
    return (
        <ToolPage
            toolId="research-agent"
            title="Research Agent"
            description="Autonomous AI agent that conducts comprehensive research on any topic."
            icon={Search}
            placeholder="Describe your research topic and what you want to learn..."
            examplePrompts={[
                "Research the latest trends in AI technology",
                "Comprehensive analysis of the electric vehicle market",
                "Research best practices for remote team management",
            ]}
            tokenCost={100}
            gradient="from-violet-600 to-purple-700"
            category="AI Agents"
        />
    );
}
