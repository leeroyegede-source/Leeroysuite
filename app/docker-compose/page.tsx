"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Container } from "lucide-react";

export default function DockerComposePage() {
    return (
        <ToolPage
            toolId="docker-compose"
            title="Docker Compose Generator"
            description="Generate production-ready docker-compose.yml files from stack descriptions with networking, volumes, and environment config."
            icon={Container}
            placeholder="Describe your application stack — services, databases, caching, and any other dependencies..."
            examplePrompts={[
                "Next.js app with PostgreSQL, Redis, and Nginx reverse proxy — generate docker-compose.yml",
                "Python Django app with MySQL, Celery, RabbitMQ, and Elasticsearch",
                "Full MERN stack with MongoDB, Express, React, Node.js, and a development hot-reload setup",
            ]}
            tokenCost={15}
            gradient="from-blue-500 to-sky-600"
            category="Development"
        />
    );
}
