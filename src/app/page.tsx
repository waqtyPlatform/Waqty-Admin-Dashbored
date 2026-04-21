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
                            <YAxis stroke="var(--text-tertiary)" fontSize={12} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-primary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                }}
                                formatter={(value) => [`EGP ${(Number(value) / 1000).toFixed(0)}K`, '']}
                            />
                            <Area type="monotone" dataKey="subscriptions" stackId="1" stroke="#00b166" fill="#00b16640" name="Subscriptions" />
                            <Area type="monotone" dataKey="commissions" stackId="1" stroke="#3b82f6" fill="#3b82f640" name="Commissions" />
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
                                    <th>Category</th>
                                    <th>Bookings</th>
                                    <th>Revenue</th>
                                    <th>Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockTopProviders.map(p => (
                                    <tr key={p.id}>
                                        <td className={styles.providerName}>{p.name}</td>
                                        <td>{p.category}</td>
                                        <td>{p.bookings.toLocaleString()}</td>
                                        <td>EGP {(p.revenue / 1000).toFixed(0)}K</td>
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
