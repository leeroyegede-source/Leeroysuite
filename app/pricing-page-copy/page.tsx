"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { CreditCard } from "lucide-react";

export default function PricingPageCopyPage() {
    return (
        <ToolPage
            toolId="pricing-page-copy"
            title="Pricing Page Copy"
            description="Write compelling pricing page content with plan descriptions, feature comparisons, FAQ sections, and conversion-focused copy."
            icon={CreditCard}
            placeholder="Describe your product, pricing tiers, and key features for each plan..."
            examplePrompts={[
                "Write pricing page copy for a 3-tier SaaS email marketing tool: Free, Pro ($29/mo), Enterprise",
                "Create a feature comparison table copy for a cloud storage product with 4 plans",
                "Generate a pricing FAQ section that addresses common objections for a $99/mo design tool",
            ]}
            tokenCost={20}
            gradient="from-emerald-500 to-teal-600"
            category="Marketing"
        />
    );
}
