'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { mockNotifications, type AdminNotification } from '@/mocks/notifications';

interface NotificationsContextValue {
    notifications: AdminNotification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    dismiss: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<AdminNotification[]>(mockNotifications);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const dismiss = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

    const value = useMemo<NotificationsContextValue>(() => ({
        notifications, unreadCount, markAsRead, markAllAsRead, dismiss,
    }), [notifications, unreadCount, markAsRead, markAllAsRead, dismiss]);

    return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
    const ctx = useContext(NotificationsContext);
    if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
    return ctx;
}
