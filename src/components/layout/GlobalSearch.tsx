"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { navigationCategories } from "@/lib/sidebar-routes";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

interface GlobalSearchProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onOpenChange(!open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [onOpenChange]);

    const runCommand = useCallback(
        (command: () => unknown) => {
            onOpenChange(false);
            command();
        },
        [onOpenChange]
    );

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <Command
                filter={(value, search) => {
                    if (value.toLowerCase().includes(search.toLowerCase())) return 1;
                    return 0;
                }}
            >
                <CommandInput placeholder="Search for tools, features, templates..." className="border-0 focus:ring-0 outline-none shadow-none" />
                <CommandList className="scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                    <CommandEmpty className="py-12 text-center text-sm flex flex-col items-center gap-3">
                        <Search className="h-10 w-10 text-muted-foreground/30" />
                        <p className="text-muted-foreground">No results found.</p>
                    </CommandEmpty>
                    {navigationCategories.map((category) => {
                        const filteredItems = category.items?.filter(item => {
                            if (user?.disabledFeatures?.includes(item.id)) return false;
                            if (user && user.role !== 'admin' && user.planName !== 'Enterprise' && user.aiTools && item.id !== 'dashboard' && item.id !== 'support-agent') {
                                if (!user.aiTools.includes(item.id)) return false;
                            }
                            return true;
                        });

                        if (!filteredItems || filteredItems.length === 0) return null;

                        return (
                            <div key={category.id}>
                                <CommandGroup heading={category.title} className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                    {filteredItems.map((item) => (
                                        <CommandItem
                                            key={item.id}
                                            value={item.title}
                                            onSelect={() => {
                                                runCommand(() => router.push(item.url));
                                            }}
                                            className="flex items-center gap-3 cursor-pointer py-2.5 px-3 mb-1 data-[selected=true]:bg-primary/[0.08] data-[selected=true]:text-primary rounded-xl transition-all duration-200"
                                        >
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm border border-border/50 text-foreground">
                                                <item.icon className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col flex-1 truncate">
                                                <span className="text-sm font-medium">{item.title}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 ml-auto">
                                                {item.isNew && (
                                                    <Badge variant="default" className="h-5 px-1.5 text-[9px] uppercase font-bold bg-primary text-primary-foreground tracking-wider rounded-md">
                                                        New
                                                    </Badge>
                                                )}
                                                {item.isPro && (
                                                    <Badge variant="outline" className="h-5 px-1.5 text-[9px] uppercase font-bold border-amber-500/30 text-amber-500 bg-amber-500/10 tracking-wider rounded-md">
                                                        Pro
                                                    </Badge>
                                                )}
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </div>
                        );
                    })}
                </CommandList>
            </Command>
        </CommandDialog>
    );
}
