'use client';

import React, { useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import {
    Building2,
    Users,
    CalendarDays,
    DollarSign,
    CreditCard,
    Clock,
    Headphones,
    TrendingUp,
    Star,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    ArrowRight,
    CheckCircle2,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import {
    mockKPIs,
    mockSubscriptionBreakdown,
    mockTopProviders,
    mockRecentActivity,
} from '@/mocks/dashboard';
import { mockProviders, mockRegistrations } from '@/mocks/providers';
import { platformPayouts } from '@/mocks/finance';
import { mockReviews } from '@/mocks/reviews';
import { mockTickets } from '@/mocks/support';
import { assessChurnRisk } from '@/lib/analytics';
import { formatMoney } from '@/lib/market';
import { useApiQuery } from '@/hooks/useApiQuery';
import { adminProvidersApi, adminUsersApi, adminBookingsApi } from '@/lib/api';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import styles from './page.module.css';

// recharts is heavy and lives below the KPI fold — load it client-side only so it
// stays out of the initial bundle.
const DashboardCharts = dynamic(() => import('./DashboardCharts'), {
    ssr: false,
    loading: () => (
        <div className={styles.chartsRow}>
            <div className={styles.chartCard} style={{ height: 340 }} />
            <div className={styles.chartCard} style={{ height: 340 }} />
        </div>
    ),
});

const KPI_ICONS = [
    <Building2 key="providers" size={20} />,
    <Users key="users" size={20} />,
    <CalendarDays key="bookings" size={20} />,
    <DollarSign key="revenue" size={20} />,
    <CreditCard key="subs" size={20} />,
    <Clock key="pending" size={20} />,
    <Headphones key="tickets" size={20} />,
    <TrendingUp key="monthly" size={20} />,
];

const ACTIVITY_COLORS: Record<string, string> = {
    registration: 'var(--color-info)',
    subscription: 'var(--color-primary-500)',
    review: 'var(--color-warning)',
    ticket: 'var(--color-error)',
    payout: 'var(--color-success)',
};

export default function DashboardPage() {
    const { t } = useTranslation();

    // Real platform counts for the first three KPI tiles (providers / users / bookings)
    // from each list endpoint's pagination total. The other tiles (revenue, subscriptions,
    // registrations, tickets, monthly) have no backend endpoint and stay mock.
    const { meta: providersMeta } = useApiQuery(() => adminProvidersApi.list({ per_page: 1 }), []);
    const { meta: usersMeta } = useApiQuery(() => adminUsersApi.list({ per_page: 1 }), []);
    const { meta: bookingsMeta } = useApiQuery(() => adminBookingsApi.list({ per_page: 1 }), []);
    const realKpiCounts: Record<number, number | undefined> = {
        0: providersMeta?.pagination?.total,
        1: usersMeta?.pagination?.total,
        2: bookingsMeta?.pagination?.total,
    };
    const kpis = mockKPIs.map((kpi, i) =>
        realKpiCounts[i] != null ? { ...kpi, value: realKpiCounts[i]!.toLocaleString() } : kpi
    );

    const churnWatch = mockProviders
        .map(p => ({ provider: p, risk: assessChurnRisk(p, mockProviders) }))
        .filter(x => x.risk.risk !== 'none')
        .sort((a, b) => b.risk.riskScore - a.risk.riskScore)
        .slice(0, 5);

    // "Needs attention" — actionable backlogs sourced from the same mocks the
    // queues use, deep-linking straight into each queue. Only non-zero items show.
    const attention = useMemo(() => {
        const activeTicket = (s: string) => s === 'open' || s === 'in_progress' || s === 'waiting_on_customer' || s === 'waiting_on_provider';
        return [
            {
                key: 'registrations',
                count: mockRegistrations.filter(r => r.status === 'pending').length,
                label: t('dashboard.attn.registrations'),
                href: '/providers/registrations',
                icon: <Clock size={18} />,
                tint: 'var(--color-warning)',
                bg: 'var(--color-warning-light)',
            },
            {
                key: 'payouts',
                count: platformPayouts.filter(p => p.status === 'pending').length,
                label: t('dashboard.attn.payouts'),
                href: '/finance/payouts',
                icon: <Wallet size={18} />,
                tint: 'var(--color-primary-600)',
                bg: 'var(--color-primary-50)',
            },
            {
                key: 'reviews',
                count: mockReviews.filter(r => r.status === 'flagged' || r.status === 'pending').length,
                label: t('dashboard.attn.reviews'),
                href: '/reviews',
                icon: <Star size={18} />,
                tint: '#f59e0b',
                bg: 'color-mix(in srgb, #f59e0b 12%, transparent)',
            },
            {
                key: 'tickets',
                count: mockTickets.filter(tk => tk.sla_breached || (activeTicket(tk.status) && tk.assigned_to == null)).length,
                label: t('dashboard.attn.tickets'),
                href: '/support',
                icon: <Headphones size={18} />,
                tint: 'var(--color-error)',
                bg: 'var(--color-error-50)',
            },
        ].filter(a => a.count > 0);
    }, [t]);

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <h1 className={styles.title}>{t('dashboard.title')}</h1>
            </div>

            {/* Needs attention */}
            <section aria-label={t('dashboard.needsAttention')} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                    {t('dashboard.needsAttention')}
                </h2>
                {attention.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 'var(--space-4)', background: 'var(--color-success-light)', color: 'var(--color-success)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                        <CheckCircle2 size={18} /> {t('dashboard.allClear')}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
                        {attention.map(a => (
                            <Link
                                key={a.key}
                                href={a.href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-3)',
                                    padding: 'var(--space-4)',
                                    background: 'var(--bg-primary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-lg)',
                                    borderInlineStart: `3px solid ${a.tint}`,
                                    textDecoration: 'none',
                                    color: 'var(--text-primary)',
                                }}
                            >
                                <span style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: a.bg, color: a.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {a.icon}
                                </span>
                                <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                                    <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{a.count}</span>
                                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{a.label}</span>
                                </span>
                                <ArrowRight size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* KPI Cards */}
            <div className={styles.kpiGrid}>
                {kpis.map((kpi, i) => (
                    <div key={kpi.label} className={styles.kpiCard}>
                        <div className={styles.kpiIcon}>{KPI_ICONS[i]}</div>
                        <div className={styles.kpiContent}>
                            <span className={styles.kpiLabel}>{t(kpi.label)}</span>
                            <span className={styles.kpiValue}>{kpi.value}</span>
                            <span className={`${styles.kpiChange} ${kpi.trend === 'up' ? styles.up : styles.down}`}>
                                {kpi.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {Math.abs(kpi.change)}% {t('dashboard.vsLastMonth')}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <DashboardCharts />

            {/* Bottom Row */}
            <div className={styles.bottomRow}>
                {/* Top Providers */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>{t('dashboard.topProviders')}</h3>
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>{t('common.name')}</th>
                                    <th>{t('providers.category')}</th>
                                    <th>{t('providers.bookings')}</th>
                                    <th>{t('providers.revenue')}</th>
                                    <th>{t('dashboard.col.rating')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockTopProviders.map(p => (
                                    <tr key={p.id}>
                                        <td className={styles.providerName}>{p.name}</td>
                                        <td>{p.category}</td>
                                        <td>{p.bookings.toLocaleString()}</td>
                                        <td>{formatMoney(p.revenue)}</td>
                                        <td>
                                            <span className={styles.rating}>
                                                <Star size={14} fill="#f59e0b" stroke="#f59e0b" /> {p.rating}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Churn Risk Watch */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <AlertTriangle size={16} style={{ color: 'var(--color-warning)' }} />
                            {t('dashboard.churnWatch.title')}
                        </span>
                    </h3>
                    {churnWatch.length === 0 ? (
                        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            {t('dashboard.churnWatch.empty')}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {churnWatch.map(({ provider, risk }) => {
                                const color = risk.risk === 'high' ? 'var(--color-error)' : 'var(--color-warning)';
                                return (
                                    <Link
                                        key={provider.id}
                                        href={`/providers/${provider.id}`}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                            padding: '8px 10px',
                                            borderRadius: 8,
                                            border: '1px solid var(--border-color)',
                                            textDecoration: 'none',
                                            color: 'var(--text-primary)',
                                            borderInlineStart: `3px solid ${color}`,
                                        }}
                                    >
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 500, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{provider.business_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {risk.reasons[0] || '—'}
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: 999,
                                            fontSize: '0.6875rem',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            color,
                                            background: `color-mix(in srgb, ${color} 14%, transparent)`,
                                        }}>
                                            {t(`providers.churnRisk.level.${risk.risk}`)}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>{t('dashboard.recentActivity')}</h3>
                    <div className={styles.activityList}>
                        {mockRecentActivity.map(item => (
                            <div key={item.id} className={styles.activityItem}>
                                <div
                                    className={styles.activityDot}
                                    style={{ backgroundColor: ACTIVITY_COLORS[item.type] }}
                                />
                                <div className={styles.activityContent}>
                                    <span className={styles.activityTitle}>{item.title}</span>
                                    <span className={styles.activityDesc}>{item.description}</span>
                                </div>
                                <span className={styles.activityTime}>{item.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
