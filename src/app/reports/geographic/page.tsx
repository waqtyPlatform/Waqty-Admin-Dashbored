'use client';

import React from 'react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { geographicData } from '@/mocks/finance';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import shared from '@/components/admin/shared.module.css';

type GeoRow = typeof geographicData[0];

export default function GeographicReportPage() {
    const columns: Column<GeoRow>[] = [
        { key: 'city', label: 'City', sortable: true, render: r => <span style={{ fontWeight: 500 }}>{r.city}</span> },
        { key: 'providers', label: 'Providers', sortable: true },
        { key: 'users', label: 'Users', sortable: true, render: r => r.users.toLocaleString() },
        { key: 'bookings', label: 'Bookings', sortable: true, render: r => r.bookings.toLocaleString() },
        { key: 'revenue', label: 'Revenue', sortable: true, render: r => `EGP ${(r.revenue / 1000).toFixed(0)}K` },
    ];

    return (
        <div className={shared.page}>
            <h1 className={shared.pageTitle}>Geographic Reports</h1>
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>Providers by City</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={geographicData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis type="number" stroke="var(--text-tertiary)" fontSize={12} />
                        <YAxis dataKey="city" type="category" stroke="var(--text-tertiary)" fontSize={12} width={80} />
                        <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                        <Bar dataKey="providers" fill="#00b166" name="Providers" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <DataTable<GeoRow> columns={columns} data={geographicData} searchKeys={['city']} searchPlaceholder="Search cities..." getRowKey={r => r.city} />
        </div>
    );
}
