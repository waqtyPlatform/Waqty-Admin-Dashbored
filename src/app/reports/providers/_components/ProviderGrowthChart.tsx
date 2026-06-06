'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTranslation } from '@/hooks/useTranslation';

interface ProviderStatRow {
    month: string;
    newProviders: number;
    churned: number;
    active: number;
}

interface ProviderGrowthChartProps {
    providerStats: ProviderStatRow[];
}

export default function ProviderGrowthChart({ providerStats }: ProviderGrowthChartProps) {
    const { t } = useTranslation();

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={providerStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="newProviders" fill="var(--color-primary-500)" name={t('reports.providers.newProviders')} radius={[4, 4, 0, 0]} />
                <Bar dataKey="churned" fill="var(--color-error)" name={t('reports.providers.churned')} radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
