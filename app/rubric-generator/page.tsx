"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { TableProperties } from "lucide-react";

export default function RubricGeneratorPage() {
    return (
        <ToolPage
            toolId="rubric-generator"
            title="Rubric Generator"
            description="Create detailed grading rubrics with criteria, scoring levels, and descriptors for any assignment or assessment."
            icon={TableProperties}
            placeholder="Describe the assignment type, subject, grade level, and key criteria to assess..."
            examplePrompts={[
                "Create a 4-level grading rubric for a college research paper (Excellent/Good/Satisfactory/Needs Work)",
                "Build an assessment rubric for a group presentation in a high school history class",
                "Generate a coding project rubric evaluating functionality, code quality, documentation, and testing",
            ]}
            tokenCost={15}
            gradient="from-red-500 to-rose-600"
            category="Education"
        />
    );
}
