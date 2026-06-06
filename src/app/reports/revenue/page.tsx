'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { monthlyRevenueData } from '@/mocks/finance';
import { forecastRevenue, linearRegression, type RevenuePoint } from '@/lib/analytics';
import { formatCompactMoney } from '@/lib/market';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

// recharts is heavy — load the charts client-side only so they stay out of the initial bundle.
const RevenueCharts = dynamic(() => import('./_components/RevenueCharts'), {
    ssr: false,
    loading: () => (
        <>
            <div className={shared.infoCard} style={{ height: 350 }} />
            <div className={shared.infoCard} style={{ height: 320 }} />
        </>
    ),
});

export default function RevenueReportPage() {
    const { t } = useTranslation();
    const totalRev = monthlyRevenueData.reduce((s, r) => s + r.total, 0);

    const forecast = useMemo(() => forecastRevenue(monthlyRevenueData, 3), []);
    const regression = useMemo(() => linearRegression(monthlyRevenueData.map(p => p.total)), []);

    // Unified chart data: history has `total` populated; forecast has `forecastTotal`, `lower`, `upper`.
    // A bridging point repeats the last history value under `forecastTotal` for a seamless dashed line.
    const chartData = useMemo(() => {
        const last = monthlyRevenueData[monthlyRevenueData.length - 1];
        const history = monthlyRevenueData.map(p => ({
            month: p.month,
            total: p.total,
            forecastTotal: null as number | null,
            lower: null as number | null,
            upper: null as number | null,
            band: null as number | null,
            forecast: false,
        }));
        // inject bridge point into history's last row so the dashed line starts from the last actual
        history[history.length - 1] = { ...history[history.length - 1], forecastTotal: last.total };
        const forecastRows = forecast.map(p => ({
            month: p.month,
            total: null as number | null,
            forecastTotal: p.total,
            lower: p.lower ?? null,
            upper: p.upper ?? null,
            band: p.upper != null && p.lower != null ? p.upper - p.lower : null,
            forecast: true,
        }));
        return [...history, ...forecastRows];
    }, [forecast]);

    const nextMonth: RevenuePoint | undefined = forecast[0];
    const r2 = (regression.r2 * 100).toFixed(1);

    return (
        <div className={shared.page}>
            <h1 className={shared.pageTitle}>{t('reports.revenue.title')}</h1>
            <div className={shared.kpiGrid}>
                <div className={shared.summaryCard}>
                    <span className={shared.summaryLabel}>{t('reports.revenue.totalSevenMonths')}</span>
                    <span className={shared.summaryValue}>{formatCompactMoney(totalRev)}</span>
                </div>
                <div className={shared.summaryCard}>
                    <span className={shared.summaryLabel}>{t('reports.revenue.avgMonthly')}</span>
                    <span className={shared.summaryValue}>{formatCompactMoney(Math.round(totalRev / 7))}</span>
                </div>
                <div className={shared.summaryCard}>
                    <span className={shared.summaryLabel}>{t('reports.revenue.growthRate')}</span>
                    <span className={shared.summaryValue} style={{ color: 'var(--color-success)' }}>+8.8%</span>
                </div>
                {nextMonth && (
                    <div className={shared.summaryCard} style={{ borderInlineStart: '3px solid var(--color-info)' }}>
                        <span className={shared.summaryLabel}>{t('reports.revenue.forecast.nextMonth')} ({nextMonth.month})</span>
                        <span className={shared.summaryValue} style={{ color: 'var(--color-info)' }}>{formatCompactMoney(nextMonth.total)}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {t('reports.revenue.forecast.confidence')}: {formatCompactMoney(nextMonth.lower ?? 0)} – {formatCompactMoney(nextMonth.upper ?? 0)} (R² {r2}%)
                        </span>
                    </div>
                )}
            </div>
            <RevenueCharts chartData={chartData} />
        </div>
    );
}
