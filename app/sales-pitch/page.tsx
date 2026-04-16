"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { DollarSign } from "lucide-react";

export default function SalesPitchPage() {
    return (
        <ToolPage
            toolId="sales-pitch"
            title="Sales Pitch Generator"
            description="Create compelling sales pitches that close deals."
            icon={DollarSign}
            placeholder="Describe your product/service, target customer, and their pain points..."
            examplePrompts={[
                "Sales pitch for enterprise software to CTOs",
                "Pitch for a consulting service to small businesses",
                "Elevator pitch for a startup seeking investors",
            ]}
            tokenCost={20}
            gradient="from-green-500 to-emerald-600"
            category="Marketing"
        />
    );
}
