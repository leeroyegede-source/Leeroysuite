"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Sparkles,
    MessageSquare,
    PenTool,
    Code,
    FileText,
    Mail,
    Image,
    Database,
    Languages,
    Brain,
    FileUser,
    Share2,
    ArrowRight,
    Menu,
    X,
    LayoutTemplate,
    Zap,
    Shield,
    Rocket,
    Play,
    Check,
    Star,
    Users,
    Globe,
    ChevronRight,
    Bot,
    Cpu,
    Wand2,
    Layers,
    TrendingUp,
    Award,
    Clock,
    type LucideIcon,
} from "lucide-react";
import VideoModal from "@/components/VideoModal";
import ChatWidget from "@/components/chat/ChatWidget";
import { useSettings } from "@/contexts/SettingsContext";
import { TOOLS_COUNT_DISPLAY } from "@/lib/constants";

// --- Configuration ---

interface Feature {
    title: string;
    description: string;
    icon: LucideIcon;
    url: string;
    color: string;
    isNew?: boolean;
}

const features: Feature[] = [
    {
        title: "Live Chat",
        description: "Intelligent live support agent for your queries.",
        icon: MessageSquare,
        url: "/support-agent",
        color: "from-teal-500 to-emerald-500",
        isNew: true,
    },
    {
        title: "AI Website Builder",
        description: "Generate full websites from a single prompt with modern designs.",
        icon: LayoutTemplate,
        url: "/website",
        color: "from-violet-500 to-purple-600",
        isNew: true,
    },
    {
        title: "AI Chat Assistant",
        description: "Intelligent conversations powered by advanced language models.",
        icon: MessageSquare,
        url: "/chat",
        color: "from-blue-500 to-cyan-500",
    },
    {
        title: "Code Generator",
        description: "Write, debug, and refactor code in any programming language.",
        icon: Code,
        url: "/code",
        color: "from-emerald-500 to-teal-500",
    },
    {
        title: "Content Writer",
        description: "Create blog posts, articles, and marketing copy instantly.",
        icon: PenTool,
        url: "/writer",
        color: "from-pink-500 to-rose-500",
    },
    {
        title: "Document Summarizer",
        description: "Turn lengthy documents into concise executive summaries.",
        icon: FileText,
        url: "/summary",
        color: "from-orange-500 to-amber-500",
    },
    {
        title: "Image Generator",
        description: "Create stunning visuals from text descriptions.",
        icon: Image,
        url: "/image-generator",
        color: "from-indigo-500 to-violet-500",
    },
    {
        title: "SQL Architect",
        description: "Transform natural language into complex SQL queries.",
        icon: Database,
        url: "/sql",
        color: "from-slate-500 to-gray-600",
    },
    {
        title: "Translation Hub",
        description: "Professional translations in 50+ languages.",
        icon: Languages,
        url: "/translator",
        color: "from-teal-500 to-green-500",
    },
    {
        title: "Quiz Master",
        description: "Generate educational assessments and quizzes.",
        icon: Brain,
        url: "/quiz",
        color: "from-purple-500 to-pink-500",
    },
    {
        title: "Resume Builder",
        description: "Create ATS-optimized resumes and cover letters.",
        icon: FileUser,
        url: "/resume",
        color: "from-yellow-500 to-orange-500",
    },
    {
        title: "Social Suite",
        description: "Craft viral posts, captions, and hashtags.",
        icon: Share2,
        url: "/social",
        color: "from-cyan-500 to-blue-500",
    },
    {
        title: "Email Assistant",
        description: "Draft professional emails and responses.",
        icon: Mail,
        url: "/email",
        color: "from-red-500 to-pink-500",
    },
];

const stats = [
    { value: TOOLS_COUNT_DISPLAY, label: "AI Tools" },
    { value: "50K+", label: "Active Users" },
    { value: "10M+", label: "Generations" },
    { value: "99.9%", label: "Uptime" },
];

const testimonials = [
    {
        quote: "AI Suite has completely transformed how I create content. What used to take hours now takes minutes.",
        author: "Sarah Chen",
        role: "Content Marketing Manager",
        avatar: "SC",
    },
    {
        quote: "The code generation feature saved our team countless hours. It's like having a senior developer on demand.",
        author: "Michael Torres",
        role: "Tech Lead at StartupXYZ",
        avatar: "MT",
    },
    {
        quote: "Best AI tool investment we've made. The ROI has been incredible for our agency.",
        author: "Emily Watson",
        role: "Agency Owner",
        avatar: "EW",
    },
];

const pricingPlans = [
    {
        name: "Free",
        price: "$0",
        period: "forever",
        description: "Perfect for trying out AI Suite",
        features: [
            "1,000 tokens",
            "Access to 10 AI tools",
            "Standard response time",
            "Community support",
        ],
        cta: "Get Started",
        popular: false,
    },
    {
        name: "Pro",
        price: "$19",
        period: "/month",
        description: "Best for professionals and creators",
        features: [
            "50,000 tokens/month",
            `Access to all ${TOOLS_COUNT_DISPLAY} AI tools`,
            "Priority response time",
            "API access",
            "Priority support",
            "Custom templates",
        ],
        cta: "Start Free Trial",
        popular: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        period: "",
        description: "For teams and organizations",
        features: [
            "Unlimited tokens",
            "All Pro features",
            "Dedicated account manager",
            "Custom AI training",
            "SLA guarantee",
            "On-premise deployment",
        ],
        cta: "Contact Sales",
        popular: false,
    },
];

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
};

export default function LandingPage() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const { settings } = useSettings();

    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
    const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10">
                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:60px_60px]" />

                {/* Gradient orbs */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-radial from-primary/20 to-transparent blur-3xl opacity-50" />
                <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-gradient-radial from-ai-secondary/15 to-transparent blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-ai-tertiary/10 to-transparent blur-3xl opacity-40" />
            </div>

            {/* Header */}
            <motion.header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? "bg-background/80 backdrop-blur-xl border-b border-border/50 py-3"
                    : "bg-transparent py-5"
                    }`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/30 rounded-xl blur-lg group-hover:bg-primary/40 transition-all" />
                            <div className="relative p-2 bg-gradient-to-br from-primary to-ai-secondary rounded-xl overflow-hidden w-9 h-9 flex items-center justify-center">
                                {settings?.metadata?.logoUrl ? (
                                    <img src={settings.metadata.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <Sparkles className="w-5 h-5 text-white" />
                                )}
                            </div>
                        </div>
                        <span className="text-xl font-bold gradient-text-primary">{settings?.metadata?.siteName || "AI Suite"}</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Features
                        </a>
                        <a href="#tools" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Tools
                        </a>
                        <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Pricing
                        </a>
                        <div className="h-4 w-px bg-border" />
                        <ThemeToggle />
                        <div className="flex items-center gap-3">
                            <Link href="https://codecanyon.net/item/ai-suite-react-frontend-application-with-gemini-ai-integration/59967831" target="_blank" rel="noopener noreferrer">
                                <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
                                    Buy Now
                                </Button>
                            </Link>
                            <Link href="/login" target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="sm">Log in</Button>
                            </Link>
                            <Link href="/register" target="_blank" rel="noopener noreferrer">
                                <Button size="sm">Get Started Free</Button>
                            </Link>
                        </div>
                    </nav>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden flex items-center gap-3">
                        <ThemeToggle />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-b border-border/50 bg-background/95 backdrop-blur-xl overflow-hidden"
                        >
                            <nav className="container mx-auto px-4 py-6 space-y-4 flex flex-col">
                                <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-foreground hover:text-primary">
                                    Features
                                </a>
                                <a href="#tools" onClick={() => setIsMobileMenuOpen(false)} className="text-foreground hover:text-primary">
                                    Tools
                                </a>
                                <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-foreground hover:text-primary">
                                    Pricing
                                </a>
                                <hr className="border-border/50" />
                                <Link href="https://codecanyon.net/item/ai-suite-react-frontend-application-with-gemini-ai-integration/59967831" target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">Buy Now</Button>
                                </Link>
                                <Link href="/login" target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="outline" className="w-full">Log in</Button>
                                </Link>
                                <Link href="/register" target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button className="w-full">Get Started Free</Button>
                                </Link>
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden">
                <motion.div
                    style={{ opacity: heroOpacity, scale: heroScale }}
                    className="container mx-auto px-4 text-center relative z-10"
                >
                    {/* Announcement Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                        </span>
                        <span className="text-sm font-medium text-primary">
                            New: AI Website Builder is now live!
                        </span>
                        <ChevronRight className="w-4 h-4 text-primary" />
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <span className="text-foreground">The Ultimate</span>
                        <br />
                        <span className="gradient-text bg-gradient-to-r from-primary via-ai-secondary to-ai-tertiary bg-clip-text text-transparent">
                            AI Productivity Suite
                        </span>
                    </motion.h1>

                    {/* Subheading */}
                    <motion.p
                        className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        Access {TOOLS_COUNT_DISPLAY} powerful AI tools. Generate content, code, images, websites,
                        and more with cutting-edge AI technology.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Link href="/login" target="_blank" rel="noopener noreferrer">
                            <Button size="xl" className="group">
                                Start Creating for Free
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Button
                            size="xl"
                            variant="outline"
                            onClick={() => setIsVideoOpen(true)}
                            className="group"
                        >
                            <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                            Watch Demo
                        </Button>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold gradient-text-primary mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Floating Elements */}
                <div className="absolute top-1/4 left-10 hidden lg:block">
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="p-3 bg-card rounded-2xl shadow-xl border"
                    >
                        <Code className="w-6 h-6 text-emerald-500" />
                    </motion.div>
                </div>
                <div className="absolute top-1/3 right-10 hidden lg:block">
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="p-3 bg-card rounded-2xl shadow-xl border"
                    >
                        <Image className="w-6 h-6 text-violet-500" />
                    </motion.div>
                </div>
                <div className="absolute bottom-1/4 left-20 hidden lg:block">
                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="p-3 bg-card rounded-2xl shadow-xl border"
                    >
                        <PenTool className="w-6 h-6 text-pink-500" />
                    </motion.div>
                </div>
            </section>

            {/* Trusted By Section */}
            <section className="py-12 border-y border-border/50 bg-muted/30">
                <div className="container mx-auto px-4">
                    <p className="text-center text-sm text-muted-foreground mb-8">
                        Trusted by 50,000+ professionals worldwide
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50">
                        {["Google", "Microsoft", "Amazon", "Meta", "Netflix", "Spotify", "Apple", "Tesla", "NVIDIA", "OpenAI"].map((company) => (
                            <span key={company} className="text-xl font-bold ">
                                {company}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <Badge className="mb-4">Features</Badge>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Everything You Need to Create
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Powerful AI tools designed to supercharge your productivity and creativity.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Zap,
                                title: "Lightning Fast",
                                description: "Powered by the latest AI models for sub-second response times.",
                            },
                            {
                                icon: Shield,
                                title: "Enterprise Secure",
                                description: "Your data is encrypted end-to-end and never used for training.",
                            },
                            {
                                icon: Rocket,
                                title: "Production Ready",
                                description: "Export clean, semantic outputs ready for immediate use.",
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeInUp}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card variant="interactive" className="h-full">
                                    <CardContent className="p-8">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-ai-secondary/20 flex items-center justify-center mb-6">
                                            <feature.icon className="w-7 h-7 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                        <p className="text-muted-foreground">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tools Grid Section */}
            <section id="tools" className="py-24 bg-muted/30 relative">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <Badge className="mb-4">{TOOLS_COUNT_DISPLAY} Tools</Badge>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            A Tool for Every Task
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Replace your fragmented subscription stack with one powerful suite.
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        {features.map((feature, index) => (
                            <motion.div key={index} variants={fadeInUp}>
                                <Link href={feature.url} target="_blank" rel="noopener noreferrer" className="block h-full">
                                    <Card variant="interactive" className="h-full group">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                    <feature.icon className="w-6 h-6 text-white" />
                                                </div>
                                                {feature.isNew && (
                                                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 border-0">
                                                        New
                                                    </Badge>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                                                {feature.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>

                    <div className="text-center mt-12">
                        <Link href="/dashboard" target="_blank" rel="noopener noreferrer">
                            <Button size="lg" variant="outline">
                                View All {TOOLS_COUNT_DISPLAY} Tools
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <Badge className="mb-4">Testimonials</Badge>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Loved by Creators Worldwide
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeInUp}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card variant="glass" className="h-full">
                                    <CardContent className="p-8">
                                        <div className="flex gap-1 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                                            ))}
                                        </div>
                                        <p className="text-lg mb-6 leading-relaxed">"{testimonial.quote}"</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-ai-secondary flex items-center justify-center text-white font-bold">
                                                {testimonial.avatar}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{testimonial.author}</p>
                                                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 bg-muted/30">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <Badge className="mb-4">Pricing</Badge>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Start free and scale as you grow. No hidden fees.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {pricingPlans.map((plan, index) => (
                            <motion.div
                                key={index}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeInUp}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card
                                    variant={plan.popular ? "pricing" : "default"}
                                    className={`h-full relative ${plan.popular ? "border-primary shadow-glow" : ""
                                        }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                            <Badge className="bg-gradient-to-r from-primary to-ai-secondary border-0 shadow-lg">
                                                Most Popular
                                            </Badge>
                                        </div>
                                    )}
                                    <CardContent className="p-8">
                                        <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1 mb-2">
                                            <span className="text-4xl font-bold">{plan.price}</span>
                                            <span className="text-muted-foreground">{plan.period}</span>
                                        </div>
                                        <p className="text-muted-foreground mb-6">{plan.description}</p>
                                        <ul className="space-y-3 mb-8">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-center gap-2">
                                                    <Check className="w-5 h-5 text-green-500" />
                                                    <span className="text-sm">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <Link href="/register" target="_blank" rel="noopener noreferrer">
                                            <Button
                                                className="w-full"
                                                variant={plan.popular ? "default" : "outline"}
                                            >
                                                {plan.cta}
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary via-ai-secondary to-ai-tertiary rounded-3xl p-12 md:p-16 text-white shadow-2xl overflow-hidden relative">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                        <div className="relative z-10 text-center space-y-6">
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                                Ready to Transform Your Workflow?
                            </h2>
                            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                                Join 50,000+ creators and professionals using AI Suite to work smarter.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                <Link href="/register" target="_blank" rel="noopener noreferrer">
                                    <Button size="xl" variant="white">
                                        Get Started for Free
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                                <Link href="/dashboard" target="_blank" rel="noopener noreferrer">
                                    <Button size="xl" variant="glass" className="border-white/30 text-white hover:bg-white/20">
                                        Explore Dashboard
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border/40 bg-background pt-16 pb-8">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-2 space-y-4">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="p-2 bg-gradient-to-br from-primary to-ai-secondary rounded-xl overflow-hidden w-9 h-9 flex items-center justify-center">
                                    {settings?.metadata?.logoUrl ? (
                                        <img src={settings.metadata.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <Sparkles className="w-5 h-5 text-white" />
                                    )}
                                </div>
                                <span className="text-xl font-bold">{settings?.metadata?.siteName || "AI Suite"}</span>
                            </Link>
                            <p className="text-muted-foreground max-w-sm">
                                {settings?.metadata?.siteDescription || "The complete AI toolkit for modern creators and professionals. Built with cutting-edge technology."}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Version 6 • 100+ AI Tools
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Changelog</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-muted-foreground">
                            © 2026 AI Suite. All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            {settings?.metadata?.social && Object.entries(settings.metadata.social).map(([platform, url]) => {
                                if (!url) return null;
                                return (
                                    <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors capitalize">
                                        {platform}
                                    </a>
                                );
                            })}
                            {(!settings?.metadata?.social || Object.values(settings.metadata.social).every(url => !url)) && (
                                <>
                                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Twitter
                                    </a>
                                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                        GitHub
                                    </a>
                                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Discord
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </footer>

            {/* Video Modal */}
            <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
            <ChatWidget />
        </div>
    );
}
