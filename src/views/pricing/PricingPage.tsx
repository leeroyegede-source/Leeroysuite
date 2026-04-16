"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import { Check, Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { AVAILABLE_FEATURES } from "@/lib/features";

interface PricingPlan {
    id: string;
    name: string;
    price: number;
    tokens: number;
    interval: 'month' | 'year';
    features: string[];
    aiTools?: string[];
}

function PricingPageContent() {
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const { toast } = useToast();
    const { user, refreshUser } = useAuth();
    const { settings } = useSettings();
    const router = useRouter();
    const searchParams = useSearchParams();
    const processedSessions = useRef<Set<string>>(new Set());

    useEffect(() => {
        fetchPlans();
    }, []);

    useEffect(() => {
        if (searchParams) {
            const success = searchParams.get('success');
            const canceled = searchParams.get('canceled');
            const sessionId = searchParams.get('session_id') || searchParams.get('token');

            if (success && sessionId && !processedSessions.current.has(sessionId)) {
                processedSessions.current.add(sessionId);
                const gateway = searchParams.get('gateway') || 'stripe';
                
                // Verify the session on the backend to credit tokens securely
                fetch(`/api/checkout/verify?${searchParams.toString()}`)
                    .then(res => res.json())
                    .then(data => {
                        console.log("[Verification Debug]", data);
                        if (data.success && data.status === 'paid') {
                            toast({
                                title: "Upgrade Successful!",
                                description: "Tokens have been added to your account.",
                                variant: "default",
                                className: "bg-green-600 text-white border-none"
                            });
                            refreshUser();
                        } else if (data.error) {
                            toast({
                                title: "Verification Error",
                                description: data.error,
                                variant: "destructive"
                            });
                        } else {
                            const isDeclined = data.error?.includes('INSTRUMENT_DECLINED');
                            const errorMsg = data.error ? ` - ${data.error}` : '';
                            
                            toast({
                                title: isDeclined ? "Payment Declined" : "Payment Pending",
                                description: isDeclined 
                                    ? "PayPal declined this card. Please try again using a different test card number (e.g. use a Mastercard test card)."
                                    : `Status: ${data.providerStatus || 'Processing'}${errorMsg}. Tokens will be added shortly.`,
                                variant: isDeclined ? "destructive" : "default",
                                duration: isDeclined ? 15000 : 5000,
                                action: data.recoveryUrl ? (
                                    <ToastAction 
                                        altText="Try Again" 
                                        onClick={() => window.location.href = data.recoveryUrl}
                                    >
                                        Try Again
                                    </ToastAction>
                                ) : undefined
                            });
                        }
                    })
                    .catch((err) => {
                        toast({
                            title: "Verification Error",
                            description: "Could not verify payment status immediately.",
                            variant: "destructive"
                        });
                    })
                    .finally(() => {
                        // Clean up URL
                        const newUrl = window.location.pathname;
                        window.history.replaceState({}, '', newUrl);
                    });
            } else if (canceled && !processedSessions.current.has('canceled')) {
                processedSessions.current.add('canceled');
                toast({
                    title: "Payment Canceled",
                    description: "You canceled the checkout process.",
                    variant: "destructive"
                });
                // Clean up URL
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
            }
        }
    }, [searchParams, refreshUser, toast]);

    const fetchPlans = async () => {
        try {
            const res = await fetch("/api/plans");
            if (!res.ok) throw new Error("Failed to fetch plans");
            const data = await res.json();
            setPlans(data.plans.filter((p: any) => p.isActive));
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.message || "Failed to load pricing plans",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const processPayment = async (plan: PricingPlan) => {
        if (!user) {
            router.push("/login?redirect=/pricing");
            return;
        }

        setProcessingId(plan.id);
        try {
            const intentRes = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId: plan.id })
            });

            if (!intentRes.ok) {
                const errData = await intentRes.json();
                throw new Error(errData.error || "Checkout setup failed");
            }
            const { url } = await intentRes.json();

            if (url) {
                window.location.href = url;
            } else {
                throw new Error("No checkout URL returned from server.");
            }
        } catch (error: any) {
            toast({
                title: "Payment Initialization Failed",
                description: error.message || "Something went wrong. Please try again.",
                variant: "destructive"
            });
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-ai-primary" />
            </div>
        );
    }

    return (
        <div className="container py-10 px-4 md:px-0 mx-auto max-w-6xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 ai-gradient-text">
                    Upgrade Your Plan
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
                    Get more tokens and unlock premium AI features. Choose the plan that fits your needs.
                </p>

                {/* Active Gateway Info */}
                {settings?.paymentGateway && (
                    <Card className="inline-block border-dashed border-ai-primary/40 bg-ai-primary/5 shadow-sm">
                        <CardContent className="p-4 flex flex-col items-center text-sm">
                            <div className="font-semibold text-ai-primary flex items-center gap-2 mb-2">
                                <CreditCard className="w-4 h-4" />
                                <span>Payment via {(settings.paymentGateway || 'stripe').charAt(0).toUpperCase() + (settings.paymentGateway || 'stripe').slice(1)}</span>
                            </div>
                            {settings.paymentGateway === 'stripe' && (
                                <>
                                    <div className="bg-background/80 rounded px-3 py-2 border font-mono text-xs w-full text-center">
                                        <span className="text-muted-foreground mr-2">Test Card:</span>
                                        <span className="font-medium tracking-widest">4242 4242 4242 4242</span>
                                    </div>
                                    <div className="flex gap-2 w-full mt-2">
                                        <div className="bg-background/80 rounded px-3 py-2 border font-mono text-xs flex-1 text-center">
                                            <span className="text-muted-foreground mr-2">Exp:</span>
                                            <span>12/34</span>
                                        </div>
                                        <div className="bg-background/80 rounded px-3 py-2 border font-mono text-xs flex-1 text-center">
                                            <span className="text-muted-foreground mr-2">CVC:</span>
                                            <span>123</span>
                                        </div>
                                    </div>
                                </>
                            )}
                            {settings.paymentGateway === 'paypal' && settings.paypalMode === 'sandbox' && (
                                <>
                                    <div className="bg-background/80 rounded px-3 py-2 border font-mono text-xs w-full text-center">
                                        <span className="text-muted-foreground mr-2">Test Card:</span>
                                        <span className="font-medium tracking-widest">4111 1111 1111 1111</span>
                                    </div>
                                    <div className="flex gap-2 w-full mt-2">
                                        <div className="bg-background/80 rounded px-3 py-2 border font-mono text-xs flex-1 text-center">
                                            <span className="text-muted-foreground mr-2">Exp:</span>
                                            <span>12/26</span>
                                        </div>
                                        <div className="bg-background/80 rounded px-3 py-2 border font-mono text-xs flex-1 text-center">
                                            <span className="text-muted-foreground mr-2">CVC:</span>
                                            <span>123</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-2 text-center italic">
                                        * Login with a PayPal Sandbox account for full testing.
                                    </p>
                                </>
                            )}
                            {settings.paymentGateway !== 'stripe' && (settings.paymentGateway !== 'paypal' || settings.paypalMode !== 'sandbox') && (
                                <p className="text-xs text-muted-foreground text-center">
                                    You will be redirected to {(settings.paymentGateway || '').charAt(0).toUpperCase() + (settings.paymentGateway || '').slice(1)} to complete payment.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {plans.length === 0 ? (
                <div className="text-center text-muted-foreground p-10 border border-dashed rounded-xl">
                    No active plans available at the moment. Please check back later.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <Card key={plan.id} className="flex flex-col border-ai-primary/20 hover:border-ai-primary/50 transition-all hover:shadow-lg hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <CreditCard className="w-24 h-24" />
                            </div>
                            <CardHeader>
                                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                <CardDescription>
                                    {(plan.interval === 'month' || !plan.interval) ? 'Monthly Billed' : 'Yearly Billed'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="mb-6">
                                    <span className="text-4xl font-bold">
                                        {new Intl.NumberFormat('en-US', { 
                                            style: 'currency', 
                                            currency: settings?.metadata?.platformCurrency || 'USD', 
                                            maximumFractionDigits: 0 
                                        }).format(plan.price)}
                                    </span>
                                    <span className="text-muted-foreground">/{plan.interval || 'month'}</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Check className="w-5 h-5 text-green-500" />
                                        <span className="font-semibold">{plan.tokens.toLocaleString()} Tokens</span>
                                    </div>
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <Check className="w-5 h-5 text-ai-primary" />
                                            <span className="text-sm">{feature}</span>
                                        </div>
                                    ))}
                                    {plan.aiTools && plan.aiTools.length > 0 && (
                                        <Accordion type="single" collapsible className="w-full">
                                            <AccordionItem value="tools" className="border-none">
                                                <AccordionTrigger className="py-2 text-sm hover:no-underline font-medium text-ai-primary flex gap-2 w-full text-left">
                                                    Included AI Tools ({plan.aiTools.length})
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {plan.aiTools.map(toolId => {
                                                            const feature = AVAILABLE_FEATURES.find(f => f.id === toolId);
                                                            return feature ? (
                                                                <Badge key={toolId} variant="secondary" className="text-[10px] font-normal bg-ai-primary/10 text-ai-primary hover:bg-ai-primary/20">
                                                                    {feature.label}
                                                                </Badge>
                                                            ) : null;
                                                        })}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full bg-ai-primary hover:bg-ai-primary/90"
                                    size="lg"
                                    onClick={() => processPayment(plan)}
                                    disabled={processingId === plan.id}
                                >
                                    {processingId === plan.id ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting...
                                        </>
                                    ) : (
                                        "Upgrade Now"
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function PricingPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-ai-primary" /></div>}>
            <PricingPageContent />
        </Suspense>
    );
}
