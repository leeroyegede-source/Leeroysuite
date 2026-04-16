"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Lightbulb } from "lucide-react";

export default function StoryIdeasPage() {
    return (
        <ToolPage
            toolId="story-ideas"
            title="Story Idea Generator"
            description="Generate unique and compelling story ideas for any genre."
            icon={Lightbulb}
            placeholder="Describe the genre, theme, or elements you want in your story..."
            examplePrompts={[
                "Sci-fi story ideas about time travel",
                "Romance story set in a small town",
                "Mystery thriller with an unexpected twist",
            ]}
            tokenCost={15}
            gradient="from-yellow-400 to-orange-500"
            category="Creative"
        />
    );
}
