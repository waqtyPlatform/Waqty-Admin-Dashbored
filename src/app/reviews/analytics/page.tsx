'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { mockReviews } from '@/mocks/reviews';
import { Star, TrendingUp, AlertTriangle, MessageSquare } from 'lucide-react';

const ratingDist = [1, 2, 3, 4, 5].map(r => ({ rating: `${r} Star`, count: mockReviews.filter(rv => rv.rating === r).length }));
const statusDist = [
    { name: 'Published', count: mockReviews.filter(r => r.status === 'published').length, color: '#10b981' },
    { name: 'Flagged', count: mockReviews.filter(r => r.status === 'flagged').length, color: '#f59e0b' },
    { name: 'Hidden', count: mockReviews.filter(r => r.status === 'hidden').length, color: '#ef4444' },
    { name: 'Pending', count: mockReviews.filter(r => r.status === 'pending').length, color: '#3b82f6' },
];
const avgRating = (mockReviews.reduce((s, r) => s + r.rating, 0) / mockReviews.length).toFixed(1);
const topProviders = Array.from(new Set(mockReviews.map(r => r.provider_name))).map(name => {
    const providerReviews = mockReviews.filter(r => r.provider_name === name);
    return { name, count: providerReviews.length, avg: (providerReviews.reduce((s, r) => s + r.rating, 0) / providerReviews.length).toFixed(1) };
}).sort((a, b) => b.count - a.count);

export default function ReviewAnalyticsPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Review Analytics</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {[
                    { label: 'Total Reviews', value: mockReviews.length, icon: <MessageSquare size={20} />, color: 'var(--color-primary-500)' },
                    { label: 'Avg Rating', value: avgRating, icon: <Star size={20} />, color: '#f59e0b' },
                    { label: 'Flagged', value: mockReviews.filter(r => r.status === 'flagged').length, icon: <AlertTriangle size={20} />, color: 'var(--color-warning)' },
                    { label: 'Response Rate', value: `${Math.round(mockReviews.filter(r => r.admin_response).length / mockReviews.length * 100)}%`, icon: <TrendingUp size={20} />, color: 'var(--color-success)' },
                ].map(k => (
                    <div key={k.label} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: `color-mix(in srgb, ${k.color} 12%, transparent)`, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k.icon}</div>
                        <div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{k.label}</div><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{k.value}</div></div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>Rating Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={ratingDist}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="rating" stroke="var(--text-tertiary)" fontSize={12} />
                            <YAxis stroke="var(--text-tertiary)" fontSize={12} allowDecimals={false} />
                            <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                            <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Reviews" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>Status Breakdown</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart><Pie data={statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="count" nameKey="name">
                            {statusDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie><Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8 }} /></PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                        {statusDist.map(s => <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-secondary)' }}><span style={{ width: 8, height: 8, borderRadius: 4, background: s.color }} />{s.name}: {s.count}</div>)}
                    </div>
                </div>
            </div>

            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>Reviews by Provider</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead><tr style={{ background: 'var(--bg-secondary)' }}>
                        {['Provider', 'Reviews', 'Avg Rating'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>{h}</th>)}
                    </tr></thead>
                    <tbody>{topProviders.map(p => (
                        <tr key={p.name} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '10px 16px', fontWeight: 500 }}>{p.name}</td>
                            <td style={{ padding: '10px 16px' }}>{p.count}</td>
                            <td style={{ padding: '10px 16px' }}><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={14} fill="#f59e0b" stroke="#f59e0b" /> {p.avg}</span></td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
        </div>
    );
}
