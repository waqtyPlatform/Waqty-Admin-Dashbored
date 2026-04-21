'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { monthlyRevenueData } from '@/mocks/finance';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

export default function RevenueReportPage() {
    const { t } = useTranslation();
    const totalRev = monthlyRevenueData.reduce((s, r) => s + r.total, 0);
    return (
        <div className={shared.page}>
            <h1 className={shared.pageTitle}>{t('reports.revenue.title')}</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase' }}>{t('reports.revenue.totalSevenMonths')}</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>EGP {(totalRev / 1000000).toFixed(2)}M</div>
                </div>
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase' }}>{t('reports.revenue.avgMonthly')}</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>EGP {Math.round(totalRev / 7 / 1000).toLocaleString()}K</div>
                </div>
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase' }}>{t('reports.revenue.growthRate')}</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-success)', marginTop: 4 }}>+8.8%</div>
                </div>
            </div>
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>{t('reports.revenue.monthlyBreakdown')}</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={monthlyRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
                        <YAxis stroke="var(--text-tertiary)" fontSize={12} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                        <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8 }} formatter={(v) => [`EGP ${Number(v).toLocaleString()}`, '']} />
                        <Legend />
                        <Bar dataKey="subscriptions" fill="var(--color-primary-500)" name={t('reports.revenue.subscriptions')} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="commissions" fill="var(--color-info)" name={t('reports.revenue.commissions')} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
