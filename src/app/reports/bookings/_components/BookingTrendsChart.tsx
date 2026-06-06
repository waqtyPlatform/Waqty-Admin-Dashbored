'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { bookingTrendsData } from '@/mocks/finance';
import { useTranslation } from '@/hooks/useTranslation';

export default function BookingTrendsChart() {
    const { t } = useTranslation();

    return (
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={bookingTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                <Legend />
                <Area type="monotone" dataKey="completed" stroke="var(--color-success)" fill="var(--color-success)" fillOpacity={0.2} name={t('reports.bookings.completed')} />
                <Area type="monotone" dataKey="cancelled" stroke="var(--color-error)" fill="var(--color-error)" fillOpacity={0.2} name={t('reports.bookings.cancelled')} />
                <Area type="monotone" dataKey="noShow" stroke="var(--text-tertiary)" fill="var(--text-tertiary)" fillOpacity={0.2} name={t('reports.bookings.noShow')} />
            </AreaChart>
        </ResponsiveContainer>
    );
}
