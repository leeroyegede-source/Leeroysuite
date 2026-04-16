"use client";

import { motion } from "framer-motion";
import { MicOff, Activity, Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentStatus } from "@/hooks/useAgent";

interface AIParticipantTileProps {
    status: AgentStatus;
    transcript: string;
    className?: string;
}

export function AIParticipantTile({ status, transcript, className }: AIParticipantTileProps) {
    return (
        <div className={cn(
            "relative w-full h-full rounded-2xl overflow-hidden dark:bg-[#12121a] bg-muted border border-border dark:border-white/[0.06] flex items-center justify-center group",
            className
        )}>

            {/* Background aesthetic dependng on status */}
            <div className={cn(
                "absolute inset-0 opacity-20 transition-all duration-700 blur-3xl",
                status === "listening" && "bg-gradient-to-tr from-[#00d4ff] to-[#3b82f6]",
                status === "processing" && "bg-gradient-to-tr from-[#8b5cf6] to-[#ec4899] animate-pulse",
                status === "speaking" && "bg-gradient-to-tr from-[#10b981] to-[#34d399]",
                status === "idle" || status === "error" && "bg-transparent"
            )} />

            {/* Subdued rings */}
            <div className={cn(
                "absolute w-48 h-48 rounded-full border border-border/50 dark:border-white/[0.03] transition-all duration-1000",
                status === "speaking" ? "scale-150 opacity-100" : "scale-100 opacity-50"
            )} />
            <div className={cn(
                "absolute w-64 h-64 rounded-full border border-border/30 dark:border-white/[0.02] transition-all duration-1000 delay-100",
                status === "speaking" ? "scale-150 opacity-100" : "scale-100 opacity-50"
            )} />

            {/* Main Avatar Area */}
            <div className="relative flex flex-col items-center gap-6 z-10">
                <div className="relative">
                    {/* Center icon */}
                    <div className={cn(
                        "w-24 h-24 rounded-full flex items-center justify-center backdrop-blur-xl border border-border dark:border-white/10 shadow-2xl transition-all duration-500",
                        status === "listening" ? "bg-[#00d4ff]/10 shadow-[#00d4ff]/20 scale-105" :
                            status === "processing" ? "bg-[#8b5cf6]/10 shadow-[#8b5cf6]/20 scale-100" :
                                status === "speaking" ? "bg-[#10b981]/20 shadow-[#10b981]/30 scale-110" :
                                    "dark:bg-white/5 bg-background/50"
                    )}>
                        {status === "processing" ? (
                            <Loader2 className="w-10 h-10 text-[#a78bfa] animate-spin" />
                        ) : status === "speaking" ? (
                            <div className="flex items-center gap-1.5 h-8">
                                <motion.div animate={{ height: ["40%", "100%", "40%"] }} transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }} className="w-1.5 bg-[#34d399] rounded-full" />
                                <motion.div animate={{ height: ["20%", "80%", "20%"] }} transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }} className="w-1.5 bg-[#34d399] rounded-full" />
                                <motion.div animate={{ height: ["60%", "100%", "60%"] }} transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }} className="w-1.5 bg-[#34d399] rounded-full" />
                                <motion.div animate={{ height: ["30%", "70%", "30%"] }} transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }} className="w-1.5 bg-[#34d399] rounded-full" />
                            </div>
                        ) : (
                            <Bot className={cn(
                                "w-12 h-12 transition-colors duration-500",
                                status === "listening" ? "text-[#00d4ff]" : "dark:text-white/50 text-foreground/50"
                            )} />
                        )}
                    </div>

                    {/* Speaking Halo */}
                    {status === "speaking" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 rounded-full border-2 border-[#34d399] pointer-events-none"
                        />
                    )}
                </div>

                {/* State Label */}
                <div className="text-center">
                    <h3 className="dark:text-white text-foreground font-medium text-lg tracking-wide">AI Agent</h3>
                    <p className="text-sm dark:text-white/50 text-muted-foreground mt-1 capitalize font-medium flex items-center justify-center gap-2">
                        {status === "error" ? "Connection Error" : status}
                        {status === "listening" && <span className="w-2 h-2 rounded-full bg-[#00d4ff] animate-pulse" />}
                        {status === "processing" && <span className="w-2 h-2 rounded-full bg-[#a78bfa] animate-pulse" />}
                        {status === "speaking" && <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse" />}
                    </p>
                </div>
            </div>

            {/* Transcript Overlay */}
            {status === "listening" && transcript && (
                <div className="absolute inset-x-8 bottom-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="dark:bg-black/60 bg-background/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-border dark:border-white/10 inline-block max-w-[80%]"
                    >
                        <p className="dark:text-white/90 text-foreground/90 text-sm leading-relaxed line-clamp-2">
                            "{transcript}"
                        </p>
                    </motion.div>
                </div>
            )}

            {/* Bottom info bar */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg dark:bg-black/40 bg-background/60 backdrop-blur-md border border-border dark:border-white/[0.08]">
                <Bot className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-semibold dark:text-white/90 text-foreground/90">AI Agent</span>
            </div>

            <div className="absolute top-4 right-4 p-2 rounded-lg dark:bg-black/40 bg-background/60 backdrop-blur-md border border-border dark:border-white/[0.08]">
                {status === "idle" || status === "error" ? (
                    <MicOff className="w-4 h-4 text-red-400" />
                ) : (
                    <Activity className="w-4 h-4 text-[#00d4ff]" />
                )}
            </div>

        </div>
    );
}
