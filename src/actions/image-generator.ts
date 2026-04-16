"use server";

import { GoogleGenAI } from "@google/genai";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export async function generateImageAction(prompt: string, options: { numberOfImages?: number, aspectRatio?: string } = {}) {
    try {
        // 1. Authentication
        const session: any = await getSession();
        if (!session) {
            return { error: "Unauthorized" };
        }

        // 2. Check Token Balance
        const settings = await db.getSettings();
        const cost = settings.aiLimits['image-generator'] || 50;
        const balance = await db.getTokenBalance(session.email);

        if (balance.balance < cost) {
            return { error: "Insufficient tokens. Please top up your balance." };
        }

        // 3. Initialize Client
        if (!apiKey) {
            return { error: "Gemini API Key not configured" };
        }

        const ai = new GoogleGenAI({ apiKey });

        // 4. Generate Image
        // Note: aspect ratio mapping might be needed if the UI sends "1:1" but the API expects specific ENUMs or strings. 
        // The provided example uses 'imagen-4.0-generate-001' and 'numberOfImages'.
        // We will pass aspectRatio if the API supports it in this SDK version's generateImages config (it usually does).

        // For now, let's stick to the user provided example structure
        const config: any = {
            numberOfImages: options.numberOfImages || 1,
        };

        // If aspect ratio is provided (and supported by the model/SDK), add it.
        // The prompt in user request didn't show aspectRatio, but the UI has it. 
        // Imagen 3/4 usually supports aspect ratio in config.
        if (options.aspectRatio) {
            config.aspectRatio = options.aspectRatio;
        }

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: config,
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            return { error: "No images generated" };
        }

        // 5. Deduct Tokens
        await db.updateTokenBalance(session.email, cost, 'consume', 'image-generator');

        // 6. Return Images
        // The UI expects a single image for now (based on `result = text` in proxy).
        // But the new UI code will handle the array if we update it.
        // The user's code loops and saves 4 images.
        // The current UI displays 1 image. 
        // I will return the first image as base64 string to be compatible with the UI flow 
        // or return all if I update the UI to show multiple.
        // The current UI has `setGeneratedImage(imageData)` where imageData is a string.
        // I will return the first image's base64 for now to keep it simple, or update UI to support multiple?
        // User said: "rest all components need to work same like before."
        // "create the image only for the ImageGeneratorPage.tsx"

        const firstImage = response.generatedImages[0];
        const imgBytes = firstImage.image.imageBytes; // This is Uint8Array or similar
        const base64Image = Buffer.from(imgBytes).toString('base64');

        return { success: true, image: base64Image };

    } catch (error: any) {
        console.error("Image Generation Error:", error);
        return { error: error.message || "Failed to generate image" };
    }
}
