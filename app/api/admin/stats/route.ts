import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const session: any = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const users = await db.listUsers();
        const settings = await db.getSettings();
        const totalTokens = await db.getTotalDistributedTokens();
        const tokenStats = await db.getTokenUsageStats();
        const totalWebsites = await db.getTotalWebsites();

        // Simple aggregation for dashboard
        const { totalRevenue, revenueData } = await db.getRevenueStats();
        const toolUsageData = await db.getToolUsageDistribution();
        const recentActivities = await db.getDashboardRecentActivities();

        const stats = {
            totalUsers: users.length,
            activeUsers: users.filter(u => u.status === 'active').length,
            totalTokensDistributed: totalTokens,
            totalWebsites,
            tokenUsage: tokenStats,
            totalRevenue,
            revenueData,
            toolUsageData,
            recentActivities,
            systemStatus: 'Operational',
            recentUsers: users
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                .slice(0, 5)
                .map(({ password, ...u }) => u)
        };

        return NextResponse.json(stats);
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
    }
}
