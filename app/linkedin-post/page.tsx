"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Briefcase } from "lucide-react";

export default function LinkedInPostPage() {
    return (
        <ToolPage
            toolId="linkedin-post"
            title="LinkedIn Post Generator"
            description="Create professional LinkedIn posts that establish thought leadership."
            icon={Briefcase}
            placeholder="Describe the topic, insight, or story you want to share..."
            examplePrompts={[
                "Post about leadership lessons from a recent challenge",
                "Share insights about industry trends in tech",
                "Announcement about a new career milestone",
            ]}
            tokenCost={10}
            gradient="from-blue-600 to-blue-800"
            category="Social Media"
        />
    );
}
