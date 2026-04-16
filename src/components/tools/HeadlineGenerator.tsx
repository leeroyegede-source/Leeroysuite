"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    Copy,
    Check,
    Wand2,
    RefreshCw,
    Share2,
    Zap,
    Target,
    Smile,
    Briefcase,
    Megaphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Layout } from "@/components/layout/Layout";

const TONES = [
    { value: "catchy", label: "Catchy & Viral", icon: Zap },
    { value: "professional", label: "Professional", icon: Briefcase },
    { value: "humorous", label: "Humorous", icon: Smile },
    { value: "urgent", label: "Urgent/FOMO", icon: Megaphone },
    { value: "seo", label: "SEO Optimized", icon: Target },
];

export function HeadlineGenerator() {
    const [topic, setTopic] = useState("");
    const [tone, setTone] = useState("catchy");
    const [count, setCount] = useState(5);
    const [isGenerating, setIsGenerating] = useState(false);
    const [headlines, setHeadlines] = useState<string[]>([]);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const { toast } = useToast();
    const { refreshUser, selectedModel } = useAuth();

    const handleGenerate = async () => {
        if (!topic.trim()) {
            toast({
                title: "Topic required",
                description: "Please enter a topic to generate headlines for.",
                variant: "destructive",
            });
            return;
        }

        setIsGenerating(true);
        setHeadlines([]); // Clear previous

        try {
            // Construct a specialized prompt
            const prompt = `Generate ${count} ${tone} headlines for a content piece about: "${topic}". 
            Return ONLY the headlines, one per line. No numbering, no intro text.`;

            const response = await fetch("/api/ai/proxy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tool: "headline-generator", // Keeping original ID for tracking/compatibility
                    prompt: prompt,
                    model: selectedModel
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate");
            }

            // Parse response into array
            const text = data.content || data.result || data.text || "";
            const lines = text.split("\n")
                .map((line: string) => line.replace(/^\d+[\.\)]\s*/, "").trim()) // Remove "1. " or "1) "
                .filter((line: string) => line.length > 5); // Filter empty/short lines

            setHeadlines(lines);
            refreshUser?.();

        } catch (error: any) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to generate headlines.",
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
        toast({ title: "Copied!", description: "Headline copied to clipboard." });
    };

    return (
        <Layout>
            <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50/50 dark:bg-slate-950/50">
                {/* Background Decoration */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
                </div>

                <div className="container max-w-4xl py-12 space-y-12">

                    {/* Header Section */}
                    <div className="text-center space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl mb-4"
                        >
                            <Zap className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50"
                        >
                            Headline Generator
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
                        >
                            Craft scroll-stopping titles that drive clicks.
                            Perfect for blogs, newsletters, and social media.
                        </motion.p>
                    </div>

                    {/* Generator Controls */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-2"
                    >
                        <div className="flex flex-col md:flex-row gap-2 p-2">
                            <div className="flex-1 relative">
                                <Input
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="What is your content about? (e.g. 'productivity tips')"
                                    className="h-14 pl-6 text-lg bg-transparent border-none shadow-none focus-visible:ring-0"
                                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                                />
                            </div>

                            <div className="flex items-center gap-2 px-2">
                                <Select value={tone} onValueChange={setTone}>
                                    <SelectTrigger className="w-[140px] h-12 border-none bg-slate-100 dark:bg-slate-800 rounded-xl font-medium">
                                        <SelectValue placeholder="Select Tone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TONES.map(t => (
                                            <SelectItem key={t.value} value={t.value}>
                                                <div className="flex items-center gap-2">
                                                    <t.icon className="w-4 h-4" />
                                                    <span>{t.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !topic}
                                    className="h-12 px-8 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 transition-all"
                                >
                                    {isGenerating ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Wand2 className="w-5 h-5 mr-2" />
                                            Generate
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Advanced settings (Quantity) */}
                        <div className="px-6 pb-4 pt-2 flex items-center gap-6 text-sm text-slate-500 border-t border-slate-100 dark:border-slate-800/50 mt-2">
                            <div className="flex items-center gap-3">
                                <span className="font-medium">Quantity: {count}</span>
                                <Slider
                                    value={[count]}
                                    onValueChange={(v) => setCount(v[0])}
                                    min={1}
                                    max={10}
                                    step={1}
                                    className="w-32"
                                />
                            </div>
                            <div className="flex items-center gap-2 ml-auto">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                <span>Uses 10 tokens</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Results Grid */}
                    <div className="space-y-4">
                        <AnimatePresence>
                            {headlines.map((headline, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="group relative overflow-hidden border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/50 transition-colors bg-white dark:bg-slate-900">
                                        <div className="p-6 flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                                                    {headline}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-3">
                                                    <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-normal">
                                                        {tone}
                                                    </Badge>
                                                    <Badge variant="outline" className="border-slate-200 text-slate-400 font-normal">
                                                        {headline.length} chars
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => copyToClipboard(headline, index)}
                                                    className="h-10 w-10 rounded-full hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600"
                                                >
                                                    {copiedIndex === index ? (
                                                        <Check className="w-5 h-5 text-green-500" />
                                                    ) : (
                                                        <Copy className="w-5 h-5" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {!isGenerating && headlines.length === 0 && (
                            <div className="text-center py-20 opacity-50">
                                <div className="inline-block p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                    <Sparkles className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-slate-500">Enter a topic above to start generating headlines</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
