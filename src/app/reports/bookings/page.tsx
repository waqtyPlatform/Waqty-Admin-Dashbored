'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { bookingTrendsData } from '@/mocks/finance';
import shared from '@/components/admin/shared.module.css';

export default function BookingsReportPage() {
    const latest = bookingTrendsData[bookingTrendsData.length - 1];
    const completionRate = ((latest.completed / latest.bookings) * 100).toFixed(1);
    return (
        <div className={shared.page}>
            <h1 className={shared.pageTitle}>Booking Reports</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {[
                    { label: 'Total Bookings (Apr)', value: latest.bookings.toLocaleString(), color: 'var(--text-primary)' },
                    { label: 'Completed', value: latest.completed.toLocaleString(), color: 'var(--color-success)' },
                    { label: 'Cancelled', value: latest.cancelled.toLocaleString(), color: 'var(--color-error)' },
                    { label: 'Completion Rate', value: `${completionRate}%`, color: 'var(--color-info)' },
                ].map(k => (
                    <div key={k.label} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase' }}>{k.label}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: k.color, marginTop: 4 }}>{k.value}</div>
                    </div>
                ))}
            </div>
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>Booking Trends</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={bookingTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
                        <YAxis stroke="var(--text-tertiary)" fontSize={12} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                        <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                        <Legend />
                        <Area type="monotone" dataKey="completed" stroke="var(--color-success)" fill="var(--color-success)" fillOpacity={0.2} name="Completed" />
                        <Area type="monotone" dataKey="cancelled" stroke="var(--color-error)" fill="var(--color-error)" fillOpacity={0.2} name="Cancelled" />
                        <Area type="monotone" dataKey="noShow" stroke="var(--text-tertiary)" fill="var(--text-tertiary)" fillOpacity={0.2} name="No Show" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
