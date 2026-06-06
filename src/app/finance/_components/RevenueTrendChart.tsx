'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { monthlyRevenueData } from '@/mocks/finance';
import { formatCompactMoney } from '@/lib/market';

export default function RevenueTrendChart() {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} tickFormatter={v => formatCompactMoney(Number(v), { withCurrency: false })} />
                <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8 }} formatter={(v) => [formatCompactMoney(Number(v)), '']} />
                <Area type="monotone" dataKey="subscriptions" stackId="1" stroke="var(--color-primary-500)" fill="color-mix(in srgb, var(--color-primary-500) 25%, transparent)" name="Subscriptions" />
                <Area type="monotone" dataKey="commissions" stackId="1" stroke="var(--color-info)" fill="color-mix(in srgb, var(--color-info) 25%, transparent)" name="Commissions" />
            </AreaChart>
        </ResponsiveContainer>
    );
}
