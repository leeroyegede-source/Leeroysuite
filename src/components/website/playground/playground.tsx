"use client";

import React, { useEffect, useState, Suspense } from "react";
import ChatSection from "./_components/ChatSection";
import WebsiteDesign from "./_components/WebsiteDesign";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { streamGeminiResponse } from "./_components/aiClient";
import {
  constructFullHtml,
  extractBodyContent,
  cleanupCode,
} from "@/utils/htmlProcessor";
import { useAuth } from "@/contexts/AuthContext";

export type Messages = {
  role: "user" | "assistant" | "system";
  content: string;
  image?: string;
};

const prompt: string = `
userInput: {userInput}

Instructions:
- Generate modern UI using Tailwind + Flowbite
- Use blue theme
- Return ONLY body HTML
- Make responsive
- If modification requested → return full updated HTML
- If normal chat → return text

Current Design Code:
{currentCode}
`;

const PlayGroundContent = () => {
  const searchParams = useSearchParams();
  const userprompt = searchParams.get("userprompt");
  const { refreshUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Messages[]>([]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [chatLoader, setchatLoader] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userprompt) {
      GetFrameDetails(userprompt);
    }
  }, [userprompt]);

  const safeJson = async (res: Response) => {
    try {
      return await res.json();
    } catch {
      return { error: "Server error" };
    }
  };

  const deductTokens = async () => {
    try {
      const res = await fetch("/api/tokens/deduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature: "website-generation" }),
      });

      const data = await safeJson(res);

      if (!res.ok) throw new Error(data.error || "Token error");

      await refreshUser();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Token error");
      return false;
    }
  };

  // =========================
  // GENERATE FIRST FRAME
  // =========================
  const GetFrameDetails = async (promptMsg: string) => {
    const ok = await deductTokens();
    if (!ok) return;

    setLoading(true);
    setchatLoader(true);

    const systemPrompt = prompt
      .replace("{userInput}", promptMsg)
      .replace("{currentCode}", "No design yet.");

    const apiMessages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: promptMsg },
    ];

    try {
      const stream = await streamGeminiResponse(apiMessages);

      let fullResponse = "";

      for await (const chunk of stream) {
        const text =
          typeof chunk === "string"
            ? chunk
            : chunk?.text || "";

        fullResponse += text;

        const cleaned = extractBodyContent(cleanupCode(fullResponse));
        setGeneratedCode(cleaned);
      }

      setMessages([
        { role: "user", content: promptMsg },
        { role: "assistant", content: fullResponse },
      ]);
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally {
      setLoading(false);
      setchatLoader(false);
    }
  };

  // =========================
  // CHAT / EDIT MODE
  // =========================
  const SendMessage = async (input: string) => {
    if (!input) return;

    const ok = await deductTokens();
    if (!ok) return;

    const userMsg: Messages = { role: "user", content: input };

    setMessages((prev) => [...prev, userMsg]);

    const systemPrompt = prompt
      .replace("{userInput}", input)
      .replace("{currentCode}", generatedCode || "No design yet.");

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      userMsg,
    ];

    setLoading(true);
    setchatLoader(true);

    try {
      const stream = await streamGeminiResponse(apiMessages);

      let fullResponse = "";

      for await (const chunk of stream) {
        const text =
          typeof chunk === "string"
            ? chunk
            : chunk?.text || "";

        fullResponse += text;

        if (fullResponse.includes("<")) {
          const cleaned = extractBodyContent(cleanupCode(fullResponse));
          setGeneratedCode(cleaned);
        }
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: fullResponse },
      ]);
    } catch (e: any) {
      toast.error(e.message || "Send failed");
    } finally {
      setLoading(false);
      setchatLoader(false);
    }
  };

  // =========================
  // SAVE
  // =========================
  const SaveGeneratedCode = async (code: string) => {
    setIsSaving(true);
    try {
      const fullHtml = constructFullHtml(cleanupCode(code));

      const res = await fetch("/api/website/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: fullHtml,
          messages,
          name: "Website",
        }),
      });

      if (res.ok) toast.success("Saved!");
      else toast.error("Save failed");
    } catch {
      toast.error("Error saving");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex">
      <ChatSection
        messages={messages}
        chatLoader={chatLoader}
        onSend={(input: string) => SendMessage(input)}
        loading={loading}
      />

      <WebsiteDesign
        generatedCode={generatedCode}
        onSave={() => SaveGeneratedCode(generatedCode)}
        isSaving={isSaving}
        loading={loading}
      />
    </div>
  );
};

const PlayGround = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlayGroundContent />
    </Suspense>
  );
};

export default PlayGround;