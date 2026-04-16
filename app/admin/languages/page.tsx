"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import {
    Plus,
    Trash2,
    Edit,
    Languages,
    FileText,
    Sparkles,
    Loader2,
    Save,
    Globe,
    Check,
    X,
    Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Language {
    id: string;
    code: string;
    name: string;
    direction: "ltr" | "rtl";
    isEnabled: boolean;
    createdAt?: string;
}

interface TranslationEntry {
    key: string;
    translations: Record<string, string>;
}

export default function LanguagesPage() {
    const [languages, setLanguages] = useState<Language[]>([]);
    const [translationEntries, setTranslationEntries] = useState<TranslationEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Language dialog state
    const [langDialogOpen, setLangDialogOpen] = useState(false);
    const [editingLang, setEditingLang] = useState<Language | null>(null);
    const [langForm, setLangForm] = useState({ code: "", name: "", direction: "ltr" as "ltr" | "rtl" });

    // Translation key dialog state
    const [keyDialogOpen, setKeyDialogOpen] = useState(false);
    const [newKey, setNewKey] = useState("");

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState<{ type: "language" | "key"; id: string; label: string } | null>(null);

    // Inline editing state
    const [editingCell, setEditingCell] = useState<{ key: string; langCode: string } | null>(null);
    const [editingValue, setEditingValue] = useState("");

    // AI suggestion state
    const [aiLoading, setAiLoading] = useState<string | null>(null);
    const [aiSuggestions, setAiSuggestions] = useState<{ key: string; suggestions: Record<string, string> } | null>(null);

    // Search filter
    const [searchQuery, setSearchQuery] = useState("");
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { toast } = useToast();

    // Fetch all data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [langRes, transRes] = await Promise.all([
                fetch("/api/admin/languages"),
                fetch("/api/admin/translations"),
            ]);

            if (langRes.ok) {
                const langData = await langRes.json();
                setLanguages(langData);
            }

            if (transRes.ok) {
                const transData = await transRes.json();
                setTranslationEntries(transData.keys || []);
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ===== Language CRUD =====

    const handleSaveLanguage = async () => {
        if (!langForm.code || !langForm.name) {
            toast({ title: "Error", description: "Code and name are required", variant: "destructive" });
            return;
        }
        setSaving(true);
        try {
            const res = await fetch("/api/admin/languages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...(editingLang ? { id: editingLang.id } : {}),
                    code: langForm.code,
                    name: langForm.name,
                    direction: langForm.direction,
                    isEnabled: true,
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to save");
            }
            toast({ title: "Success", description: `Language ${editingLang ? "updated" : "added"} successfully` });
            setLangDialogOpen(false);
            setEditingLang(null);
            setLangForm({ code: "", name: "", direction: "ltr" });
            fetchData();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleToggleLanguage = async (id: string, isEnabled: boolean) => {
        try {
            await fetch(`/api/admin/languages/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isEnabled }),
            });
            setLanguages((prev) => prev.map((l) => (l.id === id ? { ...l, isEnabled } : l)));
        } catch {
            toast({ title: "Error", description: "Failed to toggle language", variant: "destructive" });
        }
    };

    const handleDeleteLanguage = async (id: string) => {
        try {
            await fetch(`/api/admin/languages/${id}`, { method: "DELETE" });
            toast({ title: "Success", description: "Language deleted" });
            fetchData();
        } catch {
            toast({ title: "Error", description: "Failed to delete language", variant: "destructive" });
        }
    };

    // ===== Translation CRUD =====

    const handleAddKey = async () => {
        if (!newKey.trim()) return;
        // Add the key with empty values for all languages
        const translations = languages.map((l) => ({
            translationKey: newKey.trim(),
            languageCode: l.code,
            value: "",
        }));
        try {
            const res = await fetch("/api/admin/translations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ translations }),
            });
            if (!res.ok) throw new Error("Failed to add key");
            toast({ title: "Success", description: `Key "${newKey}" added` });
            setKeyDialogOpen(false);
            setNewKey("");
            fetchData();
        } catch {
            toast({ title: "Error", description: "Failed to add translation key", variant: "destructive" });
        }
    };

    const handleSaveTranslation = async (key: string, langCode: string, value: string) => {
        try {
            await fetch("/api/admin/translations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ translationKey: key, languageCode: langCode, value }),
            });
            // Update local state
            setTranslationEntries((prev) =>
                prev.map((entry) => {
                    if (entry.key === key) {
                        return { ...entry, translations: { ...entry.translations, [langCode]: value } };
                    }
                    return entry;
                })
            );
            setEditingCell(null);
            toast({ title: "Saved", description: `Translation updated` });
        } catch {
            toast({ title: "Error", description: "Failed to save translation", variant: "destructive" });
        }
    };

    const handleDeleteKey = async (key: string) => {
        try {
            await fetch(`/api/admin/translations/${encodeURIComponent(key)}`, { method: "DELETE" });
            toast({ title: "Success", description: `Key "${key}" deleted` });
            fetchData();
        } catch {
            toast({ title: "Error", description: "Failed to delete translation key", variant: "destructive" });
        }
    };

    // ===== AI Suggestion =====

    const handleAiSuggest = async (key: string) => {
        const entry = translationEntries.find((e) => e.key === key);
        // Find the source text — use English if available, otherwise first non-empty value
        const sourceText = entry?.translations["en"] || Object.values(entry?.translations || {}).find((v) => v) || key;
        const targetLanguages = languages
            .filter((l) => l.code !== "en")
            .map((l) => ({ code: l.code, name: l.name }));

        if (targetLanguages.length === 0) {
            toast({ title: "Info", description: "Add more languages to get AI suggestions", variant: "default" });
            return;
        }

        setAiLoading(key);
        try {
            const res = await fetch("/api/admin/translations/ai-suggest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key, sourceText, targetLanguages }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "AI suggestion failed");
            }
            const data = await res.json();
            setAiSuggestions({ key, suggestions: data.suggestions });
        } catch (error: any) {
            toast({ title: "AI Error", description: error.message, variant: "destructive" });
        } finally {
            setAiLoading(null);
        }
    };

    const handleApplyAiSuggestion = async (key: string, langCode: string, value: string) => {
        await handleSaveTranslation(key, langCode, value);
        // Remove the applied suggestion
        if (aiSuggestions) {
            const updated = { ...aiSuggestions.suggestions };
            delete updated[langCode];
            if (Object.keys(updated).length === 0) {
                setAiSuggestions(null);
            } else {
                setAiSuggestions({ ...aiSuggestions, suggestions: updated });
            }
        }
    };

    const handleApplyAllAiSuggestions = async () => {
        if (!aiSuggestions) return;
        const translations = Object.entries(aiSuggestions.suggestions).map(([langCode, value]) => ({
            translationKey: aiSuggestions.key,
            languageCode: langCode,
            value,
        }));
        try {
            await fetch("/api/admin/translations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ translations }),
            });
            toast({ title: "Success", description: "All AI suggestions applied" });
            setAiSuggestions(null);
            fetchData();
        } catch {
            toast({ title: "Error", description: "Failed to apply suggestions", variant: "destructive" });
        }
    };

    // ===== Delete confirm handler =====

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        if (deleteTarget.type === "language") {
            await handleDeleteLanguage(deleteTarget.id);
        } else {
            await handleDeleteKey(deleteTarget.id);
        }
        setDeleteTarget(null);
    };

    // Filter translations by search
    const filteredEntries = translationEntries.filter((entry) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        if (entry.key.toLowerCase().includes(q)) return true;
        return Object.values(entry.translations).some((v) => v.toLowerCase().includes(q));
    });
    
    const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
    const paginatedEntries = filteredEntries.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6 max-w-[1400px] mx-auto space-y-6" data-no-translate>
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Languages className="w-6 h-6 text-primary" />
                        Language Management
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage languages, translation keys, and AI-assisted translations
                    </p>
                </div>

                <Tabs defaultValue="languages" className="space-y-6">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="languages" className="gap-2">
                            <Globe className="w-4 h-4" />
                            Languages
                        </TabsTrigger>
                        <TabsTrigger value="translations" className="gap-2">
                            <FileText className="w-4 h-4" />
                            Translations
                        </TabsTrigger>
                    </TabsList>

                    {/* ===== Languages Tab ===== */}
                    <TabsContent value="languages" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {languages.length} language{languages.length !== 1 ? "s" : ""} configured
                            </p>
                            <Button
                                onClick={() => {
                                    setEditingLang(null);
                                    setLangForm({ code: "", name: "", direction: "ltr" });
                                    setLangDialogOpen(true);
                                }}
                                size="sm"
                                className="gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add Language
                            </Button>
                        </div>

                        <div className="border rounded-xl overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30">
                                        <TableHead>Language</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Direction</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {languages.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                                                No languages configured yet. Add your first language to get started.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        languages.map((lang) => (
                                            <TableRow key={lang.id}>
                                                <TableCell className="font-medium">{lang.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-mono text-xs">
                                                        {lang.code}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={lang.direction === "rtl" ? "default" : "secondary"}
                                                        className="text-xs uppercase"
                                                    >
                                                        {lang.direction}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Switch
                                                        checked={lang.isEnabled}
                                                        onCheckedChange={(checked) => handleToggleLanguage(lang.id, checked)}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => {
                                                                setEditingLang(lang);
                                                                setLangForm({
                                                                    code: lang.code,
                                                                    name: lang.name,
                                                                    direction: lang.direction,
                                                                });
                                                                setLangDialogOpen(true);
                                                            }}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                                            onClick={() => setDeleteTarget({ type: "language", id: lang.id, label: lang.name })}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    {/* ===== Translations Tab ===== */}
                    <TabsContent value="translations" className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search keys or values..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button onClick={() => setKeyDialogOpen(true)} size="sm" className="gap-2">
                                <Plus className="w-4 h-4" /> Add Translation Key
                            </Button>
                        </div>

                        {languages.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border rounded-xl">
                                Add languages first before managing translations.
                            </div>
                        ) : (
                            <div className="border rounded-xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/30">
                                                <TableHead className="min-w-[200px] sticky left-0 bg-muted/30 z-10">Key</TableHead>
                                                {languages.map((lang) => (
                                                    <TableHead key={lang.code} className="min-w-[180px]">
                                                        <div className="flex items-center gap-1.5">
                                                            {lang.name}
                                                            <Badge variant="outline" className="text-[10px] font-mono">
                                                                {lang.code}
                                                            </Badge>
                                                        </div>
                                                    </TableHead>
                                                ))}
                                                <TableHead className="min-w-[100px] text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedEntries.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={languages.length + 2}
                                                        className="text-center text-muted-foreground py-12"
                                                    >
                                                        {searchQuery
                                                            ? "No matching translation keys found."
                                                            : "No translation keys yet. Add your first key to get started."}
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                paginatedEntries.map((entry) => (
                                                    <TableRow key={entry.key}>
                                                        <TableCell className="font-mono text-xs sticky left-0 bg-background z-10 border-r">
                                                            {entry.key}
                                                        </TableCell>
                                                        {languages.map((lang) => {
                                                            const isEditing =
                                                                editingCell?.key === entry.key &&
                                                                editingCell?.langCode === lang.code;
                                                            const value = entry.translations[lang.code] || "";
                                                            const hasSuggestion =
                                                                aiSuggestions?.key === entry.key &&
                                                                aiSuggestions?.suggestions[lang.code];

                                                            return (
                                                                <TableCell key={lang.code} className="relative p-0">
                                                                    {isEditing ? (
                                                                        <div className="flex items-center gap-1 p-1">
                                                                            <Input
                                                                                value={editingValue}
                                                                                onChange={(e) => setEditingValue(e.target.value)}
                                                                                className="h-8 text-sm"
                                                                                autoFocus
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === "Enter") {
                                                                                        handleSaveTranslation(entry.key, lang.code, editingValue);
                                                                                    }
                                                                                    if (e.key === "Escape") setEditingCell(null);
                                                                                }}
                                                                            />
                                                                            <Button
                                                                                size="icon"
                                                                                variant="ghost"
                                                                                className="h-7 w-7 shrink-0"
                                                                                onClick={() => handleSaveTranslation(entry.key, lang.code, editingValue)}
                                                                            >
                                                                                <Check className="w-3.5 h-3.5 text-green-500" />
                                                                            </Button>
                                                                            <Button
                                                                                size="icon"
                                                                                variant="ghost"
                                                                                className="h-7 w-7 shrink-0"
                                                                                onClick={() => setEditingCell(null)}
                                                                            >
                                                                                <X className="w-3.5 h-3.5 text-destructive" />
                                                                            </Button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="relative group">
                                                                            <button
                                                                                className={cn(
                                                                                    "w-full text-left p-3 text-sm hover:bg-muted/50 transition-colors min-h-[40px] block",
                                                                                    !value && "text-muted-foreground/50 italic"
                                                                                )}
                                                                                onClick={() => {
                                                                                    setEditingCell({ key: entry.key, langCode: lang.code });
                                                                                    setEditingValue(value);
                                                                                }}
                                                                            >
                                                                                {value || "Click to add..."}
                                                                            </button>
                                                                            {hasSuggestion && (
                                                                                <div className="absolute inset-0 bg-background border-2 border-primary/40 rounded-md flex items-center justify-between px-2 shadow-sm z-10">
                                                                                    <span className="text-sm font-medium text-primary truncate mr-2">
                                                                                        {aiSuggestions!.suggestions[lang.code]}
                                                                                    </span>
                                                                                    <div className="flex gap-0.5 shrink-0 bg-background">
                                                                                        <Button
                                                                                            size="icon"
                                                                                            variant="ghost"
                                                                                            className="h-7 w-7 hover:bg-green-500/10"
                                                                                            onClick={() =>
                                                                                                handleApplyAiSuggestion(
                                                                                                    entry.key,
                                                                                                    lang.code,
                                                                                                    aiSuggestions!.suggestions[lang.code]
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <Check className="w-4 h-4 text-green-500" />
                                                                                        </Button>
                                                                                        <Button
                                                                                            size="icon"
                                                                                            variant="ghost"
                                                                                            className="h-7 w-7 hover:bg-destructive/10"
                                                                                            onClick={() => {
                                                                                                const updated = { ...aiSuggestions!.suggestions };
                                                                                                delete updated[lang.code];
                                                                                                if (Object.keys(updated).length === 0) {
                                                                                                    setAiSuggestions(null);
                                                                                                } else {
                                                                                                    setAiSuggestions({ ...aiSuggestions!, suggestions: updated });
                                                                                                }
                                                                                            }}
                                                                                        >
                                                                                            <X className="w-4 h-4 text-destructive" />
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </TableCell>
                                                            );
                                                        })}
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    disabled={aiLoading === entry.key}
                                                                    onClick={() => handleAiSuggest(entry.key)}
                                                                    title="AI Translate"
                                                                >
                                                                    {aiLoading === entry.key ? (
                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                    ) : (
                                                                        <Sparkles className="w-4 h-4 text-primary" />
                                                                    )}
                                                                </Button>
                                                                {aiSuggestions?.key === entry.key && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8"
                                                                        onClick={handleApplyAllAiSuggestions}
                                                                        title="Apply all suggestions"
                                                                    >
                                                                        <Save className="w-4 h-4 text-green-500" />
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                                    onClick={() => setDeleteTarget({ type: "key", id: entry.key, label: entry.key })}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-4">
                                <p className="text-sm text-muted-foreground">
                                    Showing {Math.min(filteredEntries.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredEntries.length, currentPage * itemsPerPage)} of {filteredEntries.length} results
                                </p>
                                <Pagination className="w-auto mx-0">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious 
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                className={cn("cursor-pointer", currentPage === 1 && "pointer-events-none opacity-50")}
                                            />
                                        </PaginationItem>
                                        
                                        {Array.from({ length: totalPages }).map((_, i) => {
                                            const page = i + 1;
                                            // Show first, last, current, and pages around current
                                            if (
                                                page === 1 || 
                                                page === totalPages || 
                                                (page >= currentPage - 1 && page <= currentPage + 1)
                                            ) {
                                                return (
                                                    <PaginationItem key={page}>
                                                        <PaginationLink
                                                            onClick={() => setCurrentPage(page)}
                                                            isActive={currentPage === page}
                                                            className="cursor-pointer"
                                                        >
                                                            {page}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                );
                                            } else if (
                                                (page === currentPage - 2 && page > 1) ||
                                                (page === currentPage + 2 && page < totalPages)
                                            ) {
                                                return (
                                                    <PaginationItem key={page}>
                                                        <PaginationEllipsis />
                                                    </PaginationItem>
                                                );
                                            }
                                            return null;
                                        })}

                                        <PaginationItem>
                                            <PaginationNext 
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                className={cn("cursor-pointer", currentPage === totalPages && "pointer-events-none opacity-50")}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* ===== Add/Edit Language Dialog ===== */}
            <Dialog open={langDialogOpen} onOpenChange={setLangDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingLang ? "Edit Language" : "Add Language"}</DialogTitle>
                        <DialogDescription>
                            {editingLang ? "Update language details" : "Add a new language to the system"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Language Name</Label>
                            <Input
                                placeholder="e.g. English, Arabic, French"
                                value={langForm.name}
                                onChange={(e) => setLangForm({ ...langForm, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Language Code (ISO 639-1)</Label>
                            <Input
                                placeholder="e.g. en, ar, fr"
                                value={langForm.code}
                                onChange={(e) => setLangForm({ ...langForm, code: e.target.value })}
                                disabled={!!editingLang}
                                maxLength={10}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Text Direction</Label>
                            <Select
                                value={langForm.direction}
                                onValueChange={(val: "ltr" | "rtl") => setLangForm({ ...langForm, direction: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ltr">LTR (Left to Right)</SelectItem>
                                    <SelectItem value="rtl">RTL (Right to Left)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLangDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveLanguage} disabled={saving} className="gap-2">
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                            {editingLang ? "Update" : "Add"} Language
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ===== Add Translation Key Dialog ===== */}
            <Dialog open={keyDialogOpen} onOpenChange={setKeyDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Translation Key</DialogTitle>
                        <DialogDescription>
                            Add a new translation key. Use dot notation for organization (e.g. nav.dashboard, btn.save).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label>Key</Label>
                        <Input
                            placeholder="e.g. nav.dashboard"
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddKey();
                            }}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setKeyDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddKey} className="gap-2">
                            <Plus className="w-4 h-4" /> Add Key
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ===== Delete Confirmation ===== */}
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete{" "}
                            <span className="font-semibold">{deleteTarget?.label}</span>
                            {deleteTarget?.type === "language"
                                ? " and all its translations."
                                : " across all languages."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
