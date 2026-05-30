'use client';

import React from 'react';
import { Coins } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatMoney } from '@/lib/market';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { mockTipRows, type TipReportRow } from '@/mocks/engagement';
import shared from '@/components/admin/shared.module.css';

// X13 — tips reporting. Rows embed the canonical `Tip` (see mocks/engagement),
// so a tip created upstream (User → Employee) is visible and reportable here.
export default function TipsReportPage() {
    const { t } = useTranslation();

    const total = mockTipRows.reduce((s, r) => s + r.tip.amount, 0);
    const count = mockTipRows.length;
    const avg = count ? Math.round(total / count) : 0;

    const columns: Column<TipReportRow>[] = [
        { key: 'customer', label: t('eng.col.customer'), render: r => r.customerName },
        { key: 'employee', label: t('eng.col.employee'), render: r => r.employeeName },
        { key: 'provider', label: t('eng.col.provider'), render: r => r.providerName },
        {
            key: 'amount', label: t('eng.col.amount'),
            render: r => <span style={{ fontWeight: 600 }}>{formatMoney(r.tip.amount)}</span>,
        },
        {
            key: 'date', label: t('eng.col.date'),
            render: r => <span style={{ color: 'var(--text-secondary)' }}>{new Date(r.tip.created_at).toLocaleDateString()}</span>,
        },
    ];

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Coins size={24} />
                    <h1 className={shared.pageTitle}>{t('eng.tips.title')}</h1>
                </div>
            </div>

            <div className={shared.kpiGrid}>
                <div className={shared.summaryCard}>
                    <span className={shared.summaryLabel}>{t('eng.tips.kpiTotal')}</span>
                    <span className={shared.summaryValue}>{formatMoney(total)}</span>
                </div>
                <div className={shared.summaryCard}>
                    <span className={shared.summaryLabel}>{t('eng.tips.kpiCount')}</span>
                    <span className={shared.summaryValue}>{count}</span>
                </div>
                <div className={shared.summaryCard}>
                    <span className={shared.summaryLabel}>{t('eng.tips.kpiAvg')}</span>
                    <span className={shared.summaryValue}>{formatMoney(avg)}</span>
                </div>
            </div>

            <DataTable<TipReportRow>
                columns={columns}
                data={mockTipRows}
                searchKeys={['customerName', 'employeeName', 'providerName']}
                searchPlaceholder={t('eng.searchTips')}
                getRowKey={r => r.tip.uuid}
            />
        </div>
    );
}
