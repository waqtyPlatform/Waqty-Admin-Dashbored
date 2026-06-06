'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Building2, TrendingUp, Star, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

// recharts is heavy — load the chart client-side only so it stays out of the initial bundle.
const ProviderGrowthChart = dynamic(() => import('./_components/ProviderGrowthChart'), {
    ssr: false,
    loading: () => <div style={{ height: 350, width: '100%' }} />,
});

const providerStats = [
    { month: 'Oct', newProviders: 45, churned: 8, active: 1050 },
    { month: 'Nov', newProviders: 52, churned: 5, active: 1097 },
    { month: 'Dec', newProviders: 38, churned: 12, active: 1123 },
    { month: 'Jan', newProviders: 48, churned: 6, active: 1165 },
    { month: 'Feb', newProviders: 55, churned: 7, active: 1213 },
    { month: 'Mar', newProviders: 42, churned: 8, active: 1247 },
];

export default function ProviderReportsPage() {
    const { t } = useTranslation();
    return (
        <div className={shared.page}>
            <h1 className={shared.pageTitle}>{t('reports.providers.title')}</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {[
                    { label: t('reports.providers.total'), value: '1,247', icon: <Building2 size={20} />, color: 'var(--color-primary-500)' },
                    { label: t('reports.providers.growthRate'), value: '+4.2%', icon: <TrendingUp size={20} />, color: 'var(--color-success)' },
                    { label: t('reports.providers.avgRating'), value: '4.6', icon: <Star size={20} />, color: '#f59e0b' },
                    { label: t('reports.providers.suspended'), value: '23', icon: <AlertTriangle size={20} />, color: 'var(--color-error)' },
                ].map(k => (
                    <div key={k.label} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: `color-mix(in srgb, ${k.color} 12%, transparent)`, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k.icon}</div>
                        <div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{k.label}</div><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{k.value}</div></div>
                    </div>
                ))}
            </div>
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>{t('reports.providers.growthVsChurn')}</h3>
                <ProviderGrowthChart providerStats={providerStats} />
            </div>
        </div>
    );
}
