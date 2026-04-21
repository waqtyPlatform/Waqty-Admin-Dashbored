'use client';

import React from 'react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { mockCommissions } from '@/mocks/finance';
import type { CommissionRecord } from '@/types/finance';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

export default function CommissionsPage() {
    const { t } = useTranslation();
    const columns: Column<CommissionRecord>[] = [
        { key: 'provider_name', label: t('finance.provider'), sortable: true, render: r => <span style={{ fontWeight: 500 }}>{r.provider_name}</span> },
        { key: 'booking_id', label: t('finance.commissions.booking'), sortable: true },
        { key: 'booking_amount', label: t('finance.commissions.bookingAmount'), sortable: true, render: r => `EGP ${r.booking_amount}` },
        { key: 'commission_rate', label: t('finance.commissions.rate'), sortable: true, render: r => `${r.commission_rate}%` },
        { key: 'commission_amount', label: t('finance.commissions.commission'), sortable: true, render: r => <strong style={{ color: 'var(--color-success)' }}>EGP {r.commission_amount}</strong> },
        { key: 'status', label: t('common.status'), sortable: true, render: r => <StatusBadge status={r.status} /> },
        { key: 'created_at', label: t('common.date'), sortable: true, render: r => new Date(r.created_at).toLocaleDateString() },
    ];

    return (
        <div className={shared.page}>
            <h1 className={shared.pageTitle}>{t('finance.commissions.title')}</h1>
            <DataTable<CommissionRecord> columns={columns} data={mockCommissions} searchKeys={['provider_name', 'booking_id']} searchPlaceholder={t('finance.commissions.searchPlaceholder')} getRowKey={r => r.id} />
        </div>
    );
}
