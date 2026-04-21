'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { EmptyState } from '@/components/admin/EmptyState';
import {
    Bell, Briefcase, CreditCard, Star, LifeBuoy, Activity, DollarSign, CheckCheck, X,
} from 'lucide-react';
import shared from '@/components/admin/shared.module.css';
import type { NotificationCategory } from '@/mocks/notifications';

const categoryIcon: Record<NotificationCategory, React.ReactNode> = {
    provider: <Briefcase size={18} />,
    subscription: <CreditCard size={18} />,
    review: <Star size={18} />,
    support: <LifeBuoy size={18} />,
    system: <Activity size={18} />,
    finance: <DollarSign size={18} />,
};

const categoryColor: Record<NotificationCategory, string> = {
    provider: 'var(--color-primary-500)',
    subscription: 'var(--color-warning)',
    review: 'var(--color-info)',
    support: 'var(--color-error)',
    system: 'var(--text-tertiary)',
    finance: 'var(--color-success)',
};

type Filter = 'all' | 'unread' | NotificationCategory;

export default function NotificationsPage() {
    const { t } = useTranslation();
    const { language } = useLanguage();
    const { notifications, unreadCount, markAsRead, markAllAsRead, dismiss } = useNotifications();
    const [filter, setFilter] = useState<Filter>('all');

    const filtered = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.read;
        return n.category === filter;
    });

    const filters: { value: Filter; label: string; count?: number }[] = [
        { value: 'all', label: t('common.all'), count: notifications.length },
        { value: 'unread', label: t('notifications.unread'), count: unreadCount },
        { value: 'provider', label: t('sidebar.providers') },
        { value: 'subscription', label: t('sidebar.subscriptions') },
        { value: 'review', label: t('sidebar.reviews') },
        { value: 'support', label: t('sidebar.support') },
        { value: 'finance', label: t('sidebar.finance') },
        { value: 'system', label: t('sidebar.systemHealth') },
    ];

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Bell size={24} />
                    <h1 className={shared.pageTitle}>{t('notifications.title')}</h1>
                </div>
                {unreadCount > 0 && (
                    <button className={shared.iconBtn} onClick={markAllAsRead}>
                        <CheckCheck size={16} /> {t('topbar.markAllRead')}
                    </button>
                )}
            </div>

            <div className={shared.filterGroup}>
                {filters.map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={shared.filterSelect}
                        style={{
                            cursor: 'pointer',
                            borderColor: filter === f.value ? 'var(--color-primary-500)' : 'var(--border-color)',
                            color: filter === f.value ? 'var(--color-primary-500)' : 'var(--text-primary)',
                            fontWeight: filter === f.value ? 600 : 400,
                        }}
                    >
                        {f.label}{f.count !== undefined ? ` (${f.count})` : ''}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <EmptyState icon={<Bell size={36} strokeWidth={1.5} />} title={t('topbar.noNotifications')} />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {filtered.map(n => {
                        const color = categoryColor[n.category];
                        const title = language === 'ar' ? n.title_ar : n.title;
                        const desc = language === 'ar' ? n.description_ar : n.description;
                        const Body = (
                            <>
                                <div style={{ width: 40, height: 40, minWidth: 40, borderRadius: 10, background: `color-mix(in srgb, ${color} 15%, transparent)`, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {categoryIcon[n.category]}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: n.read ? 500 : 600, color: 'var(--text-primary)' }}>{title}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 2 }}>{desc}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                                        {new Date(n.created_at).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                                    </div>
                                </div>
                                {!n.read && <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--color-primary-500)', minWidth: 8 }} />}
                                <button
                                    onClick={e => { e.preventDefault(); e.stopPropagation(); dismiss(n.id); }}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 4 }}
                                    title={t('common.delete')}
                                    aria-label={t('common.delete')}
                                >
                                    <X size={16} />
                                </button>
                            </>
                        );
                        const baseStyle: React.CSSProperties = {
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12,
                            padding: 16,
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            borderInlineStart: `3px solid ${n.read ? 'transparent' : color}`,
                            borderRadius: 10,
                            textDecoration: 'none',
                            color: 'inherit',
                            transition: 'background var(--transition-fast)',
                        };
                        return n.href ? (
                            <Link key={n.id} href={n.href} onClick={() => markAsRead(n.id)} style={baseStyle}>
                                {Body}
                            </Link>
                        ) : (
                            <div key={n.id} onClick={() => markAsRead(n.id)} style={{ ...baseStyle, cursor: 'pointer' }}>
                                {Body}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
