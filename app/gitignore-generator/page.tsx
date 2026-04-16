"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { GitBranch } from "lucide-react";

export default function GitignoreGeneratorPage() {
    return (
        <ToolPage
            toolId="gitignore-generator"
            title="Git Ignore Generator"
            description="Create comprehensive .gitignore files tailored to your tech stack, frameworks, IDEs, and operating systems."
            icon={GitBranch}
            placeholder="List your programming languages, frameworks, IDEs, and operating systems..."
            examplePrompts={[
                "Python + Django + Docker + VS Code + macOS — generate a comprehensive .gitignore",
                "Node.js + TypeScript + Next.js + JetBrains IDE + Windows",
                "Java + Spring Boot + Gradle + IntelliJ IDEA + Linux with CI/CD artifacts",
            ]}
            tokenCost={5}
            gradient="from-gray-500 to-zinc-600"
            category="Development"
        />
    );
}
