'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/hooks/useTranslation';
import { monthlyRevenueData, platformPayouts, revenueSummary } from '@/mocks/finance';
import { formatMoney, formatCompactMoney } from '@/lib/market';
import { forecastRevenue } from '@/lib/analytics';
import { DollarSign, TrendingUp, CreditCard, Wallet, FileText, Percent, Send, Receipt, LineChart as LineChartIcon } from 'lucide-react';
import Link from 'next/link';
import shared from '@/components/admin/shared.module.css';

// recharts is heavy — load the chart client-side only so it stays out of the initial bundle.
const RevenueTrendChart = dynamic(() => import('./_components/RevenueTrendChart'), {
    ssr: false,
    loading: () => <div style={{ height: 300, width: '100%' }} />,
});

export default function FinancePage() {
    const { t } = useTranslation();
    // Derived from paid Visits via platform_finance.ts (see mocks/finance.ts).
    const platformRevenue = revenueSummary.platform_revenue;
    const totalCommissions = revenueSummary.commission_total;
    const pendingPayouts = platformPayouts.filter(p => p.status === 'pending' || p.status === 'processing').reduce((s, p) => s + p.net_payable, 0);
    const completedPayouts = platformPayouts.filter(p => p.status === 'paid').reduce((s, p) => s + p.net_payable, 0);
    const forecast = forecastRevenue(monthlyRevenueData, 3);
    const nextMonthForecast = forecast[0];

    const kpis = [
        { label: t('finance.platformRevenue'), value: formatMoney(platformRevenue), icon: <DollarSign size={20} />, color: 'var(--color-primary-500)' },
        { label: t('finance.commissionsEarned'), value: formatMoney(totalCommissions), icon: <TrendingUp size={20} />, color: 'var(--color-success)' },
        { label: t('finance.pendingPayouts'), value: formatMoney(pendingPayouts), icon: <CreditCard size={20} />, color: 'var(--color-warning)' },
        { label: t('finance.completedPayouts'), value: formatMoney(completedPayouts), icon: <Wallet size={20} />, color: 'var(--color-info)' },
        ...(nextMonthForecast ? [{
            label: `${t('reports.revenue.forecast.nextMonth')} (${nextMonthForecast.month})`,
            value: formatCompactMoney(nextMonthForecast.total),
            icon: <LineChartIcon size={20} />,
            color: 'var(--color-info)',
        }] : []),
    ];

    const subNav = [
        { label: t('finance.commissions'), href: '/finance/commissions', icon: <Percent size={18} />, description: t('finance.commissionsDesc') },
        { label: t('finance.payouts'), href: '/finance/payouts', icon: <Send size={18} />, description: t('finance.payoutsDesc') },
        { label: t('finance.invoices'), href: '/finance/invoices', icon: <Receipt size={18} />, description: t('finance.invoicesDesc') },
        { label: t('finance.taxReports'), href: '/finance/tax-reports', icon: <FileText size={18} />, description: t('finance.taxReportsDesc') },
    ];

    return (
        <div className={shared.page}>
            <h1 className={shared.pageTitle}>{t('finance.title')} - {t('sidebar.overview')}</h1>
            <div className={shared.kpiGrid}>
                {subNav.map(item => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={shared.infoCard}
                        style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 16, color: 'var(--text-primary)', textDecoration: 'none' }}
                    >
                        <div className={shared.kpiIcon} style={{ background: 'var(--bg-tertiary)', color: 'var(--color-primary-500)', width: 40, height: 40 }}>{item.icon}</div>
                        <div>
                            <div style={{ fontWeight: 600 }}>{item.label}</div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{item.description}</div>
                        </div>
                    </Link>
                ))}
            </div>
            <div className={shared.kpiGrid}>
                {kpis.map(k => (
                    <div key={k.label} className={shared.kpiCard}>
                        <div className={shared.kpiIcon} style={{ background: `color-mix(in srgb, ${k.color} 12%, transparent)`, color: k.color }}>{k.icon}</div>
                        <div>
                            <div className={shared.kpiLabel}>{k.label}</div>
                            <div className={shared.kpiValue}>{k.value}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className={shared.infoCard}>
                <h3 className={shared.infoCardHeader}>{t('finance.revenueTrendTitle')}</h3>
                <RevenueTrendChart />
            </div>
        </div>
    );
}
