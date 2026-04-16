import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { processDocument, processText } from '@/lib/rag';
import { scrapeUrl } from '@/lib/scraper';
import { extractTextFromFile } from '@/lib/docProcessor';
import axios from 'axios';

// Check if documents table and storage bucket exist
async function checkStorageAndDatabase(): Promise<{ tableExists: boolean; bucketExists: boolean }> {
    const status = { tableExists: false, bucketExists: false };
    try {
        const { supabaseAdmin } = await import('@/lib/supabase');

        // Check table
        const { error: tableError } = await supabaseAdmin
            .from('documents')
            .select('id')
            .limit(1);
        status.tableExists = !tableError || !tableError.message.includes('does not exist');

        // Check bucket
        const { data: buckets } = await supabaseAdmin.storage.listBuckets();
        status.bucketExists = !!buckets?.find(b => b.id === 'documents');

        return status;
    } catch {
        return status;
    }
}

async function ensureBucketExists() {
    try {
        const { supabaseAdmin } = await import('@/lib/supabase');
        const { data: buckets } = await supabaseAdmin.storage.listBuckets();
        const exists = buckets?.find(b => b.id === 'documents');

        if (!exists) {
            console.log("Creating 'documents' bucket...");
            const { error } = await supabaseAdmin.storage.createBucket('documents', {
                public: true,
                fileSizeLimit: 10485760 // 10MB
            });
            if (error) console.error("Error creating bucket:", error);
        }
    } catch (err) {
        console.error("Failed to ensure bucket exists:", err);
    }
}

export async function POST(req: Request) {
    try {
        const session = (await getSession()) as { email: string } | null;
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check setup
        const { tableExists, bucketExists } = await checkStorageAndDatabase();

        if (!tableExists) {
            return NextResponse.json({
                error: 'Database not configured',
                details: 'The documents table has not been created yet. Please run the SQL schema in your Supabase SQL Editor. Check the schema.sql file for the required SQL.',
                needsSetup: true
            }, { status: 503 });
        }

        if (!bucketExists) {
            await ensureBucketExists();
        }

        // Parse request
        const contentType = req.headers.get('content-type') || '';
        let file: File | null = null;
        let url: string | null = null;

        if (contentType.includes('application/json')) {
            const body = await req.json();
            url = body.url;
        } else {
            const formData = await req.formData();
            file = formData.get('file') as File;
            url = formData.get('url') as string;
        }

        if (!file && !url) {
            return NextResponse.json({ error: 'No file or URL provided' }, { status: 400 });
        }

        if (url) {
            // Handle URL-based training
            let text = '';
            let title = url;

            const isPdf = url.toLowerCase().endsWith('.pdf');

            try {
                if (isPdf) {
                    console.log(`[Upload] Detected PDF URL: ${url}`);
                    const response = await axios.get(url, { responseType: 'arraybuffer' });
                    const buffer = Buffer.from(response.data);
                    text = await extractTextFromFile(buffer, url);
                    title = url.split('/').pop() || url;
                } else {
                    const scraped = await scrapeUrl(url);
                    text = scraped.text;
                    title = scraped.title;
                }
            } catch (err: any) {
                console.error("Failed to fetch or scrape URL", url, err);
                return NextResponse.json({
                    error: 'Failed to process URL content',
                    details: err.message
                }, { status: 500 });
            }

            // 1. Create document record in DB
            const doc = await db.saveDocument({
                userEmail: session.email,
                name: title || url,
                status: 'processing',
                metadata: { source: 'url', url }
            });

            // 2. Process text
            try {
                await processText(text, title || url, doc.id);
            } catch (procError: unknown) {
                console.error("Processing failed for URL", doc.id, procError);
                await db.updateDocumentStatus(doc.id, 'error');
                return NextResponse.json({
                    error: 'URL processing failed',
                    details: (procError as Error).message
                }, { status: 500 });
            }

            return NextResponse.json({
                message: 'URL content processed successfully',
                document: doc
            });
        }

        // Handle File-based training
        if (file) {
            const fileName = file.name;
    
            // 1. Upload file to Supabase Storage (Server-side bypasses RLS)
            const fileExt = fileName.split('.').pop();
            const storageFileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const storagePath = `uploads/${storageFileName}`;
    
            const { supabaseAdmin } = await import('@/lib/supabase');
            const buffer = Buffer.from(await file.arrayBuffer());
    
            const { data: uploadData, error: uploadError } = await supabaseAdmin
                .storage
                .from('documents')
                .upload(storagePath, buffer, {
                    contentType: file.type,
                    upsert: true
                });
    
            if (uploadError) {
                console.error("Storage upload failed", uploadError);
                return NextResponse.json({
                    error: 'Failed to upload file to storage',
                    details: uploadError.message
                }, { status: 500 });
            }
    
            // 2. Create document record in DB
            const doc = await db.saveDocument({
                userEmail: session.email,
                name: fileName || 'Uploaded Document',
                status: 'processing'
            });
    
            // 3. Process document
            try {
                await processDocument(buffer, fileName, doc.id);
    
                // Clean up storage after processing
                await supabaseAdmin.storage.from('documents').remove([storagePath]);
            } catch (procError: unknown) {
                console.error("Processing failed for doc", doc.id, procError);
                await db.updateDocumentStatus(doc.id, 'error');
                return NextResponse.json({
                    error: 'Document processing failed',
                    details: (procError as Error).message
                }, { status: 500 });
            }
    
            return NextResponse.json({
                message: 'Document uploaded and processed successfully',
                document: doc
            });
        }

    } catch (error: unknown) {
        console.error('Upload Error:', error);

        const errorMessage = (error as Error).message || 'Upload failed';

        // Check for table not found error
        if (errorMessage.includes('documents') && errorMessage.includes('schema cache')) {
            return NextResponse.json({
                error: 'Database not configured',
                details: 'Please run the SQL schema in your Supabase SQL Editor to create the documents table.',
                needsSetup: true
            }, { status: 503 });
        }

        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = (await getSession()) as { email: string } | null;
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check setup
        const { tableExists, bucketExists } = await checkStorageAndDatabase();
        if (!tableExists) {
            return NextResponse.json([]); // Return empty array if table doesn't exist
        }

        if (!bucketExists) {
            await ensureBucketExists();
        }

        const documents = await db.listDocuments(session.email);
        return NextResponse.json(documents);
    } catch (error: unknown) {
        const errorMessage = (error as Error).message || '';
        // If table doesn't exist, return empty array gracefully
        if (errorMessage.includes('documents')) {
            return NextResponse.json([]);
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
