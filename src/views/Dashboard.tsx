"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    MessageSquare,
    BarChart3,
    PenTool,
    Code,
    FileText,
    Mail,
    Image,
    Database,
    CheckSquare,
    ArrowRight,
    Zap,
    Users,
    TrendingUp,
    Clock,
    Search,
    Sparkles,
    LayoutTemplate,
    Globe,
    Languages,
    Brain,
    Briefcase,
    Share2,
    ChefHat,
    GraduationCap,
    Calendar,
    Crown,
    FileSearch,
    Bot,
    Shield,
    Heart,
    Palette,
    Target,
    Flame,
    Star,
    ArrowUpRight,
    Activity,
    ChevronRight,
    Plus,
    type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { AVAILABLE_FEATURES, FEATURE_CATEGORIES, getFeaturesByCategory, type FeatureItem } from "@/lib/features";
import { getAllSidebarTools } from "@/lib/sidebar-routes";
import { InstallPWAButton } from "@/components/InstallPWAButton";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06 },
    },
} as const;

const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
    },
} as const;

// Get all tools from sidebar and merge with feature details
const ALL_TOOLS = getAllSidebarTools().map(tool => {
    // Find matching feature details if available
    const featureDetails = AVAILABLE_FEATURES.find(f => f.id === tool.id);

    return {
        id: tool.id,
        label: tool.title,
        category: tool.category,
        description: featureDetails?.description,
        tokenCost: featureDetails?.tokenCost || 10, // Default cost
        isNew: tool.isNew,
        isPro: tool.isPro,
        url: tool.url,
        icon: tool.icon // Keep icon for display
    };
});

// Category config with icons and colors
const categoryConfig: Record<string, { icon: LucideIcon; gradient: string; color: string; bgLight: string }> = {
    core: { icon: Sparkles, gradient: "from-violet-500 to-purple-600", color: "text-violet-500", bgLight: "bg-violet-500/10" },
    writing: { icon: PenTool, gradient: "from-pink-500 to-rose-600", color: "text-pink-500", bgLight: "bg-pink-500/10" },
    social: { icon: Share2, gradient: "from-sky-500 to-blue-600", color: "text-sky-500", bgLight: "bg-sky-500/10" },
    marketing: { icon: TrendingUp, gradient: "from-orange-500 to-amber-600", color: "text-orange-500", bgLight: "bg-orange-500/10" },
    business: { icon: Briefcase, gradient: "from-slate-500 to-slate-700", color: "text-slate-500", bgLight: "bg-slate-500/10" },
    development: { icon: Code, gradient: "from-emerald-500 to-green-600", color: "text-emerald-500", bgLight: "bg-emerald-500/10" },
    education: { icon: GraduationCap, gradient: "from-indigo-500 to-blue-600", color: "text-indigo-500", bgLight: "bg-indigo-500/10" },
    creative: { icon: Palette, gradient: "from-fuchsia-500 to-pink-600", color: "text-fuchsia-500", bgLight: "bg-fuchsia-500/10" },
    legal: { icon: Shield, gradient: "from-gray-500 to-gray-700", color: "text-gray-500", bgLight: "bg-gray-500/10" },
    seo: { icon: Search, gradient: "from-teal-500 to-cyan-600", color: "text-teal-500", bgLight: "bg-teal-500/10" },
    personal: { icon: Heart, gradient: "from-rose-500 to-pink-600", color: "text-rose-500", bgLight: "bg-rose-500/10" },
    agents: { icon: Bot, gradient: "from-violet-600 to-indigo-700", color: "text-violet-600", bgLight: "bg-violet-600/10" },
    "data-analytics": { icon: BarChart3, gradient: "from-cyan-500 to-blue-600", color: "text-cyan-500", bgLight: "bg-cyan-500/10" },
    "design-ux": { icon: Palette, gradient: "from-pink-500 to-rose-500", color: "text-pink-500", bgLight: "bg-pink-500/10" },
    "health-wellness": { icon: Activity, gradient: "from-green-500 to-emerald-600", color: "text-green-500", bgLight: "bg-green-500/10" },
    communication: { icon: MessageSquare, gradient: "from-indigo-500 to-violet-600", color: "text-indigo-500", bgLight: "bg-indigo-500/10" },
};

// Mock usage data
const usageData = [
    { name: "Mon", usage: 120, tokens: 2400 },
    { name: "Tue", usage: 180, tokens: 3600 },
    { name: "Wed", usage: 150, tokens: 3000 },
    { name: "Thu", usage: 220, tokens: 4400 },
    { name: "Fri", usage: 280, tokens: 5600 },
    { name: "Sat", usage: 190, tokens: 3800 },
    { name: "Sun", usage: 240, tokens: 4800 },
];

const categoryUsage = [
    { name: "Writing", value: 35, color: "#ec4899" },
    { name: "Code", value: 25, color: "#10b981" },
    { name: "Social", value: 20, color: "#0ea5e9" },
    { name: "Business", value: 12, color: "#64748b" },
    { name: "Other", value: 8, color: "#8b5cf6" },
];

// Quick action tools
const quickActions = [
    { id: "chat", title: "AI Chat", subtitle: "Conversational AI", icon: MessageSquare, url: "/chat", gradient: "from-sky-500 to-blue-600" },
    { id: "writer", title: "Content Writer", subtitle: "Blog & articles", icon: PenTool, url: "/writer", gradient: "from-pink-500 to-rose-600" },
    { id: "code", title: "Code Generator", subtitle: "Any language", icon: Code, url: "/code", gradient: "from-emerald-500 to-green-600" },
    { id: "website", title: "Website Builder", subtitle: "AI-powered sites", icon: Globe, url: "/website", gradient: "from-violet-500 to-purple-600", isNew: true },
    { id: "image", title: "Image Generator", subtitle: "DALL-E & more", icon: Image, url: "/image-generator", gradient: "from-amber-500 to-orange-600" },
    { id: "translator", title: "Translator Hub", subtitle: "100+ languages", icon: Languages, url: "/translator", gradient: "from-teal-500 to-cyan-600" },
];

// Stats cards data
const getStatsCards = (tokens: number, allowedToolsCount: number) => [
    {
        title: "Token Balance",
        value: tokens.toLocaleString(),
        subtitle: "Available credits",
        icon: Zap,
        trend: "+12%",
        trendUp: true,
        gradient: "from-amber-500 to-orange-600",
        iconBg: "bg-amber-500/15",
        iconColor: "text-amber-500",
    },
    {
        title: "AI Tools",
        value: allowedToolsCount.toString(),
        subtitle: "Ready to use",
        icon: Sparkles,
        trend: "+48 new",
        trendUp: true,
        gradient: "from-violet-500 to-purple-600",
        iconBg: "bg-violet-500/15",
        iconColor: "text-violet-500",
    },
    {
        title: "Generations",
        value: "1,380",
        subtitle: "This week",
        icon: Activity,
        trend: "+23%",
        trendUp: true,
        gradient: "from-emerald-500 to-green-600",
        iconBg: "bg-emerald-500/15",
        iconColor: "text-emerald-500",
    },
    {
        title: "Time Saved",
        value: "24h",
        subtitle: "This month",
        icon: Clock,
        trend: "+8h",
        trendUp: true,
        gradient: "from-sky-500 to-blue-600",
        iconBg: "bg-sky-500/15",
        iconColor: "text-sky-500",
    },
];

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover/95 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-3">
                <p className="font-semibold text-sm mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-muted-foreground capitalize">{entry.dataKey}:</span>
                        <span className="font-medium">{entry.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function Dashboard() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const { user } = useAuth();

    const userTokens = user?.tokens || 1000;

    // Filter features based on user package
    const allowedTools = useMemo(() => {
        if (!user || user.role === "admin" || user.planName === "Enterprise" || !user.aiTools) return ALL_TOOLS;
        return ALL_TOOLS.filter(t => user.aiTools!.includes(t.id));
    }, [user]);

    // Filter features based on search and category
    const filteredFeatures = useMemo(() => {
        return allowedTools.filter((feature) => {
            const matchesSearch = feature.label.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === "all" || feature.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory, allowedTools]);

    // Filter quick actions
    const allowedQuickActions = useMemo(() => {
        if (!user || user.role === "admin" || user.planName === "Enterprise" || !user.aiTools) return quickActions;
        return quickActions.filter(action => user.aiTools!.includes(action.id));
    }, [user]);

    // Get new features count
    const newFeaturesCount = allowedTools.filter(f => f.isNew).length;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-[1600px] mx-auto"
        >
            {/* Welcome Header */}
            <motion.div variants={itemVariants} className="space-y-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                            Welcome back{user?.name ? `, ${user.name}` : ""}
                        </h1>
                        <span className="text-2xl lg:text-3xl">👋</span>
                    </div>
                    {/* <InstallPWAButton /> */}
                </div>
                <p className="text-muted-foreground">
                    Your AI-powered workspace with {allowedTools.length}+ tools ready to boost your productivity
                </p>
            </motion.div>

            {/* Stats Cards - Premium Design */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {getStatsCards(userTokens, allowedTools.length).map((stat, index) => (
                    <Card
                        key={index}
                        className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm group hover:border-primary/20 transition-all duration-300"
                    >
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                                    <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                                </div>
                                <div className={cn(
                                    "p-2.5 rounded-xl",
                                    stat.iconBg
                                )}>
                                    <stat.icon className={cn("w-5 h-5", stat.iconColor)} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-1.5 text-xs">
                                <div className={cn(
                                    "flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-medium",
                                    stat.trendUp ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600"
                                )}>
                                    <ArrowUpRight className={cn(
                                        "w-3 h-3",
                                        !stat.trendUp && "rotate-90"
                                    )} />
                                    {stat.trend}
                                </div>
                                <span className="text-muted-foreground">vs last week</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </motion.div>

            {/* Quick Actions - Modern Design */}
            <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold">Quick Actions</h2>
                        <p className="text-sm text-muted-foreground">Jump right into your favorite tools</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary" asChild>
                        <Link href="/chat">
                            View all <ChevronRight className="w-4 h-4 ml-0.5" />
                        </Link>
                    </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {allowedQuickActions.map((action) => (
                        <Link key={action.id} href={action.url}>
                            <Card className="group h-full border-border/50 bg-card/50 hover:bg-card hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer">
                                <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                                    <div className={cn(
                                        "p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
                                        `bg-gradient-to-br ${action.gradient}`
                                    )}>
                                        <action.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="font-medium text-sm">{action.title}</p>
                                        <p className="text-[11px] text-muted-foreground">{action.subtitle}</p>
                                    </div>
                                    {action.isNew && (
                                        <span className="px-2 py-0.5 text-[9px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full uppercase tracking-wide">
                                            New
                                        </span>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </motion.div>

            {/* Charts Section - Refined */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Usage Chart */}
                <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base">Usage Overview</CardTitle>
                                <CardDescription>Your AI generations this week</CardDescription>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                                <Activity className="w-3 h-3 mr-1" />
                                Live
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px] focus:outline-none">
                            <ResponsiveContainer width="100%" height="100%" className="focus:outline-none" style={{ outline: 'none' }}>
                                <AreaChart data={usageData} style={{ outline: 'none' }}>
                                    <defs>
                                        <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        className="text-xs"
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        className="text-xs"
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="usage"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2.5}
                                        fill="url(#colorUsage)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Category Breakdown */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Category Usage</CardTitle>
                        <CardDescription>Tools by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[180px]">
                            <ResponsiveContainer width="100%" height="100%" className="focus:outline-none" style={{ outline: 'none' }}>
                                <PieChart style={{ outline: 'none' }}>
                                    <Pie
                                        data={categoryUsage}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={70}
                                        paddingAngle={3}
                                        dataKey="value"
                                        strokeWidth={0}
                                    >
                                        {categoryUsage.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 space-y-2">
                            {categoryUsage.map((cat, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                        <span className="text-muted-foreground">{cat.name}</span>
                                    </div>
                                    <span className="font-medium">{cat.value}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Browse All Tools - Premium Grid */}
            <motion.div variants={itemVariants}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div>
                        <h2 className="text-lg font-semibold">Browse All Tools</h2>
                        <p className="text-sm text-muted-foreground">
                            {allowedTools.length} tools available • {newFeaturesCount} new this month
                        </p>
                    </div>
                    <div className="relative w-full sm:w-72 group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black font-bold z-20 pointer-events-none" />
                        <Input
                            placeholder="Search tools..."
                            className="pl-10 h-11 bg-background border-2 border-primary/20 shadow-sm shadow-primary/5 focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 rounded-xl font-medium relative z-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Category Filters - Pill Style */}
                <div className="flex flex-wrap gap-2 mb-5">
                    <Button
                        variant={activeCategory === "all" ? "default" : "secondary"}
                        size="sm"
                        onClick={() => setActiveCategory("all")}
                        className="rounded-full h-8 px-4"
                    >
                        All Tools
                        <Badge variant={activeCategory === "all" ? "secondary" : "outline"} className="ml-1.5 px-1.5 text-[10px]">
                            {allowedTools.length}
                        </Badge>
                    </Button>
                    {FEATURE_CATEGORIES.slice(0, 8).map((cat) => {
                        const config = categoryConfig[cat.id];
                        const count = getFeaturesByCategory(cat.id).length;
                        const Icon = config?.icon || Sparkles;
                        const isActive = activeCategory === cat.id;
                        return (
                            <Button
                                key={cat.id}
                                variant={isActive ? "default" : "secondary"}
                                size="sm"
                                onClick={() => setActiveCategory(cat.id)}
                                className="rounded-full h-8 px-3"
                            >
                                <Icon className="w-3.5 h-3.5 mr-1.5" />
                                {cat.label}
                            </Button>
                        );
                    })}
                </div>

                {/* Tools Grid - Refined Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredFeatures.slice(0, 12).map((feature) => {
                        const config = categoryConfig[feature.category] || categoryConfig.core;
                        const Icon = config.icon;
                        return (
                            <Link key={feature.id} href={`/${feature.id}`}>
                                <Card className="group h-full border-border/50 bg-card/50 hover:bg-card hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer">
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={cn(
                                                "p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-105",
                                                `bg-gradient-to-br ${config.gradient}`
                                            )}>
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex gap-1">
                                                {feature.isNew && (
                                                    <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded uppercase tracking-wide">
                                                        New
                                                    </span>
                                                )}
                                                {feature.isPro && (
                                                    <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded uppercase tracking-wide">
                                                        Pro
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-[15px] mb-1 group-hover:text-primary transition-colors">
                                            {feature.label}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                            {feature.description || `Generate ${feature.label.toLowerCase()} with AI`}
                                        </p>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <Zap className="w-3 h-3 text-amber-500" />
                                                {feature.tokenCost || 10} tokens
                                            </span>
                                            <span className="text-primary flex items-center gap-0.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                Open <ArrowRight className="w-3 h-3" />
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>

                {filteredFeatures.length > 12 && (
                    <div className="text-center mt-6">
                        <Button variant="outline" size="lg" className="rounded-full" asChild>
                            <Link href="/chat">
                                View All {filteredFeatures.length} Tools
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                )}
            </motion.div>

            {/* Upgrade CTA - Premium Banner */}
            {user?.role !== "admin" && (
                <motion.div variants={itemVariants}>
                    <div className="relative overflow-hidden rounded-2xl">
                        {/* Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600" />

                        {/* Pattern Overlay */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0" style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            }} />
                        </div>

                        {/* Glow Effects */}
                        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/20 rounded-full blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />

                        {/* Content */}
                        <div className="relative p-8">
                            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                                <div className="text-center lg:text-left text-white">
                                    <div className="flex items-center gap-2 justify-center lg:justify-start mb-3">
                                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600">
                                            <Crown className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-amber-300 font-semibold text-sm">Pro Plan</span>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">
                                        Unlock All {ALL_TOOLS.length}+ AI Tools
                                    </h3>
                                    <p className="text-white/80 max-w-lg">
                                        Get unlimited access to all tools, priority support, and 50,000 tokens monthly.
                                    </p>
                                </div>
                                <Button
                                    size="lg"
                                    className="bg-white text-purple-600 hover:bg-white/90 shadow-xl shadow-black/20 font-semibold rounded-xl"
                                    asChild
                                >
                                    <Link href="/pricing">
                                        <Star className="w-4 h-4 mr-2 fill-current" />
                                        Upgrade Now
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
