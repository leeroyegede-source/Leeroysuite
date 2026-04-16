"use client";

import React, { useState, useEffect } from 'react';
import {
    Upload,
    FileText,
    Trash2,
    Code,
    CheckCircle2,
    Clock,
    AlertCircle,
    ExternalLink,
    Copy,
    MessageSquare,
    Sparkles,
    BookOpen,
    Zap,
    Shield,
    ArrowRight,
    RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabase-client";
import ChatWidget from "@/components/chat/ChatWidget";
import { Layout } from "@/components/layout/Layout";

interface Document {
    id: string;
    name: string;
    status: 'processing' | 'completed' | 'error';
    createdAt: string;
}

export default function SupportAgentPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [origin, setOrigin] = useState('');

    useEffect(() => {
        fetchDocuments();
        setOrigin(window.location.origin);
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await fetch('/api/documents/upload');
            const data = await res.json();
            if (Array.isArray(data)) setDocuments(data);
        } catch (error) {
            console.error("Failed to fetch docs", error);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError(null);
        setIsUploading(true);
        const toastId = toast.loading("Uploading and indexing document...");

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/documents/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (res.ok) {
                toast.success("Document indexed successfully!", { id: toastId });
                fetchDocuments();
            } else if (data.needsSetup) {
                toast.error("Database setup required", { id: toastId });
                setUploadError("Database setup required. Please run the SQL schema in Supabase.");
            } else {
                toast.error("Upload failed", { id: toastId });
                setUploadError(data.error || "Failed to upload document");
            }
        } catch (error: unknown) {
            console.error("Upload process error:", error);
            const errorMessage = (error as Error).message || "Upload failed";
            toast.error(errorMessage, { id: toastId });
            setUploadError(errorMessage);
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleUrlTrain = async () => {
        if (!urlInput || !urlInput.startsWith('http')) {
            toast.error("Please enter a valid URL starting with http:// or https://");
            return;
        }

        setUploadError(null);
        setIsUploading(true);
        const toastId = toast.loading("Scraping and indexing website...");

        try {
            const res = await fetch('/api/documents/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: urlInput })
            });
            const data = await res.json();

            if (res.ok) {
                toast.success("Website indexed successfully!", { id: toastId });
                setUrlInput('');
                fetchDocuments();
            } else if (data.needsSetup) {
                toast.error("Database setup required", { id: toastId });
                setUploadError("Database setup required. Please run the SQL schema in Supabase.");
            } else {
                toast.error("Import failed", { id: toastId });
                setUploadError(data.error || "Failed to import URL");
            }
        } catch (error: any) {
            console.error("URL training error:", error);
            const errorMessage = (error as Error).message || "Import failed";
            toast.error(errorMessage, { id: toastId });
            setUploadError(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        const toastId = toast.loading("Deleting document...");
        try {
            const res = await fetch(`/api/documents/${deleteId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success("Document deleted", { id: toastId });
                // Optimistic update
                setDocuments(prev => prev.filter(d => d.id !== deleteId));
            } else {
                const data = await res.json();
                toast.error(data.error || "Delete failed", { id: toastId });
            }
        } catch (error) {
            toast.error("Network error", { id: toastId });
        } finally {
            setDeleteId(null);
        }
    };

    const embedCode = `<script src="${origin}/chat-widget-embed.js" data-site-url="${origin}"></script>`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(embedCode);
        toast.success("Embed code copied!");
    };

    return (
        <Layout>
            <div className="space-y-8">
                {/* Hero Header */}
                <header className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 p-8 lg:p-12 text-white shadow-2xl shadow-teal-600/20">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                                <MessageSquare className="h-8 w-8" />
                            </div>
                            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                                <Sparkles className="h-3 w-3 mr-1" /> RAG Powered
                            </Badge>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">
                            Live Chat Support
                        </h1>
                        <p className="text-white/80 max-w-2xl text-lg">
                            Train your AI assistant with your documents. Get accurate, grounded responses based only on your uploaded content.
                        </p>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl"></div>
                </header>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Documents", value: documents.length, icon: FileText, color: "text-teal-500" },
                        { label: "Indexed", value: documents.filter(d => d.status === 'completed').length, icon: CheckCircle2, color: "text-emerald-500" },
                        { label: "Processing", value: documents.filter(d => d.status === 'processing').length, icon: Clock, color: "text-amber-500" },
                        { label: "Errors", value: documents.filter(d => d.status === 'error').length, icon: AlertCircle, color: "text-red-500" },
                    ].map((stat, i) => (
                        <Card key={i} className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className={`${stat.color} bg-current/10 p-2.5 rounded-xl`}>
                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Document Management */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Upload Section */}
                        <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
                            <CardHeader className="border-b bg-muted/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-teal-500/10 p-2 rounded-xl">
                                            <Upload className="h-5 w-5 text-teal-500" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Knowledge Base</CardTitle>
                                            <CardDescription>Upload documents to train your support agent</CardDescription>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={fetchDocuments} className="text-muted-foreground hover:text-foreground">
                                        <RefreshCw className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {/* Upload Zone */}
                                <div className="space-y-4">
                                    {uploadError && (
                                        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-start gap-3">
                                            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                                            <div className="space-y-1">
                                                <p className="font-semibold text-sm">Upload Failed</p>
                                                <p className="text-xs opacity-90">{uploadError}</p>
                                            </div>
                                        </div>
                                    )}

                                    <Tabs defaultValue="file" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1 rounded-xl">
                                            <TabsTrigger value="file" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                                <Upload className="h-4 w-4 mr-2" /> File Upload
                                            </TabsTrigger>
                                            <TabsTrigger value="url" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                                <ExternalLink className="h-4 w-4 mr-2" /> URL Import
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="file">
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                    accept=".pdf,.docx,.txt"
                                                    onChange={handleUpload}
                                                    disabled={isUploading}
                                                />
                                                <div className={`border-2 border-dashed rounded-2xl p-10 transition-all duration-300 cursor-pointer ${uploadError ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-gradient-to-br from-muted/30 to-muted/10 group-hover:border-teal-500/50 group-hover:bg-teal-500/5'}`}>
                                                    <div className="text-center space-y-4">
                                                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 ${uploadError ? 'bg-destructive shadow-destructive/20' : 'bg-gradient-to-br from-teal-500 to-emerald-500 shadow-teal-500/20'}`}>
                                                            {uploadError ? <AlertCircle className="h-7 w-7" /> : <Upload className="h-7 w-7" />}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="font-semibold text-lg">Drop files here or click to upload</p>
                                                            <p className="text-sm text-muted-foreground">PDF, DOCX, or TXT • Max 10MB per file</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="url" className="space-y-4">
                                            <div className={`border-2 border-dashed rounded-2xl p-10 transition-all duration-300 ${uploadError ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-gradient-to-br from-muted/30 to-muted/10'}`}>
                                                <div className="text-center space-y-6">
                                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/20">
                                                        <ExternalLink className="h-7 w-7" />
                                                    </div>
                                                    <div className="space-y-4 max-w-md mx-auto">
                                                        <div className="space-y-1">
                                                            <p className="font-semibold text-lg">Train from URL</p>
                                                            <p className="text-sm text-muted-foreground">Enter a website URL to crawl and index its content</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Input 
                                                                placeholder="https://example.com/docs" 
                                                                className="bg-background/50 border-border/50 focus:border-teal-500/50 transition-colors"
                                                                value={urlInput}
                                                                onChange={(e) => setUrlInput(e.target.value)}
                                                                disabled={isUploading}
                                                            />
                                                            <Button 
                                                                onClick={handleUrlTrain} 
                                                                disabled={isUploading || !urlInput}
                                                                className="bg-teal-600 hover:bg-teal-700 text-white shrink-0"
                                                            >
                                                                {isUploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Train"}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>

                                {/* Documents List */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Your Documents</h3>
                                        <span className="text-xs text-muted-foreground">{documents.length} total</span>
                                    </div>
                                    <ScrollArea className="h-[280px] rounded-xl border bg-background/50">
                                        {documents.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                                                <BookOpen className="h-12 w-12 mb-4 opacity-30" />
                                                <p className="font-medium">No documents yet</p>
                                                <p className="text-sm">Upload your first document to get started</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y">
                                                {documents.map((doc) => (
                                                    <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="bg-gradient-to-br from-teal-500/20 to-emerald-500/20 p-2.5 rounded-xl">
                                                                <FileText className="h-5 w-5 text-teal-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm truncate max-w-[250px]">{doc.name}</p>
                                                                <p className="text-[11px] text-muted-foreground">{new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {doc.status === 'completed' ? (
                                                                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
                                                                    <CheckCircle2 className="h-3 w-3" /> Indexed
                                                                </Badge>
                                                            ) : doc.status === 'processing' ? (
                                                                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1">
                                                                    <Clock className="h-3 w-3 animate-pulse" /> Processing
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="destructive" className="gap-1">
                                                                    <AlertCircle className="h-3 w-3" /> Error
                                                                </Badge>
                                                            )}
                                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" onClick={() => handleDeleteClick(doc.id)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </ScrollArea>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Embed Code Section */}
                        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="bg-violet-500/10 p-2 rounded-xl">
                                        <Code className="h-5 w-5 text-violet-500" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Embed on Your Website</CardTitle>
                                        <CardDescription>Add this script before {'</body>'}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="relative group bg-zinc-950 rounded-xl p-5 font-mono text-sm text-zinc-300 overflow-x-auto">
                                    <code className="break-all">{embedCode}</code>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={copyToClipboard}
                                    >
                                        <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Preview Card */}
                        <Card className="border-teal-500/20 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-6">
                                <div className="flex items-center gap-3">
                                    <MessageSquare className="h-6 w-6" />
                                    <CardTitle>Test Your Agent</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Launch the preview to test how your AI responds to questions based on your uploaded documents.
                                </p>
                                <Button
                                    className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg shadow-teal-600/20 h-12 text-base"
                                    onClick={() => setShowPreview(!showPreview)}
                                >
                                    {showPreview ? "Close Preview" : "Launch Preview"}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <div className="pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-amber-500" /> Instant</span>
                                    <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-emerald-500" /> Grounded</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* How It Works */}
                        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">How It Works</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                {[
                                    { step: 1, title: "Add Content", desc: "Upload docs or provide website URLs" },
                                    { step: 2, title: "Auto-Index", desc: "AI processes and indexes content" },
                                    { step: 3, title: "Test Chat", desc: "Try queries in the preview" },
                                    { step: 4, title: "Embed", desc: "Add widget to your website" },
                                ].map((item) => (
                                    <div key={item.step} className="flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                                            {item.step}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{item.title}</p>
                                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Floating Live Preview Widget */}
                {showPreview && <ChatWidget />}

                <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the document from your knowledge base.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Layout>
    );
}
