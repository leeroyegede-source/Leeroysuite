"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Users } from "lucide-react";

export default function JobDescriptionPage() {
    return (
        <ToolPage
            toolId="job-description"
            title="Job Description Generator"
            description="Create compelling job descriptions that attract top talent."
            icon={Users}
            placeholder="Describe the role, responsibilities, and required qualifications..."
            examplePrompts={[
                "Job description for a Senior React Developer",
                "Marketing Manager role at a tech startup",
                "Customer Success Representative position",
            ]}
            tokenCost={20}
            gradient="from-cyan-500 to-blue-600"
            category="Business"
        />
    );
}
