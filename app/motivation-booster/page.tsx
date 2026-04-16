"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Flame } from "lucide-react";

export default function MotivationBoosterPage() {
    return (
        <ToolPage
            toolId="motivation-booster"
            title="Motivation Booster"
            description="Get personalized motivation and encouragement for your challenges."
            icon={Flame}
            placeholder="Describe what you're struggling with or need motivation for..."
            examplePrompts={[
                "Motivation to start exercising after a long break",
                "Encouragement for starting a new business",
                "Boost for staying focused while studying",
            ]}
            tokenCost={10}
            gradient="from-orange-500 to-red-600"
            category="Personal"
        />
    );
}
