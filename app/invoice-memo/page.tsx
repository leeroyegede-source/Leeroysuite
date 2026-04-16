"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Receipt } from "lucide-react";

export default function InvoiceMemoPage() {
    return (
        <ToolPage
            toolId="invoice-memo"
            title="Invoice Memo Writer"
            description="Write professional invoice memos, payment notes, and service descriptions for freelancers and small businesses."
            icon={Receipt}
            placeholder="Describe the services provided, payment terms, and any special notes..."
            examplePrompts={[
                "Write an invoice memo for a completed website redesign project, net 30 payment terms",
                "Create a professional service description for a monthly social media management retainer",
                "Generate invoice notes for a consulting engagement with milestone-based billing",
            ]}
            tokenCost={10}
            gradient="from-gray-500 to-slate-600"
            category="Business"
        />
    );
}
