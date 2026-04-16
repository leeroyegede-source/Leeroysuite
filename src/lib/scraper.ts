import axios from 'axios';

/**
 * Basic HTML to text extractor using regex.
 * While not perfect, it avoids adding heavy dependencies like cheerio or jsdom.
 */
function extractTextFromHtml(html: string): string {
    // Remove scripts and styles
    let text = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, " ");
    text = text.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gmi, " ");
    
    // Replace common block tags with spaces/newlines
    text = text.replace(/<(p|div|br|h1|h2|h3|h4|h5|h6|li|tr)[^>]*>/gi, "\n");
    
    // Strip all other HTML tags
    text = text.replace(/<[^>]+>/g, " ");
    
    // Decode basic entities (simple version)
    text = text.replace(/&nbsp;/g, " ")
               .replace(/&lt;/g, "<")
               .replace(/&gt;/g, ">")
               .replace(/&amp;/g, "&")
               .replace(/&quot;/g, '"')
               .replace(/&#39;/g, "'");

    // Clean up whitespace
    return text.replace(/\n\s*\n/g, "\n") // Remove multiple newlines
               .replace(/[ \t]+/g, " ")    // Remove multiple spaces
               .trim();
}

/**
 * Scrapes a URL and returns the text content and page title.
 */
export async function scrapeUrl(url: string): Promise<{ text: string; title: string }> {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000 // 10s timeout
        });

        const html = response.data;
        if (typeof html !== 'string') {
            throw new Error("Invalid response from URL (not text/html)");
        }

        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : url;
        const text = extractTextFromHtml(html);

        if (!text || text.length < 50) {
            throw new Error("Could not extract meaningful text from this URL. It might be a single-page app or protected.");
        }

        return { text, title };
    } catch (error: any) {
        console.error(`[Scraper] Failed to scrape ${url}:`, error.message);
        throw new Error(`Failed to scrape URL: ${error.message}`);
    }
}
