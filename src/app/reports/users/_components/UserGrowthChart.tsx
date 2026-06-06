'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from '@/hooks/useTranslation';

interface GrowthRow {
    month: string;
    total: number;
    new: number;
    active: number;
}

interface UserGrowthChartProps {
    growthData: GrowthRow[];
}

export default function UserGrowthChart({ growthData }: UserGrowthChartProps) {
    const { t } = useTranslation();

    return (
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                <Area type="monotone" dataKey="total" stroke="var(--color-primary-500)" fill="var(--color-primary-500)" fillOpacity={0.2} name={t('reports.users.totalUsers')} />
                <Area type="monotone" dataKey="active" stroke="var(--color-info)" fill="var(--color-info)" fillOpacity={0.2} name={t('reports.users.activeUsers')} />
                <Area type="monotone" dataKey="new" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} name={t('reports.users.newUsers')} />
            </AreaChart>
        </ResponsiveContainer>
    );
}
