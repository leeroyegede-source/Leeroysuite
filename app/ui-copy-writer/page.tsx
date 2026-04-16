"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Type } from "lucide-react";

export default function UiCopyWriterPage() {
    return (
        <ToolPage
            toolId="ui-copy-writer"
            title="UI Copy Writer"
            description="Generate effective microcopy for buttons, error messages, empty states, tooltips, and onboarding flows."
            icon={Type}
            placeholder="Describe the UI element, context, and tone you need copy for..."
            examplePrompts={[
                "Write 5 variations of a CTA button for a free trial signup on a project management tool",
                "Create friendly error messages for: invalid email, password too short, network timeout, and 404 page",
                "Write onboarding tooltip copy for a 4-step setup wizard in a CRM application",
            ]}
            tokenCost={10}
            gradient="from-violet-500 to-indigo-600"
            category="Design & UX"
        />
    );
}
