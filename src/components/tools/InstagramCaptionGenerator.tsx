"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Instagram,
    Sparkles,
    Copy,
    Check,
    Wand2,
    RefreshCw,
    Hash,
    Smile,
    Heart,
    MessageCircle,
    Send,
    Bookmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const VIBES = [
    { value: "aesthetic", label: "✨ Aesthetic" },
    { value: "funny", label: "😂 Funny" },
    { value: "inspirational", label: "💡 Inspirational" },
    { value: "casual", label: "☕ Casual" },
    { value: "promotional", label: "📣 Promotional" },
];

export function InstagramCaptionGenerator() {
    const [description, setDescription] = useState("");
    const [vibe, setVibe] = useState("aesthetic");
    const [useEmojis, setUseEmojis] = useState(true);
    const [useHashtags, setUseHashtags] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [caption, setCaption] = useState("");
    const [copied, setCopied] = useState(false);

    const { toast } = useToast();
    const { user, refreshUser, selectedModel } = useAuth();

    const handleGenerate = async () => {
        if (!description.trim()) {
            toast({
                title: "Description required",
                description: "Please describe your photo first.",
                variant: "destructive",
            });
            return;
        }

        setIsGenerating(true);
        setCaption("");

        try {
            const prompt = `Write an Instagram caption for: "${description}".
            Vibe: ${vibe}.
            Emojis: ${useEmojis ? "Yes, use plenty" : "No"}.
            Hashtags: ${useHashtags ? "Yes, add 5-10 relevant ones at the bottom" : "No"}.
            Return ONLY the caption text.`;

            const response = await fetch("/api/ai/proxy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tool: "instagram-caption",
                    prompt: prompt,
                    model: selectedModel
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate");
            }

            setCaption(data.content || data.result || data.text || "");
            refreshUser?.();

        } catch (error: any) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to generate caption.",
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(caption);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({ title: "Copied!", description: "Caption copied to clipboard." });
    };

    return (
        <Layout>
            <div className="container max-w-6xl py-8 lg:py-12">
                <div className="grid lg:grid-cols-2 gap-12 items-start">

                    {/* Left Column: Controls */}
                    <div className="space-y-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full text-sm font-medium mb-4">
                                <Instagram className="w-4 h-4" />
                                <span>Instagram Toolkit</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight mb-2">Caption Generator</h1>
                            <p className="text-muted-foreground text-lg">
                                Stop staring at a blank screen. detailed captions in seconds.
                            </p>
                        </div>

                        <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="space-y-2">
                                <Label>What's in your photo?</Label>
                                <Textarea
                                    placeholder="e.g. A sunset at the beach with my best friends, holding cocktails..."
                                    className="min-h-[120px] resize-none text-base"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Vibe</Label>
                                    <Select value={vibe} onValueChange={setVibe}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {VIBES.map(v => (
                                                <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className="flex items-center space-x-2">
                                    <Switch id="emojis" checked={useEmojis} onCheckedChange={setUseEmojis} />
                                    <Label htmlFor="emojis" className="cursor-pointer flex items-center gap-2">
                                        <Smile className="w-4 h-4 text-muted-foreground" /> Emojis
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id="hashtags" checked={useHashtags} onCheckedChange={setUseHashtags} />
                                    <Label htmlFor="hashtags" className="cursor-pointer flex items-center gap-2">
                                        <Hash className="w-4 h-4 text-muted-foreground" /> Hashtags
                                    </Label>
                                </div>
                            </div>

                            <Button
                                size="lg"
                                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 transition-opacity"
                                onClick={handleGenerate}
                                disabled={isGenerating || !description}
                            >
                                {isGenerating ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Writing Magic...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-4 h-4 mr-2" />
                                        Generate Caption
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Right Column: Preview */}
                    <div className="relative flex justify-center lg:sticky lg:top-8">
                        {/* Phone Mockup */}
                        <div className="w-[380px] bg-white dark:bg-black rounded-[3rem] border-8 border-slate-900 dark:border-slate-800 shadow-2xl overflow-hidden relative">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 dark:bg-slate-800 rounded-b-2xl z-20" />

                            {/* Header */}
                            <div className="h-14 border-b dark:border-slate-800 flex items-center justify-between px-4 mt-6">
                                <Avatar className="w-8 h-8">
                                    <AvatarFallback>{user?.email?.[0].toUpperCase() || "U"}</AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-sm">New Post</span>
                                <Button variant="ghost" size="sm" className="text-blue-500 font-semibold">Share</Button>
                            </div>

                            {/* Image Placeholder */}
                            <div className="aspect-square bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-300">
                                <Instagram className="w-24 h-24 opacity-20" />
                            </div>

                            {/* Actions */}
                            <div className="p-3 flex justify-between items-center">
                                <div className="flex gap-4">
                                    <Heart className="w-6 h-6" />
                                    <MessageCircle className="w-6 h-6" />
                                    <Send className="w-6 h-6" />
                                </div>
                                <Bookmark className="w-6 h-6" />
                            </div>

                            {/* Caption Area */}
                            <div className="px-4 pb-8 min-h-[200px] text-sm leading-relaxed">
                                <p className="font-semibold mb-1">
                                    {user?.name || "username"}
                                </p>

                                {isGenerating ? (
                                    <div className="space-y-2 animate-pulse">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                                    </div>
                                ) : caption ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="whitespace-pre-wrap"
                                    >
                                        {caption}
                                    </motion.div>
                                ) : (
                                    <span className="text-muted-foreground italic">
                                        Your caption will appear here...
                                    </span>
                                )}
                            </div>

                            {/* Copy Overlay */}
                            {caption && (
                                <div className="absolute bottom-6 right-6">
                                    <Button
                                        size="icon"
                                        className="rounded-full shadow-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100"
                                        onClick={handleCopy}
                                    >
                                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Decor blobs */}
                        <div className="absolute -z-10 top-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
                        <div className="absolute -z-10 bottom-20 -left-20 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
                    </div>
                </div>
            </div>
        </Layout>
    );
}
