"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Presentation } from "lucide-react";

export default function PitchDeckPage() {
    return (
        <ToolPage
            toolId="pitch-deck"
            title="Pitch Deck Outliner"
            description="Structure a compelling investor pitch deck slide by slide — from problem statement to financial projections and ask."
            icon={Presentation}
            placeholder="Describe your startup, product, market, traction, and what you're raising..."
            examplePrompts={[
                "Create a 12-slide pitch deck outline for a fintech startup raising a $2M seed round",
                "Structure a pitch deck for a B2B AI tool with $50K MRR seeking Series A funding",
                "Generate a demo day presentation outline for a healthtech startup in a YC batch",
            ]}
            tokenCost={25}
            gradient="from-sky-500 to-blue-600"
            category="Business"
        />
    );
}
