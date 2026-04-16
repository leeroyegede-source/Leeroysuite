"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Tag } from "lucide-react";

export default function NameGeneratorPage() {
    return (
        <ToolPage
            toolId="name-generator"
            title="Name Generator"
            description="Generate creative names for characters, businesses, products, and more."
            icon={Tag}
            placeholder="Describe what you need a name for and any preferences..."
            examplePrompts={[
                "Fantasy character names for a D&D campaign",
                "Brand names for a sustainable clothing line",
                "Baby names with Celtic origins",
            ]}
            tokenCost={5}
            gradient="from-cyan-500 to-blue-600"
            category="Creative"
        />
    );
}
