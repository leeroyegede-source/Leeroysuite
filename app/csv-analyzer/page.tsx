"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { FileSpreadsheet } from "lucide-react";

export default function CsvAnalyzerPage() {
    return (
        <ToolPage
            toolId="csv-analyzer"
            title="CSV Analyzer"
            description="Paste your CSV data to get instant statistical summaries, trend analysis, and actionable insights."
            icon={FileSpreadsheet}
            placeholder="Paste your CSV data here (include headers). The AI will analyze patterns, outliers, and key insights..."
            examplePrompts={[
                "Name,Sales,Region\nAlice,45000,East\nBob,62000,West\nCarol,38000,East\nDave,71000,North — analyze this sales data",
                "Analyze customer churn data and identify the top 3 factors contributing to churn",
                "Find correlations and outliers in this survey response dataset",
            ]}
            tokenCost={20}
            gradient="from-teal-500 to-emerald-600"
            category="Data & Analytics"
        />
    );
}
