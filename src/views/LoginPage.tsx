"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    Loader2,
    Sparkles,
    ArrowRight,
    Zap,
    Shield,
    Users,
    type LucideIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { TOOLS_COUNT_DISPLAY } from "@/lib/constants";

interface Feature {
    icon: LucideIcon;
    title: string;
    description: string;
}

const features: Feature[] = [
    {
        icon: Zap,
        title: `${TOOLS_COUNT_DISPLAY} AI Tools`,
        description: "Access the most comprehensive AI toolkit",
    },
    {
        icon: Shield,
        title: "Enterprise Security",
        description: "Your data is encrypted and protected",
    },
    {
        icon: Users,
        title: "Join 50,000+ Users",
        description: "Trusted by professionals worldwide",
    },
];

const formSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().default(false),
});

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const { settings } = useSettings();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);

        try {
            const result = await login(values.email, values.password);

            if (result.success) {
                toast({
                    title: "Welcome back!",
                    description: "Successfully logged in.",
                });
                router.refresh();
                if (result.user?.role === "admin") {
                    router.push("/admin/dashboard");
                } else {
                    router.push("/dashboard");
                }
            } else {
                toast({
                    title: "Login failed",
                    description: result.error || "Invalid credentials.",
                    variant: "destructive",
                });
            }
        } catch (err: any) {
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const quickLogin = (userEmail: string, userPassword: string) => {
        form.setValue("email", userEmail);
        form.setValue("password", userPassword);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-ai-secondary to-ai-tertiary" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px]" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 text-white">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl overflow-hidden w-11 h-11 flex items-center justify-center">
                            {settings?.metadata?.logoUrl ? (
                                <img src={settings.metadata.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Sparkles className="w-6 h-6" />
                            )}
                        </div>
                        <span className="text-2xl font-bold">{settings?.metadata?.siteName || "AI Suite"}</span>
                    </Link>

                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl font-bold mb-4">
                                Welcome Back to
                                <br />
                                Your AI Workspace
                            </h1>
                            <p className="text-lg text-white/80 max-w-md">
                                Sign in to access your personalized AI tools and continue creating.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + index * 0.1 }}
                                    className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl"
                                >
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <feature.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{feature.title}</h3>
                                        <p className="text-sm text-white/70">{feature.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <p className="text-sm text-white/60">
                        © 2026 AI Suite. All rights reserved.
                    </p>
                </div>

                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 right-20 p-4 bg-white/10 backdrop-blur-sm rounded-2xl"
                >
                    <Zap className="w-8 h-8 text-white" />
                </motion.div>
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-1/3 right-40 p-3 bg-white/10 backdrop-blur-sm rounded-2xl"
                >
                    <Shield className="w-6 h-6 text-white" />
                </motion.div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-br from-primary to-ai-secondary rounded-xl overflow-hidden w-9 h-9 flex items-center justify-center">
                                {settings?.metadata?.logoUrl ? (
                                    <img src={settings.metadata.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <Sparkles className="w-5 h-5 text-white" />
                                )}
                            </div>
                            <span className="text-xl font-bold gradient-text-primary">{settings?.metadata?.siteName || "AI Suite"}</span>
                        </Link>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">Sign in to your account</h2>
                        <p className="text-muted-foreground">
                            Enter your credentials to access your workspace
                        </p>
                    </div>

                    <Card variant="glass" className="border-0 shadow-2xl">
                        <CardContent className="p-8">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                    <FormField
                                        control={form.control as any}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email address</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            type="email"
                                                            placeholder="Enter your email"
                                                            className="pl-10"
                                                            inputSize="lg"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control as any}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center justify-between">
                                                    <FormLabel>Password</FormLabel>
                                                    <Link
                                                        href="/forgot-password"
                                                        className="text-sm text-primary hover:underline"
                                                    >
                                                        Forgot password?
                                                    </Link>
                                                </div>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Enter your password"
                                                            className="pl-10 pr-10"
                                                            inputSize="lg"
                                                            {...field}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            className="absolute right-1 top-1/2 -translate-y-1/2"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setShowPassword(!showPassword);
                                                            }}
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="rememberMe"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-1">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value as boolean}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel className="text-sm text-muted-foreground font-normal cursor-pointer">
                                                        Remember me for 30 days
                                                    </FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                Sign In
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </Form>

                            {/* Demo Accounts */}
                            <div className="mt-8 pt-6 border-t border-border">
                                <p className="text-sm font-medium text-muted-foreground mb-4 text-center">
                                    Quick demo login
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => quickLogin("admin@example.com", "admin123")}
                                        className="w-full"
                                    >
                                        Admin Demo
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => quickLogin("user@demo.com", "user123")}
                                        className="w-full"
                                    >
                                        User Demo
                                    </Button>
                                </div>
                            </div>

                            <p className="text-center text-sm text-muted-foreground mt-6">
                                Don't have an account?{" "}
                                <Link
                                    href="/register"
                                    className="text-primary hover:underline font-medium"
                                >
                                    Create one free
                                </Link>
                            </p>
                        </CardContent>
                    </Card>

                    {/* Token Badge */}
                    <div className="mt-6 flex justify-center">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                            <Sparkles className="w-4 h-4 mr-2" />
                            New users get 1,000 free tokens
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
