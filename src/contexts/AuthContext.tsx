'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
    'superadmin@hagzy.com': { name: 'Super Admin', role: 'super_admin' },
    'admin@hagzy.com': { name: 'Platform Admin', role: 'admin' },
    'moderator@hagzy.com': { name: 'Content Moderator', role: 'moderator' },
    'support@hagzy.com': { name: 'Support Agent', role: 'support' },
    'finance@hagzy.com': { name: 'Finance Manager', role: 'finance' },
    'viewer@hagzy.com': { name: 'Report Viewer', role: 'viewer' },
};

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
            document.cookie = `hagzy_superadmin_logged_in=true;path=/;max-age=${60 * 60 * 24 * 30};SameSite=Lax`;
            if (role) {
                document.cookie = `hagzy_superadmin_auth=${JSON.stringify({ token: true, role })};path=/;max-age=${60 * 60 * 24 * 30};SameSite=Lax`;
            }
        } else {
            document.cookie = 'hagzy_superadmin_logged_in=;path=/;max-age=0';
            document.cookie = 'hagzy_superadmin_auth=;path=/;max-age=0';
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('hagzy_superadmin_user');
        const storedToken = localStorage.getItem('hagzy_superadmin_token');
        if (storedUser && storedToken) {
            const parsed = JSON.parse(storedUser) as SuperAdminUser;
            // Ensure the API client has the token available
            localStorage.setItem('hagzy_token', storedToken);
            setUser(parsed);
            setAuthCookie(true, parsed.role);
        } else {
            localStorage.removeItem('hagzy_superadmin_user');
            localStorage.removeItem('hagzy_superadmin_token');
            setAuthCookie(false);
        }
        const storedImpersonation = localStorage.getItem('hagzy_superadmin_impersonating');
        if (storedImpersonation) {
            try {
                setImpersonating(JSON.parse(storedImpersonation) as ImpersonationState);
            } catch {
                localStorage.removeItem('hagzy_superadmin_impersonating');
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
        try {
            const res = await adminAuthApi.login(email, password);
            const { token, admin } = res.data!;

            // Store JWT so the ApiClient can attach it to every request
            localStorage.setItem('hagzy_token', token);

            // Build a SuperAdminUser from the API response.
            // The API only returns id/name/email/active — default role to super_admin
            // (role-based access can be refined once the backend exposes it).
            const apiUser: SuperAdminUser = {
                id: String(admin.id),
                uuid: `admin-${admin.id}`,
                name: admin.name,
                email: admin.email,
                role: 'super_admin' as SuperAdminRole,
                permissions: getPermissionsForRole('super_admin'),
                active: admin.active,
                last_login_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            localStorage.setItem('hagzy_superadmin_token', token);
            localStorage.setItem('hagzy_superadmin_user', JSON.stringify(apiUser));
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
        localStorage.removeItem('hagzy_token');
        localStorage.removeItem('hagzy_superadmin_token');
        localStorage.removeItem('hagzy_superadmin_user');
        localStorage.removeItem('hagzy_superadmin_impersonating');
        setUser(null);
        setImpersonating(null);
        setAuthCookie(false);
        router.push('/login');
    };

    const startImpersonating = (providerId: string, providerName: string) => {
        const state: ImpersonationState = { providerId, providerName, startedAt: new Date().toISOString() };
        localStorage.setItem('hagzy_superadmin_impersonating', JSON.stringify(state));
        setImpersonating(state);
    };

    const stopImpersonating = () => {
        localStorage.removeItem('hagzy_superadmin_impersonating');
        setImpersonating(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, forgotPassword, verifyOtpCode, resetPassword, logout, loading, impersonating, startImpersonating, stopImpersonating }}>
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
