'use client';

import React from 'react';
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
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import {
    mockKPIs,
    mockRevenueData,
    mockCategoryBreakdown,
    mockSubscriptionBreakdown,
    mockTopProviders,
    mockRecentActivity,
} from '@/mocks/dashboard';
import { mockProviders } from '@/mocks/providers';
import { assessChurnRisk } from '@/lib/analytics';
import { formatMoney, formatCompactMoney } from '@/lib/market';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import styles from './page.module.css';

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

    const churnWatch = mockProviders
        .map(p => ({ provider: p, risk: assessChurnRisk(p, mockProviders) }))
        .filter(x => x.risk.risk !== 'none')
        .sort((a, b) => b.risk.riskScore - a.risk.riskScore)
        .slice(0, 5);

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <h1 className={styles.title}>{t('dashboard.title')}</h1>
            </div>

            {/* KPI Cards */}
            <div className={styles.kpiGrid}>
                {mockKPIs.map((kpi, i) => (
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
            <div className={styles.chartsRow}>
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>{t('dashboard.revenueOverTime')}</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={mockRevenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
                            <YAxis stroke="var(--text-tertiary)" fontSize={12} tickFormatter={v => formatCompactMoney(Number(v), { withCurrency: false })} />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-primary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                }}
                                formatter={(value) => [formatCompactMoney(Number(value)), '']}
                            />
                            <Area type="monotone" dataKey="subscriptions" stackId="1" stroke="var(--color-primary-500)" fill="var(--color-primary-500)" fillOpacity={0.25} name="Subscriptions" />
                            <Area type="monotone" dataKey="commissions" stackId="1" stroke="var(--color-info)" fill="var(--color-info)" fillOpacity={0.25} name="Commissions" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>{t('dashboard.providersByCategory')}</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={mockCategoryBreakdown}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={3}
                                dataKey="count"
                                nameKey="name"
                            >
                                {mockCategoryBreakdown.map(entry => (
                                    <Cell key={entry.name} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-primary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className={styles.legend}>
                        {mockCategoryBreakdown.map(item => (
                            <div key={item.name} className={styles.legendItem}>
                                <span className={styles.legendDot} style={{ backgroundColor: item.color }} />
                                <span>{item.name}</span>
                                <span className={styles.legendValue}>{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

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
