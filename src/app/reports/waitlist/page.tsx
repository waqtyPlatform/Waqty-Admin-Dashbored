'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { mockWaitlistRows, type WaitlistReportRow } from '@/mocks/engagement';
import shared from '@/components/admin/shared.module.css';

// X13 — waitlist reporting. Rows embed the canonical WaitlistEntry, so an entry
// joined upstream (User app "join the waitlist") is visible/reportable here.
export default function WaitlistReportPage() {
    const { t } = useTranslation();

    const waiting = mockWaitlistRows.filter(r => r.entry.status === 'waiting').length;
    const notified = mockWaitlistRows.filter(r => r.entry.status === 'notified').length;
    const booked = mockWaitlistRows.filter(r => r.entry.status === 'booked').length;

    const statusLabel: Record<WaitlistReportRow['entry']['status'], string> = {
        waiting: t('eng.st.waiting'),
        notified: t('eng.st.notified'),
        booked: t('eng.st.booked'),
        cancelled: t('eng.st.cancelled'),
    };
    const statusColor: Record<WaitlistReportRow['entry']['status'], string> = {
        waiting: 'var(--color-warning)',
        notified: 'var(--color-info)',
        booked: 'var(--color-success)',
        cancelled: 'var(--text-tertiary)',
    };

    const columns: Column<WaitlistReportRow>[] = [
        { key: 'customer', label: t('eng.col.customer'), render: r => r.customerName },
        { key: 'provider', label: t('eng.col.provider'), render: r => r.providerName },
        { key: 'service', label: t('eng.col.service'), render: r => <span style={{ color: 'var(--text-secondary)' }}>{r.serviceName ?? '—'}</span> },
        {
            key: 'status', label: t('eng.col.status'),
            render: r => (
                <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', background: 'var(--bg-tertiary)', color: statusColor[r.entry.status] }}>
                    {statusLabel[r.entry.status]}
                </span>
            ),
        },
        { key: 'position', label: t('eng.col.position'), render: r => r.entry.position ?? '—' },
        { key: 'requested', label: t('eng.col.requested'), render: r => <span style={{ color: 'var(--text-secondary)' }}>{r.entry.requested_date ?? '—'}</span> },
    ];

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Clock size={24} />
                    <h1 className={shared.pageTitle}>{t('eng.waitlist.title')}</h1>
                </div>
            </div>

            <div className={shared.kpiGrid}>
                <div className={shared.summaryCard}>
                    <span className={shared.summaryLabel}>{t('eng.waitlist.kpiWaiting')}</span>
                    <span className={shared.summaryValue}>{waiting}</span>
                </div>
                <div className={shared.summaryCard}>
                    <span className={shared.summaryLabel}>{t('eng.waitlist.kpiNotified')}</span>
                    <span className={shared.summaryValue}>{notified}</span>
                </div>
                <div className={shared.summaryCard}>
                    <span className={shared.summaryLabel}>{t('eng.waitlist.kpiBooked')}</span>
                    <span className={shared.summaryValue}>{booked}</span>
                </div>
            </div>

            <DataTable<WaitlistReportRow>
                columns={columns}
                data={mockWaitlistRows}
                searchKeys={['customerName', 'providerName', 'serviceName']}
                searchPlaceholder={t('eng.searchWaitlist')}
                getRowKey={r => r.entry.uuid}
            />
        </div>
    );
}
