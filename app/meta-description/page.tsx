"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { FileText } from "lucide-react";

export default function MetaDescriptionPage() {
    return (
        <ToolPage
            toolId="meta-description"
            title="Meta Description Generator"
            description="Create compelling meta descriptions that improve click-through rates."
            icon={FileText}
            placeholder="Enter your page title and main content topic..."
            examplePrompts={[
                "Meta description for a digital marketing services page",
                "Product page description for running shoes",
                "Blog post meta about healthy meal prep",
            ]}
            tokenCost={10}
            gradient="from-blue-500 to-cyan-600"
            category="SEO"
        />
    );
}
