'use client';

import React from 'react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { mockPayouts } from '@/mocks/finance';
import type { PayoutRecord } from '@/types/finance';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

export default function PayoutsPage() {
    const { t } = useTranslation();
    const columns: Column<PayoutRecord>[] = [
        { key: 'provider_name', label: t('finance.provider'), sortable: true, render: r => <span style={{ fontWeight: 500 }}>{r.provider_name}</span> },
        { key: 'amount', label: t('common.amount'), sortable: true, render: r => <strong>EGP {r.amount.toLocaleString()}</strong> },
        { key: 'method', label: t('finance.payouts.method'), sortable: true, render: r => <span style={{ textTransform: 'capitalize' }}>{r.method.replace('_', ' ')}</span> },
        { key: 'status', label: t('common.status'), sortable: true, render: r => <StatusBadge status={r.status} /> },
        { key: 'period_start', label: t('finance.payouts.period'), render: r => `${new Date(r.period_start).toLocaleDateString()} - ${new Date(r.period_end).toLocaleDateString()}` },
        { key: 'completed_at', label: t('finance.payouts.completed'), render: r => r.completed_at ? new Date(r.completed_at).toLocaleDateString() : '-' },
    ];

    return (
        <div className={shared.page}>
            <h1 className={shared.pageTitle}>{t('finance.payouts.title')}</h1>
            <DataTable<PayoutRecord> columns={columns} data={mockPayouts} searchKeys={['provider_name']} searchPlaceholder={t('finance.payouts.searchPlaceholder')} getRowKey={r => r.id} />
        </div>
    );
}
