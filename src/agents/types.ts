
import { BaseMessage } from "@langchain/core/messages";

export type AgentRole = 'developer' | 'devops' | 'business';

export interface AgentStep {
    thought: string;
    action?: string;
    actionInput?: string;
    observation?: string;
}

export interface AgentContext {
    role: AgentRole;
    history: BaseMessage[];
    workspaceId: string;
}

export interface AgentResponse {
    output: string;
    steps: AgentStep[];
}
