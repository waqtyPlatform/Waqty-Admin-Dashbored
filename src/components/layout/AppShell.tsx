'use client';

import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { SidebarProvider, useSidebar } from './SidebarContext';
import { ToastProvider } from '@/components/ui';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { OfflineBanner } from '@/components/OfflineBanner';
import styles from './AppShell.module.css';
import { usePathname } from 'next/navigation';

function AppContent({ children }: { children: React.ReactNode }) {
    const { collapsed } = useSidebar();
    const pathname = usePathname();

    const isPublicRoute = pathname === '/login' || pathname === '/forgot-password';

    if (isPublicRoute) {
        return <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>{children}</div>;
    }

    return (
        <div className={`${styles.layout} ${collapsed ? styles.sidebarCollapsed : ''}`}>
            <Sidebar />
            <TopBar />
            <main className={styles.main}>
                <div className={styles.content}>{children}</div>
            </main>
        </div>
    );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <ToastProvider>
                <ErrorBoundary>
                    <AppContent>{children}</AppContent>
                    <OfflineBanner />
                </ErrorBoundary>
            </ToastProvider>
        </SidebarProvider>
    );
}
