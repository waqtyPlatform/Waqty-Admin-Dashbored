import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/forgot-password'];

// Routes that require specific role access
const ADMIN_ONLY_ROUTES = ['/settings/security', '/settings/roles', '/settings/admins', '/audit-logs'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
        return NextResponse.next();
    }

    // Allow static files and API routes
    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
        return NextResponse.next();
    }

    // Check auth cookie
    const loggedIn = request.cookies.get('hagzy_superadmin_logged_in')?.value;
    if (!loggedIn) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Check role-based access
    const authCookie = request.cookies.get('hagzy_superadmin_auth')?.value;
    if (authCookie) {
        try {
            const auth = JSON.parse(authCookie);
            const role = auth.role;

            // Admin-only routes
            if (ADMIN_ONLY_ROUTES.some(r => pathname.startsWith(r))) {
                if (role !== 'super_admin' && role !== 'admin') {
                    return NextResponse.redirect(new URL('/', request.url));
                }
            }
        } catch {
            // Invalid cookie — allow through, client-side will handle
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
