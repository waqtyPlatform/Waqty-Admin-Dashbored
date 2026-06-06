'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ExperimentResultChartProps {
    data: { metric: string; A: number; B: number }[];
    nameA: string;
    nameB: string;
}

/**
 * Co-located, lazily-loaded result chart for the A/B experiment detail modal.
 * Keeping recharts here (imported via next/dynamic from the page) means the heavy
 * charting lib is NOT in the experiments route's initial JS chunk — it loads only
 * when the user opens a result-detail modal. Mirrors the app-wide lazy-chart pattern.
 */
export default function ExperimentResultChart({ data, nameA, nameB }: ExperimentResultChartProps) {
    return (
        <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="metric" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="A" fill="var(--color-primary-500)" name={nameA} />
                <Bar dataKey="B" fill="var(--color-info)" name={nameB} />
            </BarChart>
        </ResponsiveContainer>
    );
}
