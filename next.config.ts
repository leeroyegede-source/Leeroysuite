import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    typescript: {
        ignoreBuildErrors: false,
    },
    reactStrictMode: false,
    turbopack: {},
};

export default nextConfig;
