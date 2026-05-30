'use client';

import React from 'react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { platformCommissions } from '@/mocks/finance';
import type { PlatformCommissionRow } from '@/types/finance';
import { formatMoney } from '@/lib/market';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

export default function CommissionsPage() {
    const { t } = useTranslation();
    const columns: Column<PlatformCommissionRow>[] = [
        { key: 'provider_name', label: t('finance.provider'), sortable: true, render: r => <span style={{ fontWeight: 500 }}>{r.provider_name}</span> },
        { key: 'visit_uuid', label: t('finance.commissions.booking'), sortable: true, render: r => <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{r.visit_uuid}</code> },
        { key: 'gross_amount', label: t('finance.commissions.bookingAmount'), sortable: true, render: r => formatMoney(r.gross_amount) },
        { key: 'commission_rate', label: t('finance.commissions.rate'), sortable: true, render: r => `${Math.round(r.commission_rate * 100)}%` },
        { key: 'commission_amount', label: t('finance.commissions.commission'), sortable: true, render: r => <strong style={{ color: 'var(--color-success)' }}>{formatMoney(r.commission_amount)}</strong> },
        { key: 'provider_net', label: t('finance.payouts.netPayable'), sortable: true, render: r => formatMoney(r.provider_net) },
        { key: 'period', label: t('finance.payouts.period'), sortable: true },
        { key: 'created_at', label: t('common.date'), sortable: true, render: r => new Date(r.created_at).toLocaleDateString() },
    ];

    return (
        <div className={shared.page}>
            <h1 className={shared.pageTitle}>{t('finance.commissions.title')}</h1>
            <DataTable<PlatformCommissionRow> columns={columns} data={platformCommissions} searchKeys={['provider_name', 'visit_uuid']} searchPlaceholder={t('finance.commissions.searchPlaceholder')} getRowKey={r => r.uuid} />
        </div>
    );
}
