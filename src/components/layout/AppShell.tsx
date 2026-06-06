'use client';

import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileBottomNav from './MobileBottomNav';
import { SidebarProvider, useSidebar } from './SidebarContext';
import { ToastProvider } from '@/components/ui';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { OfflineBanner } from '@/components/OfflineBanner';
import { useAuth } from '@/contexts/AuthContext';
import { CommandPaletteProvider } from '@/components/CommandPalette';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { Breadcrumbs } from './Breadcrumbs';
import styles from './AppShell.module.css';
import { useTranslation } from '@/hooks/useTranslation';
import { usePathname } from 'next/navigation';

function AppContent({ children }: { children: React.ReactNode }) {
    const { collapsed } = useSidebar();
    const { impersonating } = useAuth();
    const pathname = usePathname();
    const { t } = useTranslation();

    const isPublicRoute = pathname === '/login' || pathname === '/forgot-password';

    if (isPublicRoute) {
        return <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>{children}</div>;
    }

    return (
        <div
            className={`${styles.layout} ${collapsed ? styles.sidebarCollapsed : ''}`}
            style={impersonating ? { paddingTop: 36 } : undefined}
        >
            <a href="#main-content" className={styles.skipLink}>{t('common.skipToContent')}</a>
            <Sidebar />
            <TopBar />
            <main id="main-content" className={styles.main}>
                <div className={styles.content}>
                    <Breadcrumbs />
                    {children}
                </div>
            </main>
            <MobileBottomNav />
        </div>
    );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <ToastProvider>
                <NotificationsProvider>
                    <CommandPaletteProvider>
                        <ErrorBoundary>
                            <AppContent>{children}</AppContent>
                            <OfflineBanner />
                        </ErrorBoundary>
                    </CommandPaletteProvider>
                </NotificationsProvider>
            </ToastProvider>
        </SidebarProvider>
    );
}
