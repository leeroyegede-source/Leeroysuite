
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AgentRole } from '@/agents/types';
import { Card } from '@/components/ui/card';

interface AgentChatProps {
    role: AgentRole;
    onSendMessage: (message: string) => void;
    messages: { role: 'user' | 'assistant', content: string }[];
    isLoading: boolean;
}

export const AgentChat: React.FC<AgentChatProps> = ({ role, onSendMessage, messages, isLoading }) => {
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;
        onSendMessage(input);
        setInput('');
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <h2 className="font-semibold capitalize">Chat with {role} Agent</h2>
            </div>
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <Card className={`p-3 max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            </Card>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <Card className="p-3 bg-muted">
                                <span className="animate-pulse">Thinking...</span>
                            </Card>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <div className="p-4 border-t flex gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your instruction..."
                    disabled={isLoading}
                />
                <Button onClick={handleSend} disabled={isLoading}>Send</Button>
            </div>
        </div>
    );
};
