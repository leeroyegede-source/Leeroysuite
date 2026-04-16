"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Loader2,
    Copy,
    Check,
    Sparkles,
    RotateCcw,
    Download,
    type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { cn } from "@/lib/utils";
import { useGeminiStream } from "@/hooks/useGeminiStream";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface ToolPageProps {
    toolId: string;
    title: string;
    description: string;
    icon: LucideIcon;
    placeholder?: string;
    examplePrompts?: string[];
    tokenCost?: number;
    gradient?: string;
    category?: string;
}

export function ToolPage({
    toolId,
    title,
    description,
    icon: Icon,
    placeholder = "Enter your prompt here...",
    examplePrompts = [],
    tokenCost = 10,
    gradient = "from-violet-500 to-purple-600",
    category = "AI Tool",
}: ToolPageProps) {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { toast } = useToast();
    const { user, isAuthenticated, loading, refreshUser, selectedModel } = useAuth();
    const { generateStream, isStreaming, streamedText } = useGeminiStream();
    const router = useRouter();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, loading, router]);

    const handleSubmit = async () => {
        if (!input.trim()) {
            toast({
                title: "Input required",
                description: "Please enter a prompt to continue.",
                variant: "destructive",
            });
            return;
        }

        setOutput("");

        try {
            await generateStream(
                `You are a helpful AI assistant for the tool: ${title}. ${description}`,
                input,
                undefined,
                undefined,
                toolId
            );
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.message || "Failed to generate content. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output || streamedText);
        setCopied(true);
        toast({ title: "Copied!", description: "Content copied to clipboard" });
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReset = () => {
        setInput("");
        setOutput("");
        textareaRef.current?.focus();
    };

    const handleDownload = () => {
        const content = output || streamedText;
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${toolId}-output.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Show nothing while checking auth
    if (loading || !isAuthenticated) {
        return null;
    }

    // Use streamedText when streaming, or fallback to output (if set)
    const displayContent = isStreaming ? streamedText : (streamedText || output);

    return (
        <Layout>
            <div className="container max-w-5xl py-8 space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center",
                            `bg-gradient-to-br ${gradient}`
                        )}>
                            <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-bold">{title}</h1>
                                <Badge variant="secondary">{category}</Badge>
                            </div>
                            <p className="text-muted-foreground">{description}</p>
                        </div>
                    </div>

                    {/* Token Info */}
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span><strong>{tokenCost}</strong> tokens per use</span>
                        </div>
                        {user && (
                            <div className="text-muted-foreground">
                                Your balance: <strong>{user.tokens?.toLocaleString() || 0}</strong> tokens
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Input Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="text-lg">Input</CardTitle>
                                <CardDescription>Describe what you want to generate</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    ref={textareaRef}
                                    placeholder={placeholder}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="min-h-[200px] resize-none"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && e.ctrlKey) {
                                            handleSubmit();
                                        }
                                    }}
                                />

                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isStreaming || !input.trim()}
                                        className="flex-1"
                                    >
                                        {isStreaming ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4 mr-2" />
                                                Generate
                                            </>
                                        )}
                                    </Button>
                                    <Button variant="outline" onClick={handleReset}>
                                        <RotateCcw className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Example Prompts */}
                                {examplePrompts.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">Try these examples:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {examplePrompts.map((prompt, i) => (
                                                <Button
                                                    key={i}
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => setInput(prompt)}
                                                    className="text-xs"
                                                >
                                                    {prompt.slice(0, 40)}...
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Output Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="h-full">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Output</CardTitle>
                                        <CardDescription>Generated content will appear here</CardDescription>
                                    </div>
                                    {displayContent && (
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={handleCopy}>
                                                {copied ? (
                                                    <Check className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={handleDownload}>
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isStreaming || displayContent ? (
                                    <div className="min-h-[200px] max-h-[500px] overflow-auto rounded-lg border bg-muted/30 p-4">
                                        <MarkdownRenderer content={displayContent} />
                                        {isStreaming && (
                                            <div className="flex gap-1 mt-2">
                                                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center min-h-[200px] text-muted-foreground">
                                        <Icon className="w-12 h-12 mb-4 opacity-20" />
                                        <p>Your generated content will appear here</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
}

export default ToolPage;
