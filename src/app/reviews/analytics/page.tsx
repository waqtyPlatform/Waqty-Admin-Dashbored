'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Star, TrendingUp, MessageSquare, EyeOff } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useApiQuery } from '@/hooks/useApiQuery';
import { adminRatingsApi } from '@/lib/api';
import shared from '@/components/admin/shared.module.css';

export default function ReviewAnalyticsPage() {
    const { t } = useTranslation();

    const { data, loading } = useApiQuery(() => adminRatingsApi.analytics(), []);

    const summary     = data?.summary;
    const ratingDist  = (data?.rating_distribution ?? []).map(d => ({ rating: `${d.stars} Star`, count: d.count }));
    const byProvider  = data?.by_provider ?? [];

    const statusDist = [
        { name: t('reviews.analytics.published'), count: summary?.published ?? 0,                                color: 'var(--color-success)' },
        { name: t('reviews.analytics.hidden'),    count: summary?.hidden    ?? 0,                                color: 'var(--color-error)' },
    ];

    if (loading) {
        return (
            <div className={shared.page}>
                <h1 className={shared.pageTitle}>{t('reviews.analytics.title')}</h1>
                <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-tertiary)' }}>Loading...</div>
            </div>
        );
    }

    return (
        <div className={shared.page}>
            <h1 className={shared.pageTitle}>{t('reviews.analytics.title')}</h1>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {[
                    { label: t('reviews.analytics.totalReviews'), value: summary?.total ?? '--',                                       icon: <MessageSquare size={20} />, color: 'var(--color-primary-500)' },
                    { label: t('reviews.analytics.avgRating'),    value: summary?.avg_rating != null ? Number(summary.avg_rating).toFixed(1) : '--', icon: <Star size={20} />,          color: '#f59e0b' },
                    { label: t('reviews.analytics.hidden'),       value: summary?.hidden    ?? '--',                                   icon: <EyeOff size={20} />,        color: 'var(--color-error)' },
                    { label: t('reviews.analytics.responseRate'), value: summary?.response_rate != null ? `${Number(summary.response_rate).toFixed(1)}%` : '--', icon: <TrendingUp size={20} />, color: 'var(--color-success)' },
                ].map(k => (
                    <div key={k.label} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: `color-mix(in srgb, ${k.color} 12%, transparent)`, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k.icon}</div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{k.label}</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{k.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Rating distribution bar chart */}
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>{t('reviews.analytics.ratingDistribution')}</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={ratingDist}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="rating" stroke="var(--text-tertiary)" fontSize={12} />
                            <YAxis stroke="var(--text-tertiary)" fontSize={12} allowDecimals={false} />
                            <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                            <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name={t('reviews.analytics.reviews')} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Status breakdown pie chart */}
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>{t('reviews.analytics.statusBreakdown')}</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="count" nameKey="name">
                                {statusDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                        {statusDist.map(s => (
                            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                <span style={{ width: 8, height: 8, borderRadius: 4, background: s.color }} />
                                {s.name}: {s.count}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* By provider table */}
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>{t('reviews.analytics.reviewsByProvider')}</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-secondary)' }}>
                            {[t('reviews.analytics.provider'), t('reviews.analytics.reviews'), t('reviews.analytics.avgRating')].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {byProvider.length === 0 ? (
                            <tr><td colSpan={3} style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-tertiary)' }}>No data</td></tr>
                        ) : byProvider.map(p => (
                            <tr key={p.provider_uuid} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '10px 16px', fontWeight: 500 }}>{p.provider_name}</td>
                                <td style={{ padding: '10px 16px' }}>{p.total}</td>
                                <td style={{ padding: '10px 16px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Star size={14} fill="#f59e0b" stroke="#f59e0b" />
                                        {Number(p.avg_rating).toFixed(1)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
