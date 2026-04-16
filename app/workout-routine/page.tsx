"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Dumbbell } from "lucide-react";

export default function WorkoutRoutinePage() {
    return (
        <ToolPage
            toolId="workout-routine"
            title="Workout Routine Builder"
            description="Design personalized exercise programs with exercises, sets, reps, rest times, and progressive overload schedules."
            icon={Dumbbell}
            placeholder="Describe your fitness level, goals, available equipment, and how many days per week..."
            examplePrompts={[
                "Create a 4-day upper/lower strength training split for intermediate lifters with barbell access",
                "Design a 3-day full-body home workout routine using only bodyweight and resistance bands",
                "Build a 6-week progressive running plan for a beginner training for a 5K race",
            ]}
            tokenCost={15}
            gradient="from-orange-500 to-yellow-600"
            category="Health & Wellness"
        />
    );
}
