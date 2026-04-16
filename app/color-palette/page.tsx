"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Palette } from "lucide-react";

export default function ColorPalettePage() {
    return (
        <ToolPage
            toolId="color-palette"
            title="Color Palette Generator"
            description="Create harmonious, on-brand color palettes from mood descriptions with hex codes, RGB values, and contrast ratios."
            icon={Palette}
            placeholder="Describe the mood, brand personality, or visual style you're going for..."
            examplePrompts={[
                "Modern fintech startup: trustworthy, innovative, clean — generate a 5-color palette with hex codes",
                "Warm and cozy coffee shop branding with earthy tones and one accent color",
                "Dark mode UI palette for a developer tools product with accessible contrast ratios",
            ]}
            tokenCost={10}
            gradient="from-pink-500 to-fuchsia-600"
            category="Design & UX"
        />
    );
}
