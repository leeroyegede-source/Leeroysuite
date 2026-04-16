"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Search } from "lucide-react";

export default function SeoAuditPage() {
    return (
        <ToolPage
            toolId="seo-audit"
            title="SEO Audit Checklist"
            description="Generate comprehensive SEO audit checklists for websites."
            icon={Search}
            placeholder="Enter your website URL or describe your site type..."
            examplePrompts={[
                "Complete SEO audit checklist for an e-commerce site",
                "Technical SEO checklist for a WordPress blog",
                "Local SEO audit for a restaurant website",
            ]}
            tokenCost={30}
            gradient="from-orange-500 to-red-600"
            category="SEO"
        />
    );
}
