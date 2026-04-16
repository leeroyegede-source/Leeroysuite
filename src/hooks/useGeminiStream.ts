import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface ToolCall {
  name: string;
  args: any;
}

export function useGeminiStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const { selectedModel, refreshUser } = useAuth();

  const generateStream = useCallback(
    async (
      systemPrompt: string,
      prompt: string,
      image?: string,
      tools?: any[],
      toolId?: string,
      history?: any[]
    ) => {
      setIsStreaming(true);
      setStreamedText("");
      setToolCalls([]);

      // 🚨 RATE LIMIT GUARD (PREVENT SPAM REQUESTS)
      const lastCallKey = "ai_last_call_time";
      const now = Date.now();

      const last =
        typeof window !== "undefined"
          ? localStorage.getItem(lastCallKey)
          : null;

      if (last && now - parseInt(last) < 4000) {
        setIsStreaming(false);
        throw new Error("Slow down — please wait before sending another request.");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(lastCallKey, now.toString());
      }

      try {
        // 🔥 ALWAYS SEND ARRAY (FIX FOR YOUR ERROR)
        const messages = [
          ...(history || []),
          {
            role: "user",
            content: prompt,
          },
        ];

        const response = await fetch("/api/ai/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || "AI request failed");
        }

        if (!response.body) throw new Error("No stream found");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let fullText = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          fullText += chunk;
          setStreamedText(fullText);
        }

        return {
          text: fullText,
          toolCalls: [],
        };
      } catch (err) {
        console.error(err);
        throw err;
      } finally {
        setIsStreaming(false);
        refreshUser?.();
      }
    },
    [refreshUser]
  );

  return {
    generateStream,
    isStreaming,
    streamedText,
    toolCalls,
  };
}