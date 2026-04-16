"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Handshake } from "lucide-react";

export default function NegotiationScriptPage() {
    return (
        <ToolPage
            toolId="negotiation-script"
            title="Negotiation Script"
            description="Create negotiation scripts with opening statements, key arguments, counterpoint handlers, BATNA analysis, and closing strategies."
            icon={Handshake}
            placeholder="Describe the negotiation context — what you're negotiating, current offer, your target, and leverage points..."
            examplePrompts={[
                "Salary negotiation script: current offer $120K, target $140K, 5 years experience in cloud engineering",
                "Freelance rate negotiation: client offering $50/hr, I want $75/hr for a 6-month React project",
                "Vendor contract negotiation script to reduce annual SaaS licensing cost by 20%",
            ]}
            tokenCost={20}
            gradient="from-amber-500 to-yellow-600"
            category="Communication"
        />
    );
}
