"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface SignalingMessage {
    type: "offer" | "answer" | "ice-candidate" | "join" | "leave" | "chat" | "media-state";
    from: string;
    to?: string;
    payload: any;
    timestamp: number;
}

interface UseSignalingOptions {
    meetingId: string;
    userId: string;
    userName: string;
    onMessage: (message: SignalingMessage) => void;
    enabled?: boolean;
}

export function useSignaling({ meetingId, userId, userName, onMessage, enabled = true }: UseSignalingOptions) {
    const channelRef = useRef<RealtimeChannel | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [participants, setParticipants] = useState<Map<string, { name: string; joinedAt: number }>>(new Map());
    const onMessageRef = useRef(onMessage);
    onMessageRef.current = onMessage;

    const sendMessage = useCallback((message: Omit<SignalingMessage, "from" | "timestamp">) => {
        if (!channelRef.current) return;

        const fullMessage: SignalingMessage = {
            ...message,
            from: userId,
            timestamp: Date.now(),
        };

        channelRef.current.send({
            type: "broadcast",
            event: "signal",
            payload: fullMessage,
        });
    }, [userId]);

    const joinRoom = useCallback(() => {
        sendMessage({
            type: "join",
            payload: { name: userName },
        });
    }, [sendMessage, userName]);

    const leaveRoom = useCallback(() => {
        sendMessage({
            type: "leave",
            payload: { name: userName },
        });
    }, [sendMessage, userName]);

    useEffect(() => {
        if (!enabled || !meetingId || !userId) return;

        const channelName = `meeting:${meetingId}`;

        const channel = supabase.channel(channelName, {
            config: {
                broadcast: { self: false },
                presence: { key: userId },
            },
        });

        channel
            .on("broadcast", { event: "signal" }, ({ payload }) => {
                const message = payload as SignalingMessage;
                // Ignore own messages and messages not meant for us
                if (message.from === userId) return;
                if (message.to && message.to !== userId) return;
                onMessageRef.current(message);
            })
            .on("presence", { event: "sync" }, () => {
                const state = channel.presenceState();
                const newParticipants = new Map<string, { name: string; joinedAt: number }>();
                
                Object.entries(state).forEach(([key, presences]) => {
                    if (presences && presences.length > 0) {
                        const p = presences[0] as any;
                        newParticipants.set(key, {
                            name: p.name || "Unknown",
                            joinedAt: p.joinedAt || Date.now(),
                        });
                    }
                });

                setParticipants(newParticipants);
            })
            .on("presence", { event: "join" }, ({ key, newPresences }) => {
                if (key !== userId && newPresences.length > 0) {
                    onMessageRef.current({
                        type: "join",
                        from: key,
                        payload: { name: (newPresences[0] as any).name },
                        timestamp: Date.now(),
                    });
                }
            })
            .on("presence", { event: "leave" }, ({ key }) => {
                if (key !== userId) {
                    onMessageRef.current({
                        type: "leave",
                        from: key,
                        payload: {},
                        timestamp: Date.now(),
                    });
                }
            })
            .subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    setIsConnected(true);
                    await channel.track({
                        name: userName,
                        joinedAt: Date.now(),
                    });
                }
            });

        channelRef.current = channel;

        return () => {
            channel.untrack();
            supabase.removeChannel(channel);
            channelRef.current = null;
            setIsConnected(false);
        };
    }, [meetingId, userId, userName, enabled]);

    return {
        sendMessage,
        joinRoom,
        leaveRoom,
        isConnected,
        participants,
    };
}
