"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Code } from "lucide-react";

export default function RegexGeneratorPage() {
    return (
        <ToolPage
            toolId="regex-generator"
            title="Regex Generator"
            description="Generate and explain regular expressions for pattern matching."
            icon={Code}
            placeholder="Describe the pattern you want to match..."
            examplePrompts={[
                "Regex to validate email addresses",
                "Pattern to match phone numbers in US format",
                "Expression to extract URLs from text",
            ]}
            tokenCost={10}
            gradient="from-yellow-500 to-amber-600"
            category="Development"
        />
    );
}
