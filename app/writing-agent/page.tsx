"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { PenTool } from "lucide-react";

export default function WritingAgentPage() {
    return (
        <ToolPage
            toolId="writing-agent"
            title="Writing Agent"
            description="Autonomous AI agent that handles complex writing projects from start to finish."
            icon={PenTool}
            placeholder="Describe your writing project and requirements..."
            examplePrompts={[
                "Write a complete 2000-word blog post about productivity",
                "Create an entire email marketing sequence",
                "Develop a content strategy with sample posts",
            ]}
            tokenCost={75}
            gradient="from-pink-600 to-rose-700"
            category="AI Agents"
        />
    );
}
