"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Users } from "lucide-react";

export default function CharacterCreatorPage() {
    return (
        <ToolPage
            toolId="character-creator"
            title="Character Creator"
            description="Create detailed character profiles for your stories and games."
            icon={Users}
            placeholder="Describe the type of character and any specific traits you want..."
            examplePrompts={[
                "Create a complex villain for a fantasy novel",
                "Develop a protagonist for a coming-of-age story",
                "Generate a mysterious side character with secrets",
            ]}
            tokenCost={20}
            gradient="from-violet-500 to-purple-600"
            category="Creative"
        />
    );
}
