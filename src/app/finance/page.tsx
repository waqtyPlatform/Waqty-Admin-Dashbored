'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { monthlyRevenueData, mockCommissions, mockPayouts } from '@/mocks/finance';
import { DollarSign, TrendingUp, CreditCard, Wallet } from 'lucide-react';

export default function FinancePage() {
    const { t } = useTranslation();
    const totalCommissions = mockCommissions.reduce((s, c) => s + c.commission_amount, 0);
    const pendingPayouts = mockPayouts.filter(p => p.status === 'pending' || p.status === 'processing').reduce((s, p) => s + p.amount, 0);
    const completedPayouts = mockPayouts.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);

    const kpis = [
        { label: 'Total Revenue (Apr)', value: 'EGP 520K', icon: <DollarSign size={20} />, color: 'var(--color-primary-500)' },
        { label: 'Commissions Earned', value: `EGP ${totalCommissions.toLocaleString()}`, icon: <TrendingUp size={20} />, color: 'var(--color-success)' },
        { label: 'Pending Payouts', value: `EGP ${(pendingPayouts / 1000).toFixed(0)}K`, icon: <CreditCard size={20} />, color: 'var(--color-warning)' },
        { label: 'Completed Payouts', value: `EGP ${(completedPayouts / 1000).toFixed(0)}K`, icon: <Wallet size={20} />, color: 'var(--color-info)' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{t('sidebar.finance')} - {t('sidebar.overview')}</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {kpis.map(k => (
                    <div key={k.label} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: `color-mix(in srgb, ${k.color} 12%, transparent)`, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k.icon}</div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{k.label}</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{k.value}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>Revenue Trend (Subscriptions vs Commissions)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
                        <YAxis stroke="var(--text-tertiary)" fontSize={12} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                        <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8 }} formatter={(v) => [`EGP ${Number(v).toLocaleString()}`, '']} />
                        <Area type="monotone" dataKey="subscriptions" stackId="1" stroke="#00b166" fill="#00b16640" name="Subscriptions" />
                        <Area type="monotone" dataKey="commissions" stackId="1" stroke="#3b82f6" fill="#3b82f640" name="Commissions" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
