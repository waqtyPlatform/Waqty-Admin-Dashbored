'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Building2, TrendingUp, Star, AlertTriangle } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';

const providerStats = [
    { month: 'Oct', newProviders: 45, churned: 8, active: 1050 },
    { month: 'Nov', newProviders: 52, churned: 5, active: 1097 },
    { month: 'Dec', newProviders: 38, churned: 12, active: 1123 },
    { month: 'Jan', newProviders: 48, churned: 6, active: 1165 },
    { month: 'Feb', newProviders: 55, churned: 7, active: 1213 },
    { month: 'Mar', newProviders: 42, churned: 8, active: 1247 },
];

export default function ProviderReportsPage() {
    return (
        <div className={shared.page}>
            <h1 className={shared.pageTitle}>Provider Reports</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {[
                    { label: 'Total Providers', value: '1,247', icon: <Building2 size={20} />, color: 'var(--color-primary-500)' },
                    { label: 'Growth Rate', value: '+4.2%', icon: <TrendingUp size={20} />, color: 'var(--color-success)' },
                    { label: 'Avg Rating', value: '4.6', icon: <Star size={20} />, color: '#f59e0b' },
                    { label: 'Suspended', value: '23', icon: <AlertTriangle size={20} />, color: 'var(--color-error)' },
                ].map(k => (
                    <div key={k.label} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: `color-mix(in srgb, ${k.color} 12%, transparent)`, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k.icon}</div>
                        <div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{k.label}</div><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{k.value}</div></div>
                    </div>
                ))}
            </div>
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>Provider Growth vs Churn</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={providerStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
                        <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                        <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                        <Legend />
                        <Bar dataKey="newProviders" fill="#00b166" name="New Providers" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="churned" fill="#ef4444" name="Churned" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
