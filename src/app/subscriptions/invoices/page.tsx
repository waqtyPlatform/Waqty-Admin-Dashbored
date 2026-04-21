'use client';

import React from 'react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { exportToCSV } from '@/lib/utils';
import type { Invoice } from '@/types/subscription';
import { Download, FileText } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

const mockInvoices: Invoice[] = [
    { id: 'INV-001', provider_id: '1', provider_name: 'Glamour Studio', subscription_id: 'sub-1', amount: 12990, tax: 1818, total: 14808, currency: 'EGP', status: 'paid', issued_at: '2026-01-01T00:00:00Z', due_at: '2026-01-15T00:00:00Z', paid_at: '2026-01-03T10:00:00Z', pdf_url: '#' },
    { id: 'INV-002', provider_id: '2', provider_name: 'Elite Barbers', subscription_id: 'sub-2', amount: 1299, tax: 182, total: 1481, currency: 'EGP', status: 'paid', issued_at: '2026-04-01T00:00:00Z', due_at: '2026-04-15T00:00:00Z', paid_at: '2026-04-02T10:00:00Z', pdf_url: '#' },
    { id: 'INV-003', provider_id: '4', provider_name: 'Royal Spa & Wellness', subscription_id: 'sub-3', amount: 599, tax: 84, total: 683, currency: 'EGP', status: 'paid', issued_at: '2026-04-01T00:00:00Z', due_at: '2026-04-15T00:00:00Z', paid_at: '2026-04-03T10:00:00Z', pdf_url: '#' },
    { id: 'INV-004', provider_id: '6', provider_name: 'Nail Art Studio', subscription_id: 'sub-4', amount: 299, tax: 42, total: 341, currency: 'EGP', status: 'overdue', issued_at: '2026-03-01T00:00:00Z', due_at: '2026-03-15T00:00:00Z', paid_at: null, pdf_url: '#' },
    { id: 'INV-005', provider_id: '5', provider_name: 'Fresh Cuts Downtown', subscription_id: 'sub-6', amount: 5990, tax: 839, total: 6829, currency: 'EGP', status: 'paid', issued_at: '2026-03-05T00:00:00Z', due_at: '2026-03-19T00:00:00Z', paid_at: '2026-03-06T10:00:00Z', pdf_url: '#' },
    { id: 'INV-006', provider_id: '7', provider_name: 'The Gentleman Club', subscription_id: 'sub-7', amount: 299, tax: 42, total: 341, currency: 'EGP', status: 'cancelled', issued_at: '2026-02-01T00:00:00Z', due_at: '2026-02-15T00:00:00Z', paid_at: null, pdf_url: null },
];

export default function InvoicesPage() {
    const { t } = useTranslation();
    const columns: Column<Invoice>[] = [
        { key: 'id', label: t('subscriptions.invoices.invoice'), sortable: true, render: r => <span style={{ fontWeight: 500, fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{r.id}</span> },
        { key: 'provider_name', label: t('subscriptions.invoices.provider'), sortable: true, render: r => <span style={{ fontWeight: 500 }}>{r.provider_name}</span> },
        { key: 'amount', label: t('subscriptions.invoices.amount'), sortable: true, render: r => `EGP ${r.amount.toLocaleString()}` },
        { key: 'tax', label: t('subscriptions.invoices.tax'), sortable: true, render: r => `EGP ${r.tax.toLocaleString()}` },
        { key: 'total', label: t('subscriptions.invoices.total'), sortable: true, render: r => <strong>EGP {r.total.toLocaleString()}</strong> },
        { key: 'status', label: t('common.status'), sortable: true, render: r => <StatusBadge status={r.status} /> },
        { key: 'issued_at', label: t('subscriptions.invoices.issued'), sortable: true, render: r => new Date(r.issued_at).toLocaleDateString() },
        { key: 'paid_at', label: t('subscriptions.invoices.paid'), render: r => r.paid_at ? new Date(r.paid_at).toLocaleDateString() : '-' },
        { key: 'actions', label: '', width: '48px', render: r => r.pdf_url ? <button title={t('subscriptions.invoices.downloadPDF')} onClick={() => {
            exportToCSV([{ invoice_id: r.id, provider: r.provider_name, amount: r.amount, tax: r.tax, total: r.total, status: r.status, issued: r.issued_at }], `invoice-${r.id}`, [{key:'invoice_id',label:'Invoice'},{key:'provider',label:'Provider'},{key:'amount',label:'Amount'},{key:'tax',label:'Tax'},{key:'total',label:'Total'},{key:'status',label:'Status'},{key:'issued',label:'Issued'}]);
        }} style={{ border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px 8px', display: 'flex' }}><FileText size={14} /></button> : null },
    ];

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <h1 className={shared.pageTitle}>{t('subscriptions.invoices.title')}</h1>
                <button onClick={() => exportToCSV(mockInvoices, 'invoices', [{key:'id',label:'Invoice ID'},{key:'provider_name',label:'Provider'},{key:'amount',label:'Amount'},{key:'tax',label:'Tax'},{key:'total',label:'Total'},{key:'status',label:'Status'},{key:'issued_at',label:'Issued'},{key:'paid_at',label:'Paid'}])} className={shared.exportBtn}><Download size={16} /> {t('subscriptions.invoices.exportAll')}</button>
            </div>
            <DataTable<Invoice> columns={columns} data={mockInvoices} searchKeys={['id', 'provider_name']} searchPlaceholder={t('subscriptions.invoices.searchPlaceholder')} getRowKey={r => r.id} />
        </div>
    );
}
