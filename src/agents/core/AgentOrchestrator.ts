
import { AgentRole, AgentContext, AgentResponse } from "../types";
import { getSystemPrompt } from "../prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";

console.log("Loading AgentOrchestrator.ts module...");

export class AgentOrchestrator {
    private role: AgentRole = 'developer';
    private history: (HumanMessage | AIMessage | SystemMessage)[] = [];
    private model: ChatGoogleGenerativeAI;
    public files: Map<string, string> = new Map();

    constructor(apiKey?: string) {
        const key = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!key) {
            console.error("NEXT_PUBLIC_GEMINI_API_KEY is not set!");
            throw new Error("Gemini API Key is missing. Please check your .env file.");
        }
        console.log("AgentOrchestrator using key ending in:", key.slice(-4));

        this.model = new ChatGoogleGenerativeAI({
            model: "gemini-2.0-flash",
            maxOutputTokens: 2048,
            apiKey: key,
        });
        this.reset();
    }

    setRole(role: AgentRole) {
        this.role = role;
        this.reset();
    }

    reset() {
        this.history = [
            new SystemMessage(getSystemPrompt(this.role) + "\n\nTo create a file, use the following format:\nACTION: CREATE_FILE\nPATH: <path>\nCONTENT:\n<content>\nEND_CONTENT")
        ];
        this.files.clear();
    }

    async sendMessage(message: string): Promise<AgentResponse> {
        this.history.push(new HumanMessage(message));

        const response = await this.model.invoke(this.history);
        const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

        this.history.push(new AIMessage(content));

        // Simple Tool Parsing
        const lines = content.split('\n');
        let isCreatingFile = false;
        let currentPath = '';
        let currentContent = '';

        const steps = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim()?.startsWith('Thought:')) {
                steps.push({ thought: line.replace('Thought:', '').trim() });
            }

            if (line.includes('ACTION: CREATE_FILE')) {
                isCreatingFile = true;
                // Next line should be PATH
            } else if (isCreatingFile && line.trim()?.startsWith('PATH:')) {
                currentPath = line.replace('PATH:', '').trim();
            } else if (isCreatingFile && line.trim()?.startsWith('CONTENT:')) {
                // Content starts next line
            } else if (isCreatingFile && line.trim() === 'END_CONTENT') {
                isCreatingFile = false;
                if (currentPath) {
                    this.files.set(currentPath, currentContent.trim());
                    steps.push({
                        thought: `Created file: ${currentPath}`,
                        action: 'CREATE_FILE',
                        actionInput: currentPath
                    });
                }
                currentPath = '';
                currentContent = '';
            } else if (isCreatingFile) {
                currentContent += line + '\n';
            }
        }

        // Default step if none found
        if (steps.length === 0) {
            steps.push({ thought: "Processed response." });
        }

        return {
            output: content,
            steps: steps
        };
    }

    getHistory() {
        return this.history;
    }
}
