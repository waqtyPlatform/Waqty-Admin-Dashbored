'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { geographicData } from '@/mocks/finance';
import { useTranslation } from '@/hooks/useTranslation';

export default function GeographicChart() {
    const { t } = useTranslation();

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={geographicData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis type="number" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis dataKey="city" type="category" stroke="var(--text-tertiary)" fontSize={12} width={80} />
                <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                <Bar dataKey="providers" fill="var(--color-primary-500)" name={t('reports.geographic.providers')} radius={[0, 4, 4, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
