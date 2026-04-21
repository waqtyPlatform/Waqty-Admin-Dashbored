'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { monthlyRevenueData, mockCommissions, mockPayouts } from '@/mocks/finance';
import { forecastRevenue } from '@/lib/analytics';
import { DollarSign, TrendingUp, CreditCard, Wallet, FileText, Percent, Send, Receipt, LineChart as LineChartIcon } from 'lucide-react';
import Link from 'next/link';
import shared from '@/components/admin/shared.module.css';

export default function FinancePage() {
    const { t } = useTranslation();
    const totalCommissions = mockCommissions.reduce((s, c) => s + c.commission_amount, 0);
    const pendingPayouts = mockPayouts.filter(p => p.status === 'pending' || p.status === 'processing').reduce((s, p) => s + p.amount, 0);
    const completedPayouts = mockPayouts.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
    const forecast = forecastRevenue(monthlyRevenueData, 3);
    const nextMonthForecast = forecast[0];

    const kpis = [
        { label: 'Total Revenue (Apr)', value: 'EGP 520K', icon: <DollarSign size={20} />, color: 'var(--color-primary-500)' },
        { label: 'Commissions Earned', value: `EGP ${totalCommissions.toLocaleString()}`, icon: <TrendingUp size={20} />, color: 'var(--color-success)' },
        { label: 'Pending Payouts', value: `EGP ${(pendingPayouts / 1000).toFixed(0)}K`, icon: <CreditCard size={20} />, color: 'var(--color-warning)' },
        { label: 'Completed Payouts', value: `EGP ${(completedPayouts / 1000).toFixed(0)}K`, icon: <Wallet size={20} />, color: 'var(--color-info)' },
        ...(nextMonthForecast ? [{
            label: `${t('reports.revenue.forecast.nextMonth')} (${nextMonthForecast.month})`,
            value: `EGP ${Math.round(nextMonthForecast.total / 1000).toLocaleString()}K`,
            icon: <LineChartIcon size={20} />,
            color: 'var(--color-info)',
        }] : []),
    ];

    const subNav = [
        { label: t('finance.commissions'), href: '/finance/commissions', icon: <Percent size={18} />, description: 'Bookings commission ledger' },
        { label: t('finance.payouts'), href: '/finance/payouts', icon: <Send size={18} />, description: 'Provider payout batches' },
        { label: t('finance.invoices'), href: '/finance/invoices', icon: <Receipt size={18} />, description: 'Subscription invoices' },
        { label: t('finance.taxReports'), href: '/finance/tax-reports', icon: <FileText size={18} />, description: 'VAT & withholding' },
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
                <h3 className={shared.infoCardHeader}>Revenue Trend (Subscriptions vs Commissions)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
                        <YAxis stroke="var(--text-tertiary)" fontSize={12} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                        <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8 }} formatter={(v) => [`EGP ${Number(v).toLocaleString()}`, '']} />
                        <Area type="monotone" dataKey="subscriptions" stackId="1" stroke="var(--color-primary-500)" fill="color-mix(in srgb, var(--color-primary-500) 25%, transparent)" name="Subscriptions" />
                        <Area type="monotone" dataKey="commissions" stackId="1" stroke="var(--color-info)" fill="color-mix(in srgb, var(--color-info) 25%, transparent)" name="Commissions" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
