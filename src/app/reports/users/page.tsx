'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Users, UserPlus, UserCheck, UserX } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

// recharts is heavy — load the chart client-side only so it stays out of the initial bundle.
const UserGrowthChart = dynamic(() => import('./_components/UserGrowthChart'), {
    ssr: false,
    loading: () => <div style={{ height: 350, width: '100%' }} />,
});

const growthData = [
    { month: 'Oct', total: 35000, new: 3200, active: 28000 },
    { month: 'Nov', total: 37500, new: 3500, active: 29500 },
    { month: 'Dec', total: 40200, new: 3800, active: 31200 },
    { month: 'Jan', total: 42800, new: 3600, active: 33000 },
    { month: 'Feb', total: 45100, new: 3900, active: 35200 },
    { month: 'Mar', total: 47500, new: 4100, active: 37800 },
    { month: 'Apr', total: 48392, new: 2800, active: 38900 },
];

export default function UserReportsPage() {
    const { t } = useTranslation();
    return (
        <div className={shared.page}>
            <h1 className={shared.pageTitle}>{t('reports.users.title')}</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {[
                    { label: t('reports.users.total'), value: '48,392', icon: <Users size={20} />, color: 'var(--color-primary-500)' },
                    { label: t('reports.users.newThisMonth'), value: '2,800', icon: <UserPlus size={20} />, color: 'var(--color-success)' },
                    { label: t('reports.users.active30d'), value: '38,900', icon: <UserCheck size={20} />, color: 'var(--color-info)' },
                    { label: t('reports.users.churned'), value: '1,200', icon: <UserX size={20} />, color: 'var(--color-error)' },
                ].map(k => (
                    <div key={k.label} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: `color-mix(in srgb, ${k.color} 12%, transparent)`, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k.icon}</div>
                        <div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{k.label}</div><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{k.value}</div></div>
                    </div>
                ))}
            </div>
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>{t('reports.users.growth')}</h3>
                <UserGrowthChart growthData={growthData} />
            </div>
        </div>
    );
}
