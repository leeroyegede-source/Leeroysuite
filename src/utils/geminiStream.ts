export interface StreamCallbacks {
    onChunk?: (text: string) => void;
    onComplete?: (fullText: string) => void;
    onError?: (error: string) => void;
    onToolCall?: (toolCall: any) => void;
}

export interface StreamOptions {
    systemPrompt: string;
    userPrompt?: string;
    imageBase64?: string;
    model?: 'gemini' | 'openai';
    tool?: string;
    tools?: any[];
    signal?: AbortSignal;
}

/**
 * Streams AI responses from the /api/ai/stream endpoint via SSE.
 * Calls onChunk for each text fragment and onComplete with the full text.
 */
export async function streamGemini(
    options: StreamOptions,
    callbacks: StreamCallbacks
): Promise<string> {
    const { systemPrompt, userPrompt, imageBase64, model = 'gemini', tool = 'chat', tools, signal } = options;
    const { onChunk, onComplete, onError, onToolCall } = callbacks;

    let fullText = '';

    try {
        // Build the payload matching the proxy format
        let proxyPayload: any;

        if (model === 'openai') {
            const messages: any[] = [{ role: 'system', content: systemPrompt }];

            if (userPrompt) {
                if (imageBase64) {
                    messages.push({
                        role: 'user',
                        content: [
                            { type: 'text', text: userPrompt },
                            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
                        ],
                    });
                } else {
                    messages.push({ role: 'user', content: userPrompt });
                }
            }

            proxyPayload = {
                tool,
                tools,
                model: 'openai',
                content: { messages, stream: true },
            };
        } else {
            // Gemini format
            let prompt = '';
            if (userPrompt) {
                prompt = `${systemPrompt}\n\nUser: ${userPrompt}`;
            } else {
                prompt = systemPrompt;
            }

            const parts: any[] = [{ text: prompt }];

            if (imageBase64) {
                parts.push({
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: imageBase64,
                    },
                });
            }

            proxyPayload = {
                tool,
                tools,
                model: 'gemini',
                content: {
                    contents: [{ parts }],
                },
            };
        }

        const response = await fetch('/api/ai/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(proxyPayload),
            signal,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Stream request failed' }));
            const errorMessage = errorData.error || `HTTP ${response.status}`;
            onError?.(errorMessage);
            return '';
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data: ')) continue;

                const data = trimmed.slice(6);
                if (data === '[DONE]') continue;

                try {
                    const parsed = JSON.parse(data);
                    if (parsed.error) {
                        onError?.(parsed.error);
                        return fullText;
                    }
                    if (parsed.text) {
                        fullText += parsed.text;
                        onChunk?.(parsed.text);
                    }
                    if (parsed.toolCalls) {
                        onToolCall?.(parsed.toolCalls);
                    }
                    if (parsed.functionCall) {
                        onToolCall?.(parsed.functionCall);
                    }
                } catch {
                    // Skip unparseable lines
                }
            }
        }

        onComplete?.(fullText);
        return fullText;
    } catch (error: any) {
        if (error.name === 'AbortError') {
            // Stream was cancelled by user — not an error
            onComplete?.(fullText);
            return fullText;
        }
        const message = error.message || 'Failed to stream AI response';
        onError?.(message);
        return fullText;
    }
}
