"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Activity } from "lucide-react";

export default function SymptomJournalPage() {
    return (
        <ToolPage
            toolId="symptom-journal"
            title="Symptom Journal Analyzer"
            description="Analyze health symptom patterns, identify potential triggers, and generate structured health journals for doctor visits."
            icon={Activity}
            placeholder="Describe your symptoms, their frequency, duration, and any potential triggers you've noticed..."
            examplePrompts={[
                "Analyze these headache patterns: Mon-morning, Wed-afternoon, Fri-morning — possible triggers and patterns",
                "Track and organize these digestive symptoms over the past week with meals and stress levels",
                "Create a structured symptom report for my doctor: fatigue, joint pain, sleep issues over 2 weeks",
            ]}
            tokenCost={15}
            gradient="from-red-400 to-pink-600"
            category="Health & Wellness"
        />
    );
}
