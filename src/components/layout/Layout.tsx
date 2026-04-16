"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { motion } from "framer-motion";
// import { FloatingBuyNow } from "@/components/ui/FloatingBuyNow";

interface LayoutProps {
    children: React.ReactNode;
    fullHeight?: boolean;
}

export function Layout({ children, fullHeight = false }: LayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu on resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            {/* Ambient background effects - Refined */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                {/* Primary gradient - top left */}
                <div
                    className="absolute -top-[30%] -left-[15%] w-[50%] h-[50%] rounded-full opacity-40 dark:opacity-30"
                    style={{
                        background: 'radial-gradient(circle, hsl(var(--ai-primary) / 0.15) 0%, transparent 60%)',
                        filter: 'blur(80px)',
                    }}
                />

                {/* Secondary gradient - bottom right */}
                <div
                    className="absolute -bottom-[30%] -right-[15%] w-[50%] h-[50%] rounded-full opacity-30 dark:opacity-20"
                    style={{
                        background: 'radial-gradient(circle, hsl(var(--ai-secondary) / 0.12) 0%, transparent 60%)',
                        filter: 'blur(80px)',
                    }}
                />

                {/* Accent gradient - center */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35%] h-[35%] rounded-full opacity-20 dark:opacity-15"
                    style={{
                        background: 'radial-gradient(circle, hsl(var(--ai-tertiary) / 0.08) 0%, transparent 60%)',
                        filter: 'blur(60px)',
                    }}
                />

                {/* Subtle grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
                            linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            {/* Sidebar - handles both desktop and mobile internally */}
            <Sidebar
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header
                    onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
                />

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        className={`${fullHeight ? 'h-full' : 'min-h-full'} p-4 lg:p-6 xl:p-8`}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
            {/* <FloatingBuyNow /> */}
        </div>
    );
}
