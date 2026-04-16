"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { LayoutTemplate } from "lucide-react";

export default function WireframeDescriberPage() {
    return (
        <ToolPage
            toolId="wireframe-describer"
            title="Wireframe Describer"
            description="Convert your wireframe ideas into detailed component specs, layout descriptions, and interaction documentation."
            icon={LayoutTemplate}
            placeholder="Describe the page or screen you want to wireframe — include sections, components, and user flow..."
            examplePrompts={[
                "Describe a wireframe for a flight booking checkout page with seat selection, payment, and confirmation",
                "Create a detailed component spec for a social media profile page with posts, followers, and settings",
                "Generate a wireframe description for a SaaS analytics dashboard with filters, charts, and data tables",
            ]}
            tokenCost={15}
            gradient="from-slate-500 to-gray-600"
            category="Design & UX"
        />
    );
}
