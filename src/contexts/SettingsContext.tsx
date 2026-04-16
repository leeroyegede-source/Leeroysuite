
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { hexToHsl } from "@/lib/utils";

export interface SystemSettings {
    defaultTokens: number;
    aiLimits: Record<string, number>;
    paymentEnabled: boolean;
    paymentGateway?: string;
    stripePublicKey?: string;
    stripeSecretKey?: string;
    paypalClientId?: string;
    paypalClientSecret?: string;
    paypalMode?: string;

    metadata?: {
        siteName?: string;
        siteUrl?: string;
        siteDescription?: string;
        siteKeywords?: string;
        primaryColor?: string;
        defaultTheme?: "light" | "dark" | "system";
        logoUrl?: string;
        social?: {
            facebook?: string;
            twitter?: string;
            instagram?: string;
            linkedin?: string;
            github?: string;
        };
        platformCurrency?: string;
        features?: Record<string, boolean>;
        smtp?: {
            host?: string;
            port?: string;
            user?: string;
            pass?: string;
            from?: string;
        };
        security?: {
            emailVerification?: boolean;
            maxLoginAttempts?: number;
        };
    };
}

interface SettingsContextType {
    settings: SystemSettings | null;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
    settings: null,
    loading: true,
    refreshSettings: async () => { },
});

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings");
            if (res.ok) {
                const data = await res.json();
                setSettings(data);

                // Apply dynamic styles if needed (e.g. primary color)
                if (data.metadata?.primaryColor) {
                    const primaryHsl = hexToHsl(data.metadata.primaryColor);
                    document.documentElement.style.setProperty('--primary', primaryHsl);
                    document.documentElement.style.setProperty('--ring', primaryHsl);

                    // Simple contrast check for foreground
                    // Extract L value to determine if we need light or dark text
                    const l = parseInt(primaryHsl.split(' ')[2]);
                    const foreground = l > 60 ? '0 0% 0%' : '0 0% 100%';
                    document.documentElement.style.setProperty('--primary-foreground', foreground);
                }
            }
        } catch (error) {
            console.error("Failed to load settings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}
