import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { getEmbedding } from '@/lib/rag';
import { extractTextFromFile, chunkText } from '@/lib/docProcessor';
import { translationsData } from '@/lib/seed_translations';

// ============================================================================
// CRON DATABASE SEED ROUTE
// ============================================================================
// This API is designed to be triggered as a Vercel cron job (or manually).
// It performs a FULL RESET of the database and inserts rich, realistic demo
// data across all tables. Safe to run multiple times (idempotent).
//
// Execution order:
//   1. DELETE all data (children-first to respect FK constraints)
//   2. INSERT seed data (parents-first to satisfy FK constraints)
// ============================================================================

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60s for seeding

// ---------------------------------------------------------------------------
// Helper: Generate a date N days ago from now
// ---------------------------------------------------------------------------
function daysAgo(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
}

// ---------------------------------------------------------------------------
// Helper: Generate a date N hours ago from now
// ---------------------------------------------------------------------------
function hoursAgo(hours: number): string {
    const d = new Date();
    d.setHours(d.getHours() - hours);
    return d.toISOString();
}

// ---------------------------------------------------------------------------
// STEP 1: Truncate all tables (children-first order)
// ---------------------------------------------------------------------------
async function truncateAllTables() {
    // Order matters: delete from child tables first to avoid FK violations.
    // Supabase JS doesn't support raw TRUNCATE, so we use delete with a
    // broad filter. The neq('id','__impossible__') trick deletes all rows.

    // document_chunks (child of documents)
    await supabaseAdmin.from('document_chunks').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // documents (child of users via user_email)
    await supabaseAdmin.from('documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // websites (child of users via user_email)
    await supabaseAdmin.from('websites').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // payments (child of users + pricing_plans)
    await supabaseAdmin.from('payments').delete().neq('id', '__none__');

    // subscriptions (child of users + pricing_plans)
    await supabaseAdmin.from('subscriptions').delete().neq('id', '__none__');

    // token_logs (child of users via email)
    await supabaseAdmin.from('token_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // user_balances (child of users via email)
    await supabaseAdmin.from('user_balances').delete().neq('email', '__none__');

    // reset_tokens (child of users via email)
    await supabaseAdmin.from('reset_tokens').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // system_settings (standalone)
    await supabaseAdmin.from('system_settings').delete().neq('id', -999);

    // pricing_plans (now safe — payments & subscriptions deleted)
    await supabaseAdmin.from('pricing_plans').delete().neq('id', '__none__');

    // translations (child of languages)
    await supabaseAdmin.from('translations').delete().neq('translation_key', '___');

    // languages
    await supabaseAdmin.from('languages').delete().neq('code', '___');

    // meetings
    await supabaseAdmin.from('meetings').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // users (now safe — all children deleted)
    await supabaseAdmin.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
}

// ---------------------------------------------------------------------------
// STEP 2: Seed Users
// ---------------------------------------------------------------------------
async function seedUsers() {
    const salt = 10;

    const users = [
        {
            email: 'admin@example.com',
            name: 'Alex Morgan',
            role: 'admin',
            status: 'active',
            password: await bcrypt.hash('admin123', salt),
            disabled_features: '{}',
            created_at: daysAgo(180),
        },
        {
            email: 'user@demo.com',
            name: 'Jordan Lee',
            role: 'user',
            status: 'active',
            password: await bcrypt.hash('user123', salt),
            disabled_features: '{}',
            created_at: daysAgo(120),
        },
        {
            email: 'sarah.chen@techcorp.io',
            name: 'Sarah Chen',
            role: 'user',
            status: 'active',
            password: await bcrypt.hash('demo1234', salt),
            disabled_features: '{}',
            created_at: daysAgo(90),
        },
        {
            email: 'mike.johnson@startup.dev',
            name: 'Mike Johnson',
            role: 'user',
            status: 'active',
            password: await bcrypt.hash('demo1234', salt),
            disabled_features: '{}',
            created_at: daysAgo(75),
        },
        {
            email: 'emily.davis@agency.co',
            name: 'Emily Davis',
            role: 'user',
            status: 'active',
            password: await bcrypt.hash('demo1234', salt),
            disabled_features: '{}',
            created_at: daysAgo(60),
        },
        {
            email: 'raj.patel@enterprise.com',
            name: 'Raj Patel',
            role: 'user',
            status: 'active',
            password: await bcrypt.hash('demo1234', salt),
            disabled_features: '{}',
            created_at: daysAgo(45),
        },
        {
            email: 'lisa.wang@creative.studio',
            name: 'Lisa Wang',
            role: 'user',
            status: 'active',
            password: await bcrypt.hash('demo1234', salt),
            disabled_features: '{}',
            created_at: daysAgo(30),
        },
        {
            email: 'tom.wilson@freelance.io',
            name: 'Tom Wilson',
            role: 'user',
            status: 'disabled',
            password: await bcrypt.hash('demo1234', salt),
            disabled_features: '{chat,image-generator}',
            created_at: daysAgo(15),
        },
    ];

    const { data, error } = await supabaseAdmin.from('users').insert(users).select('id, email');
    if (error) throw new Error(`Seed users failed: ${error.message}`);

    // Build a map of email → id for relational inserts
    const userMap: Record<string, string> = {};
    data?.forEach((u: any) => { userMap[u.email] = u.id; });
    return userMap;
}

// ---------------------------------------------------------------------------
// STEP 3: Seed User Balances
// ---------------------------------------------------------------------------
async function seedUserBalances() {
    const balances = [
        { email: 'admin@example.com', balance: 9999, updated_at: hoursAgo(1) },
        { email: 'user@demo.com', balance: 100000, updated_at: hoursAgo(3) },
        { email: 'sarah.chen@techcorp.io', balance: 4200, updated_at: hoursAgo(6) },
        { email: 'mike.johnson@startup.dev', balance: 1800, updated_at: hoursAgo(12) },
        { email: 'emily.davis@agency.co', balance: 3100, updated_at: daysAgo(1) },
        { email: 'raj.patel@enterprise.com', balance: 5000, updated_at: daysAgo(2) },
        { email: 'lisa.wang@creative.studio', balance: 750, updated_at: hoursAgo(2) },
        { email: 'tom.wilson@freelance.io', balance: 150, updated_at: daysAgo(5) },
    ];

    const { error } = await supabaseAdmin.from('user_balances').insert(balances);
    if (error) throw new Error(`Seed user_balances failed: ${error.message}`);
}

// ---------------------------------------------------------------------------
// STEP 4: Seed System Settings
// ---------------------------------------------------------------------------
async function seedSystemSettings() {
    const settings = {
        id: 1,
        default_tokens: 1000,
        ai_limits: {
            chat: 10,
            image: 50,
            code: 15,
            writer: 20,
            website: 100,
            translator: 10,
            summary: 15,
        },
  payment_enabled: true,
  payment_gateway: 'stripe',

  stripe_public_key: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
  stripe_secret_key: process.env.STRIPE_SECRET_KEY,

  paypal_client_id: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
  paypal_client_secret: process.env.PAYPAL_CLIENT_SECRET,
  paypal_mode: process.env.PAYPAL_MODE || 'sandbox',

  site_name: 'AI Suite',
  site_url: process.env.NEXT_PUBLIC_SITE_URL,

  smtp_config: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM,
  },

        metadata: {
            maintenanceMode: false,
            announcement: 'Welcome to AI Suite! Explore 100+ AI tools.',
            version: '6.0',
        },
        updated_at: hoursAgo(2),
    };

    const { error } = await supabaseAdmin.from('system_settings').insert(settings);
    if (error) throw new Error(`Seed system_settings failed: ${error.message}`);
}

// ---------------------------------------------------------------------------
// STEP 5: Seed Pricing Plans
// ---------------------------------------------------------------------------
async function seedPricingPlans() {
    const plans = [
        {
            id: 'free',
            name: 'Free',
            price: 0,
            tokens: 500,
            interval: 'month',
            features: ['AI Chat (10 msgs/day)', 'Text Summarizer', 'Grammar Check', 'Translation Hub', 'Community Support'],
            ai_tools: ['chat', 'summary', 'grammar', 'translator'],
            is_active: true,
        },
        {
            id: 'starter',
            name: 'Starter',
            price: 9,
            tokens: 5000,
            interval: 'month',
            features: ['Everything in Free', '5,000 tokens/month', 'Image Generator', 'Code Generator', 'Content Writer', 'Social Media Suite', 'Email Support'],
            ai_tools: ['chat', 'summary', 'grammar', 'translator', 'image-generator', 'code', 'writer', 'social', 'email'],
            is_active: true,
        },
        {
            id: 'pro',
            name: 'Pro',
            price: 29,
            tokens: 25000,
            interval: 'month',
            features: ['Everything in Starter', '25,000 tokens/month', 'Website Builder', 'AI Agents', 'RAG Documents', 'Contract Generator', 'Priority Support'],
            ai_tools: ['chat', 'summary', 'grammar', 'translator', 'image-generator', 'code', 'writer', 'social', 'email', 'website', 'rag-docs', 'agent', 'contract'],
            is_active: true,
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 99,
            tokens: 100000,
            interval: 'month',
            features: ['Everything in Pro', '100,000 tokens/month', 'Unlimited AI Agents', 'Custom Models', 'Dedicated Support', 'SSO & API Access', 'White-label Option'],
            ai_tools: [
                'chat', 'website', 'image-generator', 'code', 'translator', 'support-agent',
                'writer', 'blog-post', 'article-writer', 'content-improver', 'summary', 'headline-generator', 'poem-generator', 'story', 'grammar',
                'social', 'instagram-caption', 'twitter-thread', 'linkedin-post', 'youtube-description', 'hashtag-generator', 'content-calendar',
                'google-ads', 'facebook-ads', 'email', 'sales-pitch', 'marketing-plan', 'competitor-analysis',
                'business-plan', 'meeting', 'contract-generator', 'job-description', 'finance',
                'bug-fix', 'code-reviewer', 'api-docs', 'readme-generator', 'regex-generator', 'sql', 'unit-test', 'ocr',
                'quiz', 'lesson-plan', 'study-guide', 'flashcard-generator', 'math-solver', 'interview',
                'story-ideas', 'character-creator', 'song-lyrics', 'joke-generator', 'name-generator', 'recipe',
                'privacy-policy', 'terms-of-service', 'disclaimer-generator', 'refund-policy',
                'meta-description', 'keyword-research', 'schema-markup', 'seo-audit',
                'journal-prompt', 'goal-setting', 'motivation-booster', 'sentiment', 'resume',
                'research-agent', 'writing-agent', 'code-agent', 'ai-support-agent', 'marketing-agent',
                'rag-docs', 'agent', 'contract', 'custom-model', 'api-access', 'voice-generator', 'video-ai'
            ],
            is_active: true,
        },
    ];

    const { error } = await supabaseAdmin.from('pricing_plans').insert(plans);
    if (error) throw new Error(`Seed pricing_plans failed: ${error.message}`);
}

// ---------------------------------------------------------------------------
// STEP 6: Seed Subscriptions
// ---------------------------------------------------------------------------
async function seedSubscriptions() {
    const subscriptions = [
        { id: 'sub_admin_pro', user_email: 'admin@example.com', plan_id: 'pro', status: 'active', created_at: daysAgo(160) },
        { id: 'sub_demo_enterprise', user_email: 'user@demo.com', plan_id: 'enterprise', status: 'active', created_at: daysAgo(100) },
        { id: 'sub_sarah_pro', user_email: 'sarah.chen@techcorp.io', plan_id: 'pro', status: 'active', created_at: daysAgo(80) },
        { id: 'sub_mike_starter', user_email: 'mike.johnson@startup.dev', plan_id: 'starter', status: 'trialing', created_at: daysAgo(10) },
        { id: 'sub_emily_pro', user_email: 'emily.davis@agency.co', plan_id: 'pro', status: 'active', created_at: daysAgo(50) },
        { id: 'sub_raj_enterprise', user_email: 'raj.patel@enterprise.com', plan_id: 'enterprise', status: 'active', created_at: daysAgo(40) },
        { id: 'sub_lisa_starter', user_email: 'lisa.wang@creative.studio', plan_id: 'starter', status: 'past_due', created_at: daysAgo(25) },
        { id: 'sub_tom_cancelled', user_email: 'tom.wilson@freelance.io', plan_id: 'starter', status: 'canceled', created_at: daysAgo(60) },
    ];

    const { error } = await supabaseAdmin.from('subscriptions').insert(subscriptions);
    if (error) throw new Error(`Seed subscriptions failed: ${error.message}`);
}

// ---------------------------------------------------------------------------
// STEP 7: Seed Payments
// ---------------------------------------------------------------------------
async function seedPayments(userMap: Record<string, string>) {
    const payments = [
        // Admin — Pro plan payments
        { id: 'pay_001', user_id: userMap['admin@example.com'], user_email: 'admin@example.com', plan_id: 'pro', amount: 29, status: 'succeeded', created_at: daysAgo(160) },
        { id: 'pay_002', user_id: userMap['admin@example.com'], user_email: 'admin@example.com', plan_id: 'pro', amount: 29, status: 'succeeded', created_at: daysAgo(130) },
        { id: 'pay_003', user_id: userMap['admin@example.com'], user_email: 'admin@example.com', plan_id: 'pro', amount: 29, status: 'succeeded', created_at: daysAgo(100) },

        // Demo user — Enterprise plan payments
        { id: 'pay_004', user_id: userMap['user@demo.com'], user_email: 'user@demo.com', plan_id: 'enterprise', amount: 99, status: 'succeeded', created_at: daysAgo(100) },
        { id: 'pay_005', user_id: userMap['user@demo.com'], user_email: 'user@demo.com', plan_id: 'enterprise', amount: 99, status: 'succeeded', created_at: daysAgo(70) },

        // Sarah — Pro
        { id: 'pay_006', user_id: userMap['sarah.chen@techcorp.io'], user_email: 'sarah.chen@techcorp.io', plan_id: 'pro', amount: 29, status: 'succeeded', created_at: daysAgo(80) },
        { id: 'pay_007', user_id: userMap['sarah.chen@techcorp.io'], user_email: 'sarah.chen@techcorp.io', plan_id: 'pro', amount: 29, status: 'succeeded', created_at: daysAgo(50) },

        // Emily — Pro
        { id: 'pay_008', user_id: userMap['emily.davis@agency.co'], user_email: 'emily.davis@agency.co', plan_id: 'pro', amount: 29, status: 'succeeded', created_at: daysAgo(50) },

        // Raj — Enterprise
        { id: 'pay_009', user_id: userMap['raj.patel@enterprise.com'], user_email: 'raj.patel@enterprise.com', plan_id: 'enterprise', amount: 99, status: 'succeeded', created_at: daysAgo(40) },

        // Failed & pending payments (edge cases)
        { id: 'pay_010', user_id: userMap['lisa.wang@creative.studio'], user_email: 'lisa.wang@creative.studio', plan_id: 'starter', amount: 9, status: 'failed', created_at: daysAgo(5) },
        { id: 'pay_011', user_id: userMap['mike.johnson@startup.dev'], user_email: 'mike.johnson@startup.dev', plan_id: 'starter', amount: 9, status: 'pending', created_at: daysAgo(2) },
        { id: 'pay_012', user_id: userMap['tom.wilson@freelance.io'], user_email: 'tom.wilson@freelance.io', plan_id: 'starter', amount: 9, status: 'succeeded', created_at: daysAgo(60) },
    ];

    const { error } = await supabaseAdmin.from('payments').insert(payments);
    if (error) throw new Error(`Seed payments failed: ${error.message}`);
}

// ---------------------------------------------------------------------------
// STEP 8: Seed Token Logs (realistic usage patterns)
// ---------------------------------------------------------------------------
async function seedTokenLogs() {
    const features = ['chat', 'image-generator', 'code', 'writer', 'website', 'translator', 'summary', 'social', 'email', 'quiz', 'resume', 'story', 'grammar', 'sql', 'blog-post'];

    const logs: any[] = [];

    // Generate realistic consumption logs across multiple users and days
    const activeUsers = [
        'admin@example.com',
        'user@demo.com',
        'sarah.chen@techcorp.io',
        'mike.johnson@startup.dev',
        'emily.davis@agency.co',
        'raj.patel@enterprise.com',
        'lisa.wang@creative.studio',
    ];

    // Day-by-day consumption over the past 30 days
    for (let day = 0; day < 30; day++) {
        // Each day, 2-4 random users use the platform
        const usersToday = activeUsers
            .sort(() => Math.random() - 0.5)
            .slice(0, 2 + Math.floor(Math.random() * 3));

        for (const email of usersToday) {
            // Each user uses 1-3 features per day
            const featuresUsed = features
                .sort(() => Math.random() - 0.5)
                .slice(0, 1 + Math.floor(Math.random() * 3));

            for (const feature of featuresUsed) {
                logs.push({
                    email,
                    amount: [5, 10, 15, 20, 25, 50][Math.floor(Math.random() * 6)],
                    action: 'consume',
                    feature,
                    timestamp: daysAgo(day),
                });
            }
        }
    }

    // Add some "add" token events (purchases / resets)
    logs.push(
        { email: 'user@demo.com', amount: 5000, action: 'add', feature: 'purchase', timestamp: daysAgo(100) },
        { email: 'sarah.chen@techcorp.io', amount: 25000, action: 'add', feature: 'purchase', timestamp: daysAgo(80) },
        { email: 'emily.davis@agency.co', amount: 25000, action: 'add', feature: 'purchase', timestamp: daysAgo(50) },
        { email: 'raj.patel@enterprise.com', amount: 100000, action: 'add', feature: 'purchase', timestamp: daysAgo(40) },
        { email: 'mike.johnson@startup.dev', amount: 5000, action: 'add', feature: 'purchase', timestamp: daysAgo(10) },
        { email: 'admin@example.com', amount: 1000, action: 'reset', feature: 'admin_reset', timestamp: daysAgo(5) },
        { email: 'lisa.wang@creative.studio', amount: 5000, action: 'add', feature: 'purchase', timestamp: daysAgo(25) },
    );

    // Insert in batches of 50 to avoid payload size issues
    for (let i = 0; i < logs.length; i += 50) {
        const batch = logs.slice(i, i + 50);
        const { error } = await supabaseAdmin.from('token_logs').insert(batch);
        if (error) throw new Error(`Seed token_logs batch ${i} failed: ${error.message}`);
    }

    return logs.length;
}

// ---------------------------------------------------------------------------
// STEP 9: Seed Websites (AI-generated website projects)
// ---------------------------------------------------------------------------
async function seedWebsites() {
    const websites = [
        {
            user_email: 'admin@example.com',
            name: 'TechStartup Landing Page',
            code: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>NexaFlow - AI-Powered Workflows</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <script>
                tailwind.config = {
                    theme: {
                        extend: {
                            fontFamily: { sans: ['Inter', 'sans-serif'] }
                        }
                    }
                }
            </script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        </head>
        <body class="bg-[#030014] text-white font-sans antialiased overflow-x-hidden selection:bg-indigo-500 selection:text-white">
            
            <div class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none"></div>
            <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none"></div>

            <nav class="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
                <div class="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
                    NexaFlow
                </div>
                <div class="hidden md:flex space-x-8 text-sm font-medium text-slate-300">
                    <a href="#" class="hover:text-white transition">Product</a>
                    <a href="#" class="hover:text-white transition">Solutions</a>
                    <a href="#" class="hover:text-white transition">Pricing</a>
                </div>
                <button class="px-5 py-2.5 text-sm font-semibold rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all">
                    Sign In
                </button>
            </nav>

            <main class="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
                
                <div class="inline-flex items-center px-4 py-1.5 mb-8 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium backdrop-blur-sm cursor-pointer hover:bg-indigo-500/20 transition">
                    <span class="flex h-2 w-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
                    NexaFlow AI 2.0 is now live
                </div>
                
                <h1 class="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight max-w-5xl leading-[1.1]">
                    Automate workflows with <br/>
                    <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-sm">
                        Intelligent AI
                    </span>
                </h1>
                
                <p class="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    Build, deploy, and scale complex automation in minutes. NexaFlow's neural engine handles the heavy lifting so your team can focus on what matters.
                </p>
                
                <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
                    <button class="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold text-lg transition-all shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)] hover:shadow-[0_0_40px_-5px_rgba(99,102,241,0.7)] hover:-translate-y-1">
                        Get Started Free
                    </button>
                    <button class="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-lg backdrop-blur-sm transition-all hover:-translate-y-1">
                        Book a Demo
                    </button>
                </div>
                
            </main>
        </body>
        </html>`,
            messages: [
                { role: 'user', content: 'Create a modern landing page for an AI startup called NexaFlow' },
                { role: 'model', content: 'I\'ve created a sleek, dark-themed landing page for NexaFlow with a gradient hero section and CTA button.' },
                { role: 'user', content: 'Update that HTML code with a premium UI design. Use Tailwind CSS.' },
                { role: 'model', content: 'I have completely overhauled the design using Tailwind CSS. The new premium UI features an ambient background glow, a modern navigation bar, an animated announcement badge, a highly stylized hero section with gradient text, and beautiful frosted glass/backdrop-blur button hover effects.' }
            ],
            created_at: daysAgo(45),
            updated_at: daysAgo(0), // Updated to reflect recent modification
        },
        {
            user_email: 'admin@example.com',
            name: 'SaaS Admin Dashboard',
            code: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Dashboard - NexaFlow</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <script>
                tailwind.config = {
                    theme: {
                        extend: {
                            fontFamily: { sans: ['Inter', 'sans-serif'] }
                        }
                    }
                }
            </script>
        </head>
        <body class="bg-gray-50 text-gray-900 font-sans antialiased">

            <div class="flex h-screen overflow-hidden">
                
                <aside class="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                    <div class="h-16 flex items-center px-6 border-b border-gray-200">
                        <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">NexaFlow</span>
                    </div>
                    <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        <a href="#" class="flex items-center gap-3 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                            Dashboard
                        </a>
                        <a href="#" class="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            Customers
                        </a>
                        <a href="#" class="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                            Analytics
                        </a>
                        <a href="#" class="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            Settings
                        </a>
                    </nav>
                    <div class="p-4 border-t border-gray-200">
                        <div class="flex items-center gap-3">
                            <img class="h-9 w-9 rounded-full bg-gray-300" src="https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff" alt="Avatar">
                            <div>
                                <p class="text-sm font-medium text-gray-700">Admin User</p>
                                <p class="text-xs text-gray-500">admin@nexaflow.io</p>
                            </div>
                        </div>
                    </div>
                </aside>

                <div class="flex-1 flex flex-col overflow-hidden">
                    
                    <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10">
                        <div class="flex-1 flex">
                            <div class="w-full max-w-lg relative">
                                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </span>
                                <input type="text" class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors" placeholder="Search tasks, users, or settings...">
                            </div>
                        </div>
                        <div class="ml-4 flex items-center md:ml-6">
                            <button class="p-2 text-gray-400 hover:text-gray-500 relative">
                                <span class="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                            </button>
                            <button class="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                                New Project
                            </button>
                        </div>
                    </header>

                    <main class="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
                        
                        <h1 class="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

                        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                            <div class="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                                <div class="p-5">
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0 bg-indigo-50 rounded-md p-3">
                                            <svg class="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        </div>
                                        <div class="ml-4 w-0 flex-1">
                                            <dl>
                                                <dt class="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                                                <dd class="flex items-baseline">
                                                    <div class="text-2xl font-semibold text-gray-900">$45,231</div>
                                                    <div class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                                                        <svg class="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" style="transform: rotate(-45deg);"></path></svg>
                                                        12%
                                                    </div>
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                                <div class="p-5">
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0 bg-purple-50 rounded-md p-3">
                                            <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                        </div>
                                        <div class="ml-4 w-0 flex-1">
                                            <dl>
                                                <dt class="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                                                <dd class="flex items-baseline">
                                                    <div class="text-2xl font-semibold text-gray-900">2,405</div>
                                                    <div class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                                                        <svg class="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" style="transform: rotate(-45deg);"></path></svg>
                                                        5.4%
                                                    </div>
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div class="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                                    <h3 class="text-lg leading-6 font-medium text-gray-900">Recent Transactions</h3>
                                    <a href="#" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">View all</a>
                                </div>
                                <div class="overflow-x-auto">
                                    <table class="min-w-full divide-y divide-gray-200">
                                        <thead class="bg-gray-50">
                                            <tr>
                                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody class="bg-white divide-y divide-gray-200">
                                            <tr>
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <div class="flex items-center">
                                                        <div class="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">AC</div>
                                                        <div class="ml-3"><div class="text-sm font-medium text-gray-900">Acme Corp</div></div>
                                                    </div>
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$2,400.00</td>
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Completed</span>
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Oct 24, 2024</td>
                                            </tr>
                                            <tr>
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <div class="flex items-center">
                                                        <div class="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">GL</div>
                                                        <div class="ml-3"><div class="text-sm font-medium text-gray-900">Globex Inc</div></div>
                                                    </div>
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$850.00</td>
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Oct 23, 2024</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div class="bg-white rounded-xl shadow-sm border border-gray-200">
                                <div class="px-6 py-5 border-b border-gray-200">
                                    <h3 class="text-lg leading-6 font-medium text-gray-900">Invite Team Member</h3>
                                </div>
                                <div class="p-6">
                                    <form action="#" method="POST" class="space-y-4">
                                        <div>
                                            <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
                                            <div class="mt-1 relative rounded-md shadow-sm">
                                                <input type="email" name="email" id="email" class="block w-full sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3 border" placeholder="jane@example.com">
                                            </div>
                                        </div>
                                        <div>
                                            <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
                                            <select id="role" name="role" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border">
                                                <option>Admin</option>
                                                <option selected>Editor</option>
                                                <option>Viewer</option>
                                            </select>
                                        </div>
                                        <div class="flex items-start mt-4">
                                            <div class="flex items-center h-5">
                                                <input id="notify" name="notify" type="checkbox" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded">
                                            </div>
                                            <div class="ml-3 text-sm">
                                                <label for="notify" class="font-medium text-gray-700">Send welcome email</label>
                                                <p class="text-gray-500">They will receive a link to set their password.</p>
                                            </div>
                                        </div>
                                        <div class="pt-4">
                                            <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors">
                                                Send Invitation
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                    </main>
                </div>
            </div>
        </body>
        </html>`,
            messages: [
                { role: 'user', content: 'Create a modern landing page for an AI startup called NexaFlow' },
                { role: 'model', content: 'I\'ve created a sleek, dark-themed landing page for NexaFlow with a gradient hero section and CTA button.' },
                { role: 'user', content: 'Update that HTML code with a premium UI design. Use Tailwind CSS.' },
                { role: 'model', content: 'I have completely overhauled the design using Tailwind CSS. The new premium UI features an ambient background glow, a modern navigation bar, an animated announcement badge, a highly stylized hero section with gradient text, and beautiful frosted glass/backdrop-blur button hover effects.' },
                { role: 'user', content: 'now make one more UI example not landing page. also make the page big. need to see lot of examples in the html code' },
                { role: 'model', content: 'I have generated a large, comprehensive SaaS Admin Dashboard layout. This provides extensive examples of Tailwind CSS in action, including a functional sidebar, top navigation with search, data metric cards, a full data table with status badges, and a form interface.' }
            ],
            created_at: daysAgo(45),
            updated_at: daysAgo(0),
        },
        {
            user_email: 'admin@example.com',
            name: 'E-commerce Product Details',
            code: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>NexaAudio Pro - NexaStore</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <script>
                tailwind.config = {
                    theme: {
                        extend: {
                            fontFamily: { sans: ['Inter', 'sans-serif'] }
                        }
                    }
                }
            </script>
        </head>
        <body class="bg-white text-gray-900 font-sans antialiased">

            <header class="border-b border-gray-200">
                <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div class="flex items-center gap-8">
                        <a href="#" class="text-2xl font-bold tracking-tighter text-indigo-600">NexaStore</a>
                        <div class="hidden md:flex gap-6 text-sm font-medium text-gray-600">
                            <a href="#" class="hover:text-indigo-600 transition">Men</a>
                            <a href="#" class="hover:text-indigo-600 transition">Women</a>
                            <a href="#" class="text-indigo-600 transition">Electronics</a>
                            <a href="#" class="hover:text-indigo-600 transition">Accessories</a>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <button class="text-gray-400 hover:text-gray-500">
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </button>
                        <button class="text-gray-400 hover:text-gray-500 relative">
                            <span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">3</span>
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </button>
                    </div>
                </nav>
            </header>

            <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                
                <nav class="flex text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
                    <ol class="flex items-center space-x-2">
                        <li><a href="#" class="hover:text-gray-900">Home</a></li>
                        <li><svg class="h-4 w-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg></li>
                        <li><a href="#" class="hover:text-gray-900">Electronics</a></li>
                        <li><svg class="h-4 w-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg></li>
                        <li class="font-medium text-gray-900" aria-current="page">NexaAudio Pro</li>
                    </ol>
                </nav>

                <div class="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
                    
                    <div class="flex flex-col gap-4">
                        <div class="aspect-w-1 aspect-h-1 w-full bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200">
                            <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Headphones" class="w-full h-full object-cover object-center">
                        </div>
                        <div class="grid grid-cols-4 gap-4">
                            <button class="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden border-2 border-indigo-600">
                                <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" class="w-full h-full object-cover object-center" alt="Thumbnail 1">
                            </button>
                            <button class="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-gray-300 transition">
                                <img src="https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" class="w-full h-full object-cover object-center" alt="Thumbnail 2">
                            </button>
                            <button class="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-gray-300 transition">
                                <img src="https://images.unsplash.com/photo-1484704849700-f032a568e944?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" class="w-full h-full object-cover object-center" alt="Thumbnail 3">
                            </button>
                            <button class="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-gray-300 transition flex items-center justify-center">
                                <span class="text-sm font-medium text-gray-500">+3 More</span>
                            </button>
                        </div>
                    </div>

                    <div class="mt-10 px-4 sm:px-0 lg:mt-0">
                        <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">NexaAudio Pro Wireless</h1>
                        
                        <div class="mt-3 flex items-center justify-between">
                            <p class="text-3xl text-gray-900 font-bold">$299.00</p>
                            <div class="flex items-center gap-2">
                                <div class="flex items-center text-yellow-400">
                                    <svg class="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                    <svg class="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                    <svg class="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                    <svg class="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                    <svg class="h-5 w-5 flex-shrink-0 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                </div>
                                <a href="#" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">117 reviews</a>
                            </div>
                        </div>

                        <div class="mt-6 text-base text-gray-500 space-y-4">
                            <p>Experience studio-quality sound with the NexaAudio Pro. Featuring active noise cancellation, 40-hour battery life, and ultra-plush memory foam ear cups for all-day listening comfort.</p>
                        </div>

                        <form class="mt-8">
                            <div>
                                <h3 class="text-sm font-medium text-gray-900">Color</h3>
                                <div class="mt-4 flex items-center space-x-3">
                                    <label class="relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none ring-gray-400 ring-2 ring-offset-2">
                                        <input type="radio" name="color-choice" value="Matte Black" class="sr-only" aria-labelledby="color-choice-0-label">
                                        <span aria-hidden="true" class="h-8 w-8 rounded-full border border-black border-opacity-10 bg-gray-900"></span>
                                    </label>
                                    <label class="relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none ring-transparent hover:ring-gray-300 ring-2 ring-offset-2 transition">
                                        <input type="radio" name="color-choice" value="Silver" class="sr-only" aria-labelledby="color-choice-1-label">
                                        <span aria-hidden="true" class="h-8 w-8 rounded-full border border-black border-opacity-10 bg-gray-300"></span>
                                    </label>
                                    <label class="relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none ring-transparent hover:ring-gray-300 ring-2 ring-offset-2 transition">
                                        <input type="radio" name="color-choice" value="Rose Gold" class="sr-only" aria-labelledby="color-choice-2-label">
                                        <span aria-hidden="true" class="h-8 w-8 rounded-full border border-black border-opacity-10 bg-rose-200"></span>
                                    </label>
                                </div>
                            </div>

                            <div class="mt-8">
                                <div class="flex items-center justify-between">
                                    <h3 class="text-sm font-medium text-gray-900">Model</h3>
                                    <a href="#" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">Compare specs</a>
                                </div>
                                <div class="mt-4 grid grid-cols-2 gap-4">
                                    <label class="group relative flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none sm:flex-1 cursor-pointer bg-white text-gray-900 shadow-sm border-indigo-600 ring-1 ring-indigo-600">
                                        <input type="radio" name="model" value="Standard" class="sr-only">
                                        <span>Standard</span>
                                    </label>
                                    <label class="group relative flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none sm:flex-1 cursor-pointer bg-white text-gray-900 shadow-sm border-gray-300">
                                        <input type="radio" name="model" value="Pro Max" class="sr-only">
                                        <span>Pro Max (+$50)</span>
                                    </label>
                                </div>
                            </div>

                            <div class="mt-10 flex gap-4">
                                <button type="submit" class="flex max-w-xs flex-1 items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 transition-colors sm:w-full">
                                    Add to bag
                                </button>
                                <button type="button" class="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-400 hover:bg-gray-50 hover:text-gray-500 transition-colors">
                                    <svg class="h-6 w-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                                    <span class="sr-only">Add to favorites</span>
                                </button>
                            </div>
                        </form>

                        <div class="mt-8 border-t border-gray-200 pt-8">
                            <h3 class="text-sm font-medium text-gray-900">Highlights</h3>
                            <div class="mt-4">
                                <ul role="list" class="list-disc space-y-2 pl-4 text-sm text-gray-500">
                                    <li class="pl-2">Industry-leading Active Noise Cancellation</li>
                                    <li class="pl-2">Up to 40 hours of listening time</li>
                                    <li class="pl-2">Spatial Audio with dynamic head tracking</li>
                                    <li class="pl-2">Seamless switching between devices</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </body>
        </html>`,
            messages: [
                { role: 'user', content: 'Create a modern landing page for an AI startup called NexaFlow' },
                { role: 'model', content: 'I\'ve created a sleek, dark-themed landing page for NexaFlow with a gradient hero section and CTA button.' },
                { role: 'user', content: 'Update that HTML code with a premium UI design. Use Tailwind CSS.' },
                { role: 'model', content: 'I have completely overhauled the design using Tailwind CSS. The new premium UI features an ambient background glow, a modern navigation bar, an animated announcement badge, a highly stylized hero section with gradient text, and beautiful frosted glass/backdrop-blur button hover effects.' },
                { role: 'user', content: 'now make one more UI example not landing page. also make the page big. need to see lot of examples in the html code' },
                { role: 'model', content: 'I have generated a large, comprehensive SaaS Admin Dashboard layout. This provides extensive examples of Tailwind CSS in action, including a functional sidebar, top navigation with search, data metric cards, a full data table with status badges, and a form interface.' },
                { role: 'user', content: 'now give me one more example' },
                { role: 'model', content: 'I have built an E-commerce Product Details page. This layout focuses on consumer-facing elements, featuring a dynamic image gallery grid, interactive color and size selectors using customized radio inputs, breadcrumb navigation, and an inline review rating display.' }
            ],
            created_at: daysAgo(45),
            updated_at: daysAgo(0),
        },
        {
            user_email: 'admin@example.com',
            name: 'Messaging Chat Interface',
            code: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>NexaChat - Web</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <script>
                tailwind.config = { theme: { extend: { fontFamily: { sans: ['Inter', 'sans-serif'] } } } }
            </script>
        </head>
        <body class="bg-gray-100 font-sans antialiased">
            <div class="flex h-screen w-full overflow-hidden bg-gray-100">
                
                <aside class="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full z-10">
                    <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 class="text-xl font-bold text-gray-800">Messages</h2>
                        <button class="p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-600 transition">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        </button>
                    </div>
                    <div class="p-4">
                        <input type="text" placeholder="Search chats..." class="w-full bg-gray-100 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
                    </div>
                    <div class="flex-1 overflow-y-auto">
                        <div class="flex items-center gap-3 p-4 bg-indigo-50 cursor-pointer border-l-4 border-indigo-600">
                            <div class="relative">
                                <img src="https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random" class="w-12 h-12 rounded-full object-cover">
                                <span class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex justify-between items-baseline">
                                    <h3 class="text-sm font-semibold text-gray-900 truncate">Sarah Jenkins</h3>
                                    <span class="text-xs text-indigo-600 font-medium">10:42 AM</span>
                                </div>
                                <p class="text-sm text-gray-600 truncate">Are we still on for the 2PM sync?</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition border-l-4 border-transparent">
                            <div class="relative">
                                <img src="https://ui-avatars.com/api/?name=Design+Team&background=0D8ABC&color=fff" class="w-12 h-12 rounded-full object-cover">
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex justify-between items-baseline">
                                    <h3 class="text-sm font-semibold text-gray-900 truncate">Design Team</h3>
                                    <span class="text-xs text-gray-400">Yesterday</span>
                                </div>
                                <p class="text-sm text-gray-500 truncate">Mike: I've updated the Figma file.</p>
                            </div>
                        </div>
                    </div>
                </aside>

                <main class="flex-1 min-w-0 flex flex-col bg-[#F8FAFC]">
                    <header class="h-16 flex-shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
                        <div class="flex items-center gap-3">
                            <img src="https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random" class="w-10 h-10 rounded-full">
                            <div>
                                <h2 class="text-base font-semibold text-gray-900">Sarah Jenkins</h2>
                                <p class="text-xs text-green-500 font-medium">Online</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-4 text-gray-400">
                            <button class="hover:text-indigo-600 transition"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg></button>
                            <button class="hover:text-indigo-600 transition"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
                        </div>
                    </header>

                    <div class="flex-1 overflow-y-auto p-6 space-y-6">
                        <div class="text-center text-xs text-gray-400 font-medium my-4">Today, 10:30 AM</div>
                        
                        <div class="flex items-end gap-2">
                            <img src="https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random" class="w-8 h-8 rounded-full mb-1">
                            <div class="bg-white border border-gray-100 shadow-sm text-gray-800 px-4 py-2.5 rounded-2xl rounded-bl-sm max-w-md text-sm">
                                Hey! Have you had a chance to review the new dashboard mockups?
                            </div>
                        </div>

                        <div class="flex items-end justify-end gap-2">
                            <div class="bg-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-br-sm max-w-md text-sm shadow-md">
                                Yes! I just looked at them. They look incredibly clean. I'll add a few comments in Figma before our meeting.
                            </div>
                        </div>
                        
                        <div class="flex items-end gap-2">
                            <img src="https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random" class="w-8 h-8 rounded-full mb-1">
                            <div class="bg-white border border-gray-100 shadow-sm text-gray-800 px-4 py-2.5 rounded-2xl rounded-bl-sm max-w-md text-sm">
                                Perfect. Are we still on for the 2PM sync?
                            </div>
                        </div>
                    </div>

                    <div class="p-4 flex-shrink-0 bg-white border-t border-gray-200">
                        <div class="flex items-center gap-3 bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                            <button class="text-gray-400 hover:text-gray-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg></button>
                            <input type="text" placeholder="Type a message..." class="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-700 placeholder-gray-400 py-1.5">
                            <button class="text-gray-400 hover:text-gray-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></button>
                            <button class="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 transition shadow-sm"><svg class="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg></button>
                        </div>
                    </div>
                </main>
            </div>
        </body>
        </html>`,
            messages: [
                { role: 'user', content: 'Give me 3 more UI examples. Make them big.' },
                { role: 'model', content: 'Here is the first example: A comprehensive Messaging and Chat Application interface, demonstrating complex pane layouts and styling for chat bubbles.' },
                { role: 'user', content: 'chat UI was having CSS issues fix it give me the new object' },
                { role: 'model', content: 'I have fixed the layout by wrapping the main components in a dedicated flex container. This resolves the issue where the sidebar and main chat area were stacking vertically instead of horizontally due to rendering environments stripping body classes.' }
            ],
            created_at: daysAgo(2),
            updated_at: daysAgo(0),
        },
        {
            user_email: 'admin@example.com',
            name: 'Kanban Task Board',
            code: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>NexaBoard - Agile Tasks</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <script>
                tailwind.config = { theme: { extend: { fontFamily: { sans: ['Inter', 'sans-serif'] } } } }
            </script>
        </head>
        <body class="bg-gray-50 font-sans h-screen flex flex-col overflow-hidden">

            <header class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <div class="flex items-center gap-4">
                    <h1 class="text-xl font-bold text-gray-900">Q3 Marketing Launch</h1>
                    <span class="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold">Active Sprint</span>
                </div>
                <div class="flex items-center gap-3">
                    <div class="flex -space-x-2">
                        <img class="w-8 h-8 rounded-full border-2 border-white" src="https://ui-avatars.com/api/?name=A+B&background=random">
                        <img class="w-8 h-8 rounded-full border-2 border-white" src="https://ui-avatars.com/api/?name=C+D&background=random">
                        <img class="w-8 h-8 rounded-full border-2 border-white" src="https://ui-avatars.com/api/?name=E+F&background=random">
                        <div class="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">+4</div>
                    </div>
                    <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition">Share Board</button>
                </div>
            </header>

            <main class="flex-1 overflow-x-auto overflow-y-hidden p-6">
                <div class="flex items-start gap-6 h-full pb-4 min-w-max">
                    
                    <div class="w-80 flex flex-col max-h-full bg-gray-100/50 rounded-xl p-3 border border-gray-200">
                        <div class="flex justify-between items-center mb-3 px-1">
                            <h2 class="font-semibold text-gray-700 text-sm flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-gray-400"></span> TO DO <span class="text-gray-400 text-xs font-normal">3</span>
                            </h2>
                            <button class="text-gray-400 hover:text-gray-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg></button>
                        </div>
                        <div class="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                            
                            <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab hover:border-indigo-300 hover:shadow-md transition">
                                <div class="flex gap-2 mb-2">
                                    <span class="px-2 py-1 rounded bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wide">High Priority</span>
                                    <span class="px-2 py-1 rounded bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wide">Design</span>
                                </div>
                                <h3 class="text-sm font-medium text-gray-900 mb-2">Design Social Media Assets for Launch</h3>
                                <p class="text-xs text-gray-500 mb-4 line-clamp-2">Create standard sizes for Twitter, LinkedIn, and Instagram based on the new brand guidelines.</p>
                                <div class="flex justify-between items-center mt-auto">
                                    <div class="flex gap-3 text-gray-400">
                                        <span class="flex items-center text-xs gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg> 2</span>
                                        <span class="flex items-center text-xs gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg> 5</span>
                                    </div>
                                    <img src="https://ui-avatars.com/api/?name=Alex+M&background=random" class="w-6 h-6 rounded-full">
                                </div>
                            </div>

                        </div>
                        <button class="mt-3 w-full py-2 flex items-center justify-center gap-2 text-sm text-gray-500 hover:bg-gray-200/50 hover:text-gray-700 rounded-lg transition font-medium">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Add Task
                        </button>
                    </div>

                    <div class="w-80 flex flex-col max-h-full bg-indigo-50/50 rounded-xl p-3 border border-indigo-100">
                        <div class="flex justify-between items-center mb-3 px-1">
                            <h2 class="font-semibold text-gray-700 text-sm flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> IN PROGRESS <span class="text-gray-400 text-xs font-normal">1</span>
                            </h2>
                        </div>
                        <div class="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                            
                            <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab border-l-4 border-l-indigo-500">
                                <div class="flex gap-2 mb-2">
                                    <span class="px-2 py-1 rounded bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-wide">Copywriting</span>
                                </div>
                                <h3 class="text-sm font-medium text-gray-900 mb-2">Draft Email Drip Campaign</h3>
                                <div class="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                                    <div class="bg-indigo-500 h-1.5 rounded-full" style="width: 45%"></div>
                                </div>
                                <div class="flex justify-between items-center mt-auto">
                                    <div class="text-xs text-gray-500 font-medium">Due Tomorrow</div>
                                    <img src="https://ui-avatars.com/api/?name=Sam+K&background=random" class="w-6 h-6 rounded-full">
                                </div>
                            </div>

                        </div>
                    </div>

                    <div class="w-80 flex flex-col max-h-full bg-gray-100/50 rounded-xl p-3 border border-gray-200 opacity-80">
                        <div class="flex justify-between items-center mb-3 px-1">
                            <h2 class="font-semibold text-gray-700 text-sm flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-green-500"></span> DONE <span class="text-gray-400 text-xs font-normal">12</span>
                            </h2>
                        </div>
                        <div class="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                            <div class="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                                <h3 class="text-sm font-medium text-gray-500 line-through mb-2">Finalize Target Audience Personas</h3>
                                <span class="px-2 py-1 rounded bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wide">Approved</span>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </body>
        </html>`,
            messages: [
                { role: 'user', content: 'Give me 3 more UI examples. Make them big.' },
                { role: 'model', content: 'Here is the second example: A Kanban Task Board, featuring horizontal scrolling, draggable-style task cards, priority badges, and progress bars.' }
            ],
            created_at: daysAgo(2),
            updated_at: daysAgo(0),
        },
        {
            user_email: 'admin@example.com',
            name: 'Social Profile & Feed',
            code: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>User Profile - NexaSocial</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <script>
                tailwind.config = { theme: { extend: { fontFamily: { sans: ['Inter', 'sans-serif'] } } } }
            </script>
        </head>
        <body class="bg-gray-100 font-sans antialiased overflow-y-scroll">

            <nav class="bg-white shadow-sm sticky top-0 z-50">
                <div class="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
                    <span class="font-bold text-xl text-indigo-600">NexaSocial</span>
                    <div class="flex items-center gap-4">
                        <div class="relative hidden sm:block">
                            <input type="text" placeholder="Search..." class="bg-gray-100 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64">
                        </div>
                        <img src="https://ui-avatars.com/api/?name=JD&background=0D8ABC&color=fff" class="w-8 h-8 rounded-full cursor-pointer">
                    </div>
                </div>
            </nav>

            <main class="max-w-5xl mx-auto pb-10">
                <div class="bg-white rounded-b-xl shadow-sm overflow-hidden mb-6">
                    <div class="h-64 w-full bg-gradient-to-r from-indigo-400 to-purple-500 relative">
                        <img src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" class="w-full h-full object-cover mix-blend-overlay opacity-50">
                    </div>
                    
                    <div class="px-8 pb-4 relative">
                        <div class="flex justify-between items-end -mt-16 mb-4">
                            <div class="relative">
                                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" class="w-32 h-32 rounded-full border-4 border-white object-cover shadow-md z-10 relative">
                                <div class="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-2 border-white rounded-full z-20"></div>
                            </div>
                            
                            <div class="flex gap-3 mb-2">
                                <button class="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg text-sm transition">Message</button>
                                <button class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm shadow-sm transition">Following</button>
                            </div>
                        </div>

                        <div>
                            <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                Jessica Davis
                                <svg class="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>
                            </h1>
                            <p class="text-gray-500 text-sm mt-1">Senior UX Designer @NexaFlow • Coffee Enthusiast • Travel Blogger</p>
                            <div class="flex gap-6 mt-4 text-sm">
                                <span class="text-gray-500"><strong class="text-gray-900">1,204</strong> Followers</span>
                                <span class="text-gray-500"><strong class="text-gray-900">450</strong> Following</span>
                            </div>
                        </div>
                    </div>

                    <div class="border-t border-gray-200 px-8 flex gap-8 text-sm font-semibold text-gray-500">
                        <a href="#" class="py-4 text-indigo-600 border-b-2 border-indigo-600">Posts</a>
                        <a href="#" class="py-4 hover:text-gray-800 transition">About</a>
                        <a href="#" class="py-4 hover:text-gray-800 transition">Photos</a>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 sm:px-0">
                    
                    <div class="lg:col-span-1 space-y-6">
                        <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
                            <h2 class="font-bold text-gray-900 mb-4">Intro</h2>
                            <ul class="space-y-3 text-sm text-gray-600">
                                <li class="flex items-center gap-3"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> Works at NexaFlow</li>
                                <li class="flex items-center gap-3"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg> Studied at Design Institute</li>
                                <li class="flex items-center gap-3"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> Lives in San Francisco, CA</li>
                            </ul>
                        </div>
                    </div>

                    <div class="lg:col-span-2 space-y-6">
                        
                        <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                            <div class="flex gap-3">
                                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&w=100&q=80" class="w-10 h-10 rounded-full object-cover">
                                <input type="text" placeholder="What's on your mind, Jessica?" class="flex-1 bg-gray-100 rounded-full px-4 text-sm focus:outline-none hover:bg-gray-200 transition cursor-text">
                            </div>
                            <div class="border-t border-gray-100 mt-4 pt-3 flex justify-around">
                                <button class="flex items-center gap-2 text-gray-500 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition"><span class="text-green-500">📷</span> Photo/Video</button>
                                <button class="flex items-center gap-2 text-gray-500 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition"><span class="text-blue-500">📍</span> Check in</button>
                            </div>
                        </div>

                        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div class="p-4 flex justify-between items-center">
                                <div class="flex items-center gap-3">
                                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&w=100&q=80" class="w-10 h-10 rounded-full object-cover">
                                    <div>
                                        <h3 class="font-bold text-sm text-gray-900">Jessica Davis</h3>
                                        <p class="text-xs text-gray-500">2 hours ago • 🌎</p>
                                    </div>
                                </div>
                                <button class="text-gray-400 hover:text-gray-600"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"></path></svg></button>
                            </div>
                            <div class="px-4 pb-3 text-sm text-gray-800">
                                Just finished up a massive UI overhaul for a new client! Really happy with how the dark mode variants turned out. Here is a sneak peek! 🎨✨ #Design #UIUX
                            </div>
                            <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" class="w-full h-auto object-cover border-y border-gray-100">
                            
                            <div class="px-4 py-3 flex justify-between items-center text-sm text-gray-500 border-b border-gray-100">
                                <span class="flex items-center gap-1"><span class="bg-blue-500 text-white rounded-full p-0.5 text-[10px]">👍</span> 248</span>
                                <span>12 Comments • 4 Shares</span>
                            </div>
                            <div class="px-4 py-2 flex justify-between">
                                <button class="flex-1 flex items-center justify-center gap-2 py-2 text-gray-500 hover:bg-gray-50 rounded-lg text-sm font-medium transition"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg> Like</button>
                                <button class="flex-1 flex items-center justify-center gap-2 py-2 text-gray-500 hover:bg-gray-50 rounded-lg text-sm font-medium transition"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg> Comment</button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </body>
        </html>`,
            messages: [
                { role: 'user', content: 'Give me 3 more UI examples. Make them big.' },
                { role: 'model', content: 'Here is the third example: A Social Media Profile and Feed, utilizing absolute positioning for a custom header, grid layouts for sidebars, and interactive post card components.' }
            ],
            created_at: daysAgo(2),
            updated_at: daysAgo(0),
        },
        {
            user_email: 'user@demo.com',
            name: 'Premium Dark Portfolio',
            code: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Creative Developer Portfolio</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <script>tailwind.config = { theme: { extend: { fontFamily: { sans: ['Plus Jakarta Sans', 'sans-serif'] } } } }</script>
        </head>
        <body class="bg-[#0a0a0a] text-white font-sans antialiased selection:bg-purple-500/30">
            <div class="relative min-h-screen overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
                <div class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"></div>

                <nav class="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
                    <a href="#" class="text-sm font-medium hover:text-purple-400 transition">Work</a>
                    <a href="#" class="text-sm font-medium hover:text-purple-400 transition">About</a>
                    <a href="#" class="text-sm font-medium hover:text-purple-400 transition">Contact</a>
                </nav>

                <main class="relative z-10 max-w-5xl mx-auto mt-20">
                    <div class="text-center mb-16">
                        <img src="https://ui-avatars.com/api/?name=Alex+Design&background=a855f7&color=fff" class="w-20 h-20 rounded-full mx-auto mb-6 border-2 border-white/10 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                        <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">Digital Craftsman.</h1>
                        <p class="text-lg text-gray-400 max-w-xl mx-auto">Building premium web experiences merging high-end design with robust engineering.</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[250px]">
                        <div class="md:col-span-2 md:row-span-2 group relative rounded-3xl bg-white/5 border border-white/10 overflow-hidden hover:border-purple-500/50 transition duration-500">
                            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop" class="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 group-hover:opacity-60 transition duration-700">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                            <div class="absolute bottom-0 left-0 p-8">
                                <span class="px-3 py-1 text-xs font-semibold bg-purple-500/20 text-purple-300 rounded-full backdrop-blur-sm border border-purple-500/30 mb-3 inline-block">E-Commerce</span>
                                <h3 class="text-3xl font-bold text-white mb-2">Aura Skincare</h3>
                                <p class="text-gray-300">A headless Shopify experience built with Next.js.</p>
                            </div>
                        </div>

                        <div class="group relative rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-8 flex flex-col justify-center hover:-translate-y-1 transition duration-300">
                            <h3 class="text-xl font-bold mb-2">Tech Stack</h3>
                            <div class="flex flex-wrap gap-2 mt-2">
                                <span class="px-3 py-1 text-xs rounded-full bg-white/10 text-white">React</span>
                                <span class="px-3 py-1 text-xs rounded-full bg-white/10 text-white">Three.js</span>
                                <span class="px-3 py-1 text-xs rounded-full bg-white/10 text-white">Tailwind</span>
                                <span class="px-3 py-1 text-xs rounded-full bg-white/10 text-white">Framer</span>
                            </div>
                        </div>

                        <div class="group relative rounded-3xl bg-purple-600/10 border border-purple-500/20 p-8 flex flex-col items-center justify-center text-center hover:bg-purple-600/20 transition duration-300 cursor-pointer">
                            <div class="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </div>
                            <h3 class="text-xl font-bold text-white">Let's Talk</h3>
                            <p class="text-sm text-purple-300 mt-1">Available for freelance</p>
                        </div>
                    </div>
                </main>
            </div>
        </body>
        </html>`,
            messages: [
                { role: 'user', content: 'Build a minimal dark portfolio website with a project grid' },
                { role: 'model', content: 'I have created a premium dark portfolio using a modern Bento Grid layout. It features a floating glassmorphic navigation bar, subtle background ambient glows, and interactive cards that zoom and highlight on hover to showcase your projects elegantly.' }
            ],
            created_at: daysAgo(30),
            updated_at: daysAgo(0),
        },
        {
            user_email: 'user@demo.com',
            name: 'Premium FinTech Wallet',
            code: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>NexaPay Wallet</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <script>tailwind.config = { theme: { extend: { fontFamily: { sans: ['Inter', 'sans-serif'] } } } }</script>
        </head>
        <body class="bg-[#0B0F19] text-white font-sans antialiased h-screen flex justify-center items-center p-4 sm:p-8">
            
            <div class="w-full max-w-md bg-[#111827] rounded-[40px] shadow-2xl overflow-hidden border border-gray-800 relative ring-8 ring-[#1A2235]">
                <header class="p-6 flex justify-between items-center z-20 relative">
                    <div class="flex items-center gap-3">
                        <img src="https://ui-avatars.com/api/?name=User&background=3B82F6&color=fff" class="w-10 h-10 rounded-full border-2 border-gray-700">
                        <div>
                            <p class="text-xs text-gray-400 font-medium">Good morning,</p>
                            <p class="text-sm font-bold">David M.</p>
                        </div>
                    </div>
                    <button class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition">
                        <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                    </button>
                </header>

                <div class="px-6 relative z-10">
                    <div class="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl p-6 shadow-[0_10px_40px_-10px_rgba(59,130,246,0.5)] relative overflow-hidden">
                        <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                        <div class="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-blue-400/20 rounded-full blur-lg"></div>
                        
                        <p class="text-blue-100 text-sm font-medium mb-1 relative z-10">Total Balance</p>
                        <h2 class="text-4xl font-extrabold text-white tracking-tight mb-6 relative z-10">$24,562.00</h2>
                        
                        <div class="flex gap-3 relative z-10">
                            <button class="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg> Send
                            </button>
                            <button class="flex-1 bg-black/20 hover:bg-black/30 backdrop-blur-md text-white py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path></svg> Receive
                            </button>
                        </div>
                    </div>
                </div>

                <div class="mt-8 px-6 pb-8 h-full bg-gray-900 rounded-t-[32px] pt-6 relative border-t border-gray-800">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="font-semibold text-lg">Recent Activity</h3>
                        <a href="#" class="text-sm text-blue-500 font-medium">See all</a>
                    </div>

                    <div class="space-y-4">
                        <div class="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-800 transition cursor-pointer">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                                    <span class="text-xl">🍎</span>
                                </div>
                                <div>
                                    <p class="font-semibold text-sm">Apple Store</p>
                                    <p class="text-xs text-gray-500">Today, 2:45 PM</p>
                                </div>
                            </div>
                            <p class="font-semibold text-sm text-white">-$1,299.00</p>
                        </div>

                        <div class="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-800 transition cursor-pointer">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center border border-blue-800/50">
                                    <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                </div>
                                <div>
                                    <p class="font-semibold text-sm">NexaCorp Salary</p>
                                    <p class="text-xs text-gray-500">Yesterday, 9:00 AM</p>
                                </div>
                            </div>
                            <p class="font-semibold text-sm text-emerald-400">+$4,250.00</p>
                        </div>
                        
                        <div class="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-800 transition cursor-pointer">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                                    <span class="text-xl">☕</span>
                                </div>
                                <div>
                                    <p class="font-semibold text-sm">Starbucks</p>
                                    <p class="text-xs text-gray-500">Yesterday, 8:15 AM</p>
                                </div>
                            </div>
                            <p class="font-semibold text-sm text-white">-$5.40</p>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>`,
            messages: [
                { role: 'user', content: 'Create a UI for a personal finance app' },
                { role: 'model', content: 'Here is a premium mobile-first dashboard for a FinTech app. It features a striking gradient balance card with glassmorphic buttons, nested within a sleek dark-themed container that highlights recent transactions with high-quality spacing and typography.' }
            ],
            created_at: daysAgo(20),
            updated_at: daysAgo(2),
        },
        {
            user_email: 'user@demo.com',
            name: 'AI Generator Studio',
            code: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Lumina AI Studio</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
            <script>tailwind.config = { theme: { extend: { fontFamily: { sans: ['Outfit', 'sans-serif'] } } } }</script>
        </head>
        <body class="bg-[#050505] text-gray-200 font-sans h-screen flex flex-col overflow-hidden">
            
            <header class="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-white/[0.02] backdrop-blur-xl z-20">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-fuchsia-600 to-blue-600 flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <span class="text-xl font-bold text-white tracking-wide">Lumina</span>
                </div>
                <button class="bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-medium px-4 py-2 rounded-full transition">Upgrade to Pro</button>
            </header>

            <main class="flex-1 relative overflow-hidden flex flex-col">
                
                <div class="flex-1 overflow-y-auto p-6 pb-32">
                    <div class="max-w-7xl mx-auto columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        <div class="relative group rounded-2xl overflow-hidden border border-white/10 cursor-pointer">
                            <img src="https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=800&auto=format&fit=crop" class="w-full object-cover transition duration-500 group-hover:scale-105">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                <p class="text-xs text-gray-300 line-clamp-2">"A hyper-realistic cyberpunk city orbiting a gas giant, neon lights, 8k resolution, cinematic lighting"</p>
                                <div class="flex gap-2 mt-3">
                                    <button class="bg-white/20 hover:bg-white/30 backdrop-blur text-white p-2 rounded-lg"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg></button>
                                </div>
                            </div>
                        </div>
                        <div class="relative group rounded-2xl overflow-hidden border border-white/10 cursor-pointer">
                            <img src="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop" class="w-full object-cover transition duration-500 group-hover:scale-105">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                <p class="text-xs text-gray-300 line-clamp-2">"Abstract geometric shapes floating in void, iridescent materials, octane render"</p>
                            </div>
                        </div>
                        <div class="relative group rounded-2xl overflow-hidden border border-white/10 cursor-pointer">
                            <img src="https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800&auto=format&fit=crop" class="w-full object-cover transition duration-500 group-hover:scale-105">
                        </div>
                    </div>
                </div>

                <div class="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4">
                    <div class="bg-gray-900/80 backdrop-blur-2xl border border-white/20 p-2 rounded-3xl shadow-[0_0_50px_-12px_rgba(192,38,211,0.4)] flex items-center gap-3 relative overflow-hidden">
                        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-fuchsia-500/10 to-blue-500/10 blur-xl pointer-events-none"></div>
                        
                        <button class="p-3 text-gray-400 hover:text-white transition relative z-10">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        </button>
                        <input type="text" placeholder="Imagine anything... Type your prompt here" class="flex-1 bg-transparent border-none focus:outline-none text-white placeholder-gray-500 text-lg relative z-10 py-3">
                        <button class="bg-white text-black font-semibold px-6 py-3 rounded-2xl hover:bg-gray-200 transition relative z-10 flex items-center gap-2">
                            Generate <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                        </button>
                    </div>
                    <div class="flex justify-center gap-4 mt-3 text-xs text-gray-500 font-medium">
                        <span class="hover:text-gray-300 cursor-pointer">Aspect Ratio: 16:9</span>
                        <span class="hover:text-gray-300 cursor-pointer">Model: Lumina v5</span>
                        <span class="hover:text-gray-300 cursor-pointer">Style: Cinematic</span>
                    </div>
                </div>

            </main>
        </body>
        </html>`,
            messages: [
                { role: 'user', content: 'Design a UI for an AI image generator app.' },
                { role: 'model', content: 'I have designed a highly immersive AI Studio interface. It features a masonry image gallery layout and a visually striking, glassmorphic floating prompt bar at the bottom with neon ambient glows to signify creative generation.' }
            ],
            created_at: daysAgo(15),
            updated_at: daysAgo(1),
        },
        {
            user_email: 'user@demo.com',
            name: 'Luxury Travel Booking',
            code: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>WanderLuxe - Curated Stays</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
            <script>
                tailwind.config = { theme: { extend: { fontFamily: { serif: ['Playfair Display', 'serif'], sans: ['Inter', 'sans-serif'] } } } }
            </script>
        </head>
        <body class="bg-[#FAFAFA] text-gray-900 font-sans antialiased selection:bg-rose-200">
            
            <div class="relative h-[70vh] w-full p-4 sm:p-6 lg:p-8">
                <div class="w-full h-full rounded-[40px] overflow-hidden relative shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2000&auto=format&fit=crop" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60"></div>
                    
                    <nav class="absolute top-0 w-full p-8 flex justify-between items-center text-white z-10">
                        <span class="text-2xl font-serif tracking-wide">WanderLuxe.</span>
                        <div class="hidden md:flex gap-8 font-medium text-sm">
                            <a href="#" class="hover:text-rose-200 transition">Destinations</a>
                            <a href="#" class="hover:text-rose-200 transition">Experiences</a>
                            <a href="#" class="hover:text-rose-200 transition">Journal</a>
                        </div>
                        <button class="bg-white/20 hover:bg-white/30 backdrop-blur-md px-6 py-2 rounded-full text-sm font-semibold transition">Sign In</button>
                    </nav>

                    <div class="absolute bottom-24 left-8 md:left-16 z-10 max-w-2xl text-white">
                        <h1 class="text-5xl md:text-7xl font-serif leading-tight mb-4">Discover the extraordinary.</h1>
                        <p class="text-lg md:text-xl text-white/80 font-medium">Curated luxury villas and boutique hotels around the globe.</p>
                    </div>
                </div>
                
                <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[90%] max-w-4xl bg-white rounded-full shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] p-3 flex flex-col md:flex-row items-center border border-gray-100 z-20">
                    <div class="flex-1 px-6 py-2 border-b md:border-b-0 md:border-r border-gray-200 w-full">
                        <p class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Where</p>
                        <input type="text" placeholder="Santorini, Greece" class="w-full focus:outline-none text-gray-900 font-medium placeholder-gray-900 text-lg">
                    </div>
                    <div class="flex-1 px-6 py-2 border-b md:border-b-0 md:border-r border-gray-200 w-full">
                        <p class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">When</p>
                        <input type="text" placeholder="Oct 12 - Oct 19" class="w-full focus:outline-none text-gray-900 font-medium placeholder-gray-900 text-lg">
                    </div>
                    <div class="flex-1 px-6 py-2 w-full flex justify-between items-center">
                        <div>
                            <p class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Who</p>
                            <input type="text" placeholder="2 Guests" class="w-full focus:outline-none text-gray-900 font-medium placeholder-gray-900 text-lg">
                        </div>
                        <button class="bg-rose-900 hover:bg-rose-800 text-white w-14 h-14 rounded-full flex items-center justify-center transition shadow-lg shrink-0">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </button>
                    </div>
                </div>
            </div>

            <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 pb-20">
                <div class="flex justify-between items-end mb-10">
                    <h2 class="text-4xl font-serif text-gray-900">Trending Destinations</h2>
                    <a href="#" class="text-rose-900 font-semibold flex items-center gap-2 hover:gap-3 transition-all">View all <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></a>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="group cursor-pointer">
                        <div class="relative h-96 rounded-3xl overflow-hidden mb-4 shadow-md">
                            <img src="https://images.unsplash.com/photo-1516483638261-f4085ee6bd0f?q=80&w=800&auto=format&fit=crop" class="w-full h-full object-cover group-hover:scale-110 transition duration-700">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
                            <button class="absolute top-4 right-4 bg-white/30 backdrop-blur-md p-2 rounded-full text-white hover:bg-white hover:text-rose-500 transition"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg></button>
                        </div>
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="text-xl font-bold text-gray-900">Cinque Terre</h3>
                                <p class="text-gray-500">Italy</p>
                            </div>
                            <div class="text-right">
                                <p class="font-bold text-gray-900">$450 <span class="text-sm font-normal text-gray-500">/night</span></p>
                                <div class="flex items-center gap-1 text-sm font-medium text-gray-900 mt-1"><span class="text-yellow-400">★</span> 4.96</div>
                            </div>
                        </div>
                    </div>
                    <div class="group cursor-pointer mt-0 md:mt-12">
                        <div class="relative h-96 rounded-3xl overflow-hidden mb-4 shadow-md">
                            <img src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800&auto=format&fit=crop" class="w-full h-full object-cover group-hover:scale-110 transition duration-700">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
                        </div>
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="text-xl font-bold text-gray-900">Bali Resort</h3>
                                <p class="text-gray-500">Indonesia</p>
                            </div>
                            <div class="text-right">
                                <p class="font-bold text-gray-900">$280 <span class="text-sm font-normal text-gray-500">/night</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </body>
        </html>`,
            messages: [
                { role: 'user', content: 'Design a luxury travel booking website.' },
                { role: 'model', content: 'I have designed a premium luxury travel landing page. The interface utilizes a massive hero image within a rounded container, a floating multi-part search bar bridging the hero and the content, and large, elegant destination cards utilizing serif typography for an upscale feel.' }
            ],
            created_at: daysAgo(5),
            updated_at: daysAgo(0),
        },
        {
            user_email: 'user@demo.com',
            name: 'Streaming Platform UI',
            code: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>StreamLine - Movies & Shows</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <script>tailwind.config = { theme: { extend: { fontFamily: { sans: ['Inter', 'sans-serif'] } } } }</script>
        </head>
        <body class="bg-black text-white font-sans antialiased overflow-x-hidden">
            
            <header class="fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent px-8 py-4 flex justify-between items-center transition-all">
                <div class="flex items-center gap-10">
                    <span class="text-2xl font-extrabold text-red-600 tracking-tighter">STREAMLINE</span>
                    <nav class="hidden md:flex gap-6 text-sm font-medium text-gray-300">
                        <a href="#" class="text-white">Home</a>
                        <a href="#" class="hover:text-white transition">TV Shows</a>
                        <a href="#" class="hover:text-white transition">Movies</a>
                        <a href="#" class="hover:text-white transition">My List</a>
                    </nav>
                </div>
                <div class="flex items-center gap-6">
                    <button class="text-white hover:text-gray-300"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></button>
                    <button class="text-white hover:text-gray-300 relative"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg><span class="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full"></span></button>
                    <img src="https://ui-avatars.com/api/?name=User&background=333&color=fff" class="w-8 h-8 rounded-md cursor-pointer">
                </div>
            </header>

            <div class="relative h-[85vh] w-full">
                <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000&auto=format&fit=crop" class="absolute inset-0 w-full h-full object-cover">
                
                <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                
                <div class="absolute bottom-1/4 left-8 md:left-16 max-w-2xl z-10">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Dune_Logo.svg/1024px-Dune_Logo.svg.png" alt="Movie Logo" class="h-24 mb-6 invert brightness-0 opacity-90">
                    <div class="flex items-center gap-3 text-sm font-semibold mb-4 text-gray-300">
                        <span class="text-green-500">98% Match</span>
                        <span>2024</span>
                        <span class="border border-gray-500 px-1 rounded text-xs">PG-13</span>
                        <span>2h 46m</span>
                        <span class="bg-gray-800 text-white px-1.5 rounded text-xs">4K Ultra HD</span>
                    </div>
                    <p class="text-lg text-gray-200 mb-8 line-clamp-3">Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.</p>
                    <div class="flex gap-4">
                        <button class="bg-white hover:bg-gray-200 text-black px-8 py-3 rounded flex items-center gap-2 font-bold text-lg transition">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6V4z"></path></svg> Play
                        </button>
                        <button class="bg-gray-500/50 hover:bg-gray-500/70 backdrop-blur-md text-white px-8 py-3 rounded flex items-center gap-2 font-bold text-lg transition">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> More Info
                        </button>
                    </div>
                </div>
            </div>

            <main class="pl-8 md:pl-16 pb-20 -mt-10 relative z-20">
                <h2 class="text-2xl font-bold mb-4 text-white">Continue Watching for You</h2>
                <div class="flex gap-4 overflow-x-auto pb-8 pr-8 custom-scrollbar scroll-smooth snap-x">
                    
                    <div class="shrink-0 w-72 group relative rounded-md overflow-hidden cursor-pointer snap-start hover:scale-105 transition duration-300 z-10 hover:z-20 hover:shadow-2xl">
                        <div class="aspect-[16/9] w-full bg-gray-900 relative">
                            <img src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=800&auto=format&fit=crop" class="w-full h-full object-cover">
                            <div class="absolute bottom-0 left-0 w-full h-1 bg-gray-600">
                                <div class="h-full bg-red-600 w-[60%]"></div>
                            </div>
                            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                <div class="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-black/50 backdrop-blur-sm">
                                    <svg class="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6V4z"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="shrink-0 w-72 group relative rounded-md overflow-hidden cursor-pointer snap-start hover:scale-105 transition duration-300 z-10 hover:z-20 hover:shadow-2xl">
                        <div class="aspect-[16/9] w-full bg-gray-900 relative">
                            <img src="https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=800&auto=format&fit=crop" class="w-full h-full object-cover">
                            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                <div class="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-black/50">
                                    <svg class="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6V4z"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="shrink-0 w-72 group relative rounded-md overflow-hidden cursor-pointer snap-start hover:scale-105 transition duration-300 z-10 hover:z-20 hover:shadow-2xl">
                        <div class="aspect-[16/9] w-full bg-gray-900 relative">
                            <img src="https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=800&auto=format&fit=crop" class="w-full h-full object-cover">
                        </div>
                    </div>
                </div>
                
                <style>
                    .custom-scrollbar::-webkit-scrollbar { height: 0px; }
                </style>
            </main>
        </body>
        </html>`,
            messages: [
                { role: 'user', content: 'Create a UI for a video streaming platform.' },
                { role: 'model', content: 'Here is a premium streaming layout. It features a full-bleed cinematic hero background with vignette gradients to ensure text legibility, alongside a horizontal scrolling carousel for media thumbnails equipped with Netflix-style zoom-on-hover effects.' }
            ],
            created_at: daysAgo(10),
            updated_at: daysAgo(1),
        },
        {
            user_email: 'user@demo.com',
            name: 'Fitness & Sleep Tracker',
            code: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Vitality Health Tracker</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <script>tailwind.config = { theme: { extend: { fontFamily: { sans: ['Manrope', 'sans-serif'] } } } }</script>
        </head>
        <body class="bg-[#090C15] text-white font-sans antialiased min-h-screen p-4 sm:p-8 flex justify-center items-center">
            
            <div class="w-full max-w-sm bg-[#131826] rounded-[40px] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-[#1F2937] overflow-hidden">
                
                <div class="p-6 pb-2 flex justify-between items-center">
                    <div>
                        <h1 class="text-2xl font-bold tracking-tight">Today</h1>
                        <p class="text-sm text-gray-400 font-medium">Thursday, Oct 12</p>
                    </div>
                    <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 p-[2px]">
                        <img src="https://ui-avatars.com/api/?name=Emma&background=131826&color=fff" class="w-full h-full rounded-full border-2 border-[#131826]">
                    </div>
                </div>

                <div class="p-6 space-y-4">
                    
                    <div class="bg-[#1C2333] rounded-3xl p-5 border border-white/5 flex items-center justify-between">
                        <div>
                            <h2 class="font-bold text-lg mb-4">Activity</h2>
                            <div class="space-y-3">
                                <div class="flex items-center gap-3">
                                    <span class="w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.8)]"></span>
                                    <div>
                                        <p class="text-xs text-gray-400">Move</p>
                                        <p class="font-bold text-sm">480 / <span class="text-gray-500">600 kcal</span></p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]"></span>
                                    <div>
                                        <p class="text-xs text-gray-400">Exercise</p>
                                        <p class="font-bold text-sm">32 / <span class="text-gray-500">45 min</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="relative w-24 h-24 flex items-center justify-center">
                            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#311728" stroke-width="8"/>
                                <circle cx="50" cy="50" r="28" fill="transparent" stroke="#162E21" stroke-width="8"/>
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ec4899" stroke-width="8" stroke-dasharray="251" stroke-dashoffset="50" stroke-linecap="round"/>
                                <circle cx="50" cy="50" r="28" fill="transparent" stroke="#4ade80" stroke-width="8" stroke-dasharray="175" stroke-dashoffset="40" stroke-linecap="round"/>
                            </svg>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-3xl p-4">
                            <div class="flex items-center gap-2 mb-2">
                                <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path></svg>
                                <span class="text-xs font-semibold text-red-400">Heart Rate</span>
                            </div>
                            <p class="text-3xl font-extrabold text-white">72 <span class="text-sm font-medium text-gray-400">bpm</span></p>
                            <p class="text-xs text-gray-500 mt-1">Resting: 64 bpm</p>
                        </div>

                        <div class="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-3xl p-4">
                            <div class="flex items-center gap-2 mb-2">
                                <svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
                                <span class="text-xs font-semibold text-blue-400">Sleep</span>
                            </div>
                            <p class="text-3xl font-extrabold text-white">7<span class="text-xl">h</span> 15<span class="text-xl">m</span></p>
                            <p class="text-xs text-gray-500 mt-1">Deep sleep: 2h</p>
                        </div>
                    </div>
                    
                    <div class="bg-[#1C2333] rounded-3xl p-4 border border-white/5 flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
                                <svg class="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                            </div>
                            <div>
                                <p class="font-bold">Water</p>
                                <p class="text-xs text-gray-400">1.2 / 2.5 Liters</p>
                            </div>
                        </div>
                        <button class="w-8 h-8 rounded-full bg-cyan-500 hover:bg-cyan-400 flex items-center justify-center text-black font-bold transition">+</button>
                    </div>
                </div>
            </div>
        </body>
        </html>`,
            messages: [
                { role: 'user', content: 'Create a UI for a health tracking app.' },
                { role: 'model', content: 'I created a premium dark-mode fitness tracker dashboard. It uses high-contrast neon accents for data visualization, including a custom SVG implementation for circular activity rings, and clean bento-style cards for modular health metrics.' }
            ],
            created_at: daysAgo(50),
            updated_at: daysAgo(1),
        }

    ];

    const { error } = await supabaseAdmin.from('websites').insert(websites);
    if (error) throw new Error(`Seed websites failed: ${error.message}`);
}

// ---------------------------------------------------------------------------
// STEP 10: Seed RAG Documents with REAL Embeddings
// Downloads a real PDF, extracts text, generates Gemini embeddings, and stores
// chunks for both admin and demo user so LiveChat can answer questions.
// ---------------------------------------------------------------------------
const PDF_URL = 'https://writing.colostate.edu/guides/documents/resume/functionalsample.pdf';

async function seedRAGDocuments(): Promise<{ docCount: number; chunkCount: number }> {
    const targetUsers = ['admin@example.com', 'user@demo.com'];
    let totalChunks = 0;

    try {
        // 1. Download the PDF
        console.log('[SEED] Downloading PDF from:', PDF_URL);
        const pdfResponse = await fetch(PDF_URL);
        if (!pdfResponse.ok) throw new Error(`Failed to download PDF: ${pdfResponse.status}`);
        const pdfArrayBuffer = await pdfResponse.arrayBuffer();
        const pdfBuffer = Buffer.from(pdfArrayBuffer);
        console.log(`[SEED] PDF downloaded: ${pdfBuffer.length} bytes`);

        // 2. Extract text from PDF
        const extractedText = await extractTextFromFile(pdfBuffer, 'functionalsample.pdf');
        if (!extractedText || extractedText.trim().length < 10) {
            throw new Error('No useful text extracted from PDF');
        }
        console.log(`[SEED] Extracted ${extractedText.length} characters from PDF`);

        // 3. Chunk the text
        const textChunks = chunkText(extractedText);
        console.log(`[SEED] Created ${textChunks.length} chunks`);

        // 4. Generate embeddings for all chunks
        console.log('[SEED] Generating embeddings via Gemini...');
        const embeddedChunks = await Promise.all(
            textChunks.map(async (content) => {
                const embedding = await getEmbedding(content);
                return { content, embedding };
            })
        );
        console.log(`[SEED] Generated ${embeddedChunks.length} embeddings`);

        // 5. Create document + chunks for each target user
        for (const userEmail of targetUsers) {
            // Create the document record
            const { data: doc, error: docError } = await supabaseAdmin
                .from('documents')
                .insert({
                    user_email: userEmail,
                    name: 'Functional Resume Sample.pdf',
                    status: 'completed',
                    metadata: {
                        pages: 1,
                        size: `${Math.round(pdfBuffer.length / 1024)} KB`,
                        type: 'application/pdf',
                        source: PDF_URL,
                    },
                    created_at: daysAgo(5),
                })
                .select('id')
                .single();

            if (docError) throw new Error(`Seed document for ${userEmail} failed: ${docError.message}`);

            // Insert chunks with real embeddings
            const chunksToInsert = embeddedChunks.map((c) => ({
                document_id: doc.id,
                content: c.content,
                embedding: c.embedding,
            }));

            const { error: chunkError } = await supabaseAdmin
                .from('document_chunks')
                .insert(chunksToInsert);

            if (chunkError) throw new Error(`Seed chunks for ${userEmail} failed: ${chunkError.message}`);
            totalChunks += chunksToInsert.length;
            console.log(`[SEED] Seeded ${chunksToInsert.length} chunks for ${userEmail}`);
        }

        return { docCount: targetUsers.length, chunkCount: totalChunks };
    } catch (error: any) {
        console.error('[SEED] RAG document seeding failed:', error.message);
        console.warn('[SEED] Falling back to placeholder documents (no embeddings)');

        // Fallback: insert placeholder documents without embeddings
        const fallbackDocs = targetUsers.map((email) => ({
            user_email: email,
            name: 'Functional Resume Sample.pdf',
            status: 'error' as const,
            metadata: {
                error: `Embedding generation failed: ${error.message}`,
                type: 'application/pdf',
            },
            created_at: daysAgo(5),
        }));

        const { error: fbError } = await supabaseAdmin.from('documents').insert(fallbackDocs);
        if (fbError) console.error('[SEED] Fallback document insert failed:', fbError.message);

        return { docCount: targetUsers.length, chunkCount: 0 };
    }
}

// ---------------------------------------------------------------------------
// STEP 11: Seed Languages and Translations
// ---------------------------------------------------------------------------
async function seedLanguagesAndTranslations() {
    const languages = [
        { code: 'en', name: 'English', direction: 'ltr', is_enabled: true, created_at: daysAgo(10) },
        { code: 'fr', name: 'French', direction: 'ltr', is_enabled: true, created_at: daysAgo(10) },
        { code: 'es', name: 'Spanish', direction: 'ltr', is_enabled: true, created_at: daysAgo(10) },
        { code: 'ar', name: 'Arabic', direction: 'rtl', is_enabled: true, created_at: daysAgo(10) }
    ];

    const { data: langData, error: langError } = await supabaseAdmin.from('languages').upsert(languages, { onConflict: 'code' }).select();
    if (langError) throw new Error(`Seed languages failed: ${langError.message}`);

    const translationsToInsert: any[] = [];
    for (const [key, values] of Object.entries(translationsData)) {
        translationsToInsert.push({ 
            translation_key: key, 
            language_code: 'en', 
            value: (values as any).en || key, 
            updated_at: new Date().toISOString() 
        });
        translationsToInsert.push({ 
            translation_key: key, 
            language_code: 'fr', 
            value: (values as any).fr || (values as any).en || key, 
            updated_at: new Date().toISOString() 
        });
        translationsToInsert.push({ 
            translation_key: key, 
            language_code: 'es', 
            value: (values as any).es || (values as any).en || key, 
            updated_at: new Date().toISOString() 
        });
        translationsToInsert.push({ 
            translation_key: key, 
            language_code: 'ar', 
            value: (values as any).ar || (values as any).en || key, 
            updated_at: new Date().toISOString() 
        });
    }

    // Insert in batches of 500
    const chunkSize = 500;
    for (let i = 0; i < translationsToInsert.length; i += chunkSize) {
        const batch = translationsToInsert.slice(i, i + chunkSize);
        if (batch.length === 0) continue;
        const { error } = await supabaseAdmin.from('translations').upsert(batch, { onConflict: 'translation_key,language_code' });
        if (error) throw new Error(`Seed translations failed (batch ${i}): ${error.message}`);
    }
}

// ---------------------------------------------------------------------------
// STEP 12: Seed Meetings
// ---------------------------------------------------------------------------
async function seedMeetings() {
    const meetings = [
        {
            id: 'daily-scrum-99',
            title: 'Daily Scrum - Product Team',
            host_email: 'admin@example.com',
            status: 'active',
            max_participants: 8,
            created_at: hoursAgo(2),
        },
        {
            id: 'design-review-101',
            title: 'Design Review: Dashboard v2',
            host_email: 'admin@example.com',
            status: 'active',
            max_participants: 5,
            created_at: daysAgo(1),
        },
        {
            id: 'client-onboarding-jordan',
            title: 'Jordan Lee Onboarding',
            host_email: 'admin@example.com',
            status: 'ended',
            max_participants: 2,
            created_at: daysAgo(2),
            ended_at: daysAgo(2),
        },
        {
            id: 'marketing-sync-demo',
            title: 'Marketing Strategy Sync',
            host_email: 'user@demo.com',
            status: 'active',
            max_participants: 10,
            created_at: hoursAgo(4),
        },
        {
            id: 'quick-catchup-123',
            title: 'Quick Catch-up',
            host_email: 'user@demo.com',
            status: 'active',
            max_participants: 3,
            created_at: hoursAgo(1),
        }
    ];

    const { error } = await supabaseAdmin.from('meetings').insert(meetings);
    if (error) throw new Error(`Seed meetings failed: ${error.message}`);
}

// ============================================================================
// MAIN GET HANDLER
// ============================================================================
export async function GET(request: Request) {
    try {
        // Optional: Verify cron secret for Vercel cron jobs
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const startTime = Date.now();

        // ---- STEP 1: Clear all existing data ----
        await truncateAllTables();

        // ---- STEP 2: Seed data in correct FK order ----
        await seedLanguagesAndTranslations();                  // en, fr and translations
        const userMap = await seedUsers();                    // 8 users
        await seedUserBalances();                              // 8 balances
        await seedSystemSettings();                            // 1 settings row
        await seedPricingPlans();                              // 4 plans
        await seedSubscriptions();                             // 8 subscriptions
        await seedPayments(userMap);                           // 12 payments
        const tokenLogCount = await seedTokenLogs();           // ~100+ token logs
        await seedWebsites();                           // websites
        const ragResult = await seedRAGDocuments();              // real PDF with embeddings
        await seedMeetings();                                  // demo meetings

        const elapsed = Date.now() - startTime;

        return NextResponse.json({
            success: true,
            message: 'Database seeded successfully',
            duration: `${elapsed}ms`,
            summary: {
                users: 8,
                user_balances: 8,
                system_settings: 1,
                pricing_plans: 4,
                subscriptions: 8,
                payments: 12,
                token_logs: tokenLogCount,
                websites: 12,
                documents: ragResult.docCount,
                document_chunks: ragResult.chunkCount,
                languages: 4,
                translations: Object.keys(translationsData).length * 4,
                meetings: 5,
            },
        });
    } catch (error: any) {
        console.error('Database seed error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Unknown error during seeding',
            },
            { status: 500 }
        );
    }
}
