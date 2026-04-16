"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Laugh } from "lucide-react";

export default function JokeGeneratorPage() {
    return (
        <ToolPage
            toolId="joke-generator"
            title="Joke Generator"
            description="Generate jokes, puns, and humorous content."
            icon={Laugh}
            placeholder="Describe the type of joke or topic you want..."
            examplePrompts={[
                "Dad jokes about technology",
                "Puns about food",
                "Clean office humor for presentations",
            ]}
            tokenCost={10}
            gradient="from-amber-400 to-yellow-500"
            category="Creative"
        />
    );
}
