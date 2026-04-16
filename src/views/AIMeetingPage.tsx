"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
    Video, Plus, ArrowRight, Copy, Check,
    Users, Clock, Link2, Sparkles, Radio,
    Calendar, ChevronRight, Loader2, ExternalLink,
    VideoOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Meeting {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    endedAt: string | null;
}

export default function AIMeetingPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [meetingTitle, setMeetingTitle] = useState("");
    const [joinId, setJoinId] = useState("");
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [joinError, setJoinError] = useState("");

    // Fetch past meetings
    const fetchMeetings = useCallback(async () => {
        try {
            const res = await fetch("/api/meetings");
            if (res.ok) {
                const data = await res.json();
                setMeetings(data.meetings || []);
            }
        } catch (err) {
            console.error("Failed to fetch meetings:", err);
        } finally {
            setIsLoadingMeetings(false);
        }
    }, []);

    useEffect(() => {
        fetchMeetings();
    }, [fetchMeetings]);

    // Create meeting
    const handleCreateMeeting = async () => {
        setIsCreating(true);
        try {
            const res = await fetch("/api/meetings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: meetingTitle || undefined }),
            });
            const data = await res.json();
            if (res.ok) {
                router.push(data.joinLink);
            } else {
                console.error("Failed to create meeting:", data.error);
            }
        } catch (err) {
            console.error("Failed to create meeting:", err);
        } finally {
            setIsCreating(false);
        }
    };

    // Join meeting
    const handleJoinMeeting = () => {
        const id = joinId.trim();
        if (!id) return;

        // Extract meeting ID from full URL if pasted
        const urlMatch = id.match(/ai-meeting\/([a-z]+-[a-z]+-[a-z]+)/);
        const meetingId = urlMatch ? urlMatch[1] : id;

        // Basic validation
        if (!/^[a-z]+-[a-z]+-[a-z]+$/.test(meetingId)) {
            setJoinError("Invalid meeting ID format. Expected: xxxx-xxxx-xxxx");
            return;
        }

        setJoinError("");
        router.push(`/ai-meeting/${meetingId}`);
    };

    // Copy meeting link
    const copyMeetingLink = (id: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/ai-meeting/${id}`);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const staggerChildren = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.1 },
        },
    };

    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-12">
            {/* Hero Section */}
            <motion.div
                variants={staggerChildren}
                initial="hidden"
                animate="show"
                className="relative text-center space-y-5 pt-4"
            >
                {/* Decorative glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-[#00d4ff]/8 via-transparent to-transparent blur-3xl pointer-events-none" />

                <motion.div variants={fadeUp} className="relative">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff] text-xs font-semibold mb-4">
                        <Radio className="w-3 h-3" />
                        Real-time Video & Chat
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                        <span className="bg-gradient-to-r from-black via-black to-black/60 bg-clip-text text-transparent">
                            AI Meeting
                        </span>
                    </h1>
                    <p className="text-muted-foreground text-base mt-3 max-w-lg mx-auto leading-relaxed">
                        Create or join secure video meetings instantly. Crystal-clear audio and video powered by WebRTC peer-to-peer technology.
                    </p>
                </motion.div>
            </motion.div>

            {/* Action Cards */}
            <motion.div
                variants={staggerChildren}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
                {/* Create Meeting Card */}
                <motion.div variants={fadeUp}>
                    <Card className="relative overflow-hidden border-white/[0.06] bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm hover:border-[#00d4ff]/20 transition-all duration-500 group">
                        {/* Corner glow */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00d4ff]/5 rounded-full blur-3xl group-hover:bg-[#00d4ff]/10 transition-all duration-700" />

                        <CardContent className="relative p-6 space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00d4ff]/20 to-[#0099cc]/20 flex items-center justify-center border border-[#00d4ff]/20 shadow-lg shadow-[#00d4ff]/5">
                                    <Plus className="w-6 h-6 text-[#00d4ff]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">New Meeting</h3>
                                    <p className="text-sm text-muted-foreground">Start a meeting instantly</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <Label htmlFor="meeting-title" className="text-xs text-muted-foreground font-medium">
                                        Meeting Title (optional)
                                    </Label>
                                    <Input
                                        id="meeting-title"
                                        value={meetingTitle}
                                        onChange={(e) => setMeetingTitle(e.target.value)}
                                        placeholder="e.g. Weekly standup"
                                        className="mt-1.5 h-11 rounded-xl bg-background/50 border-white/[0.08] focus-visible:ring-[#00d4ff]/30"
                                    />
                                </div>

                                <Button
                                    onClick={handleCreateMeeting}
                                    disabled={isCreating}
                                    className="w-full h-11 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0099cc] hover:from-[#00bde6] hover:to-[#008ab8] text-black font-semibold transition-all duration-300 shadow-lg shadow-[#00d4ff]/20 hover:shadow-[#00d4ff]/30"
                                >
                                    {isCreating ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <Video className="w-4 h-4 mr-2" />
                                    )}
                                    {isCreating ? "Creating..." : "Create & Join"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Join Meeting Card */}
                <motion.div variants={fadeUp}>
                    <Card className="relative overflow-hidden border-white/[0.06] bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm hover:border-[#ff9f43]/20 transition-all duration-500 group">
                        {/* Corner glow */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#ff9f43]/5 rounded-full blur-3xl group-hover:bg-[#ff9f43]/10 transition-all duration-700" />

                        <CardContent className="relative p-6 space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff9f43]/20 to-[#ee5a24]/20 flex items-center justify-center border border-[#ff9f43]/20 shadow-lg shadow-[#ff9f43]/5">
                                    <Link2 className="w-6 h-6 text-[#ff9f43]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Join Meeting</h3>
                                    <p className="text-sm text-muted-foreground">Enter a meeting ID or link</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <Label htmlFor="join-id" className="text-xs text-muted-foreground font-medium">
                                        Meeting ID or Link
                                    </Label>
                                    <Input
                                        id="join-id"
                                        value={joinId}
                                        onChange={(e) => {
                                            setJoinId(e.target.value);
                                            setJoinError("");
                                        }}
                                        onKeyDown={(e) => e.key === "Enter" && handleJoinMeeting()}
                                        placeholder="e.g. abcd-efgh-ijkl"
                                        className="mt-1.5 h-11 rounded-xl bg-background/50 border-white/[0.08] focus-visible:ring-[#ff9f43]/30"
                                    />
                                    {joinError && (
                                        <p className="text-xs text-red-400 mt-1.5">{joinError}</p>
                                    )}
                                </div>

                                <Button
                                    onClick={handleJoinMeeting}
                                    disabled={!joinId.trim()}
                                    variant="outline"
                                    className="w-full h-11 rounded-xl border-[#ff9f43]/30 text-[#ff9f43] hover:bg-[#ff9f43]/10 hover:border-[#ff9f43]/50 font-semibold transition-all duration-300"
                                >
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    Join Meeting
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Feature highlights */}
            <motion.div
                variants={staggerChildren}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
                {[
                    { icon: Video, label: "HD Video", sublabel: "Crystal clear" },
                    { icon: Users, label: "Up to 8", sublabel: "Participants" },
                    { icon: Link2, label: "Peer-to-Peer", sublabel: "Low latency" },
                    { icon: Sparkles, label: "Encrypted", sublabel: "End-to-end" },
                ].map((feature, i) => (
                    <motion.div
                        key={i}
                        variants={fadeUp}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-card/40 border border-white/[0.04] hover:border-white/[0.08] transition-all duration-300"
                    >
                        <feature.icon className="w-5 h-5 text-[#00d4ff]/70 flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground/80 truncate">{feature.label}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{feature.sublabel}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Recent Meetings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        Recent Meetings
                    </h2>
                </div>

                {isLoadingMeetings ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : meetings.length === 0 ? (
                    <div className="text-center py-12 rounded-2xl border border-dashed border-white/[0.06] bg-card/20">
                        <VideoOff className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">No meetings yet</p>
                        <p className="text-muted-foreground/60 text-xs mt-1">
                            Create your first meeting to get started
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {meetings.map((meeting, i) => (
                            <motion.div
                                key={meeting.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group flex items-center gap-4 px-5 py-4 rounded-xl bg-card/40 border border-white/[0.04] hover:border-white/[0.08] hover:bg-card/60 transition-all duration-300 cursor-pointer"
                                onClick={() => {
                                    if (meeting.status === "active") {
                                        router.push(`/ai-meeting/${meeting.id}`);
                                    }
                                }}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                    meeting.status === "active"
                                        ? "bg-emerald-500/10 border border-emerald-500/20"
                                        : "bg-white/[0.03] border border-white/[0.06]"
                                )}>
                                    <Video className={cn(
                                        "w-5 h-5",
                                        meeting.status === "active" ? "text-emerald-400" : "text-white/30"
                                    )} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium truncate">{meeting.title}</span>
                                        {meeting.status === "active" && (
                                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold uppercase">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                Live
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(meeting.createdAt)}
                                        </span>
                                        <span className="text-xs text-muted-foreground/50">
                                            ID: {meeting.id}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            copyMeetingLink(meeting.id);
                                        }}
                                        className="h-8 w-8 rounded-lg text-white/30 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        {copiedId === meeting.id ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                        )}
                                    </Button>

                                    {meeting.status === "active" && (
                                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
