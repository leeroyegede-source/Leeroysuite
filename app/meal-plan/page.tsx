"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Apple } from "lucide-react";

export default function MealPlanPage() {
    return (
        <ToolPage
            toolId="meal-plan"
            title="Meal Plan Generator"
            description="Create personalized meal plans with recipes, macro breakdowns, grocery lists, and dietary restriction support."
            icon={Apple}
            placeholder="Describe your dietary goals, restrictions, calorie target, and preferences..."
            examplePrompts={[
                "Create a 7-day 2000-calorie vegetarian meal plan with grocery list and macro breakdown",
                "Generate a high-protein meal prep plan for 5 workdays under $50 budget",
                "Build a gluten-free, dairy-free meal plan for a family of 4 with kid-friendly options",
            ]}
            tokenCost={20}
            gradient="from-green-500 to-lime-600"
            category="Health & Wellness"
        />
    );
}
