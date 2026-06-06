'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { SuperAdminUser, SuperAdminRole } from '@/types/admin';
import { getPermissionsForRole } from '@/lib/permissions';
import { adminAuthApi, ApiError } from '@/lib/api';

interface ImpersonationState {
    providerId: string;
    providerName: string;
    startedAt: string;
}

interface AuthContextType {
    user: SuperAdminUser | null;
    login: (email: string, password: string) => Promise<{ success: boolean; user?: SuperAdminUser; error?: string }>;
    forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
    verifyOtpCode: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
    resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    loading: boolean;
    impersonating: ImpersonationState | null;
    startImpersonating: (providerId: string, providerName: string) => void;
    stopImpersonating: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock admin users for demo
const MOCK_ADMINS: Record<string, { name: string; role: SuperAdminRole }> = {
    'superadmin@waqty.com': { name: 'Super Admin', role: 'super_admin' },
    'admin@waqty.com': { name: 'Platform Admin', role: 'admin' },
    'moderator@waqty.com': { name: 'Content Moderator', role: 'moderator' },
    'support@waqty.com': { name: 'Support Agent', role: 'support' },
    'finance@waqty.com': { name: 'Finance Manager', role: 'finance' },
    'viewer@waqty.com': { name: 'Report Viewer', role: 'viewer' },
};

const VALID_ROLES: readonly SuperAdminRole[] = ['super_admin', 'admin', 'moderator', 'support', 'finance', 'viewer'];

// Coerce a backend role string into a known SuperAdminRole. Honours the actual
// role when the API supplies a recognised one (X12); only when it is missing or
// unrecognised do we fall back to super_admin so a real, non-super-admin identity
// is respected rather than silently elevated.
function coerceRole(role: string | null | undefined): SuperAdminRole {
    return VALID_ROLES.includes(role as SuperAdminRole) ? (role as SuperAdminRole) : 'super_admin';
}

function buildMockUser(email: string, info: { name: string; role: SuperAdminRole }): SuperAdminUser {
    return {
        id: `SA-${info.role.toUpperCase()}`,
        uuid: `sa-${info.role}-uuid`,
        name: info.name,
        email,
        role: info.role,
        permissions: getPermissionsForRole(info.role),
        active: true,
        last_login_at: new Date().toISOString(),
        created_at: '2024-01-01T00:00:00Z',
        updated_at: new Date().toISOString(),
    };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<SuperAdminUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [impersonating, setImpersonating] = useState<ImpersonationState | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    const setAuthCookie = (loggedIn: boolean, role?: string) => {
        if (loggedIn) {
            document.cookie = `waqty_superadmin_logged_in=true;path=/;max-age=${60 * 60 * 24 * 30};SameSite=Lax`;
            if (role) {
                document.cookie = `waqty_superadmin_auth=${JSON.stringify({ token: true, role })};path=/;max-age=${60 * 60 * 24 * 30};SameSite=Lax`;
            }
        } else {
            document.cookie = 'waqty_superadmin_logged_in=;path=/;max-age=0';
            document.cookie = 'waqty_superadmin_auth=;path=/;max-age=0';
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('waqty_superadmin_user');
        const storedToken = localStorage.getItem('waqty_superadmin_token');
        if (storedUser && storedToken) {
            const parsed = JSON.parse(storedUser) as SuperAdminUser;
            // The API client reads `waqty_superadmin_token` directly (X11) — no
            // mirror into the shared `waqty_token` key, which other apps also use.
            setUser(parsed);
            setAuthCookie(true, parsed.role);
        } else {
            localStorage.removeItem('waqty_superadmin_user');
            localStorage.removeItem('waqty_superadmin_token');
            setAuthCookie(false);
        }
        const storedImpersonation = localStorage.getItem('waqty_superadmin_impersonating');
        if (storedImpersonation) {
            try {
                setImpersonating(JSON.parse(storedImpersonation) as ImpersonationState);
            } catch {
                localStorage.removeItem('waqty_superadmin_impersonating');
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!loading) {
            const isPublicRoute = pathname === '/login' || pathname === '/forgot-password';
            if (!user && !isPublicRoute) {
                router.push('/login');
            } else if (user && pathname === '/login') {
                router.push('/');
            }
        }
    }, [user, loading, pathname, router]);

    const login = async (email: string, password: string) => {
        // Mock role demo (SA-5): the known demo accounts resolve to VARIED roles so
        // the 6-role × 17-module matrix is actually exercised in the UI — a
        // non-super-admin (e.g. moderator@waqty.com) is restricted by the sidebar
        // (can()), PermissionGate, and the proxy.ts route guard. Real backend RBAC
        // is deferred; unknown emails still go through the live API below.
        const mock = MOCK_ADMINS[email.trim().toLowerCase()];
        if (mock) {
            const mockUser = buildMockUser(email.trim().toLowerCase(), mock);
            const mockToken = `mock-${mock.role}`;
            localStorage.setItem('waqty_superadmin_token', mockToken);
            localStorage.setItem('waqty_superadmin_user', JSON.stringify(mockUser));
            setUser(mockUser);
            setAuthCookie(true, mockUser.role);
            router.push('/');
            return { success: true, user: mockUser };
        }

        try {
            const res = await adminAuthApi.login(email, password);
            const { token, admin } = res.data!;

            // Build a SuperAdminUser from the API response. Honour the role the
            // backend assigns (X12) — a non-super-admin identity is respected; we
            // only fall back to super_admin when the API omits/returns no role.
            const role = coerceRole(admin.role);
            const apiUser: SuperAdminUser = {
                id: String(admin.id),
                uuid: `admin-${admin.id}`,
                name: admin.name,
                email: admin.email,
                role,
                permissions: getPermissionsForRole(role),
                active: admin.active,
                last_login_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            localStorage.setItem('waqty_superadmin_token', token);
            localStorage.setItem('waqty_superadmin_user', JSON.stringify(apiUser));
            setUser(apiUser);
            setAuthCookie(true, apiUser.role);
            router.push('/');
            return { success: true, user: apiUser };
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.isUnauthorized) return { success: false, error: 'Invalid email or password.' };
                if (err.isForbidden)    return { success: false, error: 'Account is inactive. Contact your administrator.' };
                return { success: false, error: err.message };
            }
            return { success: false, error: 'Login failed. Please try again.' };
        }
    };

    const forgotPassword = async (email: string) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        console.log(`Mock OTP sent to: ${email}`);
        return { success: true };
    };

    const verifyOtpCode = async (_email: string, otp: string) => {
        await new Promise(resolve => setTimeout(resolve, 600));
        if (otp === '123456') return { success: true };
        return { success: false, error: 'Invalid verification code' };
    };

    const resetPassword = async (_email: string, _otp: string, _newPassword: string) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return { success: true };
    };

    const logout = () => {
        // Fire-and-forget — invalidate token on server
        adminAuthApi.logout().catch(() => { /* ignore */ });
        localStorage.removeItem('waqty_superadmin_token');
        localStorage.removeItem('waqty_superadmin_user');
        localStorage.removeItem('waqty_superadmin_impersonating');
        setUser(null);
        setImpersonating(null);
        setAuthCookie(false);
        router.push('/login');
    };

    const startImpersonating = (providerId: string, providerName: string) => {
        const state: ImpersonationState = { providerId, providerName, startedAt: new Date().toISOString() };
        localStorage.setItem('waqty_superadmin_impersonating', JSON.stringify(state));
        setImpersonating(state);
    };

    const stopImpersonating = () => {
        localStorage.removeItem('waqty_superadmin_impersonating');
        setImpersonating(null);
    };

    // Stabilise the context value so consumers don't re-render on every provider
    // render. The handler functions (login/logout/forgotPassword/…/startImpersonating)
    // are redefined each render but only close over STABLE references — state setters
    // (setUser/setImpersonating/setLoading), `router`, and module-level helpers — and
    // never read changing component state (user/loading/impersonating) directly, so
    // capturing them by closure here is behaviourally identical. Deps are therefore
    // limited to the state the value actually exposes.
    const value = useMemo(
        () => ({ user, login, forgotPassword, verifyOtpCode, resetPassword, logout, loading, impersonating, startImpersonating, stopImpersonating }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [user, loading, impersonating],
    );

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
