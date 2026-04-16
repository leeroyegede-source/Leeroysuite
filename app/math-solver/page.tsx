"use client";

import { ToolPage } from "@/components/tools/ToolPage";
import { Cpu } from "lucide-react";

export default function MathSolverPage() {
    return (
        <ToolPage
            toolId="math-solver"
            title="Math Problem Solver"
            description="Solve math problems step-by-step with detailed explanations."
            icon={Cpu}
            placeholder="Enter your math problem (algebra, calculus, statistics, etc.)..."
            examplePrompts={[
                "Solve: 2x + 5 = 15",
                "Find the derivative of f(x) = x³ + 2x²",
                "Calculate the probability of rolling two sixes",
            ]}
            tokenCost={15}
            gradient="from-blue-600 to-purple-600"
            category="Education"
        />
    );
}
