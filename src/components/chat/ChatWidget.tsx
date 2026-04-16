"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, X, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatWidget({ embedded = false, supportEmail }: { embedded?: boolean; supportEmail?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: `Hello! I'm your Live Support Assistant. ${supportEmail ? `(Support Mode: ${supportEmail})` : ''} How can I help you today based on our documents?` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat/rag', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userMsg, supportEmail })
            });

            const data = await response.json();

            if (data.error) {
                setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I had trouble connecting to the support server." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen && !embedded) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-teal-600 hover:bg-teal-700 transition-all duration-300"
            >
                <MessageSquare className="h-6 w-6 text-white" />
            </Button>
        );
    }

    return (
        <div className={cn(
            "flex flex-col bg-background/95 backdrop-blur-md border border-border shadow-2xl transition-all duration-300 overflow-hidden",
            embedded ? "w-full h-full" : "fixed bottom-6 right-6 w-[400px] h-[600px] rounded-2xl z-50"
        )}>
            {/* Header */}
            <div className="p-4 border-b bg-teal-600 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-2 rounded-lg">
                        <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">Live Support</h3>
                        <p className="text-[10px] opacity-80">Powered by AI Suite</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => {
                    if (embedded) {
                        window.parent.postMessage('close-chat-widget', '*');
                    } else {
                        setIsOpen(false);
                    }
                }} className="text-white hover:bg-white/10">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                    {messages.map((m, i) => (
                        <div key={i} className={cn(
                            "flex items-start gap-2",
                            m.role === 'user' ? "flex-row-reverse" : ""
                        )}>
                            <div className={cn(
                                "p-2 rounded-lg text-sm max-w-[80%]",
                                m.role === 'user'
                                    ? "bg-teal-600 text-white rounded-tr-none"
                                    : "bg-muted rounded-tl-none border border-border"
                            )}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-center gap-2 text-muted-foreground text-xs italic">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Assistant is thinking...
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t bg-muted/30">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2"
                >
                    <Input
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="bg-background border-border"
                    />
                    <Button type="submit" size="icon" disabled={isLoading} className="bg-teal-600 hover:bg-teal-700">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
