"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Video } from "lucide-react";

export default function YouTubeDescriptionPage() {
    return (
        <ToolPage
            toolId="youtube-description"
            title="YouTube Description Generator"
            description="Create SEO-optimized YouTube descriptions with timestamps and links."
            icon={Video}
            placeholder="Describe your video content, main topics, and any links to include..."
            examplePrompts={[
                "Description for a tutorial on React hooks",
                "Travel vlog description for a Japan trip",
                "Product review video for the latest iPhone",
            ]}
            tokenCost={15}
            gradient="from-red-500 to-red-700"
            category="Social Media"
        />
    );
}
