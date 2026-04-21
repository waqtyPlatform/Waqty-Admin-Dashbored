'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { ConfirmModal, FormModal, FormField } from '@/components/admin/FormModal';
import { useToast } from '@/components/ui';
import { mockSubscriptions } from '@/mocks/subscriptions';
import type { ProviderSubscription, Invoice } from '@/types/subscription';
import { RefreshCw, ArrowUpCircle, XCircle, Percent, Clock, Receipt, Undo2, Plus, Trash2 } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';

const VAT_RATE = 0.14;

interface LineItem { id: string; description: string; quantity: number; unit_price: number; }

const emptyLineItem = (): LineItem => ({ id: Math.random().toString(36).slice(2, 9), description: '', quantity: 1, unit_price: 0 });

export default function SubscriptionsPage() {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const [subs, setSubs] = useState(mockSubscriptions);
    const [statusFilter, setStatusFilter] = useState('all');
    const [confirmCancel, setConfirmCancel] = useState<ProviderSubscription | null>(null);
    const [discountModal, setDiscountModal] = useState<ProviderSubscription | null>(null);
    const [discountValue, setDiscountValue] = useState('');

    const [extendTrialSub, setExtendTrialSub] = useState<ProviderSubscription | null>(null);
    const [extendDays, setExtendDays] = useState('7');
    const [extendReason, setExtendReason] = useState('customer_request');

    const [invoiceSub, setInvoiceSub] = useState<ProviderSubscription | null>(null);
    const [lineItems, setLineItems] = useState<LineItem[]>([emptyLineItem()]);
    const [generatedInvoices, setGeneratedInvoices] = useState<Invoice[]>([]);

    const [refundSub, setRefundSub] = useState<ProviderSubscription | null>(null);
    const [refundType, setRefundType] = useState<'full' | 'partial'>('partial');
    const [refundAmount, setRefundAmount] = useState('');
    const [refundReason, setRefundReason] = useState('');
    const [refundDest, setRefundDest] = useState<'wallet' | 'original'>('original');

    const filtered = subs.filter(s => statusFilter === 'all' || s.status === statusFilter);

    const summary = {
        active: subs.filter(s => s.status === 'active').length,
        trial: subs.filter(s => s.status === 'trial').length,
        past_due: subs.filter(s => s.status === 'past_due').length,
        cancelled: subs.filter(s => s.status === 'cancelled').length,
        mrr: subs.filter(s => s.status === 'active').reduce((sum, s) => sum + (s.billing_cycle === 'monthly' ? s.amount : s.amount / 12), 0),
    };

    const handleRenew = (id: string) => {
        setSubs(prev => prev.map(s => s.id === id ? { ...s, status: 'active' as const, current_period_start: new Date().toISOString(), current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(), auto_renew: true } : s));
        addToast('success', 'Subscription renewed');
    };

    const handleCancel = () => {
        if (confirmCancel) {
            setSubs(prev => prev.map(s => s.id === confirmCancel.id ? { ...s, status: 'cancelled' as const, auto_renew: false } : s));
            addToast('warning', `Subscription cancelled for ${confirmCancel.provider_name}`);
            setConfirmCancel(null);
        }
    };

    const handleUpgrade = (id: string) => {
        setSubs(prev => prev.map(s => s.id === id ? { ...s, plan_name: 'Pro', plan_tier: 'pro' as const, status: 'active' as const, amount: 599 } : s));
        addToast('success', 'Upgraded to Pro');
    };

    const handleDiscount = () => {
        if (discountModal && discountValue) {
            const pct = Number(discountValue) / 100;
            setSubs(prev => prev.map(s => s.id === discountModal.id ? { ...s, amount: Math.round(s.amount * (1 - pct)) } : s));
            addToast('success', `${discountValue}% discount applied`);
            setDiscountModal(null);
            setDiscountValue('');
        }
    };

    const openExtendTrial = (sub: ProviderSubscription) => {
        setExtendTrialSub(sub);
        setExtendDays('7');
        setExtendReason('customer_request');
    };

    const handleExtendTrial = () => {
        if (!extendTrialSub) return;
        const days = Math.min(90, Math.max(1, Number(extendDays) || 0));
        const base = extendTrialSub.trial_end ? new Date(extendTrialSub.trial_end) : new Date();
        const newEnd = new Date(base.getTime() + days * 86400000).toISOString();
        setSubs(prev => prev.map(s => s.id === extendTrialSub.id ? { ...s, trial_end: newEnd, updated_at: new Date().toISOString() } : s));
        addToast('success', `Trial extended by ${days} days`);
        setExtendTrialSub(null);
    };

    const openGenerateInvoice = (sub: ProviderSubscription) => {
        setInvoiceSub(sub);
        setLineItems([{ id: emptyLineItem().id, description: `${sub.plan_name} — ${sub.billing_cycle}`, quantity: 1, unit_price: sub.amount }]);
    };

    const invoiceSubtotal = lineItems.reduce((sum, l) => sum + l.quantity * l.unit_price, 0);
    const invoiceTax = Math.round(invoiceSubtotal * VAT_RATE * 100) / 100;
    const invoiceTotal = invoiceSubtotal + invoiceTax;

    const updateLineItem = (id: string, patch: Partial<LineItem>) => {
        setLineItems(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));
    };

    const handleGenerateInvoice = () => {
        if (!invoiceSub) return;
        if (lineItems.length === 0 || invoiceSubtotal <= 0) return;
        const now = new Date();
        const invoice: Invoice = {
            id: `INV-${Date.now()}`,
            provider_id: invoiceSub.provider_id,
            provider_name: invoiceSub.provider_name,
            subscription_id: invoiceSub.id,
            amount: invoiceSubtotal,
            tax: invoiceTax,
            total: invoiceTotal,
            currency: invoiceSub.currency,
            status: 'pending',
            issued_at: now.toISOString(),
            due_at: new Date(now.getTime() + 14 * 86400000).toISOString(),
            paid_at: null,
            pdf_url: null,
        };
        setGeneratedInvoices(prev => [invoice, ...prev]);
        addToast('success', `Invoice generated — EGP ${invoiceTotal.toLocaleString()}`);
        setInvoiceSub(null);
        setLineItems([emptyLineItem()]);
    };

    const openRefund = (sub: ProviderSubscription) => {
        setRefundSub(sub);
        setRefundType('partial');
        setRefundAmount('');
        setRefundReason('');
        setRefundDest('original');
    };

    const handleRefund = () => {
        if (!refundSub) return;
        const amount = refundType === 'full' ? refundSub.amount : Number(refundAmount);
        if (!amount || amount <= 0 || amount > refundSub.amount) {
            addToast('error', `Amount must be between 1 and ${refundSub.amount}`);
            return;
        }
        if (!refundReason.trim()) {
            addToast('error', 'Reason is required');
            return;
        }
        addToast('success', `Refund of EGP ${amount.toLocaleString()} processed`);
        setRefundSub(null);
    };

    const columns: Column<ProviderSubscription>[] = [
        { key: 'provider_name', label: 'Provider', sortable: true, render: (row) => <span style={{ fontWeight: 500 }}>{row.provider_name}</span> },
        { key: 'plan_name', label: 'Plan', sortable: true, render: (row) => <span style={{ padding: '2px 8px', borderRadius: 4, background: row.plan_tier === 'enterprise' ? 'var(--color-primary-50)' : row.plan_tier === 'pro' ? 'var(--color-info-light)' : 'var(--bg-tertiary)', fontSize: '0.75rem', fontWeight: 500 }}>{row.plan_name}</span> },
        { key: 'billing_cycle', label: 'Cycle', sortable: true, render: (row) => <span style={{ textTransform: 'capitalize' }}>{row.billing_cycle}</span> },
        { key: 'status', label: 'Status', sortable: true, render: (row) => <StatusBadge status={row.status} /> },
        { key: 'amount', label: 'Amount', sortable: true, render: (row) => `EGP ${row.amount.toLocaleString()}` },
        { key: 'current_period_end', label: 'Renews', sortable: true, render: (row) => new Date(row.current_period_end).toLocaleDateString() },
        { key: 'auto_renew', label: 'Auto-Renew', render: (row) => row.auto_renew ? 'Yes' : 'No' },
        {
            key: 'actions', label: '', width: '320px',
            render: (row) => (
                <PermissionGate module="subscriptions" action="edit">
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(row.status === 'active' || row.status === 'past_due') && <ActionBtn icon={<RefreshCw size={13} />} label="Renew" onClick={() => handleRenew(row.id)} color={row.status === 'past_due' ? 'var(--color-warning)' : undefined} />}
                        {row.status === 'trial' && <ActionBtn icon={<ArrowUpCircle size={13} />} label="Upgrade" onClick={() => handleUpgrade(row.id)} />}
                        {row.status === 'trial' && <ActionBtn icon={<Clock size={13} />} label="Extend Trial" onClick={() => openExtendTrial(row)} />}
                        {(row.status === 'active' || row.status === 'past_due') && <ActionBtn icon={<Receipt size={13} />} label="Invoice" onClick={() => openGenerateInvoice(row)} />}
                        <ActionBtn icon={<Undo2 size={13} />} label="Refund" onClick={() => openRefund(row)} color="var(--color-warning)" />
                        {row.status !== 'cancelled' && <ActionBtn icon={<XCircle size={13} />} label="Cancel" onClick={() => setConfirmCancel(row)} color="var(--color-error)" />}
                        <ActionBtn icon={<Percent size={13} />} label="Discount" onClick={() => { setDiscountModal(row); setDiscountValue(''); }} />
                    </div>
                </PermissionGate>
            ),
        },
    ];

    return (
        <div className={shared.page}>
            <h1 className={shared.pageTitle}>{t('subscriptions.title')}</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
                {[
                    { label: 'Active', value: summary.active, color: 'var(--color-success)' },
                    { label: 'Trial', value: summary.trial, color: 'var(--color-info)' },
                    { label: 'Past Due', value: summary.past_due, color: 'var(--color-warning)' },
                    { label: 'Cancelled', value: summary.cancelled, color: 'var(--color-error)' },
                    { label: 'MRR', value: `EGP ${Math.round(summary.mrr).toLocaleString()}`, color: 'var(--color-primary-500)' },
                ].map(s => (
                    <div key={s.label} className={shared.summaryCard} style={{ borderTop: `3px solid ${s.color}` }}>
                        <div className={shared.summaryLabel}>{s.label}</div>
                        <div className={shared.summaryValue}>{s.value}</div>
                    </div>
                ))}
            </div>

            <DataTable<ProviderSubscription> columns={columns} data={filtered} searchKeys={['provider_name', 'plan_name']} searchPlaceholder="Search subscriptions..." getRowKey={row => row.id}
                filters={<select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={shared.filterSelect}><option value="all">All Status</option><option value="active">Active</option><option value="trial">Trial</option><option value="past_due">Past Due</option><option value="cancelled">Cancelled</option></select>}
            />

            <ConfirmModal open={!!confirmCancel} onClose={() => setConfirmCancel(null)} onConfirm={handleCancel} title="Cancel Subscription" message={`Are you sure you want to cancel the subscription for "${confirmCancel?.provider_name}"? They will lose access at the end of the current billing period.`} confirmLabel="Cancel Subscription" variant="danger" />

            <FormModal open={!!discountModal} onClose={() => setDiscountModal(null)} title={`Apply Discount — ${discountModal?.provider_name}`} submitLabel="Apply Discount" onSubmit={e => { e.preventDefault(); handleDiscount(); }}>
                {discountModal && <>
                    <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: '0.875rem' }}><strong>Current Amount:</strong> EGP {discountModal.amount.toLocaleString()} / {discountModal.billing_cycle}</div>
                    <FormField label="Discount Percentage" required>
                        <input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} required min={1} max={100} className={shared.formInput} placeholder="e.g. 20" />
                    </FormField>
                    {discountValue && <div style={{ padding: 8, background: 'var(--color-success-light)', borderRadius: 6, fontSize: '0.8125rem', color: '#065f46' }}>New amount: <strong>EGP {Math.round(discountModal.amount * (1 - Number(discountValue) / 100)).toLocaleString()}</strong> ({discountValue}% off)</div>}
                </>}
            </FormModal>

            <FormModal open={!!extendTrialSub} onClose={() => setExtendTrialSub(null)} title={`Extend Trial — ${extendTrialSub?.provider_name}`} submitLabel="Extend Trial" onSubmit={e => { e.preventDefault(); handleExtendTrial(); }}>
                {extendTrialSub && <>
                    <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: '0.875rem' }}>
                        <strong>Current trial ends:</strong> {extendTrialSub.trial_end ? new Date(extendTrialSub.trial_end).toLocaleDateString() : '—'}
                    </div>
                    <FormField label="Additional days" required>
                        <input type="number" value={extendDays} onChange={e => setExtendDays(e.target.value)} required min={1} max={90} className={shared.formInput} />
                    </FormField>
                    <FormField label="Reason" required>
                        <select value={extendReason} onChange={e => setExtendReason(e.target.value)} className={shared.formInput}>
                            <option value="customer_request">Customer request</option>
                            <option value="onboarding_delay">Onboarding delay</option>
                            <option value="technical_issue">Technical issue</option>
                            <option value="goodwill">Goodwill gesture</option>
                            <option value="sales_hold">Sales team hold</option>
                        </select>
                    </FormField>
                </>}
            </FormModal>

            <FormModal open={!!invoiceSub} onClose={() => setInvoiceSub(null)} title={`Generate Invoice — ${invoiceSub?.provider_name}`} submitLabel="Generate Invoice" onSubmit={e => { e.preventDefault(); handleGenerateInvoice(); }} width="lg">
                {invoiceSub && <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px 36px', gap: 8, fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', padding: '4px 0' }}>
                            <div>Description</div>
                            <div>Qty</div>
                            <div>Unit price</div>
                            <div></div>
                        </div>
                        {lineItems.map(line => (
                            <div key={line.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px 36px', gap: 8 }}>
                                <input value={line.description} onChange={e => updateLineItem(line.id, { description: e.target.value })} placeholder="Description" className={shared.formInput} />
                                <input type="number" min={1} value={line.quantity} onChange={e => updateLineItem(line.id, { quantity: Math.max(1, Number(e.target.value) || 0) })} className={shared.formInput} />
                                <input type="number" min={0} step="0.01" value={line.unit_price} onChange={e => updateLineItem(line.id, { unit_price: Math.max(0, Number(e.target.value) || 0) })} className={shared.formInput} />
                                <button type="button" onClick={() => setLineItems(prev => prev.filter(l => l.id !== line.id))} disabled={lineItems.length === 1} style={{ padding: '0 8px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: 'var(--color-error)', cursor: lineItems.length === 1 ? 'not-allowed' : 'pointer', opacity: lineItems.length === 1 ? 0.4 : 1 }} aria-label="Remove line"><Trash2 size={14} /></button>
                            </div>
                        ))}
                        <button type="button" onClick={() => setLineItems(prev => [...prev, emptyLineItem()])} style={{ alignSelf: 'flex-start', padding: '6px 10px', border: '1px dashed var(--border-color)', borderRadius: 6, background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Plus size={14} /> Add line item
                        </button>
                        <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 8, paddingTop: 8, display: 'grid', gap: 4, fontSize: '0.875rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><strong>EGP {invoiceSubtotal.toLocaleString()}</strong></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>VAT ({Math.round(VAT_RATE * 100)}%)</span><strong>EGP {invoiceTax.toLocaleString()}</strong></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}><span>Total</span><strong>EGP {invoiceTotal.toLocaleString()}</strong></div>
                        </div>
                        {generatedInvoices.length > 0 && (
                            <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{generatedInvoices.length} invoice(s) generated this session</div>
                        )}
                    </div>
                </>}
            </FormModal>

            <FormModal open={!!refundSub} onClose={() => setRefundSub(null)} title={`Refund — ${refundSub?.provider_name}`} submitLabel="Process Refund" submitVariant="danger" onSubmit={e => { e.preventDefault(); handleRefund(); }}>
                {refundSub && <>
                    <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: '0.875rem' }}>
                        <strong>Last charge:</strong> EGP {refundSub.amount.toLocaleString()} ({refundSub.billing_cycle})
                    </div>
                    <FormField label="Refund type" required>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <input type="radio" checked={refundType === 'partial'} onChange={() => setRefundType('partial')} /> Partial
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <input type="radio" checked={refundType === 'full'} onChange={() => setRefundType('full')} /> Full ({refundSub.amount.toLocaleString()} EGP)
                            </label>
                        </div>
                    </FormField>
                    {refundType === 'partial' && (
                        <FormField label="Refund amount (EGP)" required>
                            <input type="number" min={1} max={refundSub.amount} value={refundAmount} onChange={e => setRefundAmount(e.target.value)} required className={shared.formInput} placeholder={`Max ${refundSub.amount}`} />
                        </FormField>
                    )}
                    <FormField label="Refund destination" required>
                        <select value={refundDest} onChange={e => setRefundDest(e.target.value as 'wallet' | 'original')} className={shared.formInput}>
                            <option value="original">Original payment method</option>
                            <option value="wallet">Provider wallet credit</option>
                        </select>
                    </FormField>
                    <FormField label="Reason" required>
                        <textarea value={refundReason} onChange={e => setRefundReason(e.target.value)} required rows={3} className={shared.formInput} style={{ resize: 'vertical' }} placeholder="Why is this refund being issued?" />
                    </FormField>
                </>}
            </FormModal>
        </div>
    );
}

function ActionBtn({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color?: string; onClick: () => void }) {
    return (
        <button title={label} onClick={e => { e.stopPropagation(); onClick(); }} style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: color || 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontFamily: 'var(--font-sans)' }}>
            {icon} {label}
        </button>
    );
}
