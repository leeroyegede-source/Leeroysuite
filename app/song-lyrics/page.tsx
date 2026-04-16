"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Music } from "lucide-react";

export default function SongLyricsPage() {
    return (
        <ToolPage
            toolId="song-lyrics"
            title="Song Lyrics Generator"
            description="Write original song lyrics in any genre and style."
            icon={Music}
            placeholder="Describe the theme, mood, genre, and any specific elements..."
            examplePrompts={[
                "Pop song about falling in love",
                "Country song about hometown memories",
                "Rap verse about overcoming obstacles",
            ]}
            tokenCost={20}
            gradient="from-pink-500 to-rose-600"
            category="Creative"
        />
    );
}
