"use client";

import { Layout } from "@/components/layout/Layout";
import PricingPage from "@/views/pricing/PricingPage";

export default function Page() {
    // Pricing page can be public? If so, Sidebar handles it.
    // If we want consistent UI, we wrap in Layout.
    return (
        <Layout>
            <PricingPage />
        </Layout>
    );
}
