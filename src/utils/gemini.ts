export interface GeminiResponse {
  text: string;
  error?: string;
}

// Production Gemini API integration template with image support:

export async function callGemini(
  systemPrompt: string,
  userPrompt?: string,
  imageBase64?: string, // pass base64 image string (optional)
  model: "gemini" | "openai" = "gemini"
): Promise<GeminiResponse> {
  try {
    let proxyPayload;

    if (model === "openai") {
      const messages: any[] = [{ role: "system", content: systemPrompt }];

      if (userPrompt) {
        if (imageBase64) {
          messages.push({
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
            ]
          });
        } else {
          messages.push({ role: "user", content: userPrompt });
        }
      }

      proxyPayload = {
        tool: "chat",
        model: "openai",
        content: { messages } // OpenAI expects 'messages' in the body, proxy wraps it
      };
    } else {
      // Gemini Logic
      let prompt = ''

      if (userPrompt) {
        prompt = `${systemPrompt}\n\nUser: ${userPrompt}`;
      } else {
        prompt = `${systemPrompt}`;
      }

      // Build parts dynamically
      const parts: any[] = [{ text: prompt }];

      if (imageBase64) {
        parts.push({
          inlineData: {
            mimeType: "image/jpeg", // or image/jpeg depending on input
            data: imageBase64,
          },
        });
      }

      // Construct the payload for the proxy
      proxyPayload = {
        tool: "chat", // Identifying the tool for token tracking
        model: "gemini",
        content: {
          contents: [
            {
              parts,
            },
          ],
        },
      };
    }

    const response = await fetch("/api/ai/proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(proxyPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      let errorMessage = "API request failed";
      if (data.error) {
        if (typeof data.error === 'string') {
          errorMessage = data.error;
        } else if (typeof data.error === 'object' && data.error.message) {
          errorMessage = data.error.message;
        } else {
          errorMessage = JSON.stringify(data.error);
        }
      }
      throw new Error(errorMessage);
    }

    // The proxy returns a unified response object with direct content or raw data
    return {
      text: data.content || data.text || data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    };

  } catch (error: any) {
    console.error("Gemini Proxy Error:", error);
    return {
      text: "",
      error: error.message || "Failed to generate AI response. Please try again.",
    };
  }
}
