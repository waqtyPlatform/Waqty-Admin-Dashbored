'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { SuperAdminUser, SuperAdminRole } from '@/types/admin';
import { getPermissionsForRole } from '@/lib/permissions';

interface AuthContextType {
    user: SuperAdminUser | null;
    login: (email: string, password: string) => Promise<{ success: boolean; user?: SuperAdminUser; error?: string }>;
    forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
    verifyOtpCode: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
    resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    loading: boolean;
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
            queueMicrotask(() => {
                setUser(parsed);
                setAuthCookie(true, parsed.role);
                setLoading(false);
            });
        } else {
            localStorage.removeItem('hagzy_superadmin_user');
            localStorage.removeItem('hagzy_superadmin_token');
            setAuthCookie(false);
            queueMicrotask(() => setLoading(false));
        }
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
            // Mock login — any password with 6+ characters works
            await new Promise(resolve => setTimeout(resolve, 800));

            if (password.length < 6) {
                return { success: false, error: 'Password must be at least 6 characters' };
            }

            const adminInfo = MOCK_ADMINS[email.toLowerCase()];
            if (!adminInfo) {
                // Allow any email for demo — default to viewer
                const mockUser = buildMockUser(email, { name: email.split('@')[0], role: 'super_admin' });
                localStorage.setItem('hagzy_superadmin_token', 'mock-token-' + Date.now());
                localStorage.setItem('hagzy_superadmin_user', JSON.stringify(mockUser));
                setUser(mockUser);
                setAuthCookie(true, mockUser.role);
                router.push('/');
                return { success: true, user: mockUser };
            }

            const mockUser = buildMockUser(email, adminInfo);
            localStorage.setItem('hagzy_superadmin_token', 'mock-token-' + Date.now());
            localStorage.setItem('hagzy_superadmin_user', JSON.stringify(mockUser));
            setUser(mockUser);
            setAuthCookie(true, mockUser.role);
            router.push('/');
            return { success: true, user: mockUser };
        } catch {
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
        localStorage.removeItem('hagzy_superadmin_token');
        localStorage.removeItem('hagzy_superadmin_user');
        setUser(null);
        setAuthCookie(false);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, forgotPassword, verifyOtpCode, resetPassword, logout, loading }}>
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
