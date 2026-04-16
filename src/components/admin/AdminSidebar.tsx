import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    ShieldCheck,
    ArrowLeft,
    CreditCard,
    Globe,
    Palette,
    LayoutTemplate,
    Zap,
    Database,
    Mail,
    ChevronDown,
    ChevronRight,
    Languages
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const navigationItems = [
    { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
    { title: "User Management", url: "/admin/users", icon: Users },
    { title: "Pricing Plans", url: "/admin/plans", icon: CreditCard },
    { title: "Languages", url: "/admin/languages", icon: Languages },
    // Settings is now a group
];

const settingSubItems = [
    { title: "General", url: "/admin/settings?tab=general", icon: Globe },
    { title: "Appearance", url: "/admin/settings?tab=appearance", icon: Palette },
    { title: "Features", url: "/admin/settings?tab=features", icon: LayoutTemplate },
    { title: "Tokens & Limits", url: "/admin/settings?tab=tokens", icon: Zap },
    { title: "Payment", url: "/admin/settings?tab=payment", icon: Database },
    { title: "Email & SMTP", url: "/admin/settings?tab=email", icon: Mail },
];

interface AdminSidebarProps {
    className?: string;
    isMobile?: boolean;
    isOpen?: boolean;
    onClose?: () => void;
}

export function AdminSidebar({ className, isMobile = false, isOpen = false, onClose }: AdminSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(true);
    const pathname = usePathname();

    const SidebarContent = () => (
        <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
                {(!isCollapsed || isMobile) && (
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-red-500" />
                        <span className="text-lg font-bold text-foreground">Admin Panel</span>
                    </div>
                )}
                {!isMobile && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hover:bg-sidebar-accent text-sidebar-foreground"
                    >
                        {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </Button>
                )}
            </div>

            {/* Navigation */}
            <nav className={cn(
                "flex-1 p-4 space-y-2 overflow-y-auto",
                isCollapsed && !isMobile && "px-2"
            )}>
                {navigationItems.map((item) => {
                    const isActive = pathname === item.url;
                    return (
                        <Link
                            key={item.title}
                            href={item.url}
                            onClick={isMobile ? onClose : undefined}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                isActive
                                    ? "bg-red-500/10 text-red-600 border border-red-500/20"
                                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground",
                                isCollapsed && !isMobile && "justify-center px-2 py-3 mx-1",
                                isMobile && "text-base"
                            )}
                            title={isCollapsed && !isMobile ? item.title : undefined}
                        >
                            <item.icon className={cn(
                                "flex-shrink-0",
                                isCollapsed && !isMobile ? "w-5 h-5" : "w-5 h-5"
                            )} />
                            {(!isCollapsed || isMobile) && (
                                <span className="text-sm font-medium truncate">{item.title}</span>
                            )}
                        </Link>
                    );
                })}

                {/* Settings Group */}
                <Collapsible 
                    open={isSettingsOpen} 
                    onOpenChange={setIsSettingsOpen}
                    className="space-y-1"
                >
                    <CollapsibleTrigger asChild>
                        <button
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 w-full rounded-lg transition-all duration-200",
                                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/70 hover:text-sidebar-foreground",
                                pathname.startsWith("/admin/settings") && "text-sidebar-foreground font-medium",
                                isCollapsed && !isMobile && "justify-center px-2 py-3 mx-1"
                            )}
                        >
                            <Settings className="w-5 h-5 flex-shrink-0" />
                            {(!isCollapsed || isMobile) && (
                                <>
                                    <span className="text-sm font-medium flex-1 text-left truncate">Settings</span>
                                    {isSettingsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </>
                            )}
                        </button>
                    </CollapsibleTrigger>
                    
                    {(!isCollapsed || isMobile) && (
                        <CollapsibleContent className="space-y-1 pl-4">
                            {settingSubItems.map((item) => {
                                const isActive = pathname === "/admin/settings" && (
                                    (window.location.search.includes(item.url.split('?')[1])) ||
                                    (!window.location.search && item.title === "General")
                                );
                                
                                return (
                                    <Link
                                        key={item.title}
                                        href={item.url}
                                        onClick={isMobile ? onClose : undefined}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm",
                                            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                            // Simple check for active state based on URL param
                                            "text-sidebar-foreground/60 hover:text-sidebar-foreground"
                                        )}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        <span className="truncate">{item.title}</span>
                                    </Link>
                                );
                            })}
                        </CollapsibleContent>
                    )}
                </Collapsible>
            </nav>

            {/* Footer */}
            <div className={cn(
                "border-t border-sidebar-border",
                isCollapsed && !isMobile ? "p-2" : "p-4"
            )}>
                <Link
                    href="/dashboard"
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/70",
                        isCollapsed && !isMobile && "justify-center px-2 py-3 mx-1"
                    )}
                    title="Back to App"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {(!isCollapsed || isMobile) && <span className="text-sm font-medium">Back to App</span>}
                </Link>
            </div>
        </>
    );

    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent
                    side="left"
                    className="w-72 p-0 border-sidebar-border bg-background"
                >
                    <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
                    <div className="flex flex-col h-full">
                        <SidebarContent />
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <div className={cn(
            "flex flex-col h-screen border-r border-sidebar-border transition-all duration-300 bg-background/95 backdrop-blur-sm",
            isCollapsed ? "w-16" : "w-64",
            className
        )}>
            <SidebarContent />
        </div>
    );
}
