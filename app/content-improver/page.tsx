"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Sparkles } from "lucide-react";

export default function ContentImproverPage() {
    return (
        <ToolPage
            toolId="content-improver"
            title="Content Improver"
            description="Enhance and polish your existing content for better clarity and impact."
            icon={Sparkles}
            placeholder="Paste your content here to improve its clarity, flow, and engagement..."
            examplePrompts={[
                "Improve this paragraph: [paste your text]",
                "Make this email more professional and engaging",
                "Enhance this product description for better conversions",
            ]}
            tokenCost={15}
            gradient="from-violet-500 to-purple-600"
            category="Writing"
        />
    );
}
