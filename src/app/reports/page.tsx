'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { DollarSign, CalendarDays, Users, Building2, Globe } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';

const reportCards = [
    { titleKey: 'reports.revenue.title', descKey: 'reports.hub.revenueDesc', icon: <DollarSign size={24} />, href: '/reports/revenue', color: 'var(--color-success)' },
    { titleKey: 'reports.bookings.title', descKey: 'reports.hub.bookingsDesc', icon: <CalendarDays size={24} />, href: '/reports/bookings', color: 'var(--color-info)' },
    { titleKey: 'reports.users.title', descKey: 'reports.hub.usersDesc', icon: <Users size={24} />, href: '/reports/users', color: 'var(--color-primary-500)' },
    { titleKey: 'reports.providers.title', descKey: 'reports.hub.providersDesc', icon: <Building2 size={24} />, href: '/reports/providers', color: 'var(--color-warning)' },
    { titleKey: 'reports.geographic.title', descKey: 'reports.hub.geographicDesc', icon: <Globe size={24} />, href: '/reports/geographic', color: '#8b5cf6' },
];

export default function ReportsPage() {
    const { t } = useTranslation();
    return (
        <div className={shared.page}>
            <h1 className={shared.pageTitle}>{t('sidebar.reports')}</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {reportCards.map(card => (
                    <Link key={card.href} href={card.href} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 12, transition: 'box-shadow 0.15s' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 10, background: `color-mix(in srgb, ${card.color} 12%, transparent)`, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{card.icon}</div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>{t(card.titleKey)}</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{t(card.descKey)}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
