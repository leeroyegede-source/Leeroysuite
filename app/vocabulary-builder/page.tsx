"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { BookA } from "lucide-react";

export default function VocabularyBuilderPage() {
    return (
        <ToolPage
            toolId="vocabulary-builder"
            title="Vocabulary Builder"
            description="Generate vocabulary lists with definitions, example sentences, pronunciation guides, and difficulty levels for any language."
            icon={BookA}
            placeholder="Specify the language, topic area, proficiency level, and number of words..."
            examplePrompts={[
                "Generate 20 intermediate Spanish business vocabulary words with definitions and example sentences",
                "Create a list of 15 advanced English words related to climate science for GRE preparation",
                "Build a beginner Japanese vocabulary set for traveling: greetings, directions, food, and shopping",
            ]}
            tokenCost={10}
            gradient="from-indigo-500 to-purple-600"
            category="Education"
        />
    );
}
