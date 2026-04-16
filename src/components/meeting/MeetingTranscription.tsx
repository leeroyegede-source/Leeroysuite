"use client";

import { motion } from "framer-motion";
import { X, FileText, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TranscriptionMessage } from "@/hooks/useWebRTC";
import { useEffect, useRef } from "react";

interface MeetingTranscriptionProps {
    transcripts: TranscriptionMessage[];
    onClose: () => void;
    currentUserId: string;
}

export function MeetingTranscription({ 
    transcripts, 
    onClose, 
    currentUserId 
}: MeetingTranscriptionProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new transcripts
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [transcripts]);

    return (
        <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-4 bottom-24 right-4 w-80 z-40 flex flex-col rounded-2xl overflow-hidden dark:bg-[#0d0d16]/95 bg-card/95 backdrop-blur-2xl border border-border dark:border-white/[0.08] shadow-2xl"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <FileText className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-sm font-semibold dark:text-white text-foreground">Live Transcript</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8 rounded-lg dark:hover:bg-white/10 hover:bg-foreground/10 dark:text-white/60 text-muted-foreground dark:hover:text-white hover:text-foreground"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Transcript List */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-muted-foreground/20 dark:scrollbar-thumb-white/10"
            >
                {transcripts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-40">
                        <Clock className="w-10 h-10 dark:text-white/40 text-foreground/40" />
                        <p className="text-sm dark:text-white/60 text-foreground/60">Waiting for speech...</p>
                    </div>
                ) : (
                    transcripts.map((entry, index) => (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-1.5"
                        >
                            <div className="flex items-center justify-between">
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider",
                                    entry.from === currentUserId ? "text-blue-400" : "text-emerald-400"
                                )}>
                                    {entry.fromName}
                                </span>
                                <span className="text-[10px] dark:text-white/30 text-muted-foreground">
                                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="dark:bg-white/[0.03] bg-muted/50 rounded-xl p-3 border border-border dark:border-white/[0.05]">
                                <p className="text-sm dark:text-white/80 text-foreground/80 leading-relaxed font-light">
                                    {entry.text}
                                </p>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Status Footer */}
            <div className="px-4 py-3 border-t border-border dark:border-white/[0.06] dark:bg-black/20 bg-muted/30">
                <p className="text-[10px] dark:text-white/40 text-muted-foreground text-center italic">
                    Transcripts are generated in real-time and not stored permanently.
                </p>
            </div>
        </motion.div>
    );
}
