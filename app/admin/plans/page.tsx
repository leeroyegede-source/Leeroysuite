"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminPlans from "@/views/admin/AdminPlans";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
    const { isAuthenticated, loading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.push("/login");
            } else if (user?.role !== "admin") {
                router.push("/dashboard");
            }
        }
    }, [isAuthenticated, loading, user, router]);

    if (loading || !isAuthenticated || user?.role !== "admin") {
        return null; // Or a loading spinner
    }

    return (
        <AdminLayout>
            <AdminPlans />
        </AdminLayout>
    );
}
