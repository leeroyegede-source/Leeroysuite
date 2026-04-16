"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import TranslatorPage from "@/views/TranslatorPage";

export default function TranslatorPageRoute() {
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
        <Layout>
            <TranslatorPage />
        </Layout>
    );
}
