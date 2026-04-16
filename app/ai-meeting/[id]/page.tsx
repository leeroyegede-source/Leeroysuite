"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { MeetingRoom } from "@/components/meeting/MeetingRoom";
import FeatureGuard from "@/components/auth/FeatureGuard";
import { use } from "react";

export default function MeetingRoomPageRoute({ params }: { params: Promise<{ id: string }> }) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const resolvedParams = use(params);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, loading, router]);

    if (loading || !isAuthenticated) {
        return null;
    }

    return (
        <FeatureGuard featureId="ai-meeting">
            <MeetingRoom meetingId={resolvedParams.id} />
        </FeatureGuard>
    );
}
