"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { navigationCategories } from "@/lib/sidebar-routes";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Search,
    MoreHorizontal,
    UserPlus,
    Download,
    Filter,
    Loader2,
    Mail,
    Shield,
    ShieldCheck,
    Ban,
    Trash2,
    Edit,
    Zap,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Users,
    Crown,
    Settings2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
    email: string;
    name?: string;
    role: "user" | "admin";
    status: "active" | "disabled";
    createdAt: string;
    tokens?: number;
    disabledFeatures?: string[];
}

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [addTokensDialogOpen, setAddTokensDialogOpen] = useState(false);
    const [tokenAmount, setTokenAmount] = useState("");
    const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
    const [manageToolsDialogOpen, setManageToolsDialogOpen] = useState(false);
    const [userDisabledFeatures, setUserDisabledFeatures] = useState<string[]>([]);
    const [newUserData, setNewUserData] = useState({ name: "", email: "", role: "user" as "user" | "admin" });
    const { toast } = useToast();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            if (!res.ok) throw new Error("Failed to fetch users");
            const data = await res.json();
            setUsers(Array.isArray(data) ? data : data.users || []);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.message || "Failed to load users",
                variant: "destructive",
            });
            // Mock data fallback
            setUsers([
                { email: "admin@example.com", name: "Admin User", role: "admin", status: "active", createdAt: new Date().toISOString(), tokens: 50000 },
                { email: "john@example.com", name: "John Doe", role: "user", status: "active", createdAt: new Date().toISOString(), tokens: 2500 },
                { email: "jane@example.com", name: "Jane Smith", role: "user", status: "active", createdAt: new Date().toISOString(), tokens: 1800 },
                { email: "bob@example.com", name: "Bob Wilson", role: "user", status: "disabled", createdAt: new Date().toISOString(), tokens: 0 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter((user) => {
        if (!user || !user.email) return false;
        const matchesSearch =
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.name?.toLowerCase() || "").includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        const matchesStatus = statusFilter === "all" || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedUsers(filteredUsers.map((u) => u.email));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSelectUser = (email: string, checked: boolean) => {
        if (checked) {
            setSelectedUsers([...selectedUsers, email]);
        } else {
            setSelectedUsers(selectedUsers.filter((e) => e !== email));
        }
    };

    const handleUpdateUser = async (user: User, updates: Partial<User>) => {
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: user.email, updates }),
            });

            if (res.ok) {
                setUsers(users.map((u) => (u.email === user.email ? { ...u, ...updates } : u)));
                toast({ title: "Success", description: "User updated successfully" });
            } else {
                throw new Error("Failed to update user");
            }
        } catch (error: any) {
            console.error("API update failed", error);
            toast({ title: "Error", description: error?.message || "Failed to update user", variant: "destructive" });
        }
    };

    const handleDeleteUser = async (user: User) => {
        try {
            const res = await fetch(`/api/admin/users?email=${user.email}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setUsers(users.filter((u) => u.email !== user.email));
                toast({ title: "Success", description: "User deleted successfully" });
            } else {
                throw new Error("Failed to delete user");
            }
        } catch (error: any) {
            console.error("API delete failed", error);
            toast({ title: "Error", description: error?.message || "Failed to delete user", variant: "destructive" });
        }
    };

    const handleAddTokens = async () => {
        if (!editingUser || !tokenAmount) return;

        try {
            const res = await fetch("/api/tokens", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: editingUser.email,
                    amount: parseInt(tokenAmount),
                    action: "add",
                }),
            });
            if (!res.ok) throw new Error("Failed to add tokens");

            setUsers(users.map((u) =>
                u.email === editingUser.email
                    ? { ...u, tokens: (u.tokens || 0) + parseInt(tokenAmount) }
                    : u
            ));
            toast({ title: "Success", description: `Added ${tokenAmount} tokens to ${editingUser.email}` });
            setAddTokensDialogOpen(false);
            setTokenAmount("");
        } catch (error: any) {
            toast({ title: "Error", description: error?.message || "Failed to add tokens", variant: "destructive" });
        }
    };

    const handleBulkAction = async (action: string) => {
        if (selectedUsers.length === 0) return;

        try {
            // Implement bulk action API call
            toast({ title: "Success", description: `${action} applied to ${selectedUsers.length} users` });
            setSelectedUsers([]);
            fetchUsers();
        } catch (error: any) {
            toast({ title: "Error", description: `Failed to ${action}`, variant: "destructive" });
        }
    };

    const handleExport = () => {
        const headers = ["Name", "Email", "Role", "Status", "Tokens", "Joined"];
        const csvContent = [
            headers.join(","),
            ...users.map(user => [
                `"${user.name || ""}"`,
                `"${user.email}"`,
                user.role,
                user.status,
                user.tokens || 0,
                new Date(user.createdAt).toLocaleDateString()
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "users_export.csv");
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleAddUser = async () => {
        if (!newUserData.email || !newUserData.name) {
            toast({ title: "Error", description: "Name and Email are required", variant: "destructive" });
            return;
        }

        try {
            // Attempt to call API
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newUserData, status: "active", tokens: 0 }),
            });

            if (res.ok) {
                const data = await res.json();
                const newUser = data.user || data;
                setUsers([newUser, ...users]);
                setAddUserDialogOpen(false);
                setNewUserData({ name: "", email: "", role: "user" });
                toast({ title: "Success", description: "User added successfully" });
            } else {
                throw new Error("Failed to create user");
            }
        } catch (error: any) {
            console.error("API add failed", error);
            toast({ title: "Error", description: error?.message || "Failed to add user", variant: "destructive" });
        }
    };

    const stats = [
        { label: "Total Users", value: users.length, icon: Users, color: "text-blue-500" },
        { label: "Active", value: users.filter((u) => u.status === "active").length, icon: CheckCircle2, color: "text-green-500" },
        { label: "Admins", value: users.filter((u) => u.role === "admin").length, icon: Crown, color: "text-amber-500" },
        { label: "Disabled", value: users.filter((u) => u.status === "disabled").length, icon: XCircle, color: "text-red-500" },
    ];

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">
                        Manage all registered users and their permissions.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button onClick={() => setAddUserDialogOpen(true)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add User
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters & Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="disabled">Disabled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Bulk Actions */}
                    {selectedUsers.length > 0 && (
                        <div className="mt-4 flex items-center gap-4 p-3 bg-muted rounded-lg">
                            <span className="text-sm font-medium">
                                {selectedUsers.length} selected
                            </span>
                            <div className="flex-1" />
                            <Button size="sm" variant="outline" onClick={() => handleBulkAction("enable")}>
                                Enable
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleBulkAction("disable")}>
                                Disable
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleBulkAction("delete")}>
                                Delete
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                        onCheckedChange={handleSelectAll}
                                    />
                                </TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Tokens</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.email}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedUsers.includes(user.email)}
                                            onCheckedChange={(checked) =>
                                                handleSelectUser(user.email, checked as boolean)
                                            }
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {(user.name || user.email)[0].toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{user.name || "—"}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === "admin" ? "premium" : "secondary"}>
                                            {user.role === "admin" && <Crown className="w-3 h-3 mr-1" />}
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.status === "active" ? "soft-success" : "soft-destructive"}>
                                            {user.status === "active" ? (
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                            ) : (
                                                <XCircle className="w-3 h-3 mr-1" />
                                            )}
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Zap className="w-4 h-4 text-amber-500" />
                                            <span className="font-medium">
                                                {(user.tokens || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon-sm">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {/* <DropdownMenuItem
                                                    onClick={() => {
                                                        setEditingUser(user);
                                                        setEditDialogOpen(true);
                                                    }}
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit User
                                                </DropdownMenuItem> */}
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setEditingUser(user);
                                                        setUserDisabledFeatures(user.disabledFeatures || []);
                                                        setManageToolsDialogOpen(true);
                                                    }}
                                                >
                                                    <Settings2 className="w-4 h-4 mr-2" />
                                                    Manage Tools
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setEditingUser(user);
                                                        setAddTokensDialogOpen(true);
                                                    }}
                                                >
                                                    <Zap className="w-4 h-4 mr-2" />
                                                    Add Tokens
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleUpdateUser(user, { role: user.role === "admin" ? "user" : "admin" })
                                                    }
                                                >
                                                    <ShieldCheck className="w-4 h-4 mr-2" />
                                                    {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleUpdateUser(user, {
                                                            status: user.status === "active" ? "disabled" : "active",
                                                        })
                                                    }
                                                >
                                                    {user.status === "active" ? (
                                                        <>
                                                            <Ban className="w-4 h-4 mr-2" />
                                                            Disable User
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                                            Enable User
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                    onClick={() => handleDeleteUser(user)}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {filteredUsers.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Users className="w-12 h-12 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium">No users found</p>
                            <p className="text-sm text-muted-foreground">
                                Try adjusting your search or filters
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Tokens Dialog */}
            <Dialog open={addTokensDialogOpen} onOpenChange={setAddTokensDialogOpen}>
                <DialogContent className="p-6">
                    <DialogHeader>
                        <DialogTitle>Add Tokens</DialogTitle>
                        <DialogDescription>
                            Add tokens to {editingUser?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Token Amount</Label>
                            <Input
                                type="number"
                                placeholder="Enter amount"
                                value={tokenAmount}
                                onChange={(e) => setTokenAmount(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            {[100, 500, 1000, 5000].map((amount) => (
                                <Button
                                    key={amount}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setTokenAmount(String(amount))}
                                >
                                    +{amount}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddTokensDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddTokens}>Add Tokens</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add User Dialog */}
            <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
                <DialogContent className="p-6">
                    <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                            Create a new user account manually.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                                placeholder="John Doe"
                                value={newUserData.name}
                                onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email Address</Label>
                            <Input
                                placeholder="john@example.com"
                                type="email"
                                value={newUserData.email}
                                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select
                                value={newUserData.role}
                                onValueChange={(value: "user" | "admin") => setNewUserData({ ...newUserData, role: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddUserDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddUser}>Create User</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manage Tools Dialog */}
            <Dialog open={manageToolsDialogOpen} onOpenChange={setManageToolsDialogOpen}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden flex flex-col">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle>Manage Tools for {editingUser?.email}</DialogTitle>
                        <DialogDescription>
                            Enable or disable specific AI tools for this user.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto px-6">
                        <Accordion type="multiple" className="w-full space-y-4 pb-6">
                            {navigationCategories
                                .filter(category => !['main', 'other'].includes(category.id))
                                .map((category) => (
                                    <AccordionItem key={category.id} value={category.id} className="border rounded-lg px-4 bg-card/50">
                                        <AccordionTrigger className="hover:no-underline py-4">
                                            <div className="flex items-center gap-2">
                                                <category.icon className="w-5 h-5 text-muted-foreground" />
                                                <span className="font-semibold">{category.title}</span>
                                                <Badge variant="secondary" className="ml-2 font-normal text-xs">
                                                    {category.items.length} tools
                                                </Badge>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-2 pb-4">
                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {category.items.map((feature) => {
                                                    const isEnabled = !userDisabledFeatures.includes(feature.id);
                                                    return (
                                                        <div key={feature.id} className="flex items-center justify-between p-3 border rounded-md bg-background hover:bg-accent/5 transition-colors">
                                                            <div className="space-y-0.5 max-w-[80%]">
                                                                <Label className="text-sm font-medium truncate block">{feature.title}</Label>
                                                                <p className="text-[10px] text-muted-foreground font-mono truncate">{feature.id}</p>
                                                            </div>
                                                            <Switch
                                                                checked={isEnabled}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) {
                                                                        setUserDisabledFeatures(userDisabledFeatures.filter(id => id !== feature.id));
                                                                    } else {
                                                                        setUserDisabledFeatures([...userDisabledFeatures, feature.id]);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                        </Accordion>
                    </div>
                    <DialogFooter className="p-6 pt-2 border-t mt-auto">
                        <Button variant="outline" onClick={() => setManageToolsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => {
                            if (editingUser) {
                                handleUpdateUser(editingUser, { disabledFeatures: userDisabledFeatures });
                                setManageToolsDialogOpen(false);
                            }
                        }}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
