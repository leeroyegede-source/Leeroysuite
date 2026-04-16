"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Receipt } from "lucide-react";

export default function RefundPolicyPage() {
    return (
        <ToolPage
            toolId="refund-policy"
            title="Refund Policy Generator"
            description="Create clear refund and return policies for your business."
            icon={Receipt}
            placeholder="Describe your product/service type and refund preferences..."
            examplePrompts={[
                "30-day refund policy for digital products",
                "Return policy for an e-commerce clothing store",
                "Cancellation policy for a subscription service",
            ]}
            tokenCost={15}
            gradient="from-green-600 to-emerald-700"
            category="Legal"
        />
    );
}
