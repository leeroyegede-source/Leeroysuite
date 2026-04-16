"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Target } from "lucide-react";

export default function GoalSettingPage() {
    return (
        <ToolPage
            toolId="goal-setting"
            title="Goal Setting Helper"
            description="Create SMART goals with actionable plans and milestones."
            icon={Target}
            placeholder="Describe your goal or aspiration..."
            examplePrompts={[
                "Set a fitness goal to run a marathon",
                "Career goal to get promoted within a year",
                "Financial goal to save for a house down payment",
            ]}
            tokenCost={15}
            gradient="from-green-500 to-emerald-600"
            category="Personal"
        />
    );
}
