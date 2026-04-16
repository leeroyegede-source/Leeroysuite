"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSignaling, type SignalingMessage } from "./useSignaling";

const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun.l.google.com:19305" },
        { urls: "stun:stun.services.mozilla.com" },
        { urls: "stun:stun.cloudflare.com:3478" }
    ],
};

export interface RemotePeer {
    id: string;
    name: string;
    stream: MediaStream | null;
    connection: RTCPeerConnection;
    dataChannel: RTCDataChannel | null;
    audioEnabled: boolean;
    videoEnabled: boolean;
    isScreenSharing: boolean;
}

export interface ChatMessage {
    id: string;
    from: string;
    fromName: string;
    text: string;
    timestamp: number;
}

export interface TranscriptionMessage {
    id: string;
    from: string;
    fromName: string;
    text: string;
    timestamp: number;
}

interface UseWebRTCOptions {
    meetingId: string;
    userId: string;
    userName: string;
    localStream: MediaStream | null;
    enabled?: boolean;
    onChatMessage?: (message: ChatMessage) => void;
    onTranscription?: (message: TranscriptionMessage) => void;
}

export function useWebRTC({
    meetingId,
    userId,
    userName,
    localStream,
    enabled = true,
    onChatMessage,
    onTranscription,
}: UseWebRTCOptions) {
    const [peers, setPeers] = useState<Map<string, RemotePeer>>(new Map());
    const peersRef = useRef<Map<string, RemotePeer>>(new Map());
    const localStreamRef = useRef<MediaStream | null>(null);
    const onChatMessageRef = useRef(onChatMessage);
    onChatMessageRef.current = onChatMessage;
    const onTranscriptionRef = useRef(onTranscription);
    onTranscriptionRef.current = onTranscription;
    const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

    // Keep localStreamRef in sync
    useEffect(() => {
        localStreamRef.current = localStream;
    }, [localStream]);

    const updatePeers = useCallback(() => {
        setPeers(new Map(peersRef.current));
    }, []);

    const createPeerConnection = useCallback((remoteId: string, remoteName: string): RTCPeerConnection => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        // Add local tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current!);
            });
        }

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                signaling.sendMessage({
                    type: "ice-candidate",
                    to: remoteId,
                    payload: event.candidate.toJSON(),
                });
            }
        };

        // Handle remote tracks
        pc.ontrack = (event) => {
            const peer = peersRef.current.get(remoteId);
            if (peer) {
                peer.stream = event.streams[0] || new MediaStream([event.track]);
                updatePeers();
            }
        };

        pc.oniceconnectionstatechange = () => {
            if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
                console.warn(`Peer ${remoteId} ICE state: ${pc.iceConnectionState}`);
                if (pc.iceConnectionState === "failed") {
                    // Attempt to restart ICE by creating a new offer
                    pc.restartIce();
                    pc.createOffer().then(offer => {
                        return pc.setLocalDescription(offer);
                    }).then(() => {
                        signaling.sendMessage({
                            type: "offer",
                            to: remoteId,
                            payload: {
                                sdp: pc.localDescription,
                                name: userName,
                                isRestart: true
                            },
                        });
                    }).catch(console.error);
                }
            }
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === "failed" || pc.connectionState === "closed") {
                removePeer(remoteId);
            }
        };

        return pc;
    }, [updatePeers]);

    const setupDataChannel = useCallback((channel: RTCDataChannel, peerId: string) => {
        channel.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "chat") {
                    onChatMessageRef.current?.({
                        id: `${peerId}-${Date.now()}`,
                        from: peerId,
                        fromName: data.fromName || "Unknown",
                        text: data.text,
                        timestamp: data.timestamp || Date.now(),
                    });
                } else if (data.type === "transcription") {
                    onTranscriptionRef.current?.({
                        id: `${peerId}-${Date.now()}`,
                        from: peerId,
                        fromName: data.fromName || "Unknown",
                        text: data.text,
                        timestamp: data.timestamp || Date.now(),
                    });
                } else if (data.type === "media-state") {
                    const peer = peersRef.current.get(peerId);
                    if (peer) {
                        if (data.audioEnabled !== undefined) peer.audioEnabled = data.audioEnabled;
                        if (data.videoEnabled !== undefined) peer.videoEnabled = data.videoEnabled;
                        if (data.isScreenSharing !== undefined) peer.isScreenSharing = data.isScreenSharing;
                        updatePeers();
                    }
                }
            } catch (err) {
                console.error("Failed to parse data channel message:", err);
            }
        };

        channel.onopen = () => {
            const peer = peersRef.current.get(peerId);
            if (peer) {
                peer.dataChannel = channel;
                updatePeers();
            }
        };
    }, [updatePeers]);

    const removePeer = useCallback((peerId: string) => {
        const peer = peersRef.current.get(peerId);
        if (peer) {
            peer.connection.close();
            peer.dataChannel?.close();
            peer.stream?.getTracks().forEach(t => t.stop());
            peersRef.current.delete(peerId);
            pendingCandidatesRef.current.delete(peerId);
            updatePeers();
        }
    }, [updatePeers]);

    const handleSignalingMessage = useCallback(async (message: SignalingMessage) => {
        const { type, from, payload } = message;

        switch (type) {
            case "join": {
                // Prevent WebRTC glare by enforcing the peer with the higher ID to always be the caller.
                if (userId < from) {
                    // We are the callee, we wait for their offer.
                    return;
                }

                // New participant joined — create offer
                const pc = createPeerConnection(from, payload.name || "Unknown");

                // Create data channel (only the offerer creates it)
                const dc = pc.createDataChannel("meeting-data", { ordered: true });
                setupDataChannel(dc, from);

                peersRef.current.set(from, {
                    id: from,
                    name: payload.name || "Unknown",
                    stream: null,
                    connection: pc,
                    dataChannel: null,
                    audioEnabled: true,
                    videoEnabled: true,
                    isScreenSharing: false,
                });
                updatePeers();

                try {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);

                    signaling.sendMessage({
                        type: "offer",
                        to: from,
                        payload: {
                            sdp: pc.localDescription,
                            name: userName,
                        },
                    });
                } catch (err) {
                    console.error("Error creating offer:", err);
                }
                break;
            }

            case "offer": {
                let pc = peersRef.current.get(from)?.connection;

                // Handle glaring offers gracefully if they still happen
                if (pc && pc.signalingState !== "stable" && !payload.isRestart) {
                    // If we are in the middle of negotiation and receive a non-restart offer
                    if (userId > from) {
                        return; // We have higher priority, ignore their offer
                    }
                }

                // If no pc exists, create one
                if (!pc) {
                    pc = createPeerConnection(from, payload.name || "Unknown");

                    // Listen for data channel from offerer
                    pc.ondatachannel = (event) => {
                        setupDataChannel(event.channel, from);
                    };

                    peersRef.current.set(from, {
                        id: from,
                        name: payload.name || "Unknown",
                        stream: null,
                        connection: pc,
                        dataChannel: null,
                        audioEnabled: true,
                        videoEnabled: true,
                        isScreenSharing: false,
                    });
                    updatePeers();
                }

                try {
                    await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));

                    // Apply any pending ICE candidates
                    const pending = pendingCandidatesRef.current.get(from) || [];
                    for (const candidate of pending) {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                    pendingCandidatesRef.current.delete(from);

                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);

                    signaling.sendMessage({
                        type: "answer",
                        to: from,
                        payload: {
                            sdp: pc.localDescription,
                        },
                    });
                } catch (err) {
                    console.error("Error handling offer:", err);
                }
                break;
            }

            case "answer": {
                const peer = peersRef.current.get(from);
                if (peer) {
                    try {
                        await peer.connection.setRemoteDescription(new RTCSessionDescription(payload.sdp));
                        
                        // Apply any pending ICE candidates
                        const pending = pendingCandidatesRef.current.get(from) || [];
                        for (const candidate of pending) {
                            await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
                        }
                        pendingCandidatesRef.current.delete(from);
                    } catch (err) {
                        console.error("Error handling answer:", err);
                    }
                }
                break;
            }

            case "ice-candidate": {
                const peer = peersRef.current.get(from);
                if (peer && peer.connection.remoteDescription) {
                    try {
                        await peer.connection.addIceCandidate(new RTCIceCandidate(payload));
                    } catch (err) {
                        console.error("Error adding ICE candidate:", err);
                    }
                } else {
                    // Queue the candidate — remote description not set yet
                    if (!pendingCandidatesRef.current.has(from)) {
                        pendingCandidatesRef.current.set(from, []);
                    }
                    pendingCandidatesRef.current.get(from)!.push(payload);
                }
                break;
            }

            case "leave": {
                removePeer(from);
                break;
            }

            case "media-state": {
                const peer = peersRef.current.get(from);
                if (peer) {
                    if (payload.audioEnabled !== undefined) peer.audioEnabled = payload.audioEnabled;
                    if (payload.videoEnabled !== undefined) peer.videoEnabled = payload.videoEnabled;
                    if (payload.isScreenSharing !== undefined) peer.isScreenSharing = payload.isScreenSharing;
                    updatePeers();
                }
                break;
            }
        }
    }, [createPeerConnection, setupDataChannel, removePeer, updatePeers, userName]);

    const signaling = useSignaling({
        meetingId,
        userId,
        userName,
        onMessage: handleSignalingMessage,
        enabled,
    });

    // Send chat message via data channels
    const sendChatMessage = useCallback((text: string) => {
        const message = {
            type: "chat",
            fromName: userName,
            text,
            timestamp: Date.now(),
        };

        peersRef.current.forEach((peer) => {
            if (peer.dataChannel?.readyState === "open") {
                peer.dataChannel.send(JSON.stringify(message));
            }
        });

        // Also add to own messages
        onChatMessageRef.current?.({
            id: `${userId}-${Date.now()}`,
            from: userId,
            fromName: userName,
            text,
            timestamp: Date.now(),
        });
    }, [userId, userName]);

    // Send transcription via data channels
    const sendTranscription = useCallback((text: string) => {
        const message = {
            type: "transcription",
            fromName: userName,
            text,
            timestamp: Date.now(),
        };

        peersRef.current.forEach((peer) => {
            if (peer.dataChannel?.readyState === "open") {
                peer.dataChannel.send(JSON.stringify(message));
            }
        });

        // Also add to own logs
        onTranscriptionRef.current?.({
            id: `${userId}-${Date.now()}`,
            from: userId,
            fromName: userName,
            text,
            timestamp: Date.now(),
        });
    }, [userId, userName]);

    // Broadcast media state changes
    const broadcastMediaState = useCallback((audioEnabled: boolean, videoEnabled: boolean, isScreenSharing: boolean) => {
        const message = {
            type: "media-state",
            audioEnabled,
            videoEnabled,
            isScreenSharing,
        };

        peersRef.current.forEach((peer) => {
            if (peer.dataChannel?.readyState === "open") {
                peer.dataChannel.send(JSON.stringify(message));
            }
        });

        // Also broadcast via signaling for peers still connecting
        signaling.sendMessage({
            type: "media-state",
            payload: { audioEnabled, videoEnabled, isScreenSharing },
        });
    }, [signaling]);

    // Replace tracks when local stream changes
    useEffect(() => {
        if (!localStream) return;

        peersRef.current.forEach((peer) => {
            const senders = peer.connection.getSenders();
            localStream.getTracks().forEach(track => {
                const sender = senders.find(s => s.track?.kind === track.kind);
                if (sender) {
                    sender.replaceTrack(track).catch(console.error);
                } else {
                    peer.connection.addTrack(track, localStream);
                }
            });
        });
    }, [localStream]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            peersRef.current.forEach(peer => {
                peer.connection.close();
                peer.dataChannel?.close();
                peer.stream?.getTracks().forEach(t => t.stop());
            });
            peersRef.current.clear();
        };
    }, []);

    return {
        peers,
        sendChatMessage,
        sendTranscription,
        broadcastMediaState,
        removePeer,
        isSignalingConnected: signaling.isConnected,
        signalingParticipants: signaling.participants,
        joinRoom: signaling.joinRoom,
        leaveRoom: signaling.leaveRoom,
    };
}
