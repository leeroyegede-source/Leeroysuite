"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { ClipboardList } from "lucide-react";

export default function SurveyBuilderPage() {
    return (
        <ToolPage
            toolId="survey-builder"
            title="Survey Builder"
            description="Generate professional survey questionnaires with well-crafted questions, answer options, and flow logic."
            icon={ClipboardList}
            placeholder="Describe the purpose of your survey, target audience, and key topics you want to cover..."
            examplePrompts={[
                "Create a 15-question customer satisfaction survey for a SaaS product with NPS scoring",
                "Build an employee engagement survey covering work-life balance, management, and growth",
                "Design a post-event feedback survey for a tech conference with rating scales and open-ended questions",
            ]}
            tokenCost={15}
            gradient="from-indigo-500 to-blue-600"
            category="Data & Analytics"
        />
    );
}
