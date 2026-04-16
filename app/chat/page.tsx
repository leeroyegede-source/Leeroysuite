"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import ChatPage from "@/views/ChatPage";
import FeatureGuard from "@/components/auth/FeatureGuard";

export default function ChatPageRoute() {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, loading, router]);

    if (loading || !isAuthenticated) {
        return null;
    }

    return (
        <Layout fullHeight>
            <FeatureGuard featureId="chat">
                <ChatPage />
            </FeatureGuard>
        </Layout>
    );
}
