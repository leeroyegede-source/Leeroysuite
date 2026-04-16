"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { BarChart3 } from "lucide-react";

export default function DataVisualizerPage() {
    return (
        <ToolPage
            toolId="data-visualizer"
            title="Data Visualizer"
            description="Generate chart configurations and visualization recommendations from your data descriptions."
            icon={BarChart3}
            placeholder="Describe your data and the kind of visualization you need. Include data points, categories, and the story you want to tell..."
            examplePrompts={[
                "I have monthly revenue data for 2024 across 4 product lines, suggest the best chart type and generate Chart.js config",
                "Visualize user signup trends: Jan-100, Feb-150, Mar-220, Apr-310, May-480 with growth annotations",
                "Create a dashboard layout for e-commerce metrics: conversion rate, AOV, bounce rate, and traffic sources",
            ]}
            tokenCost={20}
            gradient="from-cyan-500 to-blue-600"
            category="Data & Analytics"
        />
    );
}
