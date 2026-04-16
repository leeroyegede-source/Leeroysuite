"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { MessageSquare } from "lucide-react";

export default function TwitterThreadPage() {
    return (
        <ToolPage
            toolId="twitter-thread"
            title="Twitter/X Thread Generator"
            description="Create viral Twitter threads that educate, entertain, and engage."
            icon={MessageSquare}
            placeholder="Enter the topic and key points for your thread..."
            examplePrompts={[
                "Thread about 10 productivity hacks for remote workers",
                "Explain blockchain technology in simple terms",
                "Share lessons learned from starting a business",
            ]}
            tokenCost={15}
            gradient="from-sky-400 to-blue-600"
            category="Social Media"
        />
    );
}
