"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Clock } from "lucide-react";

export default function CronExpressionPage() {
    return (
        <ToolPage
            toolId="cron-expression"
            title="Cron Expression Builder"
            description="Generate and explain cron schedule expressions from natural language — with validation and reverse translation."
            icon={Clock}
            placeholder="Describe the schedule you need in plain English..."
            examplePrompts={[
                "Run every weekday at 9:00 AM — generate the cron expression and explain each field",
                "Execute every 15 minutes between 8 AM and 6 PM on weekdays only",
                "Explain this cron expression: 0 */4 * * 1-5 and suggest alternatives",
            ]}
            tokenCost={10}
            gradient="from-zinc-500 to-neutral-600"
            category="Development"
        />
    );
}
