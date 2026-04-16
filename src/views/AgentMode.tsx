import React, { useState, useEffect, useRef } from 'react';
import { Layout } from "@/components/layout/Layout";
import { AgentChat } from '@/components/agent/AgentChat';
import { AgentOrchestrator } from '@/agents/core/AgentOrchestrator';
import { useAuth } from '@/contexts/AuthContext';
import { AgentRole } from '@/agents/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AgentWorkspace } from '@/components/agent/AgentWorkspace';
import { toast } from 'sonner'

const AgentMode = () => {
    const { apiKeys } = useAuth();
    const apiKey = apiKeys.gemini;
    const [role, setRole] = useState<AgentRole>('developer');
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState<Map<string, string>>(new Map());
    const orchestratorRef = useRef<AgentOrchestrator | null>(null);

    useEffect(() => {
        try {
            orchestratorRef.current = new AgentOrchestrator("");
            console.log("AgentOrchestrator initialized successfully.");
        } catch (e: any) {
            console.error("Failed to initialize AgentOrchestrator:", e);
            setMessages(prev => [...prev, { role: 'assistant', content: "System Error: Failed to initialize Agent Core. Please check API Key." }]);
        }
    }, [apiKey]);

    const handleRoleChange = (newRole: AgentRole) => {
        setRole(newRole);
        orchestratorRef.current?.setRole(newRole);
        setMessages([]);
        setFiles(new Map());
    };

    const handleSendMessage = async (input: string) => {
        if (!orchestratorRef.current) return;

        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'user', content: input }]);

        try {
            toast.info("Demo mode - no actual API calls will be made.");
            // const response = await orchestratorRef.current.sendMessage(input);

            // setMessages(prev => [...prev, { role: 'assistant', content: response.output }]);

            // // Update files
            // if (orchestratorRef.current.files.size > 0) {
            //     setFiles(new Map(orchestratorRef.current.files));
            // }
        } catch (error: any) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Error: Failed to process request." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full flex-col bg-background p-4 md:p-8 gap-4">
            <div className="flex items-center justify-between">
                <h1 className="font-semibold text-2xl">Agent Mode</h1>
                <div className="w-[200px]">
                    <Select value={role} onValueChange={(v) => handleRoleChange(v as AgentRole)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Agent Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="developer">Developer Agent</SelectItem>
                            <SelectItem value="devops">DevOps Agent</SelectItem>
                            <SelectItem value="business">Business Agent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 flex-1 h-full min-h-0">
                {/* Chat Column */}
                <Card className="col-span-2 flex flex-col h-full overflow-hidden">
                    <AgentChat
                        role={role}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        isLoading={isLoading}
                    />
                </Card>

                {/* Sidebar Column */}
                <div className="flex flex-col gap-4 h-full overflow-hidden">
                    <Card className="flex-1">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Agent Thought Process</CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground text-sm">
                            <p>Active Role: <span className="font-semibold capitalize text-foreground">{role}</span></p>
                            <p className="mt-2">Waiting for task...</p>
                            {isLoading && <p className="text-blue-500 animate-pulse mt-2">Reasoning...</p>}
                        </CardContent>
                    </Card>

                    <Card className="flex-1">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Workspace Artifacts</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px] p-0 overflow-hidden">
                            <AgentWorkspace files={files} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AgentMode;
