"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "../contexts/AuthContext";
import { SettingsProvider } from "../contexts/SettingsContext";
import { RTLProvider } from "../contexts/RTLContext";
import { LanguageProvider } from "../contexts/LanguageContext";
import { TooltipProvider } from "./ui/tooltip";
import { Toaster } from "./ui/toaster";
import { Toaster as Sonner } from "./ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <SettingsProvider>
                <RTLProvider>
                    <LanguageProvider>
                        <ThemeProvider defaultTheme="light" storageKey="ai-suite-theme">
                            <AuthProvider>
                                <TooltipProvider>
                                    {children}
                                    <Toaster />
                                    <Sonner />
                                </TooltipProvider>
                            </AuthProvider>
                        </ThemeProvider>
                    </LanguageProvider>
                </RTLProvider>
            </SettingsProvider>
        </QueryClientProvider>
    );
}

