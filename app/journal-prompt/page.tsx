"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { NotebookPen } from "lucide-react";

export default function JournalPromptPage() {
    return (
        <ToolPage
            toolId="journal-prompt"
            title="Journal Prompts"
            description="Get thoughtful journal prompts for self-reflection and growth."
            icon={NotebookPen}
            placeholder="Describe the type of reflection or theme you're interested in..."
            examplePrompts={[
                "Prompts for gratitude journaling",
                "Self-discovery questions for personal growth",
                "Daily reflection prompts for mindfulness",
            ]}
            tokenCost={10}
            gradient="from-amber-400 to-orange-500"
            category="Personal"
        />
    );
}
