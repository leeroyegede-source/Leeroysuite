"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { FileText } from "lucide-react";

export default function ReadmeGeneratorPage() {
    return (
        <ToolPage
            toolId="readme-generator"
            title="README Generator"
            description="Create professional README files for your GitHub projects."
            icon={FileText}
            placeholder="Describe your project, its features, and how to use it..."
            examplePrompts={[
                "README for a React component library",
                "Documentation for a CLI tool",
                "Project README for an open-source API",
            ]}
            tokenCost={20}
            gradient="from-gray-700 to-gray-900"
            category="Development"
        />
    );
}
