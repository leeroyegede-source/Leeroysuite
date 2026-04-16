import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export type AIMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function streamAI(messages: AIMessage[]) {
  if (!Array.isArray(messages)) {
    throw new Error("Messages must be an array");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  //  SYSTEM BRAIN (VERY IMPORTANT)
  const systemPrompt = `
You are a multi-purpose AI agent inside a SaaS platform.

RULES:
- ONLY return plain text or HTML
- NEVER return JSON or objects
- NEVER return structured data
- NEVER return arrays
- DO NOT return explanations of your format

TOOL BEHAVIOR:

1. Website Builder:
- Return ONLY HTML inside <body>
- Use Tailwind CSS
- Must be responsive

2. Image Requests:
- ALWAYS return:
  <img src="https://source.unsplash.com/random/800x600/?tech" />

3. Chat:
- Normal clean text only

4. Agent mode:
- Solve step by step in plain text only
`;

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      ...messages.slice(0, -1).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    ],
  });

  const lastMessage = messages[messages.length - 1];

  return await chat.sendMessageStream(lastMessage.content);
}