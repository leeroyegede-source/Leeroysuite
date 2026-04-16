"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Calendar } from "lucide-react";

export default function ContentCalendarPage() {
    return (
        <ToolPage
            toolId="content-calendar"
            title="Content Calendar Generator"
            description="Plan your social media content with a strategic content calendar."
            icon={Calendar}
            placeholder="Describe your niche, posting frequency, and content goals..."
            examplePrompts={[
                "Monthly content calendar for a fitness brand",
                "Weekly posting schedule for a tech startup",
                "Content plan for a food blogger on Instagram",
            ]}
            tokenCost={25}
            gradient="from-indigo-500 to-purple-600"
            category="Social Media"
        />
    );
}
