"use client";

import { Globe, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function LanguageSwitcher() {
    const { locale, availableLanguages, setLocale } = useLanguage();

    // Don't render if no languages are configured
    if (availableLanguages.length <= 1) return null;

    const currentLang = availableLanguages.find((l) => l.code === locale);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-1.5 px-2.5 hover:bg-muted/50 hover:text-black"
                >
                    <Globe className="w-4 h-4" />
                    <span className="text-xs font-medium hidden sm:inline-block uppercase">
                        {currentLang?.code || locale}
                    </span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl" data-no-translate>
                {availableLanguages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLocale(lang.code)}
                        className="cursor-pointer gap-2"
                    >
                        <span className="flex-1 text-sm">{lang.name}</span>
                        {lang.direction === "rtl" && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono">
                                RTL
                            </Badge>
                        )}
                        {locale === lang.code && (
                            <Check className="w-4 h-4 text-primary" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
