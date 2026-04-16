"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Megaphone } from "lucide-react";

export default function ElevatorPitchPage() {
    return (
        <ToolPage
            toolId="elevator-pitch"
            title="Elevator Pitch Generator"
            description="Craft concise, impactful elevator pitches in 30, 60, and 90-second versions with hooks, value props, and calls to action."
            icon={Megaphone}
            placeholder="Describe your product, service, or idea — what it does, who it's for, and what makes it unique..."
            examplePrompts={[
                "Create a 30-second elevator pitch for an AI-powered personal finance app targeting millennials",
                "Generate 3 pitch versions (30s, 60s, 90s) for a sustainable packaging startup",
                "Write a compelling elevator pitch for a job interview at a top tech company as a product manager",
            ]}
            tokenCost={15}
            gradient="from-fuchsia-500 to-pink-600"
            category="Communication"
        />
    );
}
