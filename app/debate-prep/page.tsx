"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Swords } from "lucide-react";

export default function DebatePrepPage() {
    return (
        <ToolPage
            toolId="debate-prep"
            title="Debate Prep Coach"
            description="Build comprehensive arguments for both sides of any debate topic with evidence, rebuttals, and closing statements."
            icon={Swords}
            placeholder="Enter the debate topic or motion you want to prepare for..."
            examplePrompts={[
                "Arguments for and against universal basic income with economic data and counterpoints",
                "Prepare both sides of the debate: 'AI will create more jobs than it destroys'",
                "Build pro and con arguments for remote work vs office work with supporting evidence",
            ]}
            tokenCost={20}
            gradient="from-orange-500 to-amber-600"
            category="Education"
        />
    );
}
