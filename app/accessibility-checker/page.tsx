"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { ScanEye } from "lucide-react";

export default function AccessibilityCheckerPage() {
    return (
        <ToolPage
            toolId="accessibility-checker"
            title="Accessibility Checker"
            description="Audit your content for WCAG accessibility compliance — readability, alt-text suggestions, and inclusive language."
            icon={ScanEye}
            placeholder="Paste your content, page copy, or UI text to check for accessibility issues..."
            examplePrompts={[
                "Check this landing page copy for readability level and suggest improvements for a general audience",
                "Review these image descriptions for WCAG-compliant alt-text and suggest better alternatives",
                "Audit this form's labels, error messages, and instructions for screen reader accessibility",
            ]}
            tokenCost={15}
            gradient="from-green-500 to-emerald-600"
            category="Design & UX"
        />
    );
}
