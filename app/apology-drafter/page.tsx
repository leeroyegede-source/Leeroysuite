"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { HeartHandshake } from "lucide-react";

export default function ApologyDrafterPage() {
    return (
        <ToolPage
            toolId="apology-drafter"
            title="Apology Drafter"
            description="Write sincere, effective apology messages — professional, personal, or customer-facing — with appropriate tone and follow-up actions."
            icon={HeartHandshake}
            placeholder="Describe the situation, who you're apologizing to, and the context..."
            examplePrompts={[
                "Write a professional apology email for missing a project deadline by 3 days",
                "Draft a customer service apology for a shipping delay on a premium order",
                "Create a sincere team-wide apology for a miscommunication that caused rework",
            ]}
            tokenCost={10}
            gradient="from-blue-400 to-indigo-600"
            category="Communication"
        />
    );
}
