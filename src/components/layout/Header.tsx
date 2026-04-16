"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, Search, Bell, Settings, LogOut, ChevronDown, User, Sparkles, Zap, Smartphone, Link as LinkIcon, Menu as MenuIcon, Brain, Wind, Cpu, Command, LayoutDashboard, Crown, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { RTLToggle } from "@/components/ui/rtl-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { ApiKeyDialog } from "@/components/ui/dialog-api-key";
import { AVAILABLE_MODELS, getModelById } from "@/lib/models";
import { useToast } from "@/hooks/use-toast";
import { GlobalSearch } from "@/components/layout/GlobalSearch";

interface HeaderProps {
    onMobileMenuToggle?: () => void;
    isCollapsed?: boolean;
}

export function Header({ onMobileMenuToggle, isCollapsed }: HeaderProps) {
    const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const { logout, user, selectedModel, setSelectedModel, models, isLoadingModels, apiKeys } = useAuth();
    const { settings } = useSettings();
    const router = useRouter();
    const { toast } = useToast();

    const selectedModelData = models?.find(m => m.id === selectedModel) || getModelById(selectedModel);

    const userInitial = (user?.name || user?.email || "?")[0].toUpperCase();
    const userName = user?.name || user?.email?.split("@")[0] || "User";

    const handleLogout = async () => {
        await logout();
    };

    // Mock notifications
    const notifications = [
        {
            id: 1,
            title: "Welcome to AI Suite v5.0!",
            message: "Explore 100+ new AI tools and premium features.",
            time: "Just now",
            unread: true,
            icon: Sparkles,
            color: "text-primary",
        },
        {
            id: 2,
            title: "Credits updated",
            message: "Your account has been credited with 500 tokens.",
            time: "2h ago",
            unread: true,
            icon: Zap,
            color: "text-amber-500",
        },
        {
            id: 3,
            title: "New feature available",
            message: "Try our new Website Builder tool.",
            time: "1d ago",
            unread: false,
            icon: LayoutDashboard,
            color: "text-emerald-500",
        },
    ];

    const unreadCount = notifications.filter((n) => n.unread).length;

    return (
        <>
            <ApiKeyDialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen} />
            <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

            <header className="sticky top-0 z-40 h-16 bg-transparent transition-all duration-300">
                {/* Subtle gradient overlay removed to ensure complete transparency at the top */}

                <div className="relative flex items-center justify-between h-full px-4 lg:px-6">
                    {/* Left Section */}
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden h-9 w-9"
                            onClick={onMobileMenuToggle}
                        >
                            <Menu className="w-5 h-5" />
                        </Button>

                        {/* Logo (visible when sidebar is collapsed) */}
                        {isCollapsed && (
                            <Link
                                href="/dashboard"
                                className="hidden lg:flex items-center gap-2"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-ai-secondary flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden">
                                    {settings?.metadata?.logoUrl ? (
                                        <img src={settings.metadata.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <Sparkles className="w-4 h-4 text-white" />
                                    )}
                                </div>
                                <span className="font-bold text-lg tracking-tight">
                                    {settings?.metadata?.siteName || "AI Suite"}
                                </span>
                            </Link>
                        )}

                        {/* Search Bar - Desktop */}
                        <div className="hidden md:flex items-center">
                            <button
                                onClick={() => setSearchOpen(true)}
                                className={cn(
                                    "relative group transition-all duration-300 flex items-center text-left",
                                    "w-64 lg:w-80 h-10 rounded-xl px-3",
                                    "bg-muted/40 hover:bg-muted/60",
                                    "focus:bg-background focus:ring-2 focus:ring-primary/10",
                                    "text-muted-foreground transition-all duration-200"
                                )}
                            >
                                <Search className="w-4 h-4 mr-2 transition-colors group-hover:text-primary" />
                                <span className="text-sm">Search tools, features...</span>
                                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-0.5 px-2 py-1 text-[10px] font-medium text-muted-foreground/60 bg-background/80 rounded-md">
                                    <Command className="w-2.5 h-2.5" />K
                                </kbd>
                            </button>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
                        {/* Mobile Search Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden h-9 w-9"
                            onClick={() => setSearchOpen(true)}
                        >
                            <Search className="w-5 h-5" />
                        </Button>

                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* RTL Toggle */}
                        <div className="flex">
                            <RTLToggle />
                        </div>

                        {/* Language Switcher */}
                        <div className="hidden lg:flex">
                            <LanguageSwitcher />
                        </div>

                        {/* Notifications */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="relative h-9 w-9"
                                >
                                    <Bell className="w-[18px] h-[18px]" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                                            {unreadCount}
                                        </span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                align="end"
                                className="w-80 p-0 rounded-2xl overflow-hidden shadow-2xl border-none"
                            >
                                <div className="p-4 bg-muted/30 ">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                                                {unreadCount} new
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="max-h-80 overflow-auto">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={cn(
                                                "p-4 border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors",
                                                notification.unread && "bg-primary/[0.03]"
                                            )}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={cn(
                                                    "p-2 rounded-xl bg-muted/50",
                                                    notification.color
                                                )}>
                                                    <notification.icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-medium truncate">
                                                            {notification.title}
                                                        </p>
                                                        {notification.unread && (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground/60 mt-1">
                                                        {notification.time}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                 <div className="p-3 bg-muted/20">
                                    <Button
                                        variant="ghost"
                                        className="w-full h-9 text-sm font-medium"
                                    >
                                        View all notifications
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Model Selector */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2 hover:bg-muted/50 hover:text-black h-9 px-2 sm:px-3 rounded-xl bg-primary/5 transition-all outline-none border-none"
                                >
                                    {selectedModelData?.provider === 'google' ? (
                                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                                    ) : selectedModelData?.provider === 'openai' ? (
                                        <Zap className="w-3.5 h-3.5 text-green-500" />
                                    ) : (
                                        <Zap className="w-3.5 h-3.5 text-purple-500" />
                                    )}
                                    <span className="font-medium text-xs hidden sm:inline-block ">
                                        {selectedModelData?.name || "Select Model"}
                                    </span>
                                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-xl max-h-[300px] overflow-y-auto">
                                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground  px-2 py-1.5">
                                    Select AI Model
                                </DropdownMenuLabel>
                                {isLoadingModels ? (
                                    <div className="p-4 text-center text-xs text-muted-foreground">
                                        Loading models...
                                    </div>
                                ) : (
                                    models?.map((model) => (
                                        <DropdownMenuItem
                                            key={model.id}
                                            onClick={() => {
                                                const modelConfig = model as typeof model & { isEnvConfigured?: boolean };

                                                // Check if model is gemini-2.5-flash (free/default)
                                                if (model.id === 'gemini-2.5-flash') {
                                                    setSelectedModel(model.id);
                                                    return;
                                                }

                                                // Check if API key exists in env (server-side check via model.isEnvConfigured)
                                                // or in local storage (client-side check via apiKeys)
                                                const hasKey = modelConfig.isEnvConfigured || (model.provider && apiKeys[model.provider]);

                                                if (hasKey) {
                                                    setSelectedModel(model.id);
                                                } else {
                                                    setApiKeyDialogOpen(true);
                                                    toast({
                                                        title: "Model Not Available",
                                                        description: "In the demo this model was not supported. Please configure an API key.",
                                                        variant: "destructive",
                                                    });
                                                }
                                            }}
                                            className="gap-2 cursor-pointer"
                                        >
                                            <div className={cn(
                                                "p-1 rounded",
                                                model.provider === 'google' ? "bg-blue-500/10 text-blue-500" :
                                                    model.provider === 'openai' ? "bg-green-500/10 text-green-500" :
                                                        model.provider === 'anthropic' ? "bg-orange-500/10 text-orange-500" :
                                                            model.provider === 'mistral' ? "bg-yellow-500/10 text-yellow-500" :
                                                                model.provider === 'groq' ? "bg-red-500/10 text-red-500" :
                                                                    "bg-purple-500/10 text-purple-500"
                                            )}>
                                                {model.provider === 'google' && <Sparkles className="w-3.5 h-3.5" />}
                                                {model.provider === 'openai' && <Zap className="w-3.5 h-3.5" />}
                                                {model.provider === 'anthropic' && <Brain className="w-3.5 h-3.5" />}
                                                {model.provider === 'mistral' && <Wind className="w-3.5 h-3.5" />}
                                                {model.provider === 'groq' && <Cpu className="w-3.5 h-3.5" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{model.name}</span>
                                                <span className="text-[10px] text-muted-foreground line-clamp-1">{model.description}</span>
                                            </div>
                                            {selectedModel === model.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                                        </DropdownMenuItem>
                                    ))
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Settings - Desktop only */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setApiKeyDialogOpen(true)}
                            className="hidden sm:flex h-9 w-9"
                        >
                            <Settings className="w-[18px] h-[18px]" />
                        </Button>

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-10 gap-2 px-2 hover:bg-muted/50 hover:text-black rounded-xl"
                                >
                                    <Avatar className="w-8 h-8 ring-2 ring-primary/10">
                                        <AvatarImage />
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-ai-secondary text-white text-sm font-semibold">
                                            {userInitial}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden lg:flex flex-col items-start">
                                        <span className="text-sm font-medium leading-none">
                                            {userName}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                            {user?.role === "admin" ? (
                                                <>
                                                    <Crown className="w-3 h-3 text-amber-500" />
                                                    Admin
                                                </>
                                            ) : (
                                                <>
                                                    <Zap className="w-3 h-3 text-primary" />
                                                    {user?.planName || "Free Plan"}
                                                </>
                                            )}
                                        </span>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-muted-foreground hidden lg:block" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56 rounded-xl"
                                align="end"
                                forceMount
                            >
                                <DropdownMenuLabel className="font-normal p-3">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-semibold">{userName}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem
                                        onSelect={() => router.push("/dashboard")}
                                        className="cursor-pointer"
                                    >
                                        <LayoutDashboard className="mr-2.5 h-4 w-4 text-muted-foreground" />
                                        Dashboard
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onSelect={() => setApiKeyDialogOpen(true)}
                                        className="cursor-pointer"
                                    >
                                        <Key className="mr-2.5 h-4 w-4 text-muted-foreground" />
                                        API Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onSelect={() => router.push("/pricing")}
                                        className="cursor-pointer"
                                    >
                                        <Crown className="mr-2.5 h-4 w-4 text-amber-500" />
                                        Upgrade Plan
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                {user?.role === "admin" && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onSelect={() => router.push("/admin/dashboard")}
                                            className="cursor-pointer"
                                        >
                                            <Settings className="mr-2.5 h-4 w-4 text-muted-foreground" />
                                            Admin Dashboard
                                        </DropdownMenuItem>
                                    </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive cursor-pointer focus:bg-destructive/10"
                                    onSelect={handleLogout}
                                >
                                    <LogOut className="mr-2.5 h-4 w-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>
        </>
    );
}
