"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { RefreshCw } from "lucide-react";

export default function ParaphraserPage() {
    return (
        <ToolPage
            toolId="paraphraser"
            title="Paraphraser"
            description="Rewrite any text in multiple styles while preserving the original meaning — academic, casual, concise, or creative."
            icon={RefreshCw}
            placeholder="Paste the text you want to paraphrase..."
            examplePrompts={[
                "Rewrite this academic paragraph in a conversational blog style",
                "Paraphrase this product description to sound more premium and luxurious",
                "Simplify this technical documentation for a non-technical audience",
            ]}
            tokenCost={10}
            gradient="from-amber-500 to-orange-600"
            category="Writing"
        />
    );
}
