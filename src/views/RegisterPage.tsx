"use client";

import { useState, useEffect } from "react";
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
    User,
    Loader2,
    Sparkles,
    ArrowRight,
    Check,
    Zap,
    Palette,
    Code,
    type LucideIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";

interface Feature {
    icon: LucideIcon;
    title: string;
}

const features: Feature[] = [
    { icon: Zap, title: "100+ AI-powered tools" },
    { icon: Palette, title: "Generate images & websites" },
    { icon: Code, title: "Write code in any language" },
    { icon: Sparkles, title: "1,000 free tokens to start" },
];

interface RegisterPageProps {
    isAdmin?: boolean;
}

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    agreeToTerms: z.boolean().refine((val) => val === true, {
        message: "You must agree to the terms and privacy policy",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export default function RegisterPage({ isAdmin = false }: RegisterPageProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, isAuthenticated, user } = useAuth();
    const { settings } = useSettings();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            agreeToTerms: false,
        },
    });

    useEffect(() => {
        if (isAuthenticated) {
            if (user?.role === "admin") {
                router.push("/admin/dashboard");
            } else {
                router.push("/dashboard");
            }
        }
    }, [isAuthenticated, router, user]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        const result = await register(values.name, values.email, values.password, isAdmin ? "admin" : "user");
        setIsSubmitting(false);

        if (result.success) {
            toast({
                title: "Welcome to AI Suite!",
                description: "Your account has been created successfully.",
            });
            if (result.user?.role === "admin") {
                router.push("/admin/dashboard");
            } else {
                router.push("/dashboard");
            }
        } else {
            let errorMessage = result.error || "Email already exists.";
            if (typeof errorMessage === "object") {
                errorMessage = (errorMessage as any).message || JSON.stringify(errorMessage);
            }
            toast({
                title: "Registration failed",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-ai-tertiary via-primary to-ai-secondary" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px]" />

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
                                Start Your AI
                                <br />
                                Journey Today
                            </h1>
                            <p className="text-lg text-white/80 max-w-md">
                                Join thousands of creators and professionals using AI Suite.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + index * 0.1 }}
                                    className="flex items-center gap-3 text-white/90"
                                >
                                    <div className="p-1.5 bg-white/20 rounded-lg">
                                        <feature.icon className="w-4 h-4" />
                                    </div>
                                    <span>{feature.title}</span>
                                </motion.div>
                            ))}
                        </div>

                        <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <p className="text-white/90 mb-4">
                                "AI Suite transformed how I create content. What used to take hours now takes minutes."
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                                    SC
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Sarah Chen</p>
                                    <p className="text-xs text-white/60">Marketing Director</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-white/60">
                        © 2026 AI Suite. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
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
                        <h2 className="text-3xl font-bold mb-2">Create your account</h2>
                        <p className="text-muted-foreground">
                            Get started with 1,000 free tokens
                        </p>
                    </div>

                    <Card variant="glass" className="border-0 shadow-2xl">
                        <CardContent className="p-8">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                    <FormField
                                        control={form.control as any}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full name</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            placeholder="Enter your name"
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
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Create a password"
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
                                        control={form.control as any}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            placeholder="Confirm your password"
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
                                                                setShowConfirmPassword(!showConfirmPassword);
                                                            }}
                                                        >
                                                            {showConfirmPassword ? (
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
                                        control={form.control as any}
                                        name="agreeToTerms"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col items-start space-y-1 p-1">
                                                <div className="flex items-center space-x-2">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                            className="mt-0.5"
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel className="text-sm font-normal text-muted-foreground cursor-pointer leading-relaxed">
                                                            I agree to the{" "}
                                                            <Link href="/terms" className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                                                                Terms of Service
                                                            </Link>{" "}
                                                            and{" "}
                                                            <Link href="/privacy" className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                                                                Privacy Policy
                                                            </Link>
                                                        </FormLabel>
                                                    </div>
                                                </div>
                                                <FormMessage />
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
                                                Creating Account...
                                            </>
                                        ) : (
                                            <>
                                                Create Account
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </Form>

                            <p className="text-center text-sm text-muted-foreground mt-6">
                                Already have an account?{" "}
                                <Link
                                    href="/login"
                                    className="text-primary hover:underline font-medium"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </CardContent>
                    </Card>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        {[
                            "No credit card required",
                            "Cancel anytime",
                            "Free 1,000 tokens",
                            "Instant access",
                        ].map((benefit, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 text-sm text-muted-foreground"
                            >
                                <Check className="w-4 h-4 text-green-500" />
                                {benefit}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
