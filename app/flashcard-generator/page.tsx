"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { FileEdit } from "lucide-react";

export default function FlashcardGeneratorPage() {
    return (
        <ToolPage
            toolId="flashcard-generator"
            title="Flashcard Generator"
            description="Create effective flashcards for spaced repetition learning."
            icon={FileEdit}
            placeholder="Enter the topic or paste content to generate flashcards from..."
            examplePrompts={[
                "Flashcards for Spanish vocabulary - food terms",
                "Medical terminology flashcards for nursing students",
                "History flashcards about the French Revolution",
            ]}
            tokenCost={15}
            gradient="from-amber-500 to-yellow-600"
            category="Education"
        />
    );
}
