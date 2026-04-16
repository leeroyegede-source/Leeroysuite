"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface MediaDevice {
    deviceId: string;
    label: string;
    kind: MediaDeviceKind;
}

export function useMediaDevices() {
    const [cameras, setCameras] = useState<MediaDevice[]>([]);
    const [microphones, setMicrophones] = useState<MediaDevice[]>([]);
    const [speakers, setSpeakers] = useState<MediaDevice[]>([]);
    const [selectedCamera, setSelectedCamera] = useState<string>("");
    const [selectedMicrophone, setSelectedMicrophone] = useState<string>("");
    const [selectedSpeaker, setSelectedSpeaker] = useState<string>("");
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [permissionError, setPermissionError] = useState<string | null>(null);

    const enumerateDevices = useCallback(async () => {
        try {
            if (!navigator?.mediaDevices?.enumerateDevices) {
                console.warn("navigator.mediaDevices.enumerateDevices is not available.");
                return;
            }
            const devices = await navigator.mediaDevices.enumerateDevices();

            const cams = devices
                .filter(d => d.kind === "videoinput")
                .map(d => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId.slice(0, 5)}`, kind: d.kind }));
            
            const mics = devices
                .filter(d => d.kind === "audioinput")
                .map(d => ({ deviceId: d.deviceId, label: d.label || `Microphone ${d.deviceId.slice(0, 5)}`, kind: d.kind }));
            
            const spkrs = devices
                .filter(d => d.kind === "audiooutput")
                .map(d => ({ deviceId: d.deviceId, label: d.label || `Speaker ${d.deviceId.slice(0, 5)}`, kind: d.kind }));

            setCameras(cams);
            setMicrophones(mics);
            setSpeakers(spkrs);

            // Auto-select first device if none selected
            if (!selectedCamera && cams.length > 0) setSelectedCamera(cams[0].deviceId);
            if (!selectedMicrophone && mics.length > 0) setSelectedMicrophone(mics[0].deviceId);
            if (!selectedSpeaker && spkrs.length > 0) setSelectedSpeaker(spkrs[0].deviceId);
        } catch (err) {
            console.error("Failed to enumerate devices:", err);
        }
    }, [selectedCamera, selectedMicrophone, selectedSpeaker]);

    const requestPermissions = useCallback(async () => {
        try {
            setPermissionError(null);
            if (!navigator?.mediaDevices?.getUserMedia) {
                setPermissionError("Camera and microphone access is not available in this browser. Please ensure you are using HTTPS or localhost.");
                setPermissionGranted(false);
                return false;
            }
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            // Stop all tracks immediately — we just needed permission
            stream.getTracks().forEach(t => t.stop());
            setPermissionGranted(true);
            await enumerateDevices();
            return true;
        } catch (err: any) {
            console.error("Permission denied:", err);
            if (err.name === "NotAllowedError") {
                setPermissionError("Camera and microphone access was denied. Please allow access in your browser settings.");
            } else if (err.name === "NotFoundError") {
                setPermissionError("No camera or microphone found. Please connect a device and try again.");
            } else {
                setPermissionError("Failed to access media devices. Please check your browser settings or ensure secure context (HTTPS).");
            }
            setPermissionGranted(false);
            return false;
        }
    }, [enumerateDevices]);

    const getMediaStream = useCallback(async (options?: {
        video?: boolean;
        audio?: boolean;
        cameraId?: string;
        microphoneId?: string;
    }) => {
        const video = options?.video !== false;
        const audio = options?.audio !== false;
        const cameraId = options?.cameraId || selectedCamera;
        const micId = options?.microphoneId || selectedMicrophone;

        const constraints: MediaStreamConstraints = {};

        if (video && cameraId) {
            constraints.video = {
                deviceId: { exact: cameraId },
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: 30 },
            };
        } else if (video) {
            constraints.video = {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: 30 },
            };
        } else {
            constraints.video = false;
        }

        if (audio && micId) {
            constraints.audio = {
                deviceId: { exact: micId },
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
            };
        } else if (audio) {
            constraints.audio = {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
            };
        } else {
            constraints.audio = false;
        }

        if (!navigator?.mediaDevices?.getUserMedia) {
            throw new Error("Media devices are not supported in this browser or context.");
        }

        return navigator.mediaDevices.getUserMedia(constraints);
    }, [selectedCamera, selectedMicrophone]);

    // Listen for device changes
    useEffect(() => {
        const handler = () => enumerateDevices();
        navigator.mediaDevices?.addEventListener?.("devicechange", handler);
        return () => {
            navigator.mediaDevices?.removeEventListener?.("devicechange", handler);
        };
    }, [enumerateDevices]);

    return {
        cameras,
        microphones,
        speakers,
        selectedCamera,
        selectedMicrophone,
        selectedSpeaker,
        setSelectedCamera,
        setSelectedMicrophone,
        setSelectedSpeaker,
        permissionGranted,
        permissionError,
        requestPermissions,
        getMediaStream,
        enumerateDevices,
    };
}
