import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

async function checkDimensions() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API KEY");
        return;
    }
    const client = new GoogleGenAI({ apiKey });

    try {
        console.log("Testing models/gemini-embedding-001...");
        const result = await client.models.embedContent({
            model: "models/gemini-embedding-001",
            contents: [{ parts: [{ text: "Hello world" }] }]
        });
        const values = result.embeddings?.[0]?.values;
        console.log(`models/gemini-embedding-001 dimensions: ${values?.length}`);
    } catch (e: any) {
        console.error("Error with gemini-embedding-001:", e.message);
    }

    try {
        console.log("Testing text-embedding-004...");
        const result = await client.models.embedContent({
            model: "models/text-embedding-004",
            contents: [{ parts: [{ text: "Hello world" }] }]
        });
        const values = result.embeddings?.[0]?.values;
        console.log(`models/text-embedding-004 dimensions: ${values?.length}`);
    } catch (e: any) {
        console.error("Error with text-embedding-004:", e.message);
    }
}

checkDimensions();
