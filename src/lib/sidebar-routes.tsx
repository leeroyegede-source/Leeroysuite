
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

// Navigation structure
export interface NavItem {
    id: string;
    title: string;
    url: string;
    icon: LucideIcon;
    isNew?: boolean;
    isPro?: boolean;
}

export interface NavCategory {
    id: string;
    title: string;
    icon: LucideIcon;
    items: NavItem[];
}

// Build navigation from features
export const navigationCategories: NavCategory[] = [
    {
        id: "main",
        title: "Main",
        icon: LayoutDashboard,
        items: [
            { id: "dashboard", title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
        ],
    },
    {
        id: "core",
        title: "Core Tools",
        icon: Sparkles,
        items: [
            { id: "support-agent", title: "Live Chat", url: "/support-agent", icon: HelpCircle, isNew: true },
            { id: "ai-meeting", title: "AI Meeting", url: "/ai-meeting", icon: Video, isNew: true },
            { id: "chat", title: "AI Chat", url: "/chat", icon: MessageSquare },
            { id: "website", title: "Website Builder", url: "/website", icon: Globe, isNew: true },
            { id: "image-generator", title: "Image Generator", url: "/image-generator", icon: ImageIcon },
            { id: "code", title: "Code Generator", url: "/code", icon: Code },
            { id: "translator", title: "Translation Hub", url: "/translator", icon: Languages },
        ],
    },
    {
        id: "writing",
        title: "Writing",
        icon: PenTool,
        items: [
            { id: "writer", title: "Content Writer", url: "/writer", icon: PenTool },
            { id: "blog-post", title: "Blog Post", url: "/blog-post", icon: Newspaper, isNew: true },
            { id: "article-writer", title: "Article Writer", url: "/article-writer", icon: FileText, isNew: true },
            { id: "summary", title: "Summarizer", url: "/summary", icon: FileText },
            { id: "headline-generator", title: "Headlines", url: "/headline-generator", icon: Zap, isNew: true },
            { id: "content-improver", title: "Content Improver", url: "/content-improver", icon: Sparkles, isNew: true },
            { id: "story", title: "Story Writer", url: "/story", icon: BookOpen },
            { id: "poem-generator", title: "Poem Generator", url: "/poem-generator", icon: Feather, isNew: true },
            { id: "grammar", title: "Grammar Check", url: "/grammar", icon: CheckSquare },
            { id: "paraphraser", title: "Paraphraser", url: "/paraphraser", icon: RefreshCw, isNew: true },
            { id: "tone-converter", title: "Tone Converter", url: "/tone-converter", icon: ArrowLeftRight, isNew: true },
        ],
    },
    {
        id: "social",
        title: "Social Media",
        icon: Share2,
        items: [
            { id: "social", title: "Social Suite", url: "/social", icon: Share2 },
            { id: "instagram-caption", title: "Instagram", url: "/instagram-caption", icon: ImageIcon, isNew: true },
            { id: "twitter-thread", title: "Twitter/X Thread", url: "/twitter-thread", icon: MessageSquare, isNew: true },
            { id: "linkedin-post", title: "LinkedIn", url: "/linkedin-post", icon: Briefcase, isNew: true },
            { id: "youtube-description", title: "YouTube", url: "/youtube-description", icon: Video, isNew: true },
            { id: "hashtag-generator", title: "Hashtags", url: "/hashtag-generator", icon: Hash, isNew: true },
            { id: "content-calendar", title: "Content Calendar", url: "/content-calendar", icon: Calendar, isNew: true },
        ],
    },
    {
        id: "marketing",
        title: "Marketing",
        icon: TrendingUp,
        items: [
            { id: "email", title: "Email Assistant", url: "/email", icon: Mail },
            { id: "google-ads", title: "Google Ads", url: "/google-ads", icon: Target, isNew: true },
            { id: "facebook-ads", title: "Facebook Ads", url: "/facebook-ads", icon: Target, isNew: true },
            { id: "landing-page-copy", title: "Landing Page", url: "/landing-page", icon: Layout, isNew: true },
            { id: "sales-pitch", title: "Sales Pitch", url: "/sales-pitch", icon: DollarSign, isNew: true },
            { id: "marketing-plan", title: "Marketing Plan", url: "/marketing-plan", icon: BarChart3, isNew: true },
            { id: "competitor-analysis", title: "Competitor Analysis", url: "/competitor-analysis", icon: Search, isNew: true },
            { id: "ab-test-copy", title: "A/B Test Copy", url: "/ab-test-copy", icon: FlaskConical, isNew: true },
            { id: "buyer-persona", title: "Buyer Persona", url: "/buyer-persona", icon: UserCircle, isNew: true },
            { id: "pricing-page-copy", title: "Pricing Page Copy", url: "/pricing-page-copy", icon: CreditCard, isNew: true },
        ],
    },
    {
        id: "business",
        title: "Business",
        icon: Briefcase,
        items: [
            { id: "business-plan", title: "Business Plan", url: "/business-plan", icon: Briefcase, isNew: true },
            { id: "meeting", title: "Meeting Notes", url: "/meeting", icon: Calendar },
            { id: "job-description", title: "Job Description", url: "/job-description", icon: Users, isNew: true },
            { id: "resume", title: "Resume Builder", url: "/resume", icon: FileUser },
            { id: "interview", title: "Interview Prep", url: "/interview", icon: Users },
            { id: "finance", title: "Finance Helper", url: "/finance", icon: PiggyBank },
            { id: "contract-generator", title: "Contracts", url: "/contract-generator", icon: FileCheck, isNew: true, isPro: true },
            { id: "swot-analysis", title: "SWOT Analysis", url: "/swot-analysis", icon: Target, isNew: true },
            { id: "pitch-deck", title: "Pitch Deck", url: "/pitch-deck", icon: Presentation, isNew: true },
            { id: "invoice-memo", title: "Invoice Memo", url: "/invoice-memo", icon: Receipt, isNew: true },
            { id: "onboarding-checklist", title: "Onboarding Checklist", url: "/onboarding-checklist", icon: ListChecks, isNew: true },
        ],
    },
    {
        id: "development",
        title: "Development",
        icon: Code,
        items: [
            { id: "sql", title: "SQL Builder", url: "/sql", icon: Database },
            { id: "bug-fix", title: "Bug Fix", url: "/bug-fix", icon: Bug, isNew: true },
            { id: "code-reviewer", title: "Code Review", url: "/code-reviewer", icon: Eye, isNew: true },
            { id: "api-docs", title: "API Docs", url: "/api-docs", icon: FileText, isNew: true },
            { id: "readme-generator", title: "README", url: "/readme-generator", icon: FileText, isNew: true },
            { id: "regex-generator", title: "Regex", url: "/regex-generator", icon: Code, isNew: true },
            { id: "unit-test", title: "Unit Tests", url: "/unit-test", icon: TestTube, isNew: true },
            { id: "ocr", title: "OCR Tool", url: "/ocr", icon: FileSearch },
            { id: "cron-expression", title: "Cron Builder", url: "/cron-expression", icon: Clock, isNew: true },
            { id: "docker-compose", title: "Docker Compose", url: "/docker-compose", icon: Container, isNew: true },
            { id: "env-template", title: ".env Template", url: "/env-template", icon: FileKey, isNew: true },
            { id: "gitignore-generator", title: "Git Ignore", url: "/gitignore-generator", icon: GitBranch, isNew: true },
        ],
    },
    {
        id: "education",
        title: "Education",
        icon: GraduationCap,
        items: [
            { id: "quiz", title: "Quiz Generator", url: "/quiz", icon: GraduationCap },
            { id: "lesson-plan", title: "Lesson Plan", url: "/lesson-plan", icon: BookMarked, isNew: true },
            { id: "study-guide", title: "Study Guide", url: "/study-guide", icon: BookOpen, isNew: true },
            { id: "flashcard-generator", title: "Flashcards", url: "/flashcard-generator", icon: FileEdit, isNew: true },
            { id: "math-solver", title: "Math Solver", url: "/math-solver", icon: Cpu, isNew: true },
            { id: "rubric-generator", title: "Rubric Generator", url: "/rubric-generator", icon: TableProperties, isNew: true },
            { id: "vocabulary-builder", title: "Vocabulary Builder", url: "/vocabulary-builder", icon: BookA, isNew: true },
            { id: "debate-prep", title: "Debate Prep", url: "/debate-prep", icon: Swords, isNew: true },
        ],
    },
    {
        id: "creative",
        title: "Creative",
        icon: Palette,
        items: [
            { id: "recipe", title: "Recipe Generator", url: "/recipe", icon: ChefHat },
            { id: "story-ideas", title: "Story Ideas", url: "/story-ideas", icon: Lightbulb, isNew: true },
            { id: "character-creator", title: "Characters", url: "/character-creator", icon: Users, isNew: true },
            { id: "song-lyrics", title: "Song Lyrics", url: "/song-lyrics", icon: Music, isNew: true },
            { id: "joke-generator", title: "Jokes", url: "/joke-generator", icon: Laugh, isNew: true },
            { id: "name-generator", title: "Name Generator", url: "/name-generator", icon: Tag, isNew: true },
        ],
    },
    {
        id: "legal",
        title: "Legal",
        icon: Shield,
        items: [
            { id: "privacy-policy", title: "Privacy Policy", url: "/privacy-policy", icon: Shield, isNew: true, isPro: true },
            { id: "terms-of-service", title: "Terms of Service", url: "/terms-of-service", icon: ScrollText, isNew: true, isPro: true },
            { id: "disclaimer-generator", title: "Disclaimer", url: "/disclaimer-generator", icon: FileWarning, isNew: true },
            { id: "refund-policy", title: "Refund Policy", url: "/refund-policy", icon: Receipt, isNew: true },
        ],
    },
    {
        id: "seo",
        title: "SEO",
        icon: Search,
        items: [
            { id: "meta-description", title: "Meta Description", url: "/meta-description", icon: FileText, isNew: true },
            { id: "keyword-research", title: "Keywords", url: "/keyword-research", icon: Search, isNew: true },
            { id: "seo-audit", title: "SEO Audit", url: "/seo-audit", icon: Search, isNew: true },
            { id: "schema-markup", title: "Schema Markup", url: "/schema-markup", icon: Code, isNew: true },
        ],
    },
    {
        id: "personal",
        title: "Personal",
        icon: Heart,
        items: [
            { id: "sentiment", title: "Sentiment Analysis", url: "/sentiment", icon: Heart },
            { id: "journal-prompt", title: "Journal Prompts", url: "/journal-prompt", icon: NotebookPen, isNew: true },
            { id: "goal-setting", title: "Goal Setting", url: "/goal-setting", icon: Target, isNew: true },
            { id: "motivation-booster", title: "Motivation", url: "/motivation-booster", icon: Flame, isNew: true },
        ],
    },
    {
        id: "agents",
        title: "AI Agents",
        icon: Bot,
        items: [
            { id: "research-agent", title: "Research Agent", url: "/research-agent", icon: Search, isNew: true, isPro: true },
            { id: "writing-agent", title: "Writing Agent", url: "/writing-agent", icon: PenTool, isNew: true, isPro: true },
            { id: "code-agent", title: "Code Agent", url: "/code-agent", icon: Code, isNew: true, isPro: true },
            { id: "marketing-agent", title: "Marketing Agent", url: "/marketing-agent", icon: TrendingUp, isNew: true, isPro: true },
        ],
    },
    {
        id: "data-analytics",
        title: "Data & Analytics",
        icon: BarChart3,
        items: [
            { id: "data-visualizer", title: "Data Visualizer", url: "/data-visualizer", icon: BarChart3, isNew: true },
            { id: "csv-analyzer", title: "CSV Analyzer", url: "/csv-analyzer", icon: FileSpreadsheet, isNew: true },
            { id: "survey-builder", title: "Survey Builder", url: "/survey-builder", icon: ClipboardList, isNew: true },
            { id: "kpi-dashboard", title: "KPI Dashboard", url: "/kpi-dashboard", icon: Gauge, isNew: true },
        ],
    },
    {
        id: "design-ux",
        title: "Design & UX",
        icon: Palette,
        items: [
            { id: "color-palette", title: "Color Palette", url: "/color-palette", icon: Palette, isNew: true },
            { id: "ui-copy-writer", title: "UI Copy Writer", url: "/ui-copy-writer", icon: Type, isNew: true },
            { id: "accessibility-checker", title: "Accessibility", url: "/accessibility-checker", icon: ScanEye, isNew: true },
            { id: "wireframe-describer", title: "Wireframe Spec", url: "/wireframe-describer", icon: LayoutTemplate, isNew: true },
        ],
    },
    {
        id: "health-wellness",
        title: "Health & Wellness",
        icon: Activity,
        items: [
            { id: "symptom-journal", title: "Symptom Journal", url: "/symptom-journal", icon: Activity, isNew: true },
            { id: "meal-plan", title: "Meal Plan", url: "/meal-plan", icon: Apple, isNew: true },
            { id: "workout-routine", title: "Workout Builder", url: "/workout-routine", icon: Dumbbell, isNew: true },
        ],
    },
    {
        id: "communication",
        title: "Communication",
        icon: Megaphone,
        items: [
            { id: "apology-drafter", title: "Apology Drafter", url: "/apology-drafter", icon: HeartHandshake, isNew: true },
            { id: "negotiation-script", title: "Negotiation Script", url: "/negotiation-script", icon: Handshake, isNew: true },
            { id: "elevator-pitch", title: "Elevator Pitch", url: "/elevator-pitch", icon: Megaphone, isNew: true },
        ],
    },
    {
        id: "other",
        title: "Other",
        icon: Gamepad2,
        items: [
            { id: "playground", title: "Playground", url: "/playground", icon: Gamepad2 },
            { id: "blank", title: "Blank Template", url: "/blank", icon: FileEdit },
        ],
    },
];

export function getAllSidebarTools() {
    // Exclude 'Main', 'Other', and 'Settings' from tool count if desired
    // Assuming we want to count actual functional AI tools
    return navigationCategories.flatMap(category => {
        if (category.id === 'main' || category.id === 'other') return [];
        return category.items.map(item => ({
            ...item,
            category: category.id,
            // Include category label for filtering/display logic if needed
            categoryLabel: category.title
        }));
    });
}

export function getSidebarToolsCount() {
    return getAllSidebarTools().length;
}
