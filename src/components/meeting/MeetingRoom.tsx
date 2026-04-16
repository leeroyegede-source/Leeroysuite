"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useWebRTC, type ChatMessage } from "@/hooks/useWebRTC";
import { useMediaDevices } from "@/hooks/useMediaDevices";
import { ParticipantTile } from "./ParticipantTile";
import { MeetingControls } from "./MeetingControls";
import { MeetingChat } from "./MeetingChat";
import { useAgent } from "@/hooks/useAgent";
import { AIParticipantTile } from "./AIParticipantTile";
import { MeetingTranscription } from "./MeetingTranscription";
import { TranscriptionMessage } from "@/hooks/useWebRTC";
import {
    Loader2, Copy, Check, Video, VideoOff,
    Mic, MicOff, Settings, Users, X, ExternalLink,
    AlertTriangle, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

interface MeetingRoomProps {
    meetingId: string;
}

type RoomState = "loading" | "prejoin" | "joining" | "connected" | "error";

export function MeetingRoom({ meetingId }: MeetingRoomProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [roomState, setRoomState] = useState<RoomState>("loading");
    const [meetingInfo, setMeetingInfo] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
    const [isTranscriptionOpen, setIsTranscriptionOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [transcriptionLogs, setTranscriptionLogs] = useState<TranscriptionMessage[]>([]);
    const [copied, setCopied] = useState(false);

    const agent = useAgent({
        isTranscriptionEnabled: isTranscriptionOpen,
        onFinalResult: (text) => {
            webrtc.sendTranscription(text);
        }
    });

    const localUserId = useRef(uuidv4()).current;
    const screenStreamRef = useRef<MediaStream | null>(null);
    const originalStreamRef = useRef<MediaStream | null>(null);

    const mediaDevices = useMediaDevices();

    const userName = user?.name || user?.email?.split("@")[0] || "Guest";

    // Fetch meeting info
    useEffect(() => {
        const fetchMeeting = async () => {
            try {
                const res = await fetch(`/api/meetings/${meetingId}`);
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Meeting not found");
                }
                const data = await res.json();
                if (data.meeting.status === "ended") {
                    throw new Error("This meeting has ended");
                }
                setMeetingInfo(data.meeting);
                setRoomState("prejoin");
            } catch (err: any) {
                setErrorMessage(err.message || "Failed to load meeting");
                setRoomState("error");
            }
        };
        fetchMeeting();
    }, [meetingId]);

    // Request permissions and start local preview
    const startPreview = useCallback(async () => {
        const granted = await mediaDevices.requestPermissions();
        if (granted) {
            try {
                const stream = await mediaDevices.getMediaStream();
                setLocalStream(stream);
                originalStreamRef.current = stream;
            } catch (err) {
                console.error("Failed to get media stream:", err);
            }
        }
    }, [mediaDevices]);

    useEffect(() => {
        if (roomState === "prejoin") {
            startPreview();
        }
    }, [roomState]);

    // WebRTC
    const handleChatMessage = useCallback((msg: ChatMessage) => {
        setChatMessages((prev) => [...prev, msg]);
    }, []);

    const webrtc = useWebRTC({
        meetingId,
        userId: localUserId,
        userName,
        localStream,
        enabled: roomState === "connected",
        onChatMessage: handleChatMessage,
        onTranscription: (msg) => {
            setTranscriptionLogs(prev => [...prev, msg]);
        }
    });

    // Join meeting
    const handleJoinMeeting = useCallback(async () => {
        setRoomState("joining");
        // Small delay to allow signaling to connect
        setTimeout(() => {
            setRoomState("connected");
        }, 500);
    }, []);

    // Leave meeting
    const handleLeaveMeeting = useCallback(() => {
        webrtc.leaveRoom();
        localStream?.getTracks().forEach((t) => t.stop());
        screenStreamRef.current?.getTracks().forEach((t) => t.stop());
        setLocalStream(null);
        router.push("/ai-meeting");
    }, [webrtc, localStream, router]);

    // Toggle mute
    const toggleMute = useCallback(() => {
        if (localStream) {
            localStream.getAudioTracks().forEach((t) => {
                t.enabled = isMuted;
            });
            setIsMuted(!isMuted);
            webrtc.broadcastMediaState(!isMuted ? false : true, !isVideoOff, isScreenSharing);
        }
    }, [localStream, isMuted, isVideoOff, isScreenSharing, webrtc]);

    // Toggle video
    const toggleVideo = useCallback(() => {
        if (localStream) {
            localStream.getVideoTracks().forEach((t) => {
                t.enabled = isVideoOff;
            });
            setIsVideoOff(!isVideoOff);
            webrtc.broadcastMediaState(!isMuted, isVideoOff ? true : false, isScreenSharing);
        }
    }, [localStream, isVideoOff, isMuted, isScreenSharing, webrtc]);

    // Screen share
    const toggleScreenShare = useCallback(async () => {
        if (isScreenSharing) {
            // Stop screen share, restore camera
            screenStreamRef.current?.getTracks().forEach((t) => t.stop());
            screenStreamRef.current = null;
            if (originalStreamRef.current) {
                setLocalStream(originalStreamRef.current);
            }
            setIsScreenSharing(false);
            webrtc.broadcastMediaState(!isMuted, !isVideoOff, false);
        } else {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: false,
                });
                screenStreamRef.current = screenStream;

                // Replace video track in local stream
                const newStream = new MediaStream();
                // Keep audio from original
                originalStreamRef.current?.getAudioTracks().forEach((t) => newStream.addTrack(t));
                // Add screen video
                screenStream.getVideoTracks().forEach((t) => newStream.addTrack(t));

                setLocalStream(newStream);
                setIsScreenSharing(true);
                webrtc.broadcastMediaState(!isMuted, !isVideoOff, true);

                // When user stops sharing via browser UI
                screenStream.getVideoTracks()[0].onended = () => {
                    screenStreamRef.current = null;
                    if (originalStreamRef.current) {
                        setLocalStream(originalStreamRef.current);
                    }
                    setIsScreenSharing(false);
                    webrtc.broadcastMediaState(!isMuted, !isVideoOff, false);
                };
            } catch (err) {
                console.error("Screen share failed:", err);
            }
        }
    }, [isScreenSharing]);

    // Fullscreen
    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }, []);

    // Copy meeting link
    const copyMeetingLink = useCallback(() => {
        const link = `${window.location.origin}/ai-meeting/${meetingId}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [meetingId]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            localStream?.getTracks().forEach((t) => t.stop());
            screenStreamRef.current?.getTracks().forEach((t) => t.stop());
        };
    }, []);

    const participantCount = webrtc.peers.size + 1 + (agent.isActive ? 1 : 0);

    // Calculate grid layout based on participant count
    const getGridClass = () => {
        const total = participantCount;
        if (total <= 1) return "grid-cols-1 max-w-4xl mx-auto";
        if (total === 2) return "grid-cols-2 max-w-7xl mx-auto";
        if (total <= 4) return "grid-cols-2 max-w-[1600px] mx-auto";
        if (total <= 6) return "grid-cols-3 max-w-[1800px] mx-auto";
        return "grid-cols-3 lg:grid-cols-4";
    };

    // ==================== RENDER ====================

    // Error state
    if (roomState === "error") {
        return (
            <div className="min-h-screen dark:bg-[#0a0a0f] bg-background flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full text-center space-y-6"
                >
                    <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto border border-red-500/20">
                        <AlertTriangle className="w-10 h-10 text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Unable to Join</h2>
                        <p className="text-white/50">{errorMessage}</p>
                    </div>
                    <div className="flex gap-3 justify-center">
                        <Button
                            onClick={() => router.push("/ai-meeting")}
                            className="bg-white/10 hover:bg-white/15 text-white border border-white/10"
                        >
                            Back to Lobby
                        </Button>
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Loading state
    if (roomState === "loading") {
        return (
            <div className="min-h-screen dark:bg-[#0a0a0f] bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-[#00d4ff] animate-spin" />
                    <span className="text-white/50 text-sm">Loading meeting...</span>
                </div>
            </div>
        );
    }

    // Pre-join screen
    if (roomState === "prejoin" || roomState === "joining") {
        return (
            <div className="min-h-screen dark:bg-[#0a0a0f] bg-background flex items-center justify-center p-6">
                {/* Ambient glow */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00d4ff]/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7c3aed]/5 rounded-full blur-[120px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative max-w-2xl w-full space-y-6"
                >
                    {/* Meeting title */}
                    <div className="text-center">
                        <h1 className="text-2xl font-bold dark:text-white text-foreground mb-1">
                            {meetingInfo?.title || "Untitled Meeting"}
                        </h1>
                        <p className="text-white/40 text-sm">
                            Meeting ID: {meetingId}
                        </p>
                    </div>

                    {/* Video preview */}
                    <div className="relative aspect-video rounded-2xl overflow-hidden dark:bg-[#12121a] bg-muted border border-border dark:border-white/[0.06]">
                        {localStream && !isVideoOff ? (
                            <video
                                ref={(el) => {
                                    if (el) el.srcObject = localStream;
                                }}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover transform -scale-x-100"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00d4ff]/20 to-[#7c3aed]/20 flex items-center justify-center border-2 border-white/10">
                                    <span className="text-3xl font-bold text-white/60">
                                        {userName.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Preview controls */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleMute}
                                className={cn(
                                    "h-11 w-11 rounded-xl backdrop-blur-md border border-border dark:border-white/10",
                                    isMuted ? "bg-red-500/20 text-red-400" : "dark:bg-black/40 bg-background/80 dark:text-white text-foreground"
                                )}
                            >
                                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleVideo}
                                className={cn(
                                    "h-11 w-11 rounded-xl backdrop-blur-md border border-border dark:border-white/10",
                                    isVideoOff ? "bg-red-500/20 text-red-400" : "dark:bg-black/40 bg-background/80 dark:text-white text-foreground"
                                )}
                            >
                                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>

                    {/* Join button */}
                    <div className="flex flex-col items-center gap-3">
                        <Button
                            onClick={handleJoinMeeting}
                            disabled={roomState === "joining"}
                            size="lg"
                            className="w-full max-w-xs h-12 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0099cc] hover:from-[#00bde6] hover:to-[#008ab8] text-black font-bold text-base transition-all duration-300 shadow-lg shadow-[#00d4ff]/20 hover:shadow-[#00d4ff]/30"
                        >
                            {roomState === "joining" ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <Video className="w-5 h-5 mr-2" />
                            )}
                            {roomState === "joining" ? "Joining..." : "Join Meeting"}
                        </Button>

                        <p className="text-white/30 text-xs">
                            Joining as <span className="text-white/50 font-medium">{userName}</span>
                        </p>
                    </div>

                    {/* Permission error */}
                    {mediaDevices.permissionError && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm text-center"
                        >
                            {mediaDevices.permissionError}
                        </motion.div>
                    )}
                </motion.div>
            </div>
        );
    }

    // Connected / In-meeting view
    return (
        <div className="fixed inset-0 dark:bg-[#0a0a0f] bg-background flex flex-col z-[100]">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border dark:border-white/[0.06] dark:bg-[#0a0a0f]/80 bg-background/90 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-sm font-medium dark:text-white/80 text-foreground/80">
                            {meetingInfo?.title || "Meeting"}
                        </span>
                    </div>
                    <span className="text-xs dark:text-white/30 text-muted-foreground">|</span>
                    <span className="text-xs dark:text-white/40 text-muted-foreground">{meetingId}</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyMeetingLink}
                        className="h-8 text-xs dark:text-white/50 text-muted-foreground hover:text-foreground dark:hover:text-white dark:hover:bg-white/10 hover:bg-foreground/10 rounded-lg"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                        {copied ? "Copied!" : "Invite"}
                    </Button>
                </div>
            </div>

            {/* Video grid */}
            <div className="flex-1 p-4 pb-24 overflow-hidden">
                {(() => {
                    const remoteScreenShare = Array.from(webrtc.peers.values()).find(p => p.isScreenSharing);
                    const activeScreenShare = isScreenSharing
                        ? { id: 'local', name: userName, stream: localStream, isLocal: true }
                        : remoteScreenShare
                            ? { id: remoteScreenShare.id, name: remoteScreenShare.name, stream: remoteScreenShare.stream, isLocal: false }
                            : null;

                    if (activeScreenShare) {
                        return (
                            <div className="flex flex-col lg:flex-row gap-4 h-full">
                                {/* Left Sidebar - Thumbnails */}
                                <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto w-full lg:w-64 pb-2 lg:pb-0 pr-2 custom-scrollbar">
                                    {/* Local participant thumbnail (if not sharing) */}
                                    {!isScreenSharing && (
                                        <div className="flex-shrink-0 lg:w-full">
                                            <ParticipantTile
                                                name={userName}
                                                stream={localStream}
                                                isLocal
                                                isMuted={isMuted}
                                                isVideoOff={isVideoOff}
                                                className="w-48 lg:w-full"
                                            />
                                        </div>
                                    )}

                                    {/* AI Agent Participant */}
                                    {agent.isActive && (
                                        <div className="flex-shrink-0 lg:w-full">
                                            <AIParticipantTile
                                                status={agent.status}
                                                transcript={agent.transcript}
                                                className="w-48 lg:w-full"
                                            />
                                        </div>
                                    )}

                                    {/* Remote participants (only those not sharing) */}
                                    {Array.from(webrtc.peers.values())
                                        .filter(p => p.id !== activeScreenShare.id)
                                        .map((peer) => (
                                            <div key={peer.id} className="flex-shrink-0 lg:w-full">
                                                <ParticipantTile
                                                    name={peer.name}
                                                    stream={peer.stream}
                                                    isMuted={!peer.audioEnabled}
                                                    isVideoOff={!peer.videoEnabled}
                                                    className="w-48 lg:w-full"
                                                />
                                            </div>
                                        ))}
                                </div>

                                {/* Main area - Shared Screen */}
                                <div className="flex-1 h-full min-h-0">
                                    <ParticipantTile
                                        name={activeScreenShare.name}
                                        stream={activeScreenShare.stream}
                                        isLocal={activeScreenShare.isLocal}
                                        isMuted={activeScreenShare.isLocal ? isMuted : false} // Correctly handle mute state
                                        isVideoOff={false}
                                        isScreenShare
                                        className="w-full h-full"
                                    />
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div className={cn("grid gap-4 h-full auto-rows-fr items-center content-center", getGridClass())}>
                            {/* Local participant */}
                            <ParticipantTile
                                name={userName}
                                stream={localStream}
                                isLocal
                                isMuted={isMuted}
                                isVideoOff={isVideoOff}
                            />

                            {/* AI Agent Participant */}
                            {agent.isActive && (
                                <AnimatePresence mode="popLayout">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="w-full h-full min-h-[200px]"
                                    >
                                        <AIParticipantTile
                                            status={agent.status}
                                            transcript={agent.transcript}
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            )}

                            {/* Remote participants */}
                            <AnimatePresence>
                                {Array.from(webrtc.peers.values()).map((peer) => (
                                    <ParticipantTile
                                        key={peer.id}
                                        name={peer.name}
                                        stream={peer.stream}
                                        isMuted={!peer.audioEnabled}
                                        isVideoOff={!peer.videoEnabled}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    );
                })()}
            </div>

            {/* Controls */}
            <MeetingControls
                isMuted={isMuted}
                isVideoOff={isVideoOff}
                isScreenSharing={isScreenSharing}
                isChatOpen={isChatOpen}
                isParticipantsOpen={isParticipantsOpen}
                isTranscriptionOpen={isTranscriptionOpen}
                isFullscreen={isFullscreen}
                isAgentActive={agent.isActive}
                participantCount={participantCount}
                onToggleMute={toggleMute}
                onToggleVideo={toggleVideo}
                onToggleScreenShare={toggleScreenShare}
                onToggleChat={() => {
                    setIsChatOpen(!isChatOpen);
                    setIsTranscriptionOpen(false);
                    setIsParticipantsOpen(false);
                }}
                onToggleParticipants={() => {
                    setIsParticipantsOpen(!isParticipantsOpen);
                    setIsChatOpen(false);
                    setIsTranscriptionOpen(false);
                }}
                onToggleTranscription={() => {
                    setIsTranscriptionOpen(!isTranscriptionOpen);
                    setIsChatOpen(false);
                    setIsParticipantsOpen(false);
                }}
                onToggleAgent={agent.toggleAgent}
                onToggleFullscreen={toggleFullscreen}
                onLeaveMeeting={handleLeaveMeeting}
            />

            {/* Chat panel */}
            <AnimatePresence>
                {isChatOpen && (
                    <MeetingChat
                        messages={chatMessages}
                        onSendMessage={webrtc.sendChatMessage}
                        onClose={() => setIsChatOpen(false)}
                        currentUserId={localUserId}
                    />
                )}
            </AnimatePresence>

            {/* Transcription panel */}
            <AnimatePresence>
                {isTranscriptionOpen && (
                    <MeetingTranscription
                        transcripts={transcriptionLogs}
                        onClose={() => setIsTranscriptionOpen(false)}
                        currentUserId={localUserId}
                    />
                )}
            </AnimatePresence>

            {/* Participants panel */}
            <AnimatePresence>
                {isParticipantsOpen && (
                    <motion.div
                        initial={{ x: 320, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 320, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className={cn(
                            "fixed top-4 bottom-24 w-72 z-40 flex flex-col rounded-2xl overflow-hidden",
                            "dark:bg-[#0d0d16]/95 bg-card/95 backdrop-blur-2xl border border-border dark:border-white/[0.08] shadow-2xl",
                            isChatOpen ? "right-[340px]" : "right-4"
                        )}
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-white/[0.06]">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-[#00d4ff]" />
                                <span className="text-sm font-semibold dark:text-white text-foreground">
                                    Participants ({participantCount})
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsParticipantsOpen(false)}
                                className="h-7 w-7 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-1">
                            {/* Self */}
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03]">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4ff]/20 to-[#7c3aed]/20 flex items-center justify-center border border-border dark:border-white/10">
                                    <span className="text-xs font-bold dark:text-white/70 text-foreground/70">
                                        {userName.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm dark:text-white/80 text-foreground/80 font-medium truncate block">
                                        {userName} <span className="dark:text-white/30 text-muted-foreground">(You)</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {isMuted ? (
                                        <MicOff className="w-3.5 h-3.5 text-red-400" />
                                    ) : (
                                        <Mic className="w-3.5 h-3.5 text-white/40" />
                                    )}
                                </div>
                            </div>

                            {/* Remote peers */}
                            {Array.from(webrtc.peers.values()).map((peer) => (
                                <div key={peer.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/5 dark:hover:bg-white/[0.03] transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff9f43]/20 to-[#ee5a24]/20 flex items-center justify-center border border-border dark:border-white/10">
                                        <span className="text-xs font-bold dark:text-white/70 text-foreground">
                                            {peer.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm dark:text-white/80 text-foreground font-medium truncate block">
                                            {peer.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {!peer.audioEnabled ? (
                                            <MicOff className="w-3.5 h-3.5 text-red-400" />
                                        ) : (
                                            <Mic className="w-3.5 h-3.5 text-white/40" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
