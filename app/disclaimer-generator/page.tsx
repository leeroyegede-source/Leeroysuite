"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { FileWarning } from "lucide-react";

export default function DisclaimerGeneratorPage() {
    return (
        <ToolPage
            toolId="disclaimer-generator"
            title="Disclaimer Generator"
            description="Generate appropriate disclaimers for websites and content."
            icon={FileWarning}
            placeholder="Describe the type of disclaimer needed and your content type..."
            examplePrompts={[
                "Medical disclaimer for a health blog",
                "Affiliate disclaimer for product reviews",
                "Financial disclaimer for investment content",
            ]}
            tokenCost={15}
            gradient="from-amber-600 to-orange-700"
            category="Legal"
        />
    );
}
