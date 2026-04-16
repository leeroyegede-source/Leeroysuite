"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, type User } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare,
    PenTool,
    Code,
    FileText,
    Mail,
    Image,
    Database,
    CheckSquare,
    Menu,
    X,
    Sparkles,
    Languages,
    BookOpen,
    Brain,
    FileUser,
    Share2,
    ChefHat,
    PiggyBank,
    Calendar,
    Heart,
    Users,
    FileEdit,
    ImageIcon,
    Bot,
    LayoutDashboard,
    Gamepad2,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Crown,
    Zap,
    Settings,
    HelpCircle,
    Globe,
    Mic,
    Video,
    FileSearch,
    Briefcase,
    GraduationCap,
    Lightbulb,
    TrendingUp,
    ShieldCheck,
    Palette,
    Search,
    Shield,
    Newspaper,
    FileType,
    Hash,
    Target,
    BarChart3,
    DollarSign,
    ClipboardList,
    FileCheck,
    Bug,
    GitBranch,
    Terminal,
    TestTube,
    BookMarked,
    FlaskConical,
    History,
    Feather,
    Music,
    Laugh,
    Quote,
    Tag,
    ScrollText,
    Cookie,
    Scale,
    FileWarning,
    Receipt,
    Link2,
    Layout,
    Compass,
    NotebookPen,
    ThumbsUp,
    Star,
    Focus,
    Moon,
    Flame,
    Eye,
    Cpu,
    FileSpreadsheet,
    Gauge,
    Type,
    ScanEye,
    LayoutTemplate,
    RefreshCw,
    ArrowLeftRight,
    UserCircle,
    CreditCard,
    Presentation,
    ListChecks,
    Clock,
    Container,
    FileKey,
    TableProperties,
    BookA,
    Swords,
    Activity,
    Apple,
    Dumbbell,
    HeartHandshake,
    Handshake,
    Megaphone,
    type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
    Sheet,
    SheetContent,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { navigationCategories, type NavItem, type NavCategory } from "@/lib/sidebar-routes";

interface NavItemComponentProps {
    item: NavItem;
    isActive: boolean;
    isCollapsed: boolean;
    isMobile: boolean;
    onClose?: () => void;
}

function NavItemComponent({ item, isActive, isCollapsed, isMobile, onClose }: NavItemComponentProps) {
    const activeRef = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
        if (isActive && activeRef.current) {
            activeRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
        }
    }, []);

    const content = (
        <Link
            ref={activeRef}
            href={item.url}
            onClick={isMobile ? onClose : undefined}
            className={cn(
                "group relative flex items-center gap-3 px-3 py-2 rounded-lg transition-[background-color,color,box-shadow,transform] duration-200",
                "hover:bg-sidebar-accent",
                isActive
                    ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground",
                isCollapsed && !isMobile && "justify-center px-2"
            )}
        >
            {/* Active indicator line */}
            {isActive && (!isCollapsed || isMobile) && (
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full z-10"
                />
            )}

            <item.icon
                className={cn(
                    "flex-shrink-0 w-[18px] h-[18px] transition-all duration-200",
                    "group-hover:scale-105",
                    isActive && "text-primary"
                )}
            />

            {(!isCollapsed || isMobile) && (
                <span className="text-[13px] font-medium truncate flex-1">{item.title}</span>
            )}

            {/* Badges */}
            {(!isCollapsed || isMobile) && (
                <div className="flex items-center gap-1">
                    {item.isNew && (
                        <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-500/15 text-emerald-500 rounded-md uppercase tracking-wide">
                            New
                        </span>
                    )}
                    {item.isPro && (
                        <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-amber-500/15 text-amber-500 rounded-md uppercase tracking-wide">
                            Pro
                        </span>
                    )}
                </div>
            )}
        </Link>
    );

    if (isCollapsed && !isMobile) {
        return (
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>{content}</TooltipTrigger>
                    <TooltipContent side="right" className="flex items-center gap-2 font-medium">
                        {item.title}
                        {item.isNew && (
                            <span className="px-1 py-0.5 text-[9px] font-semibold bg-emerald-500 text-white rounded">
                                NEW
                            </span>
                        )}
                        {item.isPro && (
                            <span className="px-1 py-0.5 text-[9px] font-semibold bg-amber-500 text-white rounded">
                                PRO
                            </span>
                        )}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return content;
}

interface CategorySectionProps {
    category: NavCategory;
    pathname: string;
    isCollapsed: boolean;
    isMobile: boolean;
    onClose?: () => void;
    user: User | null;
    settingsFeatures?: Record<string, boolean>;
}

function CategorySection({ category, pathname, isCollapsed, isMobile, onClose, user, settingsFeatures }: CategorySectionProps) {
    const [isOpen, setIsOpen] = useState(true);

    const filteredItems = category.items.filter((item) => {
        // System level check
        if (settingsFeatures && settingsFeatures[item.id] === false) return false;

        // User level feature check
        if (user?.disabledFeatures?.includes(item.id)) return false;

        // Package allowed tools check
        if (user && user.role !== 'admin' && user.planName !== 'Enterprise' && user.aiTools && item.id !== 'dashboard' && item.id !== 'support-agent') {
            if (!user.aiTools.includes(item.id)) return false;
        }

        return true;
    });

    if (filteredItems.length === 0) return null;

    const CategoryIcon = category.icon;

    if (isCollapsed && !isMobile) {
        return (
            <div className="space-y-0.5">
                {filteredItems.slice(0, 3).map((item) => (
                    <NavItemComponent
                        key={item.id}
                        item={item}
                        isActive={pathname === item.url}
                        isCollapsed={isCollapsed}
                        isMobile={isMobile}
                        onClose={onClose}
                    />
                ))}
            </div>
        );
    }

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider hover:text-muted-foreground transition-colors">
                <div className="flex items-center gap-2">
                    <CategoryIcon className="w-3.5 h-3.5" />
                    <span>{category.title}</span>
                </div>
                <ChevronDown className={cn(
                    "w-3 h-3 transition-transform duration-200",
                    isOpen && "rotate-180"
                )} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-0.5 mt-1">
                {filteredItems.map((item) => (
                    <NavItemComponent
                        key={item.id}
                        item={item}
                        isActive={pathname === item.url}
                        isCollapsed={isCollapsed}
                        isMobile={isMobile}
                        onClose={onClose}
                    />
                ))}
            </CollapsibleContent>
        </Collapsible>
    );
}

interface SidebarContentProps {
    isCollapsed: boolean;
    isMobile: boolean;
    onClose?: () => void;
    onToggleCollapse?: () => void;
}

function SidebarContent({ isCollapsed, isMobile, onClose, onToggleCollapse }: SidebarContentProps) {
    const pathname = usePathname();
    const { user } = useAuth();

    const { settings } = useSettings();

    // Count total features
    const totalFeatures = navigationCategories.reduce((acc, cat) => acc + cat.items.length, 0);

    return (
        <div className="flex flex-col h-full bg-sidebar">
            {/* Header */}
            <div className={cn(
                "flex items-center h-16 px-4 relative",
                isCollapsed && !isMobile ? "justify-center" : "justify-between"
            )}>
                {(!isCollapsed || isMobile) && (
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-primary to-ai-secondary flex items-center justify-center shadow-lg shadow-primary/25 overflow-hidden">
                            {settings?.metadata?.logoUrl ? (
                                <img src={settings.metadata.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Sparkles className="w-5 h-5 text-white" />
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg tracking-tight">
                                    {settings?.metadata?.siteName || "AI Suite"}
                                </span>
                            </div>
                        </div>
                    </Link>
                )}

                {isCollapsed && !isMobile && (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-primary to-ai-secondary flex items-center justify-center shadow-lg shadow-primary/25 overflow-hidden">
                        {settings?.metadata?.logoUrl ? (
                            <img src={settings.metadata.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <Sparkles className="w-5 h-5 text-white" />
                        )}
                    </div>
                )}

                {!isMobile && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleCollapse}
                        className={cn(
                            "h-8 w-8 text-muted-foreground hover:text-foreground transition-all duration-300",
                            isCollapsed
                                ? "absolute -right-4 top-1/2 -translate-y-1/2 bg-background shadow-sm z-50 hover:bg-accent rounded-full"
                                : "rounded-lg"
                        )}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-4 h-4" />
                        ) : (
                            <ChevronLeft className="w-4 h-4" />
                        )}
                    </Button>
                )}
            </div>


            {/* Navigation */}
            <ScrollArea className="flex-1 px-2 py-4">
                <nav className="space-y-6">
                    {navigationCategories.map((category) => (
                        <CategorySection
                            key={category.id}
                            category={category}
                            pathname={pathname}
                            isCollapsed={isCollapsed}
                            isMobile={isMobile}
                            onClose={onClose}
                            user={user}
                            settingsFeatures={settings?.metadata?.features}
                        />
                    ))}
                </nav>
            </ScrollArea>

            {/* Footer - Token Progress */}
            {(!isCollapsed || isMobile) && user && (
                <div className="p-3 mt-auto">
                    <div className="relative p-4 rounded-2xl overflow-hidden bg-sidebar-accent/30">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-muted-foreground">Monthly Tokens</span>
                            <span className="text-xs font-bold text-primary">
                                {user.tokens?.toLocaleString() || 0} left
                            </span>
                        </div>

                        <Progress value={Math.min(((user.tokens || 0) / 100000) * 100, 100)} className="h-2 mb-2" />

                        <div className="flex items-center justify-between text-[10px] text-muted-foreground/70">
                            <span>{user.planName || "Free Plan"}</span>
                            <Link href="/pricing" className="text-primary hover:underline">
                                Upgrade
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden lg:flex flex-col h-screen sticky top-0 transition-all duration-300 ease-out z-30",
                    isCollapsed ? "w-[70px]" : "w-[260px]"
                )}
            >
                <SidebarContent
                    isCollapsed={isCollapsed}
                    isMobile={false}
                    onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
                />
            </aside>

            {/* Mobile Sidebar */}
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent side="left" className="p-0 w-[280px] border-r-0">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <SidebarContent
                        isCollapsed={false}
                        isMobile={true}
                        onClose={onClose}
                    />
                </SheetContent>
            </Sheet>
        </>
    );
}

export default Sidebar;
