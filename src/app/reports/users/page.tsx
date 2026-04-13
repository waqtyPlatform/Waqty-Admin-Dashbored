'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, UserPlus, UserCheck, UserX } from 'lucide-react';

const growthData = [
    { month: 'Oct', total: 35000, new: 3200, active: 28000 },
    { month: 'Nov', total: 37500, new: 3500, active: 29500 },
    { month: 'Dec', total: 40200, new: 3800, active: 31200 },
    { month: 'Jan', total: 42800, new: 3600, active: 33000 },
    { month: 'Feb', total: 45100, new: 3900, active: 35200 },
    { month: 'Mar', total: 47500, new: 4100, active: 37800 },
    { month: 'Apr', total: 48392, new: 2800, active: 38900 },
];

export default function UserReportsPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>User Reports</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {[
                    { label: 'Total Users', value: '48,392', icon: <Users size={20} />, color: 'var(--color-primary-500)' },
                    { label: 'New This Month', value: '2,800', icon: <UserPlus size={20} />, color: 'var(--color-success)' },
                    { label: 'Active (30d)', value: '38,900', icon: <UserCheck size={20} />, color: 'var(--color-info)' },
                    { label: 'Churned', value: '1,200', icon: <UserX size={20} />, color: 'var(--color-error)' },
                ].map(k => (
                    <div key={k.label} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: `color-mix(in srgb, ${k.color} 12%, transparent)`, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k.icon}</div>
                        <div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{k.label}</div><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{k.value}</div></div>
                    </div>
                ))}
            </div>
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>User Growth</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={growthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
                        <YAxis stroke="var(--text-tertiary)" fontSize={12} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                        <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                        <Area type="monotone" dataKey="total" stroke="#00b166" fill="#00b16630" name="Total Users" />
                        <Area type="monotone" dataKey="active" stroke="#3b82f6" fill="#3b82f630" name="Active Users" />
                        <Area type="monotone" dataKey="new" stroke="#f59e0b" fill="#f59e0b30" name="New Users" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
