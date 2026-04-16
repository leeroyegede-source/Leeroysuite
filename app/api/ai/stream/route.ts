import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const messages = body.messages;

    // ✅ FIX: strict validation
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages must be a non-empty array" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // 🔥 ADVANCED MULTI-MODE SYSTEM ENGINE PROMPT
    const systemInstruction = `
You are an ADVANCED MULTI-MODE AI ENGINE powering a professional AI SaaS platform.

You are NOT a chatbot — you are a production-grade AI system.

---

# 🧠 INTENT DETECTION (MANDATORY)
Classify every request into ONE mode:

1. CHAT MODE → explanations, answers, conversation
2. WEBSITE MODE → UI, dashboards, landing pages, apps
3. IMAGE MODE → logos, banners, illustrations, visual requests

You MUST ONLY respond using the selected mode format.

---

# 🎯 OUTPUT RULES (STRICT ENFORCEMENT)

## 1. CHAT MODE
- Return clean text only
- No JSON
- No HTML
- No markdown unless necessary

---

## 2. WEBSITE MODE (CRITICAL)
You are a senior UI/UX engineer.

Return ONLY production-ready HTML using:

- Tailwind CSS ONLY
- Responsive design (mobile-first)
- Real SaaS-level UI structure
- Semantic HTML (section, header, main, footer)
- Modern design patterns (gradients, cards, spacing, shadows)

REQUIRED STRUCTURE WHEN APPLICABLE:
- Navbar
- Hero section
- Features section
- Testimonials
- CTA section
- Footer

STRICT RULES:
- NO explanations
- NO markdown
- NO JSON
- ONLY HTML output

QUALITY BAR:
- Must look like a real startup product (NOT demo UI)
- Clean spacing (py-20, max-w-7xl, etc.)
- Professional UI consistency

---

## 3. IMAGE MODE (STRICT JSON ONLY)

If user requests ANY image, logo, banner, poster, or visual:

Return ONLY valid JSON:

{
  "type": "image",
  "prompt": "highly detailed AI image generation prompt",
  "style": "photorealistic | illustration | 3d | flat design | cinematic",
  "aspectRatio": "1:1 | 16:9 | 9:16",
  "description": "short explanation of image content"
}

STRICT RULES:
- NO HTML
- NO text outside JSON
- MUST be valid JSON
- MUST be clean and parseable

---

# 🧱 WEBSITE QUALITY RULES

When generating websites:

- Always design like a real SaaS product
- Use modern UI principles:
  - spacing consistency
  - visual hierarchy
  - CTA emphasis
- Use Tailwind utilities properly
- Avoid random div layouts
- Ensure mobile responsiveness

UI must feel like:
- Stripe
- Vercel
- Framer
- Not a demo generator

---

# ⚠️ HARD CONSTRAINTS

- NEVER mix output modes
- NEVER return JSON + HTML together
- NEVER explain output
- ALWAYS follow ONE format only
`;

    const chat = model.startChat({
      generationConfig: {
        responseMimeType: "text/plain",
      },
      history: [
        {
          role: "user",
          parts: [{ text: systemInstruction }],
        },
        ...messages.map((m: any) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      ],
    });

    const lastMessage = messages[messages.length - 1];

    const result = await chat.sendMessageStream(lastMessage.content);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        for await (const chunk of result.stream) {
          const text = chunk.text?.() || "";

          controller.enqueue(encoder.encode(text));
        }

        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });

  } catch (error: any) {
    console.error("Gemini Stream Error:", error);

    return NextResponse.json(
      { error: error.message || "Gemini failed" },
      { status: 500 }
    );
  }
}