'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Line, Area } from 'recharts';
import { monthlyRevenueData } from '@/mocks/finance';
import { formatCompactMoney } from '@/lib/market';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

interface ChartRow {
    month: string;
    total: number | null;
    forecastTotal: number | null;
    lower: number | null;
    upper: number | null;
    band: number | null;
    forecast: boolean;
}

interface RevenueChartsProps {
    chartData: ChartRow[];
}

export default function RevenueCharts({ chartData }: RevenueChartsProps) {
    const { t } = useTranslation();

    return (
        <>
            <div className={shared.infoCard}>
                <h3 className={shared.infoCardHeader}>{t('reports.revenue.monthlyBreakdown')}</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={monthlyRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
                        <YAxis stroke="var(--text-tertiary)" fontSize={12} tickFormatter={v => formatCompactMoney(Number(v), { withCurrency: false })} />
                        <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8 }} formatter={(v) => [formatCompactMoney(Number(v)), '']} />
                        <Legend />
                        <Bar dataKey="subscriptions" fill="var(--color-primary-500)" name={t('reports.revenue.subscriptions')} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="commissions" fill="var(--color-info)" name={t('reports.revenue.commissions')} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className={shared.infoCard}>
                <h3 className={shared.infoCardHeader}>{t('reports.revenue.forecast.title')}</h3>
                <ResponsiveContainer width="100%" height={320}>
                    <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
                        <YAxis stroke="var(--text-tertiary)" fontSize={12} tickFormatter={v => formatCompactMoney(Number(v), { withCurrency: false })} />
                        <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8 }} formatter={(v) => v == null ? ['—', ''] : [formatCompactMoney(Number(v)), '']} />
                        <Legend />
                        <Area type="monotone" dataKey="band" stroke="none" fill="var(--color-info)" fillOpacity={0.15} name={t('reports.revenue.forecast.confidence')} />
                        <Line type="monotone" dataKey="total" stroke="var(--color-primary-500)" strokeWidth={2} dot={{ r: 3 }} name={t('reports.revenue.monthlyBreakdown')} connectNulls={false} />
                        <Line type="monotone" dataKey="forecastTotal" stroke="var(--color-info)" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name={t('reports.revenue.forecast.title')} connectNulls={false} />
                    </ComposedChart>
                </ResponsiveContainer>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 8 }}>
                    {t('reports.revenue.forecast.disclaimer')}
                </p>
            </div>
        </>
    );
}
