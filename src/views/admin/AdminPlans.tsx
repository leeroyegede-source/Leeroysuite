"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { AVAILABLE_FEATURES } from "@/lib/features";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { navigationCategories } from "@/lib/sidebar-routes";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useSettings } from "@/contexts/SettingsContext";

interface PricingPlan {
    id?: string;
    name: string;
    price: number;
    tokens: number;
    interval: 'month' | 'year';
    features: string[];
    aiTools?: string[];
    isActive: boolean;
}

export default function AdminPlans() {
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentPlan, setCurrentPlan] = useState<PricingPlan | null>(null);
    const { toast } = useToast();
    const { settings } = useSettings();

    // Form Stats
    const [formData, setFormData] = useState<PricingPlan>({
        name: "",
        price: 0,
        tokens: 1000,
        interval: 'month',
        features: [],
        aiTools: [],
        isActive: true
    });
    const [featureInput, setFeatureInput] = useState("");

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await fetch("/api/plans");
            if (!res.ok) throw new Error("Failed to fetch plans");
            const data = await res.json();
            setPlans(data.plans || []);
        } catch (error: any) {
            toast({ title: "Error", description: error?.message || "Failed to load plans", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const method = currentPlan ? "PUT" : "POST";
            const url = currentPlan ? `/api/plans/${currentPlan.id}` : "/api/plans";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error("Failed to save plan");

            toast({ title: "Success", description: "Plan saved successfully" });
            fetchPlans();
            setIsDialogOpen(false);
            resetForm();
        } catch (error: any) {
            toast({ title: "Error", description: error?.message || "Failed to save plan", variant: "destructive" });
        }
    };

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [planToDelete, setPlanToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const triggerDelete = (id: string) => {
        setPlanToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!planToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/plans/${planToDelete}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");
            toast({ title: "Deleted", description: "Plan removed" });
            fetchPlans();
        } catch (error: any) {
            toast({ title: "Error", description: error?.message || "Failed to delete plan", variant: "destructive" });
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setPlanToDelete(null);
        }
    };

    const resetForm = () => {
        setFormData({ name: "", price: 0, tokens: 1000, interval: 'month', features: [], aiTools: [], isActive: true });
        setCurrentPlan(null);
        setFeatureInput("");
    };

    const openEdit = (plan: PricingPlan) => {
        setCurrentPlan(plan);
        setFormData({ ...plan });
        setIsDialogOpen(true);
    };

    const addFeature = () => {
        if (!featureInput.trim()) return;
        setFormData({ ...formData, features: [...formData.features, featureInput] });
        setFeatureInput("");
    };

    const removeFeature = (index: number) => {
        const newFeatures = [...formData.features];
        newFeatures.splice(index, 1);
        setFormData({ ...formData, features: newFeatures });
    };

    const toggleTool = (toolId: string) => {
        const currentTools = formData.aiTools || [];
        const newTools = currentTools.includes(toolId)
            ? currentTools.filter(t => t !== toolId)
            : [...currentTools, toolId];
        setFormData({ ...formData, aiTools: newTools });
    };

    const selectAllTools = () => {
        setFormData({ ...formData, aiTools: AVAILABLE_FEATURES.map(f => f.id) });
    };

    const deselectAllTools = () => {
        setFormData({ ...formData, aiTools: [] });
    };

    const toggleCategory = (items: { id: string }[], selectAll: boolean) => {
        if (!items) return;
        const toolIds = items.map(item => item.id);
        const currentTools = formData.aiTools || [];
        
        let newTools = [...currentTools];
        if (selectAll) {
            toolIds.forEach(id => {
                if (!newTools.includes(id)) newTools.push(id);
            });
        } else {
            newTools = newTools.filter(id => !toolIds.includes(id));
        }
        setFormData({ ...formData, aiTools: newTools });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Pricing Plans</h2>
                    <p className="text-muted-foreground">Manage subscription plans and pricing.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => resetForm()}><Plus className="w-4 h-4 mr-2" /> Add Plan</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col overflow-hidden">
                        <DialogHeader>
                            <DialogTitle>{currentPlan ? "Edit Plan" : "Create New Plan"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4 overflow-y-auto pr-2 flex-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Plan Name</Label>
                                    <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Pro Plan" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Price ({settings?.metadata?.platformCurrency || 'USD'})</Label>
                                    <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tokens</Label>
                                    <Input type="number" value={formData.tokens} onChange={e => setFormData({ ...formData, tokens: Number(e.target.value) })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Billing Cycle</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                        value={formData.interval}
                                        onChange={e => setFormData({ ...formData, interval: e.target.value as 'month' | 'year' })}
                                    >
                                        <option value="month">Monthly</option>
                                        <option value="year">Yearly</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Features</Label>
                                <div className="flex gap-2">
                                    <Input value={featureInput} onChange={e => setFeatureInput(e.target.value)} placeholder="Add a feature..." onKeyDown={e => e.key === 'Enter' && addFeature()} />
                                    <Button type="button" variant="outline" onClick={addFeature}>Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.features.map((f, i) => (
                                        <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeFeature(i)}>
                                            {f} <X className="w-3 h-3 ml-1" />
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3 pt-4 border-t mt-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-base">Included AI Tools</Label>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formData.aiTools?.length || 0} out of {AVAILABLE_FEATURES.length} tools selected overall
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={selectAllTools} className="text-xs h-7 py-1">Select All</Button>
                                        <Button variant="outline" size="sm" onClick={deselectAllTools} className="text-xs h-7 py-1">Clear</Button>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Accordion type="multiple" className="w-full space-y-4">
                                        {navigationCategories
                                            .filter(category => !['main', 'other'].includes(category.id))
                                            .map((category) => {
                                                const selectedCount = category.items ? category.items.filter((f: any) => formData.aiTools?.includes(f.id)).length : 0;
                                                const totalCount = category.items?.length || 0;
                                                return (
                                                    <AccordionItem key={category.id} value={category.id} className="border rounded-lg px-4 bg-card/50">
                                                        <AccordionTrigger className="hover:no-underline py-4">
                                                            <div className="flex items-center gap-2">
                                                                <category.icon className="w-5 h-5 text-muted-foreground" />
                                                                <span className="font-semibold">{category.title}</span>
                                                                <Badge variant="secondary" className="ml-2 font-normal text-xs">
                                                                    {selectedCount} / {totalCount} selected
                                                                </Badge>
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent className="pt-2 pb-4">
                                                            <div className="flex justify-end mb-4 gap-2 border-b pb-4">
                                                                <Button variant="outline" size="sm" onClick={() => toggleCategory(category.items || [], true)} className="text-xs h-7 py-1">Select All in Category</Button>
                                                                <Button variant="outline" size="sm" onClick={() => toggleCategory(category.items || [], false)} className="text-xs h-7 py-1">Clear Category</Button>
                                                            </div>
                                                            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
                                                                {category.items?.map((feature: any) => (
                                                                    <div key={feature.id} className="flex items-center justify-between p-3 border rounded-md bg-background hover:bg-accent/5 transition-colors">
                                                                        <div className="space-y-0.5 max-w-[80%]">
                                                                            <Label className="text-sm font-medium truncate block leading-none">{feature.title}</Label>
                                                                            <p className="text-[10px] text-muted-foreground font-mono truncate">{feature.id}</p>
                                                                        </div>
                                                                        <Switch
                                                                            checked={formData.aiTools?.includes(feature.id) || false}
                                                                            onCheckedChange={() => toggleTool(feature.id)}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                );
                                            })}
                                    </Accordion>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <Label>Active</Label>
                                <Switch checked={formData.isActive} onCheckedChange={c => setFormData({ ...formData, isActive: c })} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave}>Save Plan</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Tokens</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plans.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No plans found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                plans.map((plan) => (
                                    <TableRow key={plan.id}>
                                        <TableCell className="font-medium">{plan.name}</TableCell>
                                        <TableCell>
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: settings?.metadata?.platformCurrency || 'USD', maximumFractionDigits: 0 }).format(plan.price)}
                                            /{plan.interval}
                                        </TableCell>
                                        <TableCell>{plan.tokens.toLocaleString()}</TableCell>
                                        <TableCell>
                                            {plan.isActive ? (
                                                <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 shadow-none border-green-200">Active</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-muted-foreground">Disabled</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(plan)}>
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => triggerDelete(plan.id!)}>
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
            )}

            <ConfirmDialog 
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Plan"
                description="Are you sure you want to delete this plan? This action cannot be undone."
                confirmText="Delete"
                isDestructive={true}
                isLoading={isDeleting}
            />
        </div>
    );
}
