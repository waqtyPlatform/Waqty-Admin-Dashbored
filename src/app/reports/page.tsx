'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { DollarSign, CalendarDays, Users, Building2, Globe } from 'lucide-react';

const reportCards = [
    { title: 'Revenue Reports', desc: 'Track subscription and commission revenue trends', icon: <DollarSign size={24} />, href: '/reports/revenue', color: 'var(--color-success)' },
    { title: 'Booking Reports', desc: 'Analyze booking volumes, completion rates, and trends', icon: <CalendarDays size={24} />, href: '/reports/bookings', color: 'var(--color-info)' },
    { title: 'User Reports', desc: 'User growth, retention, and engagement metrics', icon: <Users size={24} />, href: '/reports/users', color: 'var(--color-primary-500)' },
    { title: 'Provider Reports', desc: 'Provider performance, ratings, and activity', icon: <Building2 size={24} />, href: '/reports/providers', color: 'var(--color-warning)' },
    { title: 'Geographic Reports', desc: 'Distribution of providers and users by city', icon: <Globe size={24} />, href: '/reports/geographic', color: '#8b5cf6' },
];

export default function ReportsPage() {
    const { t } = useTranslation();
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{t('sidebar.reports')}</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {reportCards.map(card => (
                    <Link key={card.href} href={card.href} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 12, transition: 'box-shadow 0.15s' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 10, background: `color-mix(in srgb, ${card.color} 12%, transparent)`, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{card.icon}</div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>{card.title}</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{card.desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
