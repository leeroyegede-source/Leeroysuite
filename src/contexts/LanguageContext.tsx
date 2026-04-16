"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useRTL } from "./RTLContext";
import { AutoTranslator } from "@/components/AutoTranslator";

interface LanguageInfo {
    code: string;
    name: string;
    direction: "ltr" | "rtl";
}

interface LanguageContextType {
    locale: string;
    translations: Record<string, string>;
    availableLanguages: LanguageInfo[];
    t: (key: string, fallback?: string) => string;
    setLocale: (code: string) => void;
    isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
    locale: "en",
    translations: {},
    availableLanguages: [],
    t: (key: string, fallback?: string) => fallback || key,
    setLocale: () => {},
    isLoading: false,
});

export const useLanguage = () => useContext(LanguageContext);

// English is always available as the default language
const ENGLISH_DEFAULT: LanguageInfo = { code: "en", name: "English", direction: "ltr" };

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState("en");
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const [availableLanguages, setAvailableLanguages] = useState<LanguageInfo[]>([ENGLISH_DEFAULT]);
    const [isLoading, setIsLoading] = useState(false);
    const { setRTL } = useRTL();
    const initializedRef = useRef(false);

    // Load available languages on mount
    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const res = await fetch("/api/translations");
                if (res.ok) {
                    const data = await res.json();
                    if (data.languages && Array.isArray(data.languages)) {
                        // Always prepend English if not already in the list
                        const hasEnglish = data.languages.some((l: LanguageInfo) => l.code === "en");
                        const langs = hasEnglish
                            ? data.languages
                            : [ENGLISH_DEFAULT, ...data.languages];
                        setAvailableLanguages(langs);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch languages:", error);
            }
        };
        fetchLanguages();
    }, []);

    // Load translations for a locale
    const loadTranslations = useCallback(async (langCode: string) => {
        if (langCode === "en") {
            setTranslations({});
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch(`/api/translations?lang=${langCode}`);
            if (res.ok) {
                const data = await res.json();
                setTranslations(data.translations || {});
            }
        } catch (error) {
            console.error("Failed to fetch translations:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // On mount: restore saved language from localStorage
    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        const saved = localStorage.getItem("ai-suite-locale");
        if (saved && saved !== "en") {
            setLocaleState(saved);
            document.documentElement.setAttribute("lang", saved);
            loadTranslations(saved);

            // Restore RTL direction based on saved locale
            // We need to check direction from availableLanguages or localStorage
            const savedDir = localStorage.getItem("ai-suite-rtl");
            if (savedDir === "true") {
                setRTL(true);
            }
        }
    }, [loadTranslations, setRTL]);

    // Translation function
    const t = useCallback(
        (key: string, fallback?: string): string => {
            return translations[key] || fallback || key;
        },
        [translations]
    );

    // Switch language
    const setLocale = useCallback(
        (code: string) => {
            setLocaleState(code);
            localStorage.setItem("ai-suite-locale", code);
            document.documentElement.setAttribute("lang", code);

            // Set RTL based on language direction
            const langInfo = availableLanguages.find((l) => l.code === code);
            const isRTL = langInfo?.direction === "rtl";
            setRTL(isRTL);

            // Load translations (clears for English)
            loadTranslations(code);
        },
        [availableLanguages, loadTranslations, setRTL]
    );

    return (
        <LanguageContext.Provider value={{ locale, translations, availableLanguages, t, setLocale, isLoading }}>
            <AutoTranslator
                translations={translations}
                locale={locale}
                enabled={locale !== "en"}
            />
            {children}
        </LanguageContext.Provider>
    );
}

