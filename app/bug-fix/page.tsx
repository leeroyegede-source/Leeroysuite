"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Bug } from "lucide-react";

export default function BugFixPage() {
    return (
        <ToolPage
            toolId="bug-fix"
            title="Bug Fix Assistant"
            description="Identify and fix bugs in your code with AI-powered debugging."
            icon={Bug}
            placeholder="Paste your buggy code and describe the issue you're experiencing..."
            examplePrompts={[
                "Fix this JavaScript function that returns undefined",
                "Debug this Python script with a TypeError",
                "Find the bug in this React component that won't render",
            ]}
            tokenCost={20}
            gradient="from-red-500 to-orange-600"
            category="Development"
        />
    );
}
