"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { FileCheck } from "lucide-react";

export default function ContractGeneratorPage() {
    return (
        <ToolPage
            toolId="contract-generator"
            title="Contract Generator"
            description="Generate professional contract templates for various business needs."
            icon={FileCheck}
            placeholder="Describe the type of contract and key terms you need..."
            examplePrompts={[
                "Freelance service agreement for web development",
                "Employment contract for a remote position",
                "Partnership agreement for a joint venture",
            ]}
            tokenCost={40}
            gradient="from-slate-700 to-slate-900"
            category="Business"
        />
    );
}
