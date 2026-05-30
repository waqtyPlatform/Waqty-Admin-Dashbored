'use client';

import React from 'react';
import { Award } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { DataTable, type Column } from '@/components/tables/DataTable';
import {
    mockLoyaltyAccountRows,
    mockLoyaltyTransactionRows,
    type LoyaltyAccountRow,
    type LoyaltyTransactionRow,
} from '@/mocks/engagement';
import shared from '@/components/admin/shared.module.css';

// X13 — loyalty reporting. Rows embed the canonical LoyaltyAccount /
// LoyaltyTransaction, so points earned/redeemed upstream are reportable here.
export default function LoyaltyReportPage() {
    const { t } = useTranslation();

    const accounts = mockLoyaltyAccountRows.length;
    const outstanding = mockLoyaltyAccountRows.reduce((s, r) => s + r.account.points_balance, 0);
    const redeemed = mockLoyaltyTransactionRows
        .filter(r => r.txn.type === 'redeem')
        .reduce((s, r) => s + Math.abs(r.txn.points), 0);

    const txnLabel: Record<LoyaltyTransactionRow['txn']['type'], string> = {
        earn: t('eng.txn.earn'),
        redeem: t('eng.txn.redeem'),
        adjust: t('eng.txn.adjust'),
        expire: t('eng.txn.expire'),
    };
    const txnColor: Record<LoyaltyTransactionRow['txn']['type'], string> = {
        earn: 'var(--color-success)',
        redeem: 'var(--color-info)',
        adjust: 'var(--color-warning)',
        expire: 'var(--text-tertiary)',
    };

    const accountColumns: Column<LoyaltyAccountRow>[] = [
        { key: 'customer', label: t('eng.col.customer'), render: r => r.customerName },
        { key: 'scope', label: t('eng.col.scope'), render: r => <span style={{ color: 'var(--text-secondary)' }}>{r.providerName}</span> },
        { key: 'tier', label: t('eng.col.tier'), render: r => r.account.tier ?? '—' },
        { key: 'points', label: t('eng.col.balance'), render: r => <span style={{ fontWeight: 600 }}>{r.account.points_balance.toLocaleString()}</span> },
    ];

    const txnColumns: Column<LoyaltyTransactionRow>[] = [
        { key: 'customer', label: t('eng.col.customer'), render: r => r.customerName },
        {
            key: 'type', label: t('eng.col.type'),
            render: r => (
                <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', background: 'var(--bg-tertiary)', color: txnColor[r.txn.type] }}>
                    {txnLabel[r.txn.type]}
                </span>
            ),
        },
        {
            key: 'points', label: t('eng.col.points'),
            render: r => <span style={{ fontWeight: 600, color: r.txn.points >= 0 ? 'var(--color-success)' : 'var(--color-info)' }}>{r.txn.points > 0 ? `+${r.txn.points}` : r.txn.points}</span>,
        },
        { key: 'reason', label: t('eng.col.reason'), render: r => <span style={{ color: 'var(--text-secondary)' }}>{r.txn.reason ?? '—'}</span> },
        { key: 'date', label: t('eng.col.date'), render: r => <span style={{ color: 'var(--text-secondary)' }}>{new Date(r.txn.created_at).toLocaleDateString()}</span> },
    ];

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Award size={24} />
                    <h1 className={shared.pageTitle}>{t('eng.loyalty.title')}</h1>
                </div>
            </div>

            <div className={shared.kpiGrid}>
                <div className={shared.summaryCard}>
                    <span className={shared.summaryLabel}>{t('eng.loyalty.kpiAccounts')}</span>
                    <span className={shared.summaryValue}>{accounts}</span>
                </div>
                <div className={shared.summaryCard}>
                    <span className={shared.summaryLabel}>{t('eng.loyalty.kpiPoints')}</span>
                    <span className={shared.summaryValue}>{outstanding.toLocaleString()}</span>
                </div>
                <div className={shared.summaryCard}>
                    <span className={shared.summaryLabel}>{t('eng.loyalty.kpiRedeemed')}</span>
                    <span className={shared.summaryValue}>{redeemed.toLocaleString()}</span>
                </div>
            </div>

            <DataTable<LoyaltyAccountRow>
                columns={accountColumns}
                data={mockLoyaltyAccountRows}
                searchKeys={['customerName', 'providerName']}
                searchPlaceholder={t('eng.searchLoyalty')}
                getRowKey={r => r.account.uuid}
            />

            <div className={shared.infoCard} style={{ marginTop: 'var(--space-6, 24px)' }}>
                <h3 className={shared.infoCardHeader}>{t('eng.loyalty.recentTxns')}</h3>
                <DataTable<LoyaltyTransactionRow>
                    columns={txnColumns}
                    data={mockLoyaltyTransactionRows}
                    getRowKey={r => r.txn.uuid}
                />
            </div>
        </div>
    );
}
