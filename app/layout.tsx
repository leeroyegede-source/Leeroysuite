import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "../src/components/Providers";
import { ServiceWorkerRegistration } from "../src/components/ServiceWorkerRegistration";
import { supabaseAdmin } from "@/lib/supabase";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const revalidate = 0;

/* ✅ FIXED: proper Next.js metadata export */
export const metadata: Metadata = {
  title: {
    default: "AI Suite",
    template: "%s | AI Suite",
  },
  description:
    "The most powerful AI productivity suite with 135+ AI tools including chatbots, content generators, code assistants, image creators, and AI agents.",

  keywords: [
    "AI",
    "artificial intelligence",
    "AI generator",
    "AI chatbot",
    "content generator",
    "code generator",
    "AI assistant",
    "AI agents",
    "text to image",
    "AI writer",
    "SaaS",
  ],

  authors: [{ name: "Mounikai" }],
  creator: "Mounikai",
  publisher: "AI Suite",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "AI Suite",
    title: "AI Suite",
    description:
      "Advanced AI productivity suite with website builder, image generation, and AI agents.",
  },

  twitter: {
    card: "summary_large_image",
    title: "AI Suite",
    description:
      "Advanced AI productivity suite with website builder, image generation, and AI agents.",
    creator: "@aisuite",
  },

  /* ✅ FIXED ICONS (IMPORTANT PART) */
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/icons/icon-192x192.png",
  },

  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AI Suite",
  },

  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#030712" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // optional runtime metadata fetch (safe)
  try {
    await supabaseAdmin
      .from("system_settings")
      .select("*")
      .eq("id", 1)
      .single();
  } catch (err) {
    console.warn("Supabase metadata fetch failed:", err);
  }

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}