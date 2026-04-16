"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { FlaskConical } from "lucide-react";

export default function AbTestCopyPage() {
    return (
        <ToolPage
            toolId="ab-test-copy"
            title="A/B Test Copy Generator"
            description="Generate multiple copy variants for split testing — headlines, CTAs, descriptions, and subject lines with hypothesis framing."
            icon={FlaskConical}
            placeholder="Describe what you're testing, target audience, and current copy (if any)..."
            examplePrompts={[
                "Generate 3 headline variants for a SaaS landing page targeting small business owners",
                "Create 4 CTA button variations for a free trial signup with different urgency levels",
                "Write 3 email subject line variants for a product launch announcement to test open rates",
            ]}
            tokenCost={15}
            gradient="from-lime-500 to-green-600"
            category="Marketing"
        />
    );
}
