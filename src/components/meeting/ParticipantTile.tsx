"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, VideoOff, User, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParticipantTileProps {
    name: string;
    stream: MediaStream | null;
    isLocal?: boolean;
    isMuted?: boolean;
    isVideoOff?: boolean;
    isSpeaking?: boolean;
    isScreenShare?: boolean;
    className?: string;
}

export function ParticipantTile({
    name,
    stream,
    isLocal = false,
    isMuted = false,
    isVideoOff = false,
    isSpeaking = false,
    isScreenShare = false,
    className,
}: ParticipantTileProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [audioLevel, setAudioLevel] = useState(0);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    // Simple audio level detection for speaking indicator
    useEffect(() => {
        if (!stream || isMuted) {
            setAudioLevel(0);
            return;
        }

        const audioTrack = stream.getAudioTracks()[0];
        if (!audioTrack) return;

        try {
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.3;
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            let animationId: number;

            const checkLevel = () => {
                analyser.getByteFrequencyData(dataArray);
                const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                setAudioLevel(avg / 128);
                animationId = requestAnimationFrame(checkLevel);
            };

            checkLevel();

            return () => {
                cancelAnimationFrame(animationId);
                audioContext.close();
            };
        } catch {
            // AudioContext might not be available
        }
    }, [stream, isMuted]);

    const hasVideo = stream && stream.getVideoTracks().length > 0 && !isVideoOff;
    const speakingIntensity = Math.min(audioLevel * 3, 1);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
                "relative rounded-2xl overflow-hidden group transition-all duration-300",
                "bg-gradient-to-br dark:from-[#12121a] dark:to-[#1a1a2e] from-background to-muted",
                "border border-border dark:border-white/[0.06]",
                "aspect-video w-full",
                speakingIntensity > 0.15 && !isScreenShare && "ring-2 ring-[#00d4ff]/60 shadow-lg shadow-[#00d4ff]/20",
                className
            )}
            style={{
                boxShadow: speakingIntensity > 0.15
                    ? `0 0 ${20 + speakingIntensity * 30}px rgba(0, 212, 255, ${speakingIntensity * 0.4})`
                    : undefined,
            }}
        >
            {/* Video */}
            {hasVideo ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={isLocal}
                    className={cn(
                        "w-full h-full object-cover",
                        isLocal && "transform -scale-x-100"
                    )}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br dark:from-[#0f0f1a] dark:to-[#1a1a2e] from-muted/50 to-muted border-border border">
                    <div className="relative">
                        {/* Avatar circle */}
                        <div
                            className={cn(
                                "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
                                "bg-gradient-to-br from-[#00d4ff]/20 to-[#7c3aed]/20",
                                "border-2 border-white/10",
                                speakingIntensity > 0.15 && "border-[#00d4ff]/50 scale-110"
                            )}
                        >
                            <User className="w-10 h-10 dark:text-white/50 text-foreground/50" />
                        </div>
                        {/* Speaking animation rings */}
                        {speakingIntensity > 0.15 && (
                            <>
                                <div className="absolute inset-0 rounded-full border-2 border-[#00d4ff]/30 animate-ping" />
                                <div className="absolute -inset-2 rounded-full border border-[#00d4ff]/15 animate-pulse" />
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Gradient overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Name badge */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg dark:bg-black/50 bg-background/80 backdrop-blur-md border border-border dark:border-white/10">
                    {isMuted ? (
                        <MicOff className="w-3 h-3 text-red-400" />
                    ) : (
                        <Mic className={cn(
                            "w-3 h-3 transition-colors",
                            speakingIntensity > 0.15 ? "text-[#00d4ff]" : "dark:text-white/60 text-foreground/60"
                        )} />
                    )}
                    <span className="text-xs font-medium dark:text-white/90 text-foreground/90 max-w-[120px] truncate">
                        {isLocal ? `${name} (You)` : name}
                    </span>
                </div>
            </div>

            {/* Camera off indicator */}
            {isVideoOff && (
                <div className="absolute top-3 right-3">
                    <div className="p-1.5 rounded-lg bg-red-500/20 backdrop-blur-sm border border-red-500/30">
                        <VideoOff className="w-3.5 h-3.5 text-red-400" />
                    </div>
                </div>
            )}

            {/* Hidden audio element for remote streams */}
            {!isLocal && stream && (
                <audio
                    ref={(el) => { if (el) el.srcObject = stream; }}
                    autoPlay
                    className="hidden"
                />
            )}
        </motion.div>
    );
}
