import mammoth from 'mammoth';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export async function extractTextFromFile(buffer: Buffer, filename: string): Promise<string> {
    const extension = filename.split('.').pop()?.toLowerCase();

    if (extension === 'pdf') {
        const PDFParser = require("pdf2json");
        const pdfParser = new PDFParser(null, 1); // 1 = text content only

        return new Promise((resolve, reject) => {
            pdfParser.on("pdfParser_dataError", (errData: any) => reject(new Error(errData.parserError)));
            pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
                try {
                    // pdf2json returns URI-encoded text
                    // Manual extraction to ensure decoding
                    let text = pdfData.Pages.map((p: any) =>
                        p.Texts.map((t: any) => {
                            try {
                                return decodeURIComponent(t.R[0].T);
                            } catch (e) {
                                return t.R[0].T;
                            }
                        }).join(" ")
                    ).join("\n");

                    // Fallback if manual extraction failed/empty
                    if (!text || text.trim().length < 10) {
                        console.warn("Manual PDF extraction yielded little text, falling back to raw content");
                        try {
                            const raw = pdfParser.getRawTextContent();
                            if (raw && raw.length > text.length) {
                                text = raw;
                            }
                        } catch (e) {
                            console.warn("Fallback raw text extraction failed", e);
                        }
                    }

                    resolve(text);
                } catch (e) {
                    reject(e);
                }
            });

            pdfParser.parseBuffer(buffer);
        });
    } else if (extension === 'docx') {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    } else if (extension === 'txt') {
        return buffer.toString('utf-8');
    } else {
        throw new Error(`Unsupported file type: ${extension}`);
    }
}

export function chunkText(text: string, chunkSize = 1000, chunkOverlap = 200): string[] {
    const chunks: string[] = [];
    const normalizedText = text.replace(/\s+/g, ' ').trim();

    let start = 0;
    while (start < normalizedText.length) {
        let end = start + chunkSize;

        // Try to find a good breaking point (period, newline, or space)
        if (end < normalizedText.length) {
            const lastPeriod = normalizedText.lastIndexOf('. ', end);
            if (lastPeriod > start + (chunkSize * 0.5)) {
                end = lastPeriod + 1;
            } else {
                const lastSpace = normalizedText.lastIndexOf(' ', end);
                if (lastSpace > start + (chunkSize * 0.5)) {
                    end = lastSpace;
                }
            }
        }

        chunks.push(normalizedText.slice(start, end).trim());
        start = end - chunkOverlap;

        // Safety break
        if (start < 0) start = 0;
        if (end >= normalizedText.length) break;
        if (start >= normalizedText.length) break;
    }

    return chunks.filter(c => c.length > 10);
}
