"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Search } from "lucide-react";

export default function KeywordResearchPage() {
    return (
        <ToolPage
            toolId="keyword-research"
            title="Keyword Research Assistant"
            description="Discover relevant keywords and search terms for your content."
            icon={Search}
            placeholder="Enter your topic or niche to find keyword opportunities..."
            examplePrompts={[
                "Keywords for a personal finance blog",
                "SEO keywords for a yoga studio website",
                "Long-tail keywords for email marketing software",
            ]}
            tokenCost={20}
            gradient="from-green-500 to-teal-600"
            category="SEO"
        />
    );
}
