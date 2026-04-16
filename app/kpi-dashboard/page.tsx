"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Gauge } from "lucide-react";

export default function KpiDashboardPage() {
    return (
        <ToolPage
            toolId="kpi-dashboard"
            title="KPI Dashboard Generator"
            description="Generate meaningful KPI definitions, measurement formulas, and dashboard layout recommendations for any business."
            icon={Gauge}
            placeholder="Describe your business type, goals, and the metrics you want to track..."
            examplePrompts={[
                "Define the top 10 KPIs for a B2B SaaS startup with ARR under $1M",
                "Create a marketing performance dashboard with KPI definitions and target benchmarks",
                "Generate an operations dashboard for a logistics company tracking delivery, cost, and quality metrics",
            ]}
            tokenCost={20}
            gradient="from-blue-500 to-indigo-600"
            category="Data & Analytics"
        />
    );
}
