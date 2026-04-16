import { supabaseAdmin } from './supabase';
import fs from 'fs';

const LOG_FILE = 'c:/sairam/applications/AI Suite/v6.2/ai-suite/tmp/rag-logs.txt';
function debugLog(msg: string) {
    const timestamp = new Date().toISOString();
    const formattedMsg = `[DB][${timestamp}] ${msg}\n`;
    try {
        fs.appendFileSync(LOG_FILE, formattedMsg);
    } catch (e) {}
}

export interface User {
    id?: string;
    email: string;
    password?: string;
    name?: string;
    role: "user" | "admin";
    createdAt: string;
    status: "active" | "disabled";
    disabledFeatures?: string[];
    tokens?: number;
}

export interface TokenBalance {
    email: string;
    balance: number;
    updatedAt: string;
}

export interface TokenLog {
    email: string;
    amount: number;
    action: "consume" | "add" | "reset";
    feature?: string;
    timestamp: string;
}

export interface SystemSettings {
    defaultTokens: number;
    aiLimits: Record<string, number>;
    paymentEnabled: boolean;
    paymentGateway?: string;
    stripePublicKey?: string;
    stripeSecretKey?: string;
    paypalClientId?: string;
    paypalClientSecret?: string;
    paypalMode?: string;

    metadata?: Record<string, any>;
}

export interface PricingPlan {
    id: string;
    name: string;
    price: number;
    tokens: number;
    interval: 'month' | 'year';
    features: string[];
    aiTools?: string[];
    isActive: boolean;
}

export interface PaymentRecord {
    id: string;
    userId: string;
    userEmail: string;
    planId: string;
    amount: number;
    status: 'succeeded' | 'failed' | 'pending';
    paymentGateway?: string;
    createdAt: string;
}

export interface SubscriptionRecord {
    id: string;
    userEmail: string;
    planId: string;
    status: 'active' | 'trialing' | 'canceled' | 'past_due' | 'unpaid';
    createdAt: string;
}

export interface WebsiteProject {
    id: string;
    userEmail: string;
    name: string;
    code: string;
    createdAt: string;
    updatedAt: string;
    previewImage?: string;
    messages?: any[];
}

export interface Document {
    id: string;
    userEmail: string;
    name: string;
    status: 'processing' | 'completed' | 'error';
    metadata?: any;
    createdAt: string;
}

export interface DocumentChunk {
    id: string;
    documentId: string;
    content: string;
    similarity?: number;
}

export interface Language {
    id?: string;
    code: string;
    name: string;
    direction: 'ltr' | 'rtl';
    isEnabled: boolean;
    createdAt?: string;
}

export interface Translation {
    id?: string;
    translationKey: string;
    languageCode: string;
    value: string;
    updatedAt?: string;
}

class SystemDB {
    // Users
    async getUser(email: string): Promise<User | null> {
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !data) return null;

        return {
            id: data.id,
            email: data.email,
            name: data.name,
            role: data.role,
            createdAt: data.created_at,
            status: data.status,
            disabledFeatures: data.disabled_features,
            password: data.password
        };
    }

    async saveUser(user: User): Promise<User> {
        const { data, error } = await supabaseAdmin
            .from('users')
            .upsert({
                email: user.email,
                name: user.name,
                role: user.role,
                status: user.status,
                password: user.password,
                created_at: user.createdAt, // If preserving creation time
                disabled_features: user.disabledFeatures
            }, { onConflict: 'email' })
            .select()
            .single();

        if (error) throw new Error(`Error saving user: ${error.message}`);

        return {
            ...user,
            id: data.id
        };
    }

    async listUsers(): Promise<User[]> {
        const { data: users, error } = await supabaseAdmin
            .from('users')
            .select('*');

        if (error || !users) return [];

        // Fetch token balances
        const { data: balances } = await supabaseAdmin
            .from('user_balances')
            .select('email, balance');

        const balanceMap = new Map<string, number>();
        if (balances) {
            balances.forEach((b: any) => {
                balanceMap.set(b.email, b.balance);
            });
        }

        return users.map((u: any) => ({
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role,
            createdAt: u.created_at,
            status: u.status,
            disabledFeatures: u.disabled_features,
            tokens: balanceMap.get(u.email) || 0
        }));
    }

    async deleteUser(email: string): Promise<void> {
        const { error } = await supabaseAdmin.from('users').delete().eq('email', email);
        if (error) throw new Error(`Error deleting user: ${error.message}`);
    }

    async updateUserPassword(email: string, hashedPassword: string): Promise<void> {
        const { error } = await supabaseAdmin
            .from('users')
            .update({ password: hashedPassword })
            .eq('email', email);

        if (error) throw new Error(`Error updating password: ${error.message}`);
    }

    // OTP and Password Reset
    async createResetToken(email: string, otp: string, expiresInMinutes: number): Promise<void> {
        // Clear any existing tokens for this user first
        await this.deleteResetTokens(email);

        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

        const { error } = await supabaseAdmin
            .from('reset_tokens')
            .insert({
                email,
                otp,
                expires_at: expiresAt.toISOString()
            });

        if (error) throw new Error(`Error creating reset token: ${error.message}`);
    }

    async verifyResetToken(email: string, otp: string): Promise<boolean> {
        const { data, error } = await supabaseAdmin
            .from('reset_tokens')
            .select('*')
            .eq('email', email)
            .eq('otp', otp)
            .single();

        if (error || !data) return false;

        const expiresAt = new Date(data.expires_at);
        if (expiresAt < new Date()) {
            return false; // Token expired
        }

        return true;
    }

    async deleteResetTokens(email: string): Promise<void> {
        const { error } = await supabaseAdmin
            .from('reset_tokens')
            .delete()
            .eq('email', email);

        if (error) throw new Error(`Error deleting reset tokens: ${error.message}`);
    }

    // Tokens
    async getTokenBalance(email: string): Promise<TokenBalance> {
        const { data, error } = await supabaseAdmin
            .from('user_balances')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !data) {
            return { email, balance: 1000, updatedAt: new Date().toISOString() };
        }

        return {
            email: data.email,
            balance: data.balance,
            updatedAt: data.updated_at
        };
    }

    async updateTokenBalance(email: string, amount: number, action: TokenLog["action"], feature?: string): Promise<void> {
        const current = await this.getTokenBalance(email);
        const newBalance = action === 'consume' ? current.balance - amount : current.balance + amount;

        // Upsert balance
        const { error: balanceError } = await supabaseAdmin.from('user_balances').upsert({
            email,
            balance: newBalance,
            updated_at: new Date().toISOString()
        });
        if (balanceError) throw new Error(`Error updating balance: ${balanceError.message}`);

        // Insert log
        const { error: logError } = await supabaseAdmin.from('token_logs').insert({
            email,
            amount,
            action,
            feature,
            timestamp: new Date().toISOString()
        });
        if (logError) throw new Error(`Error logging token usage: ${logError.message}`);
    }

    async getTokenLogs(email: string): Promise<TokenLog[]> {
        const { data, error } = await supabaseAdmin
            .from('token_logs')
            .select('*')
            .eq('email', email)
            .order('timestamp', { ascending: false })
            .limit(50);

        if (error || !data) return [];

        return data.map((l: any) => ({
            email: l.email,
            amount: l.amount,
            action: l.action,
            feature: l.feature,
            timestamp: l.timestamp
        }));
    }

    async getTotalDistributedTokens(): Promise<number> {
        const { data, error } = await supabaseAdmin
            .from('user_balances')
            .select('balance');

        if (error || !data) return 0;
        return data.reduce((sum, item) => sum + (item.balance || 0), 0);
    }

    async getTokenUsageStats(): Promise<{ date: string; tokens: number }[]> {
        // Aggregate token consumption by day for the last 7 days
        const { data, error } = await supabaseAdmin
            .from('token_logs')
            .select('amount, timestamp')
            .eq('action', 'consume')
            .order('timestamp', { ascending: true }); // Get all logs for now, ideal would be server-side aggregation

        if (error || !data) return [];

        const stats: Record<string, number> = {};

        data.forEach((log: any) => {
            const date = new Date(log.timestamp).toLocaleDateString();
            stats[date] = (stats[date] || 0) + log.amount;
        });

        return Object.entries(stats).map(([date, tokens]) => ({ date, tokens }));
    }

    async getSettings(): Promise<SystemSettings> {
        const { data, error } = await supabaseAdmin
            .from('system_settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (error || !data) {
            return {
                defaultTokens: 1000,
                aiLimits: { image: 50, chat: 10 },
                paymentEnabled: false
            };
        }

        return {
            defaultTokens: data.default_tokens,
            aiLimits: data.ai_limits,
            paymentEnabled: data.payment_enabled,
            paymentGateway: data.payment_gateway || 'stripe',
            stripePublicKey: data.stripe_public_key,
            stripeSecretKey: data.stripe_secret_key,
            paypalClientId: data.paypal_client_id,
            paypalClientSecret: data.paypal_client_secret,
            paypalMode: data.paypal_mode || 'sandbox',

            metadata: {
                ...(data.metadata || {}),
                siteName: data.site_name,
                siteUrl: data.site_url,
                smtp: data.smtp_config
            }
        };
    }

    async saveSettings(settings: SystemSettings): Promise<void> {
        const meta = settings.metadata || {};
        const storedMetadata = { ...meta };
        delete storedMetadata.siteName;
        delete storedMetadata.siteUrl;
        delete storedMetadata.smtp;

        const { error } = await supabaseAdmin.from('system_settings').upsert({
            id: 1,
            default_tokens: settings.defaultTokens,
            ai_limits: settings.aiLimits,
            payment_enabled: settings.paymentEnabled,
            payment_gateway: settings.paymentGateway || 'stripe',
            stripe_public_key: settings.stripePublicKey,
            stripe_secret_key: settings.stripeSecretKey,
            paypal_client_id: settings.paypalClientId,
            paypal_client_secret: settings.paypalClientSecret,
            paypal_mode: settings.paypalMode,

            site_name: meta.siteName,
            site_url: meta.siteUrl,
            smtp_config: meta.smtp,
            metadata: storedMetadata,
            updated_at: new Date().toISOString()
        });
        if (error) throw new Error(`Error saving settings: ${error.message}`);
    }

    // Pricing Plans
    async getPlans(): Promise<PricingPlan[]> {
        const { data, error } = await supabaseAdmin.from('pricing_plans').select('*');
        if (error || !data) return [];

        return data.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            tokens: p.tokens,
            interval: p.interval,
            features: p.features,
            aiTools: p.ai_tools || [],
            isActive: p.is_active
        }));
    }

    async savePlan(plan: PricingPlan): Promise<void> {
        const { error } = await supabaseAdmin.from('pricing_plans').upsert({
            id: plan.id,
            name: plan.name,
            price: plan.price,
            tokens: plan.tokens,
            interval: plan.interval,
            features: plan.features,
            ai_tools: plan.aiTools || [],
            is_active: plan.isActive
        });
        if (error) throw new Error(`Error saving plan: ${error.message}`);
    }

    async deletePlan(planId: string): Promise<void> {
        const { error } = await supabaseAdmin.from('pricing_plans').delete().eq('id', planId);
        if (error) throw new Error(`Error deleting plan: ${error.message}`);
    }

    // Payments
    async savePayment(payment: PaymentRecord): Promise<void> {
        const { error } = await supabaseAdmin.from('payments').upsert({
            id: payment.id,
            user_id: payment.userId,
            user_email: payment.userEmail,
            plan_id: payment.planId,
            amount: payment.amount,
            status: payment.status,
            payment_gateway: payment.paymentGateway || 'stripe',
            created_at: payment.createdAt
        });
        if (error) throw new Error(`Error saving payment: ${error.message}`);
    }

    async getPayments(limit = 50): Promise<PaymentRecord[]> {
        const { data, error } = await supabaseAdmin
            .from('payments')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error || !data) return [];

        return data.map((p: any) => ({
            id: p.id,
            userId: p.user_id,
            userEmail: p.user_email,
            planId: p.plan_id,
            amount: p.amount,
            status: p.status,
            paymentGateway: p.payment_gateway || 'stripe',
            createdAt: p.created_at
        }));
    }

    // Websites
    async getWebsite(id: string): Promise<WebsiteProject | null> {
        const { data, error } = await supabaseAdmin
            .from('websites')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;

        return {
            id: data.id,
            userEmail: data.user_email,
            name: data.name,
            code: data.code,
            messages: data.messages,
            previewImage: data.preview_image,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    }

    async saveWebsite(project: WebsiteProject): Promise<void> {
        const { error } = await supabaseAdmin.from('websites').upsert({
            id: project.id,
            user_email: project.userEmail,
            name: project.name,
            code: project.code,
            messages: project.messages,
            preview_image: project.previewImage,
            created_at: project.createdAt,
            updated_at: project.updatedAt
        });
        if (error) throw new Error(`Error saving website: ${error.message}`);
    }

    async deleteWebsite(id: string): Promise<void> {
        const { error } = await supabaseAdmin.from('websites').delete().eq('id', id);
        if (error) throw new Error(`Error deleting website: ${error.message}`);
    }

    async listWebsites(userEmail: string): Promise<WebsiteProject[]> {
        const { data, error } = await supabaseAdmin
            .from('websites')
            .select('*')
            .eq('user_email', userEmail)
            .order('updated_at', { ascending: false });

        if (error || !data) return [];

        return data.map((w: any) => ({
            id: w.id,
            userEmail: w.user_email,
            name: w.name,
            code: w.code,
            messages: w.messages,
            previewImage: w.preview_image,
            createdAt: w.created_at,
            updatedAt: w.updated_at
        }));
    }

    async getTotalWebsites(): Promise<number> {
        const { count, error } = await supabaseAdmin
            .from('websites')
            .select('*', { count: 'exact', head: true });

        if (error) return 0;
        return count || 0;
    }

    // Subscriptions
    async saveSubscription(subscription: SubscriptionRecord): Promise<void> {
        const { error } = await supabaseAdmin.from('subscriptions').upsert({
            id: subscription.id,
            user_email: subscription.userEmail,
            plan_id: subscription.planId,
            status: subscription.status,
            created_at: subscription.createdAt
        });
        if (error) throw new Error(`Error saving subscription: ${error.message}`);
    }

    async getUserPlan(email: string): Promise<{ planName: string, aiTools: string[] }> {
        // First checks for an active subscription
        const { data: subData, error: subError } = await supabaseAdmin
            .from('subscriptions')
            .select('plan_id, pricing_plans(name, ai_tools)')
            .eq('user_email', email)
            .in('status', ['active', 'trialing'])
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (!subError && subData && subData.pricing_plans) {
            const planDetails = subData.pricing_plans as any;
            return {
                planName: planDetails.name,
                aiTools: planDetails.ai_tools || []
            };
        }

        // If no active subscription, return Free Plan
        return { planName: "Free Plan", aiTools: [] };
    }

    // Documents & RAG
    async saveDocument(doc: Partial<Document> & { userEmail: string; name: string }): Promise<Document> {
        const { data, error } = await supabaseAdmin
            .from('documents')
            .insert({
                user_email: doc.userEmail,
                name: doc.name,
                status: doc.status || 'processing',
                metadata: doc.metadata || {}
            })
            .select()
            .single();

        if (error) throw new Error(`Error saving document: ${error.message}`);
        return {
            id: data.id,
            userEmail: data.user_email,
            name: data.name,
            status: data.status,
            metadata: data.metadata,
            createdAt: data.created_at
        };
    }

    async updateDocumentStatus(id: string, status: Document['status']): Promise<void> {
        const { error } = await supabaseAdmin
            .from('documents')
            .update({ status })
            .eq('id', id);

        if (error) throw new Error(`Error updating document status: ${error.message}`);
    }

    async listDocuments(userEmail: string): Promise<Document[]> {
        const { data, error } = await supabaseAdmin
            .from('documents')
            .select('*')
            .eq('user_email', userEmail)
            .order('created_at', { ascending: false });

        if (error || !data) return [];
        return data.map(d => ({
            id: d.id,
            userEmail: d.user_email,
            name: d.name,
            status: d.status,
            metadata: d.metadata,
            createdAt: d.created_at
        }));
    }

    async deleteDocument(id: string): Promise<void> {
        const { error } = await supabaseAdmin
            .from('documents')
            .delete()
            .eq('id', id);
        if (error) throw new Error(`Error deleting document: ${error.message}`);
    }

    async saveDocumentChunks(chunks: { documentId: string; content: string; embedding: number[] }[]): Promise<void> {
        const { error } = await supabaseAdmin
            .from('document_chunks')
            .insert(chunks.map(c => ({
                document_id: c.documentId,
                content: (c.content || "").replace(/\u0000/g, ""), // Final safety check for null characters
                embedding: c.embedding
            })));

        if (error) throw new Error(`Error saving document chunks: ${error.message}`);
    }

    async matchDocumentChunks(userEmail: string, embedding: number[], limit = 5, threshold = 0.5): Promise<DocumentChunk[]> {
        debugLog(`matchDocumentChunks: email=${userEmail}, limit=${limit}, threshold=${threshold}`);
        const { data, error } = await supabaseAdmin.rpc('match_document_chunks', {
            query_embedding: embedding,
            match_threshold: threshold,
            match_count: limit,
            p_user_email: userEmail
        });

        if (error) {
            debugLog(`matchDocumentChunks ERROR: ${error.message}`);
            throw new Error(`Error matching document chunks: ${error.message}`);
        }
        
        debugLog(`matchDocumentChunks: Found ${data?.length || 0} matches`);
        return (data || []).map((d: any) => ({
            id: d.id,
            documentId: d.document_id,
            content: d.content,
            similarity: d.similarity
        }));
    }

    async keywordSearchChunks(userEmail: string, query: string, limit = 5): Promise<DocumentChunk[]> {
        debugLog(`keywordSearchChunks: email=${userEmail}, query=${query}, limit=${limit}`);
        const { data, error } = await supabaseAdmin.rpc('keyword_search_chunks', {
            query_text: query,
            match_count: limit,
            p_user_email: userEmail
        });

        if (error) {
            debugLog(`keywordSearchChunks ERROR: ${error.message}`);
            return [];
        }

        return (data || []).map((d: any) => ({
            id: d.id,
            documentId: d.document_id,
            content: d.content,
            similarity: d.similarity
        }));
    }

    // Dashboard Analytics & Aggregation
    async getRevenueStats(): Promise<{ totalRevenue: number, revenueData: any[] }> {
        const { data: payments, error } = await supabaseAdmin
            .from('payments')
            .select('amount, created_at')
            .eq('status', 'succeeded');

        if (error || !payments) return { totalRevenue: 0, revenueData: [] };

        let totalRevenue = 0;
        const monthlyData: Record<string, { revenue: number, users: Set<string> }> = {};

        const { data: usersData } = await supabaseAdmin.from('users').select('email, created_at');

        payments.forEach((p: any) => {
            totalRevenue += p.amount;
            const date = new Date(p.created_at);
            const month = date.toLocaleString('default', { month: 'short' });
            if (!monthlyData[month]) monthlyData[month] = { revenue: 0, users: new Set() };
            monthlyData[month].revenue += p.amount;
        });

        if (usersData) {
            usersData.forEach((u: any) => {
                const date = new Date(u.created_at);
                const month = date.toLocaleString('default', { month: 'short' });
                if (!monthlyData[month]) monthlyData[month] = { revenue: 0, users: new Set() };
                monthlyData[month].users.add(u.email);
            });
        }

        const revenueData = Object.keys(monthlyData).map(month => ({
            month,
            revenue: monthlyData[month].revenue,
            users: monthlyData[month].users.size
        }));

        const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        revenueData.sort((a, b) => monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month));

        return { totalRevenue, revenueData };
    }

    async getToolUsageDistribution(): Promise<any[]> {
        const { data, error } = await supabaseAdmin
            .from('token_logs')
            .select('amount, feature')
            .eq('action', 'consume');

        if (error || !data) return [];

        const featureMap: Record<string, number> = {};
        let totalTokens = 0;
        data.forEach((log: any) => {
            const feature = log.feature || 'Other';
            featureMap[feature] = (featureMap[feature] || 0) + log.amount;
            totalTokens += log.amount;
        });

        const colors = ["#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#6b7280", "#3b82f6", "#ef4444"];
        let i = 0;

        const toolUsageData = Object.keys(featureMap).map(name => {
            const percentage = totalTokens > 0 ? Math.round((featureMap[name] / totalTokens) * 100) : 0;
            return {
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value: percentage,
                color: colors[i++ % colors.length]
            };
        });

        return toolUsageData.sort((a, b) => b.value - a.value);
    }

    async getDashboardRecentActivities(): Promise<any[]> {
        const activities: any[] = [];
        const { data: users } = await supabaseAdmin.from('users').select('email, created_at').order('created_at', { ascending: false }).limit(5);
        if (users) {
            users.forEach((u: any) => {
                activities.push({
                    type: "signup",
                    user: u.email,
                    timestamp: new Date(u.created_at).getTime(),
                });
            });
        }
        const { data: payments } = await supabaseAdmin.from('payments').select('user_email, amount, created_at').order('created_at', { ascending: false }).limit(5);
        if (payments) {
            payments.forEach((p: any) => {
                activities.push({
                    type: "payment",
                    user: p.user_email,
                    amount: `$${p.amount}`,
                    timestamp: new Date(p.created_at).getTime(),
                });
            });
        }

        activities.sort((a, b) => b.timestamp - a.timestamp);

        const now = Date.now();
        const formatted = activities.slice(0, 5).map(a => {
            const diffInMins = Math.floor((now - a.timestamp) / 60000);
            let timeStr = `${diffInMins} min ago`;
            if (diffInMins >= 60) {
                const hrs = Math.floor(diffInMins / 60);
                timeStr = `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
            }
            if (diffInMins >= 1440) {
                const days = Math.floor(diffInMins / 1440);
                timeStr = `${days} day${days > 1 ? 's' : ''} ago`;
            }
            return {
                type: a.type,
                user: a.user,
                amount: a.amount,
                time: timeStr
            };
        });

        return formatted;
    }

    // ==================== i18n: Languages ====================

    async getLanguages(): Promise<Language[]> {
        const { data, error } = await supabaseAdmin
            .from('languages')
            .select('*')
            .order('created_at', { ascending: true });

        if (error || !data) return [];

        return data.map((l: any) => ({
            id: l.id,
            code: l.code,
            name: l.name,
            direction: l.direction,
            isEnabled: l.is_enabled,
            createdAt: l.created_at
        }));
    }

    async saveLanguage(language: Language): Promise<Language> {
        const { data, error } = await supabaseAdmin
            .from('languages')
            .upsert({
                ...(language.id ? { id: language.id } : {}),
                code: language.code,
                name: language.name,
                direction: language.direction,
                is_enabled: language.isEnabled
            }, { onConflict: 'code' })
            .select()
            .single();

        if (error) throw new Error(`Error saving language: ${error.message}`);

        return {
            id: data.id,
            code: data.code,
            name: data.name,
            direction: data.direction,
            isEnabled: data.is_enabled,
            createdAt: data.created_at
        };
    }

    async toggleLanguage(id: string, isEnabled: boolean): Promise<void> {
        const { error } = await supabaseAdmin
            .from('languages')
            .update({ is_enabled: isEnabled })
            .eq('id', id);

        if (error) throw new Error(`Error toggling language: ${error.message}`);
    }

    async deleteLanguage(id: string): Promise<void> {
        const { error } = await supabaseAdmin
            .from('languages')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Error deleting language: ${error.message}`);
    }

    // ==================== i18n: Translations ====================

    async getTranslationKeys(): Promise<string[]> {
        const { data, error } = await supabaseAdmin
            .from('translations')
            .select('translation_key')
            .order('translation_key', { ascending: true });

        if (error || !data) return [];

        // Deduplicate keys
        return [...new Set(data.map((d: any) => d.translation_key))];
    }

    async getTranslationsForLanguage(languageCode: string): Promise<Record<string, string>> {
        const { data, error } = await supabaseAdmin
            .from('translations')
            .select('translation_key, value')
            .eq('language_code', languageCode);

        if (error || !data) return {};

        const result: Record<string, string> = {};
        data.forEach((d: any) => {
            result[d.translation_key] = d.value;
        });
        return result;
    }

    async getAllTranslations(): Promise<Translation[]> {
        const { data, error } = await supabaseAdmin
            .from('translations')
            .select('*')
            .order('translation_key', { ascending: true });

        if (error || !data) return [];

        return data.map((d: any) => ({
            id: d.id,
            translationKey: d.translation_key,
            languageCode: d.language_code,
            value: d.value,
            updatedAt: d.updated_at
        }));
    }

    async saveTranslation(translation: Translation): Promise<void> {
        const { error } = await supabaseAdmin
            .from('translations')
            .upsert({
                translation_key: translation.translationKey,
                language_code: translation.languageCode,
                value: translation.value,
                updated_at: new Date().toISOString()
            }, { onConflict: 'translation_key,language_code' })
            .select();

        if (error) throw new Error(`Error saving translation: ${error.message}`);
    }

    async bulkSaveTranslations(translations: Translation[]): Promise<void> {
        const rows = translations.map(t => ({
            translation_key: t.translationKey,
            language_code: t.languageCode,
            value: t.value,
            updated_at: new Date().toISOString()
        }));

        const { error } = await supabaseAdmin
            .from('translations')
            .upsert(rows, { onConflict: 'translation_key,language_code' });

        if (error) throw new Error(`Error bulk saving translations: ${error.message}`);
    }

    async deleteTranslationKey(key: string): Promise<void> {
        const { error } = await supabaseAdmin
            .from('translations')
            .delete()
            .eq('translation_key', key);

        if (error) throw new Error(`Error deleting translation key: ${error.message}`);
    }

    // ==================== Meetings ====================

    async createMeeting(id: string, title: string, hostEmail: string): Promise<{ id: string; title: string; hostEmail: string; status: string; createdAt: string }> {
        const { data, error } = await supabaseAdmin
            .from('meetings')
            .insert({
                id,
                title,
                host_email: hostEmail,
                status: 'active',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw new Error(`Error creating meeting: ${error.message}`);

        return {
            id: data.id,
            title: data.title,
            hostEmail: data.host_email,
            status: data.status,
            createdAt: data.created_at
        };
    }

    async getMeeting(id: string): Promise<{ id: string; title: string; hostEmail: string; status: string; maxParticipants: number; createdAt: string; endedAt: string | null } | null> {
        const { data, error } = await supabaseAdmin
            .from('meetings')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;

        return {
            id: data.id,
            title: data.title,
            hostEmail: data.host_email,
            status: data.status,
            maxParticipants: data.max_participants,
            createdAt: data.created_at,
            endedAt: data.ended_at
        };
    }

    async endMeeting(id: string): Promise<void> {
        const { error } = await supabaseAdmin
            .from('meetings')
            .update({ status: 'ended', ended_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw new Error(`Error ending meeting: ${error.message}`);
    }

    async listUserMeetings(email: string, limit = 20): Promise<{ id: string; title: string; status: string; createdAt: string; endedAt: string | null }[]> {
        const { data, error } = await supabaseAdmin
            .from('meetings')
            .select('*')
            .eq('host_email', email)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error || !data) return [];

        return data.map((m: any) => ({
            id: m.id,
            title: m.title,
            status: m.status,
            createdAt: m.created_at,
            endedAt: m.ended_at
        }));
    }
}

export const db = new SystemDB();
