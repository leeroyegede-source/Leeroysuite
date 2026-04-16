import { GoogleGenAI } from "@google/genai";
import { db } from './db';
import { supabaseAdmin } from './supabase';
import { extractTextFromFile, chunkText } from './docProcessor';
import fs from 'fs';

const LOG_FILE = 'c:/sairam/applications/AI Suite/v6.2/ai-suite/tmp/rag-logs.txt';
function debugLog(msg: string) {
    const timestamp = new Date().toISOString();
    const formattedMsg = `[${timestamp}] ${msg}\n`;
    try {
        fs.appendFileSync(LOG_FILE, formattedMsg);
    } catch (e) {}
}

const RAW_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_KEY = RAW_KEY;

const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function getEmbedding(text: string): Promise<number[]> {
    try {
        debugLog(`[getEmbedding] Generating for length: ${text.length}`);
        const result = await client.models.embedContent({
            model: "models/gemini-embedding-001",
            contents: [{ parts: [{ text }] }],
            config: {
                outputDimensionality: 768
            }
        });

        const embedding = result.embeddings?.[0]?.values;
        if (!embedding) throw new Error("No embedding returned");
        
        debugLog(`[getEmbedding] SUCCESS: length=${embedding.length}, first5=[${embedding.slice(0, 5)}]`);
        return embedding;
    } catch (error: any) {
        debugLog(`[getEmbedding] ERROR: ${error.message}`);
        throw error;
    }
}

export async function processDocument(buffer: Buffer, filename: string, docId: string) {
    try {
        debugLog(`[processDocument] START: ${filename} (id: ${docId})`);
        const text = await extractTextFromFile(buffer, filename);
        if (!text || text.length < 10) {
            throw new Error("Extracted text is too short or empty.");
        }

        const textChunks = chunkText(text);
        debugLog(`[processDocument] Created ${textChunks.length} chunks`);

        const chunksWithEmbeddings = await Promise.all(
            textChunks.map(async (content) => {
                const embedding = await getEmbedding(content);
                return { documentId: docId, content, embedding };
            })
        );

        await db.saveDocumentChunks(chunksWithEmbeddings);
        await db.updateDocumentStatus(docId, 'completed');
        debugLog(`[processDocument] SUCCESS: ${filename}`);

    } catch (error: any) {
        debugLog(`[processDocument] ERROR: ${error.message}`);
        await db.updateDocumentStatus(docId, 'error');
        throw error;
    }
}

export async function processText(text: string, filename: string, docId: string) {
    try {
        debugLog(`[processText] START: ${filename} (id: ${docId})`);
        if (!text || text.length < 10) {
            throw new Error("Text is too short or empty.");
        }

        const textChunks = chunkText(text);
        debugLog(`[processText] Created ${textChunks.length} chunks`);

        const chunksWithEmbeddings = await Promise.all(
            textChunks.map(async (content) => {
                const embedding = await getEmbedding(content);
                return { documentId: docId, content, embedding };
            })
        );

        await db.saveDocumentChunks(chunksWithEmbeddings);
        await db.updateDocumentStatus(docId, 'completed');
        debugLog(`[processText] SUCCESS: ${filename}`);

    } catch (error: any) {
        debugLog(`[processText] ERROR: ${error.message}`);
        await db.updateDocumentStatus(docId, 'error');
        throw error;
    }
}

export async function getRAGContext(userEmail: string, query: string, limit = 4): Promise<string> {
    try {
        debugLog(`[getRAGContext] START: email=${userEmail}, query="${query}"`);
        const queryEmbedding = await getEmbedding(query);

        // 1. Vector Match (Threshold 0.1)
        let matches = await db.matchDocumentChunks(userEmail, queryEmbedding, limit, 0.1);
        debugLog(`[getRAGContext] Vector matches (0.1): ${matches.length}`);

        // 2. Vector Match (Threshold 0.01Fallback)
        if (matches.length === 0) {
            matches = await db.matchDocumentChunks(userEmail, queryEmbedding, limit, 0.01);
            debugLog(`[getRAGContext] Vector fallback (0.01): ${matches.length}`);
        }

        // 3. Keyword Match Fallback
        if (matches.length === 0) {
            matches = await db.keywordSearchChunks(userEmail, query, limit);
            debugLog(`[getRAGContext] Keyword fallback: ${matches.length}`);
        }

        // 4. Emergency Latest Chunks Fallback
        if (matches.length === 0) {
            const { data: latest, error: latestErr } = await supabaseAdmin
                .from('document_chunks')
                .select('id, document_id, content')
                .limit(limit);
            
            if (latest && latest.length > 0) {
                debugLog(`[getRAGContext] Latest chunks fallback: ${latest.length}`);
                matches = latest.map((c: any) => ({
                    id: c.id,
                    documentId: c.document_id,
                    content: c.content
                }));
            }
        }

        if (matches.length === 0) {
            debugLog(`[getRAGContext] FINAL: No information found.`);
            return "";
        }

        return matches.map(m => m.content).join("\n\n---\n\n");
    } catch (error: any) {
        debugLog(`[getRAGContext] ERROR: ${error.message}`);
        return "";
    }
}

export async function generateGroundedResponseV3(userEmail: string, query: string): Promise<string> {
    try {
        const context = await getRAGContext(userEmail, query);
        
        const systemPrompt = "You are a professional support assistant. Use the provided context to answer the user's question.";
        
        const userPrompt = `
CONTEXT FROM DOCUMENTS:
---
${context || "No specific document context found for this query."}
---

USER QUESTION: ${query}`;

        const modelNames = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp"];
        let answer = "";
        let lastErr: any = null;

        for (const modelId of modelNames) {
            try {
                debugLog(`[generateGroundedResponseV3] Attempting with ${modelId}`);
                const result = await client.models.generateContent({
                    model: modelId,
                    contents: [
                        { role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }
                    ],
                    config: {
                        temperature: 0.1,
                        maxOutputTokens: 1024
                    }
                });
                answer = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
                if (answer) break;
            } catch (err: any) {
                lastErr = err;
                debugLog(`[generateGroundedResponseV3] Model ${modelId} failed: ${err.message}`);
                continue;
            }
        }

        if (!answer && lastErr) {
            // Check if it's a quota error to show a better message
            if (lastErr.message?.includes("429") || lastErr.message?.includes("RESOURCE_EXHAUSTED")) {
                return "I found relevant information in your documents, but my AI generation quota is currently exhausted. Please try again in 1 minute.";
            }
            return `I found information in your documents, but had trouble generating a summary: \n\n${context.substring(0, 500)}...`;
        }

        return answer || "I'm sorry, I found information but couldn't generate a clear answer.";

    } catch (error: any) {
        debugLog(`[generateGroundedResponseV3] ERROR: ${error.message}`);
        return "I encountered an error while searching the knowledge base. Please try again.";
    }
}
