"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { BookMarked } from "lucide-react";

export default function LessonPlanPage() {
    return (
        <ToolPage
            toolId="lesson-plan"
            title="Lesson Plan Generator"
            description="Create structured lesson plans for any subject and grade level."
            icon={BookMarked}
            placeholder="Describe the subject, topic, grade level, and learning objectives..."
            examplePrompts={[
                "Lesson plan for teaching fractions to 5th graders",
                "History lesson about World War II for high school",
                "Science lesson on photosynthesis for middle school",
            ]}
            tokenCost={25}
            gradient="from-blue-500 to-indigo-600"
            category="Education"
        />
    );
}
