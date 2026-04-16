"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function AdminNotFound() {
    const pathname = usePathname();

    useEffect(() => {
        console.error("Admin 404 Error: User attempted to access non-existent route:", pathname);
    }, [pathname]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="text-center">
                <h1 className="mb-4 text-4xl font-bold text-red-500">404</h1>
                <p className="mb-4 text-xl text-muted-foreground">Oops! Admin page not found</p>
                <Link href="/admin/dashboard" className="text-red-500 underline hover:text-red-600 transition-colors">
                    Return to Admin Dashboard
                </Link>
            </div>
        </div>
    );
}
