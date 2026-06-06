'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTranslation } from '@/hooks/useTranslation';

interface RatingDistRow {
    rating: string;
    count: number;
}

interface StatusDistRow {
    name: string;
    count: number;
    color: string;
}

export function RatingDistributionChart({ ratingDist }: { ratingDist: RatingDistRow[] }) {
    const { t } = useTranslation();
    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ratingDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="rating" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name={t('reviews.analytics.reviews')} />
            </BarChart>
        </ResponsiveContainer>
    );
}

export function StatusBreakdownChart({ statusDist }: { statusDist: StatusDistRow[] }) {
    return (
        <ResponsiveContainer width="100%" height={200}>
            <PieChart>
                <Pie data={statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="count" nameKey="name">
                    {statusDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
            </PieChart>
        </ResponsiveContainer>
    );
}
