"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingBuyNow() {
    return (
        <div className="fixed top-24 right-6 z-[100] pointer-events-none">
            <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                    duration: 0.5,
                    delay: 1,
                    ease: [0.23, 1, 0.32, 1]
                }}
                className="pointer-events-auto"
            >
                <Link href="https://codecanyon.net/item/ai-suite-react-frontend-application-with-gemini-ai-integration/59967831?s_rank=4" target="_blank">
                    <motion.div
                        whileHover={{
                            scale: 1.05,
                            y: -2,
                        }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            "relative group flex items-center gap-1.5 px-2.5 py-1 rounded-lg",
                            "bg-gradient-to-r from-primary to-ai-secondary",
                            "text-white font-semibold shadow-xl",
                            "shadow-primary/25 hover:shadow-primary/40 transition-shadow duration-300",
                            "border border-white/20 backdrop-blur-sm"
                        )}
                    >
                        {/* Animated Glow Effect */}
                        <div className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 overflow-hidden rounded-lg">
                            <motion.div
                                animate={{
                                    translateX: ["-100%", "200%"]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 3,
                                    ease: "easeInOut"
                                }}
                                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"
                            />
                        </div>

                        {/* Icon */}
                        <div className="relative flex items-center justify-center w-4 h-4 rounded-md bg-white/20">
                            <Zap className="w-2.5 h-2.5 fill-current text-white animate-pulse" />
                        </div>

                        {/* Text */}
                        <span className="relative tracking-tight uppercase text-[10px] font-bold">
                            Buy Now
                        </span>

                        {/* Badge/Dot */}
                        <div className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ai-secondary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-ai-secondary"></span>
                        </div>
                    </motion.div>
                </Link>
            </motion.div>
        </div>
    );
}
