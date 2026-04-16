"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Newspaper } from "lucide-react";

export default function BlogPostPage() {
    return (
        <ToolPage
            toolId="blog-post"
            title="Blog Post Generator"
            description="Generate SEO-optimized blog posts on any topic with engaging content."
            icon={Newspaper}
            placeholder="Enter your blog topic, target keywords, and any specific points you want covered..."
            examplePrompts={[
                "Write a blog post about the benefits of AI in healthcare",
                "Create a 1000-word article about sustainable living tips",
                "Generate a tech blog post comparing React vs Vue in 2024",
            ]}
            tokenCost={25}
            gradient="from-pink-500 to-rose-600"
            category="Writing"
        />
    );
}
