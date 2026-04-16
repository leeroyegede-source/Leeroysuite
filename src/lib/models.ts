export type ModelProvider = 'google' | 'openai' | 'anthropic' | 'mistral' | 'groq' | 'other';

export interface AIModel {
    id: string;
    name: string;
    provider: ModelProvider;
    description: string;
    contextWindow?: number;
    maxOutput?: number;
    envKey?: string;
}

export const AVAILABLE_MODELS: AIModel[] = [
    {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        provider: 'google',
        description: 'Google\'s latest fast and efficient model',
        contextWindow: 1000000,
        envKey: 'NEXT_PUBLIC_GEMINI_API_KEY'
    },
    {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'google',
        description: 'Google\'s most capable multimodal model',
        contextWindow: 1000000,
        envKey: 'NEXT_PUBLIC_GEMINI_API_KEY'
    },
    {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        provider: 'google',
        description: 'Fast and efficient multimodal model',
        contextWindow: 1000000,
        envKey: 'NEXT_PUBLIC_GEMINI_API_KEY'
    },
    {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'openai',
        description: 'OpenAI\'s flagship model',
        contextWindow: 128000,
        envKey: 'OPENAI_API_KEY'
    },
    {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'openai',
        description: 'High-intelligence model',
        contextWindow: 128000,
        envKey: 'OPENAI_API_KEY'
    },
    {
        id: 'gpt-4.1-mini',
        name: 'GPT-4.1 Mini',
        provider: 'openai',
        description: 'OpenAI\'s fast, cost-effective small model',
        contextWindow: 128000,
        envKey: 'OPENAI_API_KEY'
    },
    {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        provider: 'anthropic',
        description: 'Highly intelligent model from Anthropic',
        contextWindow: 200000,
        envKey: 'ANTHROPIC_API_KEY'
    },
    {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        provider: 'anthropic',
        description: 'Balanced intelligence and speed',
        contextWindow: 200000,
        envKey: 'ANTHROPIC_API_KEY'
    },
    {
        id: 'mixtral-8x7b',
        name: 'Mixtral 8x7B',
        provider: 'mistral',
        description: 'High performance open model',
        contextWindow: 32000,
        envKey: 'MISTRAL_API_KEY'
    },
    {
        id: 'llama-3-70b',
        name: 'Llama 3 70B',
        provider: 'groq',
        description: 'Fastest inference with Groq LPU',
        contextWindow: 8192,
        envKey: 'GROQ_API_KEY'
    }
];

export const DEFAULT_MODEL_ID = 'gemini-2.5-flash';

export function getModelById(id: string): AIModel | undefined {
    return AVAILABLE_MODELS.find(model => model.id === id);
}
