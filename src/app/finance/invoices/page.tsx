'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { FormModal } from '@/components/admin/FormModal';
import { exportToCSV } from '@/lib/utils';
import type { Invoice } from '@/types/subscription';
import { Download, FileText, Eye } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';

const initialInvoices: Invoice[] = [
    { id: 'INV-10001', provider_id: '1', provider_name: 'Glamour Studio', subscription_id: 'sub-1', amount: 12990, tax: 1819, total: 14809, currency: 'EGP', status: 'paid', issued_at: '2026-01-01T00:00:00Z', due_at: '2026-01-15T00:00:00Z', paid_at: '2026-01-03T10:00:00Z', pdf_url: '#' },
    { id: 'INV-10002', provider_id: '2', provider_name: 'Elite Barbers', subscription_id: 'sub-2', amount: 1299, tax: 182, total: 1481, currency: 'EGP', status: 'paid', issued_at: '2026-04-01T00:00:00Z', due_at: '2026-04-15T00:00:00Z', paid_at: '2026-04-02T14:00:00Z', pdf_url: '#' },
    { id: 'INV-10003', provider_id: '3', provider_name: 'Beauty Clinic Cairo', subscription_id: 'sub-3', amount: 599, tax: 84, total: 683, currency: 'EGP', status: 'pending', issued_at: '2026-04-01T00:00:00Z', due_at: '2026-04-15T00:00:00Z', paid_at: null, pdf_url: '#' },
    { id: 'INV-10004', provider_id: '4', provider_name: 'Royal Spa & Wellness', subscription_id: 'sub-4', amount: 599, tax: 84, total: 683, currency: 'EGP', status: 'overdue', issued_at: '2026-03-01T00:00:00Z', due_at: '2026-03-15T00:00:00Z', paid_at: null, pdf_url: '#' },
    { id: 'INV-10005', provider_id: '5', provider_name: 'Fresh Cuts Downtown', subscription_id: 'sub-6', amount: 5990, tax: 839, total: 6829, currency: 'EGP', status: 'paid', issued_at: '2026-03-05T00:00:00Z', due_at: '2026-03-19T00:00:00Z', paid_at: '2026-03-07T11:00:00Z', pdf_url: '#' },
    { id: 'INV-10006', provider_id: '6', provider_name: 'Nail Art Studio', subscription_id: 'sub-4', amount: 299, tax: 42, total: 341, currency: 'EGP', status: 'overdue', issued_at: '2026-03-01T00:00:00Z', due_at: '2026-03-15T00:00:00Z', paid_at: null, pdf_url: '#' },
    { id: 'INV-10007', provider_id: '9', provider_name: 'Glow Skin Clinic', subscription_id: 'sub-9', amount: 599, tax: 84, total: 683, currency: 'EGP', status: 'paid', issued_at: '2026-04-01T00:00:00Z', due_at: '2026-04-15T00:00:00Z', paid_at: '2026-04-04T09:00:00Z', pdf_url: '#' },
    { id: 'INV-10008', provider_id: '11', provider_name: 'Luxury Nails', subscription_id: 'sub-11', amount: 599, tax: 84, total: 683, currency: 'EGP', status: 'refunded', issued_at: '2026-02-14T00:00:00Z', due_at: '2026-02-28T00:00:00Z', paid_at: '2026-02-15T10:00:00Z', pdf_url: '#' },
];

export default function FinanceInvoicesPage() {
    const { t } = useTranslation();
    const [invoices] = useState(initialInvoices);
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
    const filtered = invoices.filter(i => statusFilter === 'all' || i.status === statusFilter);

    const summary = {
        total: invoices.length,
        paid: invoices.filter(i => i.status === 'paid').length,
        pending: invoices.filter(i => i.status === 'pending').length,
        overdue: invoices.filter(i => i.status === 'overdue').length,
        totalRevenue: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0),
        overdueAmount: invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0),
    };

    const handleDownload = (inv: Invoice) => {
        exportToCSV([{ id: inv.id, provider: inv.provider_name, amount: inv.amount, tax: inv.tax, total: inv.total, status: inv.status, issued: inv.issued_at, due: inv.due_at, paid: inv.paid_at || 'N/A' }], `invoice-${inv.id}`, [
            { key: 'id', label: 'Invoice ID' }, { key: 'provider', label: 'Provider' }, { key: 'amount', label: 'Amount' },
            { key: 'tax', label: 'Tax' }, { key: 'total', label: 'Total' }, { key: 'status', label: 'Status' },
            { key: 'issued', label: 'Issued' }, { key: 'due', label: 'Due' }, { key: 'paid', label: 'Paid' },
        ]);
    };

    const handleExportAll = () => {
        exportToCSV(filtered as unknown as Record<string, unknown>[], 'invoices', [
            { key: 'id', label: 'Invoice ID' }, { key: 'provider_name', label: 'Provider' },
            { key: 'amount', label: 'Amount' }, { key: 'tax', label: 'Tax' }, { key: 'total', label: 'Total' },
            { key: 'status', label: 'Status' }, { key: 'issued_at', label: 'Issued' },
            { key: 'due_at', label: 'Due Date' }, { key: 'paid_at', label: 'Paid At' },
        ]);
    };

    const columns: Column<Invoice>[] = [
        { key: 'id', label: t('finance.invoice'), sortable: true, render: r => <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 500 }}>{r.id}</code> },
        { key: 'provider_name', label: t('finance.provider'), sortable: true, render: r => <span style={{ fontWeight: 500 }}>{r.provider_name}</span> },
        { key: 'amount', label: t('common.amount'), sortable: true, render: r => `EGP ${r.amount.toLocaleString()}` },
        { key: 'tax', label: t('finance.tax'), sortable: true, render: r => `EGP ${r.tax.toLocaleString()}` },
        { key: 'total', label: t('common.total'), sortable: true, render: r => <strong>EGP {r.total.toLocaleString()}</strong> },
        { key: 'status', label: t('common.status'), sortable: true, render: r => <StatusBadge status={r.status} /> },
        { key: 'issued_at', label: t('finance.issued'), sortable: true, render: r => new Date(r.issued_at).toLocaleDateString() },
        { key: 'due_at', label: t('finance.due'), sortable: true, render: r => new Date(r.due_at).toLocaleDateString() },
        {
            key: 'actions', label: '', width: '100px',
            render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={e => { e.stopPropagation(); setViewInvoice(r); }} title="View" style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Eye size={14} /></button>
                    <button onClick={e => { e.stopPropagation(); handleDownload(r); }} title="Download PDF" style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: 'var(--color-info)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Download size={14} /></button>
                </div>
            ),
        },
    ];

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <h1 className={shared.pageTitle}>{t('finance.invoicesTitle')}</h1>
                <button onClick={handleExportAll} className={shared.exportBtn}><Download size={16} /> {t('finance.exportAll')}</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {[
                    { label: t('finance.totalCollected'), value: `EGP ${summary.totalRevenue.toLocaleString()}`, icon: <FileText size={20} />, color: 'var(--color-success)' },
                    { label: t('finance.paid'), value: summary.paid, icon: <FileText size={20} />, color: 'var(--color-success)' },
                    { label: t('finance.pending'), value: summary.pending, icon: <FileText size={20} />, color: 'var(--color-warning)' },
                    { label: t('finance.overdue'), value: `EGP ${summary.overdueAmount.toLocaleString()}`, icon: <FileText size={20} />, color: 'var(--color-error)' },
                ].map(k => (
                    <div key={k.label} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: `color-mix(in srgb, ${k.color} 12%, transparent)`, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k.icon}</div>
                        <div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{k.label}</div><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{k.value}</div></div>
                    </div>
                ))}
            </div>

            <DataTable<Invoice> columns={columns} data={filtered} searchKeys={['id', 'provider_name']} searchPlaceholder={t('finance.searchPlaceholder')} getRowKey={r => r.id}
                filters={<select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'var(--font-sans)' }}>
                    <option value="all">{t('finance.allStatus')}</option><option value="paid">{t('finance.paid')}</option><option value="pending">{t('finance.pending')}</option><option value="overdue">{t('finance.overdue')}</option><option value="refunded">{t('finance.refunded')}</option>
                </select>}
            />

            {/* View Invoice Modal */}
            <FormModal
                open={!!viewInvoice}
                onClose={() => setViewInvoice(null)}
                title={viewInvoice ? `${t('finance.invoice')} ${viewInvoice.id}` : t('finance.invoice')}
                submitLabel={t('common.close')}
                onSubmit={e => { e.preventDefault(); setViewInvoice(null); }}
            >
                {viewInvoice && (
                    <>
                        <div className={shared.formGrid2}>
                            <InvoiceField label={t('finance.provider')} value={viewInvoice.provider_name} />
                            <InvoiceField label={t('common.status')} value={viewInvoice.status} capitalize />
                            <InvoiceField label={t('finance.issued')} value={new Date(viewInvoice.issued_at).toLocaleDateString()} />
                            <InvoiceField label={t('finance.due')} value={new Date(viewInvoice.due_at).toLocaleDateString()} />
                            <InvoiceField label={t('finance.paidAt')} value={viewInvoice.paid_at ? new Date(viewInvoice.paid_at).toLocaleDateString() : '—'} />
                            <InvoiceField label={t('finance.subscription')} value={viewInvoice.subscription_id} />
                        </div>
                        <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-secondary)' }}>
                                        <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{t('finance.description')}</th>
                                        <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{t('common.amount')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderTop: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '10px 12px' }}>{t('finance.subscription')} ({viewInvoice.subscription_id})</td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>EGP {viewInvoice.amount.toLocaleString()}</td>
                                    </tr>
                                    <tr style={{ borderTop: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{t('finance.tax')} (14% {t('subscriptions.vat')})</td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>EGP {viewInvoice.tax.toLocaleString()}</td>
                                    </tr>
                                    <tr style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                                        <td style={{ padding: '10px 12px', fontWeight: 700 }}>{t('common.total')}</td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>EGP {viewInvoice.total.toLocaleString()} {viewInvoice.currency}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => handleDownload(viewInvoice)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--color-info)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                                <Download size={14} /> {t('finance.downloadPDF')}
                            </button>
                        </div>
                    </>
                )}
            </FormModal>
        </div>
    );
}

function InvoiceField({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
    return (
        <div style={{ padding: 10, background: 'var(--bg-tertiary)', borderRadius: 8 }}>
            <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 500, marginTop: 2, textTransform: capitalize ? 'capitalize' : 'none' }}>{value}</div>
        </div>
    );
}
