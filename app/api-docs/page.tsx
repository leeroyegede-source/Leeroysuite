"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { FileText } from "lucide-react";

export default function ApiDocsPage() {
    return (
        <ToolPage
            toolId="api-docs"
            title="API Documentation Generator"
            description="Generate comprehensive API documentation from your code or endpoints."
            icon={FileText}
            placeholder="Describe your API endpoints, methods, and parameters..."
            examplePrompts={[
                "Document this REST API for user authentication",
                "Create OpenAPI spec for an e-commerce API",
                "Generate documentation for these GraphQL queries",
            ]}
            tokenCost={30}
            gradient="from-green-500 to-teal-600"
            category="Development"
        />
    );
}
