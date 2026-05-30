'use client';

import React from 'react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { exportToCSV } from '@/lib/utils';
import type { InvoiceRow } from '@/types/subscription';
import { formatMoney, toMajor } from '@/lib/market';
import { Download, FileText } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

// Amounts are canonical Money — integer MINOR UNITS (100 = EGP 1.00).
const mockInvoices: InvoiceRow[] = [
    { uuid: 'INV-001', provider_uuid: 'prov-001', provider_name: 'Glamour Studio', subscription_uuid: 'sub-1', amount: 1299000, tax: 181800, total: 1480800, currency: 'EGP', status: 'paid', issued_at: '2026-01-01T00:00:00Z', due_at: '2026-01-15T00:00:00Z', paid_at: '2026-01-03T10:00:00Z', pdf_url: '#' },
    { uuid: 'INV-002', provider_uuid: 'prov-002', provider_name: 'Elite Barbers', subscription_uuid: 'sub-2', amount: 129900, tax: 18200, total: 148100, currency: 'EGP', status: 'paid', issued_at: '2026-04-01T00:00:00Z', due_at: '2026-04-15T00:00:00Z', paid_at: '2026-04-02T10:00:00Z', pdf_url: '#' },
    { uuid: 'INV-003', provider_uuid: 'prov-004', provider_name: 'Royal Spa & Wellness', subscription_uuid: 'sub-3', amount: 59900, tax: 8400, total: 68300, currency: 'EGP', status: 'paid', issued_at: '2026-04-01T00:00:00Z', due_at: '2026-04-15T00:00:00Z', paid_at: '2026-04-03T10:00:00Z', pdf_url: '#' },
    { uuid: 'INV-004', provider_uuid: 'prov-006', provider_name: 'Nail Art Studio', subscription_uuid: 'sub-4', amount: 29900, tax: 4200, total: 34100, currency: 'EGP', status: 'overdue', issued_at: '2026-03-01T00:00:00Z', due_at: '2026-03-15T00:00:00Z', paid_at: null, pdf_url: '#' },
    { uuid: 'INV-005', provider_uuid: 'prov-005', provider_name: 'Fresh Cuts Downtown', subscription_uuid: 'sub-6', amount: 599000, tax: 83900, total: 682900, currency: 'EGP', status: 'paid', issued_at: '2026-03-05T00:00:00Z', due_at: '2026-03-19T00:00:00Z', paid_at: '2026-03-06T10:00:00Z', pdf_url: '#' },
    { uuid: 'INV-006', provider_uuid: 'prov-007', provider_name: 'The Gentleman Club', subscription_uuid: 'sub-7', amount: 29900, tax: 4200, total: 34100, currency: 'EGP', status: 'cancelled', issued_at: '2026-02-01T00:00:00Z', due_at: '2026-02-15T00:00:00Z', paid_at: null, pdf_url: null },
];

export default function InvoicesPage() {
    const { t } = useTranslation();
    const columns: Column<InvoiceRow>[] = [
        { key: 'uuid', label: t('subscriptions.invoices.invoice'), sortable: true, render: r => <span style={{ fontWeight: 500, fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{r.uuid}</span> },
        { key: 'provider_name', label: t('subscriptions.invoices.provider'), sortable: true, render: r => <span style={{ fontWeight: 500 }}>{r.provider_name}</span> },
        { key: 'amount', label: t('subscriptions.invoices.amount'), sortable: true, render: r => formatMoney(r.amount) },
        { key: 'tax', label: t('subscriptions.invoices.tax'), sortable: true, render: r => formatMoney(r.tax) },
        { key: 'total', label: t('subscriptions.invoices.total'), sortable: true, render: r => <strong>{formatMoney(r.total)}</strong> },
        { key: 'status', label: t('common.status'), sortable: true, render: r => <StatusBadge status={r.status} /> },
        { key: 'issued_at', label: t('subscriptions.invoices.issued'), sortable: true, render: r => new Date(r.issued_at).toLocaleDateString() },
        { key: 'paid_at', label: t('subscriptions.invoices.paid'), render: r => r.paid_at ? new Date(r.paid_at).toLocaleDateString() : '-' },
        { key: 'actions', label: '', width: '48px', render: r => r.pdf_url ? <button title={t('subscriptions.invoices.downloadPDF')} onClick={() => {
            exportToCSV([{ invoice_id: r.uuid, provider: r.provider_name, amount: toMajor(r.amount), tax: toMajor(r.tax), total: toMajor(r.total), status: r.status, issued: r.issued_at }], `invoice-${r.uuid}`, [{key:'invoice_id',label:'Invoice'},{key:'provider',label:'Provider'},{key:'amount',label:'Amount'},{key:'tax',label:'Tax'},{key:'total',label:'Total'},{key:'status',label:'Status'},{key:'issued',label:'Issued'}]);
        }} style={{ border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px 8px', display: 'flex' }}><FileText size={14} /></button> : null },
    ];

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <h1 className={shared.pageTitle}>{t('subscriptions.invoices.title')}</h1>
                <button onClick={() => exportToCSV(mockInvoices.map(i => ({ ...i, amount: toMajor(i.amount), tax: toMajor(i.tax), total: toMajor(i.total) })) as unknown as Record<string, unknown>[], 'invoices', [{key:'uuid',label:'Invoice ID'},{key:'provider_name',label:'Provider'},{key:'amount',label:'Amount'},{key:'tax',label:'Tax'},{key:'total',label:'Total'},{key:'status',label:'Status'},{key:'issued_at',label:'Issued'},{key:'paid_at',label:'Paid'}])} className={shared.exportBtn}><Download size={16} /> {t('subscriptions.invoices.exportAll')}</button>
            </div>
            <DataTable<InvoiceRow> columns={columns} data={mockInvoices} searchKeys={['uuid', 'provider_name']} searchPlaceholder={t('subscriptions.invoices.searchPlaceholder')} getRowKey={r => r.uuid} />
        </div>
    );
}
