"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Code } from "lucide-react";

export default function SchemaMarkupPage() {
    return (
        <ToolPage
            toolId="schema-markup"
            title="Schema Markup Generator"
            description="Generate structured data markup for rich search results."
            icon={Code}
            placeholder="Describe the content type and details for schema markup..."
            examplePrompts={[
                "Schema for a local business with hours and reviews",
                "Product schema for an e-commerce item",
                "Article schema for a blog post",
            ]}
            tokenCost={20}
            gradient="from-purple-500 to-indigo-600"
            category="SEO"
        />
    );
}
