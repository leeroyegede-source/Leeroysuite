"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatMessage } from "@/hooks/useWebRTC";

interface MeetingChatProps {
    messages: ChatMessage[];
    onSendMessage: (text: string) => void;
    onClose: () => void;
    currentUserId: string;
}

export function MeetingChat({ messages, onSendMessage, onClose, currentUserId }: MeetingChatProps) {
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed) return;
        onSendMessage(trimmed);
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-4 top-4 bottom-24 w-80 z-40 flex flex-col rounded-2xl overflow-hidden dark:bg-[#0d0d16]/95 bg-card/95 backdrop-blur-2xl border border-border dark:border-white/[0.08] shadow-2xl"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#00d4ff]" />
                    <span className="text-sm font-semibold dark:text-white text-foreground">Meeting Chat</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-7 w-7 rounded-lg dark:hover:bg-white/10 hover:bg-foreground/10 dark:text-white/60 text-muted-foreground dark:hover:text-white hover:text-foreground"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full dark:text-white/30 text-muted-foreground text-sm">
                        <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
                        <p>No messages yet</p>
                        <p className="text-xs mt-1">Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isOwn = msg.from === currentUserId;
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                            >
                                {!isOwn && (
                                    <span className="text-[10px] dark:text-white/40 text-muted-foreground mb-0.5 ml-1 font-medium">
                                        {msg.fromName}
                                    </span>
                                )}
                                <div
                                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                                        isOwn
                                            ? "bg-[#00d4ff]/20 text-[#00d4ff] rounded-br-md"
                                            : "dark:bg-white/[0.06] bg-muted/80 dark:text-white/90 text-foreground rounded-bl-md"
                                    }`}
                                >
                                    {msg.text}
                                </div>
                                <span className="text-[10px] dark:text-white/25 text-muted-foreground mt-0.5 mx-1">
                                    {formatTime(msg.timestamp)}
                                </span>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="flex-1 h-10 rounded-xl dark:bg-white/[0.05] bg-muted/50 border-border dark:border-white/[0.08] dark:text-white text-foreground placeholder:text-muted-foreground focus-visible:ring-[#00d4ff]/30 text-sm"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        size="icon"
                        className="h-10 w-10 rounded-xl bg-[#00d4ff] hover:bg-[#00bde6] text-black disabled:opacity-30 transition-all"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
