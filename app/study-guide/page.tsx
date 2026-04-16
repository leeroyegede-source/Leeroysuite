"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { BookOpen } from "lucide-react";

export default function StudyGuidePage() {
    return (
        <ToolPage
            toolId="study-guide"
            title="Study Guide Generator"
            description="Create comprehensive study guides for any topic or exam."
            icon={BookOpen}
            placeholder="Describe the subject, topics to cover, and exam format..."
            examplePrompts={[
                "Study guide for AP Biology exam",
                "Review notes for JavaScript fundamentals",
                "Exam prep guide for project management certification",
            ]}
            tokenCost={20}
            gradient="from-emerald-500 to-teal-600"
            category="Education"
        />
    );
}
