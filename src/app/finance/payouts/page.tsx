'use client';

import React from 'react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { platformPayouts } from '@/mocks/finance';
import type { PayoutRow } from '@/types/finance';
import { formatMoney } from '@/lib/market';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

export default function PayoutsPage() {
    const { t } = useTranslation();
    const columns: Column<PayoutRow>[] = [
        { key: 'provider_name', label: t('finance.provider'), sortable: true, render: r => <span style={{ fontWeight: 500 }}>{r.provider_name}</span> },
        { key: 'gross', label: t('finance.commissions.bookingAmount'), sortable: true, render: r => formatMoney(r.gross) },
        { key: 'commission_total', label: t('finance.commissions'), sortable: true, render: r => formatMoney(r.commission_total) },
        { key: 'fees_total', label: t('finance.fees'), sortable: true, render: r => formatMoney(r.fees_total) },
        { key: 'net_payable', label: t('finance.payouts.netPayable'), sortable: true, render: r => <strong>{formatMoney(r.net_payable)}</strong> },
        { key: 'status', label: t('common.status'), sortable: true, render: r => <StatusBadge status={r.status} /> },
        { key: 'period_start', label: t('finance.payouts.period'), render: r => `${new Date(r.period_start).toLocaleDateString()} - ${new Date(r.period_end).toLocaleDateString()}` },
    ];

    return (
        <div className={shared.page}>
            <h1 className={shared.pageTitle}>{t('finance.payouts.title')}</h1>
            <DataTable<PayoutRow> columns={columns} data={platformPayouts} searchKeys={['provider_name']} searchPlaceholder={t('finance.payouts.searchPlaceholder')} getRowKey={r => r.uuid} />
        </div>
    );
}
