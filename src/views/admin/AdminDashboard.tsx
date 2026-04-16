"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Users,
    Activity,
    Zap,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    LayoutTemplate,
    TrendingUp,
    Clock,
    Shield,
    Server,
    Database,
    Globe,
    AlertTriangle,
    CheckCircle2,
    UserPlus,
    CreditCard,
    Settings,
    BarChart3,
    PieChart,
    type LucideIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
} from "recharts";

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover/95 backdrop-blur-sm border rounded-lg shadow-xl p-3">
                <p className="font-semibold mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-muted-foreground capitalize">
                            {entry.dataKey}:
                        </span>
                        <span className="font-medium">
                            {typeof entry.value === "number"
                                ? entry.value.toLocaleString()
                                : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

interface StatCardProps {
    title: string;
    value: string | number;
    description: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color: string;
}

function StatCard({ title, value, description, icon: Icon, trend, color }: StatCardProps) {
    return (
        <motion.div variants={fadeInUp}>
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 ${color}`} />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${color.replace('bg-', 'bg-').replace('-500', '-500/10')}`}>
                        <Icon className={`h-4 w-4 ${color.replace('bg-', 'text-')}`} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{value}</span>
                        {trend && (
                            <span
                                className={`flex items-center text-xs font-medium ${trend.isPositive ? "text-green-500" : "text-red-500"
                                    }`}
                            >
                                {trend.isPositive ? (
                                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                                ) : (
                                    <ArrowDownRight className="w-3 h-3 mr-0.5" />
                                )}
                                {trend.value}%
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// Mock data for charts (fallback)
const fallbackRevenueData = [
    { month: "Jan", revenue: 4500, users: 120 },
    { month: "Feb", revenue: 5200, users: 145 },
    { month: "Mar", revenue: 6100, users: 190 },
    { month: "Apr", revenue: 7800, users: 250 },
    { month: "May", revenue: 9200, users: 320 },
    { month: "Jun", revenue: 11500, users: 410 },
];

const fallbackToolUsageData = [
    { name: "Chat", value: 35, color: "#8b5cf6" },
    { name: "Code", value: 25, color: "#10b981" },
    { name: "Writer", value: 20, color: "#f59e0b" },
    { name: "Image", value: 12, color: "#ec4899" },
    { name: "Other", value: 8, color: "#6b7280" },
];

const fallbackRecentActivities = [
    { type: "signup", user: "john@example.com", time: "2 min ago" },
    { type: "payment", user: "sarah@company.com", amount: "$19.99", time: "15 min ago" },
    { type: "signup", user: "mike@startup.io", time: "32 min ago" },
    { type: "payment", user: "lisa@agency.co", amount: "$49.99", time: "1 hour ago" },
    { type: "signup", user: "david@tech.com", time: "2 hours ago" },
];

const systemStatus = [
    { name: "API Server", status: "operational", latency: "45ms" },
    { name: "Database", status: "operational", latency: "12ms" },
    { name: "AI Services", status: "operational", latency: "230ms" },
    { name: "CDN", status: "operational", latency: "8ms" },
];

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/admin/stats");
                if (!res.ok) throw new Error("Failed to fetch stats");
                const statsData = await res.json();
                setData(statsData);
            } catch (error: any) {
                // Use mock data if API fails
                setData({
                    totalUsers: 1247,
                    activeUsers: 892,
                    totalTokensDistributed: 4500000,
                    totalWebsites: 3421,
                    totalRevenue: 45200,
                    newUsersToday: 47,
                    revenueData: fallbackRevenueData,
                    toolUsageData: fallbackToolUsageData,
                    recentActivities: fallbackRecentActivities,
                    tokenUsage: fallbackRevenueData,
                    recentUsers: [],
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [toast]);

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const stats = [
        {
            title: "Total Users",
            value: data?.totalUsers?.toLocaleString() || "1,247",
            description: "Registered accounts",
            icon: Users,
            trend: { value: 12, isPositive: true },
            color: "bg-blue-500",
        },
        {
            title: "Monthly Revenue",
            value: `$${(data?.totalRevenue || 45200).toLocaleString()}`,
            description: "This month",
            icon: DollarSign,
            trend: { value: 23, isPositive: true },
            color: "bg-green-500",
        },
        {
            title: "Tokens Used",
            value: `${((data?.totalTokensDistributed || 4500000) / 1000000).toFixed(1)}M`,
            description: "Total consumed",
            icon: Zap,
            trend: { value: 8, isPositive: true },
            color: "bg-amber-500",
        },
        {
            title: "Websites Created",
            value: data?.totalWebsites?.toLocaleString() || "3,421",
            description: "AI-generated sites",
            icon: LayoutTemplate,
            trend: { value: 34, isPositive: true },
            color: "bg-purple-500",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back! Here's an overview of your platform.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" asChild>
                        <Link href="/admin/settings">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/admin/users">
                            <Users className="w-4 h-4 mr-2" />
                            Manage Users
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <motion.div
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
            >
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </motion.div>

            {/* Charts Row */}
            <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                {/* Revenue Chart */}
                <Card className="flex-1 w-full flex flex-col">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Revenue & Growth</CardTitle>
                                <CardDescription>
                                    Monthly revenue and user acquisition
                                </CardDescription>
                            </div>
                            <Badge variant="soft-success">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                +23% this month
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="h-full min-h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%" className="focus:outline-none" style={{ outline: 'none' }}>
                                <AreaChart data={data?.revenueData?.length ? data.revenueData : fallbackRevenueData} style={{ outline: 'none' }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Tool Usage Pie Chart */}
                <Card className="w-full lg:w-[32%] lg:min-w-[300px] flex flex-col max-h-[420px]">
                    <CardHeader className="shrink-0">
                        <CardTitle>Tool Usage</CardTitle>
                        <CardDescription>Distribution by AI tool</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-0">
                        <div className="h-[140px] shrink-0">
                            <ResponsiveContainer width="100%" height="100%" className="focus:outline-none" style={{ outline: 'none' }}>
                                <RechartsPieChart style={{ outline: 'none' }}>
                                    <Pie
                                        data={data?.toolUsageData?.length ? data.toolUsageData : fallbackToolUsageData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={65}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {(data?.toolUsageData?.length ? data.toolUsageData : fallbackToolUsageData).map((entry: any, index: number) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                        <ScrollArea className="flex-1 mt-4 -mr-4 pr-4">
                            <div className="grid grid-cols-2 gap-x-2 gap-y-3 pb-2">
                                {(data?.toolUsageData?.length ? data.toolUsageData : fallbackToolUsageData).map((item: any, index: number) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                                            {item.name}
                                        </span>
                                        <span className="text-xs font-medium ml-auto shrink-0">
                                            {item.value}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent Activity */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>Latest user actions</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/admin/activity">View All</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[280px]">
                            <div className="space-y-4">
                                {(data?.recentActivities || fallbackRecentActivities).map((activity: any, index: number) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div
                                            className={`p-2 rounded-lg ${activity.type === "payment"
                                                ? "bg-green-500/10 text-green-500"
                                                : "bg-blue-500/10 text-blue-500"
                                                }`}
                                        >
                                            {activity.type === "payment" ? <CreditCard className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {activity.user}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {activity.type === "payment"
                                                    ? `Payment received: ${activity.amount}`
                                                    : "New user signup"}
                                            </p>
                                        </div>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {activity.time}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* System Status */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>System Status</CardTitle>
                                <CardDescription>Service health</CardDescription>
                            </div>
                            <Badge variant="soft-success">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                All Systems Go
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {systemStatus.map((service, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <span className="text-sm font-medium">
                                            {service.name}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {service.latency}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Server Load</span>
                                <span className="text-sm text-muted-foreground">34%</span>
                            </div>
                            <Progress value={34} className="h-2" />
                        </div>

                        <Button variant="outline" className="w-full mt-4" asChild>
                            <Link href="/admin/logs">
                                <Server className="w-4 h-4 mr-2" />
                                View System Logs
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Add User", icon: UserPlus, href: "/admin/users/new", color: "bg-blue-500" },
                            { label: "Create Plan", icon: CreditCard, href: "/admin/plans/new", color: "bg-green-500" },
                            { label: "View Analytics", icon: BarChart3, href: "/admin/analytics", color: "bg-purple-500" },
                            { label: "System Settings", icon: Settings, href: "/admin/settings", color: "bg-orange-500" },
                        ].map((action, index) => (
                            <Link key={index} href={action.href}>
                                <Card className="hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer">
                                    <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                                        <div className={`p-3 rounded-xl ${action.color}/10`}>
                                            <action.icon className={`w-6 h-6 ${action.color.replace('bg-', 'text-')}`} />
                                        </div>
                                        <span className="text-sm font-medium">{action.label}</span>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
