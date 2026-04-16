"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import RegisterPage from "@/views/RegisterPage";

export default function RegisterRoute() {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, loading, router]);

    if (loading || isAuthenticated) {
        return null;
    }

    return <RegisterPage />;
}
