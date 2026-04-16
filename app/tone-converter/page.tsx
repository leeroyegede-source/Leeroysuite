"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { ArrowLeftRight } from "lucide-react";

export default function ToneConverterPage() {
    return (
        <ToolPage
            toolId="tone-converter"
            title="Tone Converter"
            description="Transform the emotional tone of any text — switch between formal, casual, empathetic, assertive, humorous, and more."
            icon={ArrowLeftRight}
            placeholder="Paste your text and specify the target tone (e.g., 'Convert to empathetic tone')..."
            examplePrompts={[
                "Convert this formal business email into a friendly, casual message",
                "Make this customer complaint response more empathetic and understanding",
                "Transform this dry technical report into an engaging narrative style",
            ]}
            tokenCost={10}
            gradient="from-rose-500 to-pink-600"
            category="Writing"
        />
    );
}
