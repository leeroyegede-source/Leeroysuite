"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare, Bot, User, Paperclip, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { systemPrompts } from "@/config/prompts";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { useGeminiStream } from "@/hooks/useGeminiStream";
import { chatTools } from "@/utils/tools";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  image?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const {
    generateStream,
    isStreaming,
    streamedText,
    toolCalls,
  } = useGeminiStream();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      image: selectedImage || undefined,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    const currentInput = input;
    const currentImage = selectedImage;

    setInput("");
    setSelectedImage(null);

    try {
      // ✅ FIX: correct call (NO error field returned anymore)
      const response = await generateStream(
        systemPrompts.chat,
        currentInput,
        currentImage || undefined,
        chatTools,
        "chat",
        updatedMessages
      );

      let finalText = response.text;

      // Tool execution
      if (response.toolCalls?.length > 0) {
        for (const call of response.toolCalls) {
          let result = "";

          const args = call.args;

          if (call.name === "calculator") {
            try {
              const sanitized = args.expression
                .replace(/[^-+*/%()0-9. ]/g, "")
                .trim();

              const evaluated = new Function(`return ${sanitized}`)();
              result = `${sanitized} = ${evaluated}`;
            } catch {
              result = "Could not calculate result";
            }
          } else if (call.name === "get_current_time") {
            result = new Date().toLocaleTimeString();
          } else {
            result = `Tool ${call.name} executed`;
          }

          finalText += `\n\n🛠️ **${call.name}** → ${result}`;
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: finalText || "No response",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "AI request failed",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <MessageSquare />
        <h1 className="text-2xl font-bold">AI Chat</h1>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {msg.image && (
                      <img
                        src={msg.image}
                        className="rounded mb-2 max-h-60"
                      />
                    )}
                    <MarkdownRenderer content={msg.content} />
                  </div>
                </div>
              ))}

              {isStreaming && (
                <div className="text-sm text-gray-500">
                  {streamedText || "Thinking..."}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              hidden
              accept="image/*"
            />

            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip />
            </Button>

            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
            />

            <Button type="submit" disabled={isStreaming}>
              <Send />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}