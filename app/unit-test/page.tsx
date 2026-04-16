"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { TestTube } from "lucide-react";

export default function UnitTestPage() {
    return (
        <ToolPage
            toolId="unit-test"
            title="Unit Test Generator"
            description="Generate comprehensive unit tests for your code."
            icon={TestTube}
            placeholder="Paste your code and specify the testing framework..."
            examplePrompts={[
                "Generate Jest tests for this React component",
                "Create pytest tests for this Python function",
                "Write unit tests for this TypeScript class",
            ]}
            tokenCost={20}
            gradient="from-lime-500 to-green-600"
            category="Development"
        />
    );
}
