"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Eye } from "lucide-react";

export default function CodeReviewerPage() {
    return (
        <ToolPage
            toolId="code-reviewer"
            title="Code Reviewer"
            description="Get AI-powered code reviews with suggestions for improvement."
            icon={Eye}
            placeholder="Paste your code for review. Include context about what it should do..."
            examplePrompts={[
                "Review this API endpoint for security issues",
                "Check this React component for performance optimizations",
                "Review this Python function for best practices",
            ]}
            tokenCost={25}
            gradient="from-purple-500 to-violet-600"
            category="Development"
        />
    );
}
