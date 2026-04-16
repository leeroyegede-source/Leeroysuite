"use client";

import { motion } from "framer-motion";
import {
    Mic, MicOff, Video, VideoOff, MonitorUp,
    MessageSquare, PhoneOff, Settings, Users,
    Maximize, Minimize, MoreVertical, Bot, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MeetingControlsProps {
    isMuted: boolean;
    isVideoOff: boolean;
    isScreenSharing: boolean;
    isChatOpen: boolean;
    isParticipantsOpen: boolean;
    isFullscreen: boolean;
    isAgentActive?: boolean;
    isTranscriptionOpen?: boolean;
    participantCount: number;
    onToggleMute: () => void;
    onToggleVideo: () => void;
    onToggleScreenShare: () => void;
    onToggleChat: () => void;
    onToggleParticipants: () => void;
    onToggleAgent?: () => void;
    onToggleTranscription?: () => void;
    onToggleFullscreen: () => void;
    onLeaveMeeting: () => void;
}

export function MeetingControls({
    isMuted,
    isVideoOff,
    isScreenSharing,
    isChatOpen,
    isParticipantsOpen,
    isFullscreen,
    isAgentActive = false,
    isTranscriptionOpen = false,
    participantCount,
    onToggleMute,
    onToggleVideo,
    onToggleScreenShare,
    onToggleChat,
    onToggleParticipants,
    onToggleAgent,
    onToggleTranscription,
    onToggleFullscreen,
    onLeaveMeeting,
}: MeetingControlsProps) {
    return (
        <motion.div
            initial={{ y: 100, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 left-1/2 z-50"
        >
            <div className="flex items-center gap-0.5 sm:gap-2 px-1.5 sm:px-4 py-1.5 sm:py-3 rounded-xl sm:rounded-2xl dark:bg-[#0a0a12]/90 bg-card/90 backdrop-blur-2xl border border-border dark:border-white/[0.08] shadow-2xl dark:shadow-black/40 shadow-black/10 max-w-[95vw]">
                <TooltipProvider delayDuration={200}>
                    {/* Microphone */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                id="control-mute"
                                variant="ghost"
                                size="icon"
                                onClick={onToggleMute}
                                className={cn(
                                    "relative h-9 w-9 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl transition-all duration-200",
                                    isMuted
                                        ? "bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400"
                                        : "dark:hover:bg-white/10 hover:bg-foreground/10 dark:text-white/80 text-foreground/80 dark:hover:text-white hover:text-foreground"
                                )}
                            >
                                {isMuted ? (
                                    <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
                                ) : (
                                    <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="dark:bg-[#1a1a2e] bg-popover dark:border-white/10 border-border dark:text-white text-popover-foreground">
                            {isMuted ? "Unmute" : "Mute"}
                        </TooltipContent>
                    </Tooltip>

                    {/* Camera */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                id="control-video"
                                variant="ghost"
                                size="icon"
                                onClick={onToggleVideo}
                                className={cn(
                                    "relative h-9 w-9 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl transition-all duration-200",
                                    isVideoOff
                                        ? "bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400"
                                        : "dark:hover:bg-white/10 hover:bg-foreground/10 dark:text-white/80 text-foreground/80 dark:hover:text-white hover:text-foreground"
                                )}
                            >
                                {isVideoOff ? (
                                    <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" />
                                ) : (
                                    <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="dark:bg-[#1a1a2e] bg-popover dark:border-white/10 border-border dark:text-white text-popover-foreground">
                            {isVideoOff ? "Turn on camera" : "Turn off camera"}
                        </TooltipContent>
                    </Tooltip>

                    {/* Desktop-only Secondary Actions */}
                    <div className="hidden sm:flex items-center gap-1 sm:gap-2">
                        {/* Screen Share */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    id="control-share"
                                    variant="ghost"
                                    size="icon"
                                    onClick={onToggleScreenShare}
                                    className={cn(
                                        "relative h-12 w-12 rounded-xl transition-all duration-200",
                                        isScreenSharing
                                            ? "bg-[#00d4ff]/20 hover:bg-[#00d4ff]/30 text-[#00d4ff]"
                                            : "dark:hover:bg-white/10 hover:bg-foreground/10 dark:text-white/80 text-foreground/80 dark:hover:text-white hover:text-foreground"
                                    )}
                                >
                                    <MonitorUp className="w-5 h-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="dark:bg-[#1a1a2e] bg-popover dark:border-white/10 border-border dark:text-white text-popover-foreground">
                                {isScreenSharing ? "Stop sharing" : "Share screen"}
                            </TooltipContent>
                        </Tooltip>

                        {/* Agent Mode */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    id="control-agent"
                                    variant="ghost"
                                    size="icon"
                                    onClick={onToggleAgent}
                                    className={cn(
                                        "relative h-12 w-12 rounded-xl transition-all duration-200",
                                        isAgentActive
                                            ? "bg-gradient-to-r from-[#00d4ff]/30 to-[#3b82f6]/30 text-[#00d4ff] shadow-lg shadow-[#00d4ff]/20"
                                            : "dark:hover:bg-white/10 hover:bg-foreground/10 dark:text-white/80 text-foreground/80 dark:hover:text-white hover:text-foreground"
                                    )}
                                >
                                    <Bot className={cn("w-5 h-5", isAgentActive && "animate-pulse")} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="dark:bg-[#1a1a2e] bg-popover dark:border-white/10 border-border dark:text-white text-popover-foreground">
                                {isAgentActive ? "Turn off Agent" : "Agent Mode"}
                            </TooltipContent>
                        </Tooltip>

                        {/* Transcription */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    id="control-transcription"
                                    variant="ghost"
                                    size="icon"
                                    onClick={onToggleTranscription}
                                    className={cn(
                                        "relative h-12 w-12 rounded-xl transition-all duration-200",
                                        isTranscriptionOpen
                                            ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10"
                                            : "dark:hover:bg-white/10 hover:bg-foreground/10 dark:text-white/80 text-foreground/80 dark:hover:text-white hover:text-foreground"
                                    )}
                                >
                                    <FileText className={cn("w-5 h-5")} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="dark:bg-[#1a1a2e] bg-popover dark:border-white/10 border-border dark:text-white text-popover-foreground">
                                {isTranscriptionOpen ? "Hide Transcription" : "Transcription"}
                            </TooltipContent>
                        </Tooltip>

                        {/* Fullscreen */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onToggleFullscreen}
                                    className="h-12 w-12 rounded-xl dark:hover:bg-white/10 hover:bg-foreground/10 dark:text-white/80 text-foreground/80 dark:hover:text-white hover:text-foreground transition-all duration-200"
                                >
                                    {isFullscreen ? (
                                        <Minimize className="w-5 h-5" />
                                    ) : (
                                        <Maximize className="w-5 h-5" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="dark:bg-[#1a1a2e] bg-popover dark:border-white/10 border-border dark:text-white text-popover-foreground">
                                {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    {/* Divider (Desktop Only) */}
                    <div className="hidden sm:block w-px h-8 dark:bg-white/10 bg-border mx-1" />

                    {/* Participants */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                id="control-participants"
                                variant="ghost"
                                size="icon"
                                onClick={onToggleParticipants}
                                className={cn(
                                    "relative h-9 w-9 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl transition-all duration-200",
                                    isParticipantsOpen
                                        ? "dark:bg-white/10 bg-accent dark:text-white text-accent-foreground"
                                        : "dark:hover:bg-white/10 hover:bg-foreground/10 dark:text-white/80 text-foreground/80 dark:hover:text-white hover:text-foreground"
                                )}
                            >
                                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                                {participantCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] sm:min-w-[18px] sm:h-[18px] rounded-full bg-[#00d4ff] text-[8px] sm:text-[10px] font-bold text-black flex items-center justify-center px-1">
                                        {participantCount}
                                    </span>
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="dark:bg-[#1a1a2e] bg-popover dark:border-white/10 border-border dark:text-white text-popover-foreground">
                            Participants
                        </TooltipContent>
                    </Tooltip>

                    {/* Chat */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                id="control-chat"
                                variant="ghost"
                                size="icon"
                                onClick={onToggleChat}
                                className={cn(
                                    "relative h-9 w-9 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl transition-all duration-200",
                                    isChatOpen
                                        ? "dark:bg-white/10 bg-accent dark:text-white text-accent-foreground"
                                        : "dark:hover:bg-white/10 hover:bg-foreground/10 dark:text-white/80 text-foreground/80 dark:hover:text-white hover:text-foreground"
                                )}
                            >
                                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="dark:bg-[#1a1a2e] bg-popover dark:border-white/10 border-border dark:text-white text-popover-foreground">
                            Chat
                        </TooltipContent>
                    </Tooltip>

                    {/* Mobile "More" Menu */}
                    <div className="flex sm:hidden">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    id="control-more"
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-lg dark:hover:bg-white/10 hover:bg-foreground/10 dark:text-white/80 text-foreground/80 transition-all duration-200"
                                >
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                                side="top" 
                                align="end" 
                                sideOffset={12}
                                className="dark:bg-[#0a0a0f]/95 bg-card/95 backdrop-blur-xl border-border dark:border-white/10 min-w-[180px] p-2 space-y-1 z-[100]"
                            >
                                <DropdownMenuItem onClick={onToggleScreenShare} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm dark:text-white/80 text-foreground/80 focus:bg-[#00d4ff]/10 focus:text-[#00d4ff]">
                                    <MonitorUp className="w-4 h-4" />
                                    <span>{isScreenSharing ? "Stop sharing" : "Share screen"}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onToggleAgent} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm dark:text-white/80 text-foreground/80 focus:bg-[#00d4ff]/10 focus:text-[#00d4ff]">
                                    <Bot className="w-4 h-4" />
                                    <span>{isAgentActive ? "Turn off Agent" : "Agent Mode"}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onToggleTranscription} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm dark:text-white/80 text-foreground/80 focus:bg-[#00d4ff]/10 focus:text-[#00d4ff]">
                                    <FileText className="w-4 h-4" />
                                    <span>{isTranscriptionOpen ? "Hide Transcription" : "Transcription"}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onToggleFullscreen} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm dark:text-white/80 text-foreground/80 focus:bg-[#00d4ff]/10 focus:text-[#00d4ff]">
                                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                                    <span>{isFullscreen ? "Exit fullscreen" : "Fullscreen"}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Divider (Desktop Only) */}
                    <div className="hidden sm:block w-px h-8 dark:bg-white/10 bg-border mx-1" />

                    {/* Leave */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                id="control-leave"
                                onClick={onLeaveMeeting}
                                className="h-9 sm:h-12 px-3 sm:px-5 rounded-lg sm:rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-red-500/25"
                            >
                                <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                                <span className="hidden sm:inline">Leave</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="dark:bg-[#1a1a2e] bg-popover dark:border-white/10 border-border dark:text-white text-popover-foreground">
                            Leave meeting
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </motion.div>
    );
}
