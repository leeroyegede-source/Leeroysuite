import { NextResponse, type NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only';

export async function proxy(request: NextRequest) {
    const session = request.cookies.get('session')?.value;

    const { pathname } = request.nextUrl;

    // Allow service worker and PWA-related files through without auth
    if (
        pathname === '/sw.js' ||
        pathname === '/manifest.json' ||
        pathname.startsWith('/workbox-') ||
        pathname.startsWith('/swe-worker-') ||
        pathname.startsWith('/icons/')
    ) {
        return NextResponse.next();
    }

    // Public paths
    const isPublicPath = pathname === '/login' || pathname === '/register' || pathname === '/' || pathname === '/admin/register';

    // API paths that don't need auth
    if (pathname?.startsWith('/api/auth') || pathname?.startsWith('/api/webhook') || pathname === '/api/admin/register') {
        return NextResponse.next();
    }

    if (!session && !isPublicPath) {
        if (pathname?.startsWith('/api/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (session) {
        try {
            const secret = new TextEncoder().encode(JWT_SECRET);
            const { payload } = await jose.jwtVerify(session, secret);

            // Protect Admin routes
            if (pathname?.startsWith('/admin') && payload.role !== 'admin') {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }

            // Feature Access Control
            const disabledFeatures = (payload.disabledFeatures as string[]) || [];

            const featurePaths: Record<string, string> = {
                '/chat': 'chat',
                '/writer': 'writer',
                '/code': 'code',
                '/summary': 'summary',
                '/email': 'email',
                '/ocr': 'ocr',
                '/sql': 'sql',
                '/grammar': 'grammar',
                '/translator': 'translator',
                '/story': 'story',
                '/quiz': 'quiz',
                '/resume': 'resume',
                '/social': 'social',
                '/recipe': 'recipe',
                '/finance': 'finance',
                '/meeting': 'meeting',
                '/ai-meeting': 'ai-meeting',
                '/sentiment': 'sentiment',
                '/interview': 'interview',
                '/image-generator': 'image-generator'
            };

            for (const [path, featureId] of Object.entries(featurePaths)) {
                if (pathname?.startsWith(path) && disabledFeatures.includes(featureId)) {
                    return NextResponse.redirect(new URL('/dashboard', request.url));
                }
            }

            // Redirect from login/register if already logged in
            if (isPublicPath && pathname !== '/') {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        } catch (error) {
            // Invalid session
            if (pathname?.startsWith('/api/')) {
                return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
            }
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('session');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/admin/:path*',
        '/login',
        '/register',
        '/api/ai/:path*',
        '/api/admin/:path*',
        '/chat/:path*',
        '/writer/:path*',
        '/code/:path*',
        '/summary/:path*',
        '/email/:path*',
        '/ocr/:path*',
        '/sql/:path*',
        '/grammar/:path*',
        '/translator/:path*',
        '/story/:path*',
        '/quiz/:path*',
        '/resume/:path*',
        '/social/:path*',
        '/recipe/:path*',
        '/finance/:path*',
        '/meeting/:path*',
        '/ai-meeting/:path*',
        '/sentiment/:path*',
        '/interview/:path*',
        '/image-generator/:path*',
    ],
};
