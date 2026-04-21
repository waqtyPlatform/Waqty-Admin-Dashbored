'use client';

import React from 'react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { mockCommissions } from '@/mocks/finance';
import type { CommissionRecord } from '@/types/finance';
import shared from '@/components/admin/shared.module.css';

export default function CommissionsPage() {
    const columns: Column<CommissionRecord>[] = [
        { key: 'provider_name', label: 'Provider', sortable: true, render: r => <span style={{ fontWeight: 500 }}>{r.provider_name}</span> },
        { key: 'booking_id', label: 'Booking', sortable: true },
        { key: 'booking_amount', label: 'Booking Amount', sortable: true, render: r => `EGP ${r.booking_amount}` },
        { key: 'commission_rate', label: 'Rate', sortable: true, render: r => `${r.commission_rate}%` },
        { key: 'commission_amount', label: 'Commission', sortable: true, render: r => <strong style={{ color: 'var(--color-success)' }}>EGP {r.commission_amount}</strong> },
        { key: 'status', label: 'Status', sortable: true, render: r => <StatusBadge status={r.status} /> },
        { key: 'created_at', label: 'Date', sortable: true, render: r => new Date(r.created_at).toLocaleDateString() },
    ];

    return (
        <div className={shared.page}>
            <h1 className={shared.pageTitle}>Commissions</h1>
            <DataTable<CommissionRecord> columns={columns} data={mockCommissions} searchKeys={['provider_name', 'booking_id']} searchPlaceholder="Search commissions..." getRowKey={r => r.id} />
        </div>
    );
}
