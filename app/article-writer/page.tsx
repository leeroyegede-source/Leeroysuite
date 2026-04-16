"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { FileText } from "lucide-react";

export default function ArticleWriterPage() {
    return (
        <ToolPage
            toolId="article-writer"
            title="Article Writer"
            description="Create well-researched, informative articles on any subject."
            icon={FileText}
            placeholder="Describe the article topic, length, and key points to cover..."
            examplePrompts={[
                "Write an article about the future of renewable energy",
                "Create an informative piece about cybersecurity best practices",
                "Generate an article about remote work productivity tips",
            ]}
            tokenCost={25}
            gradient="from-blue-500 to-cyan-600"
            category="Writing"
        />
    );
}
