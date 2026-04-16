"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Feather } from "lucide-react";

export default function PoemGeneratorPage() {
    return (
        <ToolPage
            toolId="poem-generator"
            title="Poem Generator"
            description="Create beautiful poems in various styles - sonnets, haikus, free verse, and more."
            icon={Feather}
            placeholder="Describe the theme, emotion, or style of poem you want..."
            examplePrompts={[
                "Write a sonnet about love and loss",
                "Create a haiku about autumn",
                "Generate a free verse poem about hope",
            ]}
            tokenCost={15}
            gradient="from-rose-400 to-pink-600"
            category="Creative"
        />
    );
}
