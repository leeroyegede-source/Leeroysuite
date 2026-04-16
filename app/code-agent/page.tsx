"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Code } from "lucide-react";

export default function CodeAgentPage() {
    return (
        <ToolPage
            toolId="code-agent"
            title="Code Agent"
            description="Autonomous AI agent that handles complex programming tasks."
            icon={Code}
            placeholder="Describe the programming task you need completed..."
            examplePrompts={[
                "Build a complete REST API with authentication",
                "Create a React component library with documentation",
                "Develop a CLI tool for file processing",
            ]}
            tokenCost={100}
            gradient="from-cyan-600 to-blue-700"
            category="AI Agents"
        />
    );
}
