"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { UserCircle } from "lucide-react";

export default function BuyerPersonaPage() {
    return (
        <ToolPage
            toolId="buyer-persona"
            title="Buyer Persona Creator"
            description="Build detailed buyer personas with demographics, pain points, buying behavior, preferred channels, and messaging strategies."
            icon={UserCircle}
            placeholder="Describe your product/service, industry, and what you know about your target customers..."
            examplePrompts={[
                "Create a buyer persona for a B2B project management tool targeting mid-size tech companies",
                "Build 2 distinct buyer personas for a premium fitness app: casual users vs serious athletes",
                "Generate a detailed persona for the decision-maker who buys enterprise cybersecurity solutions",
            ]}
            tokenCost={20}
            gradient="from-purple-500 to-violet-600"
            category="Marketing"
        />
    );
}
