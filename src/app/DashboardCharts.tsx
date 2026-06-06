'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
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
import { mockRevenueData, mockCategoryBreakdown } from '@/mocks/dashboard';
import { formatCompactMoney } from '@/lib/market';
import styles from './page.module.css';

export default function DashboardCharts() {
    const { t } = useTranslation();

    return (
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
    );
}
