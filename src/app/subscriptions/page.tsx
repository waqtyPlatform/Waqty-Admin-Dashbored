'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { ConfirmModal, FormModal, FormField } from '@/components/admin/FormModal';
import { useToast } from '@/components/ui';
import { mockSubscriptions } from '@/mocks/subscriptions';
import type { ProviderSubscriptionRow, InvoiceRow } from '@/types/subscription';
import { formatMoney, toMinor, toMajor, activeMarket } from '@/lib/market';
import { RefreshCw, ArrowUpCircle, XCircle, Percent, Clock, Receipt, Undo2, Plus, Trash2 } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';

const VAT_RATE = activeMarket.vat_rate;

interface LineItem { id: string; description: string; quantity: number; unit_price: number; }

const emptyLineItem = (): LineItem => ({ id: Math.random().toString(36).slice(2, 9), description: '', quantity: 1, unit_price: 0 });

export default function SubscriptionsPage() {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const [subs, setSubs] = useState(mockSubscriptions);
    const [statusFilter, setStatusFilter] = useState('all');
    const [confirmCancel, setConfirmCancel] = useState<ProviderSubscriptionRow | null>(null);
    const [discountModal, setDiscountModal] = useState<ProviderSubscriptionRow | null>(null);
    const [discountValue, setDiscountValue] = useState('');

    const [extendTrialSub, setExtendTrialSub] = useState<ProviderSubscriptionRow | null>(null);
    const [extendDays, setExtendDays] = useState('7');
    const [extendReason, setExtendReason] = useState('customer_request');

    const [invoiceSub, setInvoiceSub] = useState<ProviderSubscriptionRow | null>(null);
    const [lineItems, setLineItems] = useState<LineItem[]>([emptyLineItem()]);
    const [generatedInvoices, setGeneratedInvoices] = useState<InvoiceRow[]>([]);

    const [refundSub, setRefundSub] = useState<ProviderSubscriptionRow | null>(null);
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

    const handleRenew = (uuid: string) => {
        setSubs(prev => prev.map(s => s.uuid === uuid ? { ...s, status: 'active' as const, current_period_start: new Date().toISOString(), current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(), auto_renew: true } : s));
        addToast('success', 'Subscription renewed');
    };

    const handleCancel = () => {
        if (confirmCancel) {
            setSubs(prev => prev.map(s => s.uuid === confirmCancel.uuid ? { ...s, status: 'cancelled' as const, auto_renew: false } : s));
            addToast('warning', `Subscription cancelled for ${confirmCancel.provider_name}`);
            setConfirmCancel(null);
        }
    };

    const handleUpgrade = (uuid: string) => {
        setSubs(prev => prev.map(s => s.uuid === uuid ? { ...s, plan_name: 'Pro', plan_tier: 'pro' as const, status: 'active' as const, amount: toMinor(599) } : s));
        addToast('success', 'Upgraded to Pro');
    };

    const handleDiscount = () => {
        if (discountModal && discountValue) {
            const pct = Number(discountValue) / 100;
            setSubs(prev => prev.map(s => s.uuid === discountModal.uuid ? { ...s, amount: Math.round(s.amount * (1 - pct)) } : s));
            addToast('success', `${discountValue}% discount applied`);
            setDiscountModal(null);
            setDiscountValue('');
        }
    };

    const openExtendTrial = (sub: ProviderSubscriptionRow) => {
        setExtendTrialSub(sub);
        setExtendDays('7');
        setExtendReason('customer_request');
    };

    const handleExtendTrial = () => {
        if (!extendTrialSub) return;
        const days = Math.min(90, Math.max(1, Number(extendDays) || 0));
        const base = extendTrialSub.trial_end ? new Date(extendTrialSub.trial_end) : new Date();
        const newEnd = new Date(base.getTime() + days * 86400000).toISOString();
        setSubs(prev => prev.map(s => s.uuid === extendTrialSub.uuid ? { ...s, trial_end: newEnd, updated_at: new Date().toISOString() } : s));
        addToast('success', `Trial extended by ${days} days`);
        setExtendTrialSub(null);
    };

    const openGenerateInvoice = (sub: ProviderSubscriptionRow) => {
        setInvoiceSub(sub);
        setLineItems([{ id: emptyLineItem().id, description: `${sub.plan_name} — ${sub.billing_cycle}`, quantity: 1, unit_price: toMajor(sub.amount) }]);
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
        const invoice: InvoiceRow = {
            uuid: `INV-${Date.now()}`,
            provider_uuid: invoiceSub.provider_uuid,
            provider_name: invoiceSub.provider_name,
            subscription_uuid: invoiceSub.uuid,
            amount: toMinor(invoiceSubtotal),
            tax: toMinor(invoiceTax),
            total: toMinor(invoiceTotal),
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

    const openRefund = (sub: ProviderSubscriptionRow) => {
        setRefundSub(sub);
        setRefundType('partial');
        setRefundAmount('');
        setRefundReason('');
        setRefundDest('original');
    };

    const handleRefund = () => {
        if (!refundSub) return;
        // Form input is in MAJOR units; refundSub.amount is canonical MINOR units.
        const lastChargeMajor = toMajor(refundSub.amount);
        const amountMajor = refundType === 'full' ? lastChargeMajor : Number(refundAmount);
        if (!amountMajor || amountMajor <= 0 || amountMajor > lastChargeMajor) {
            addToast('error', `Amount must be between 1 and ${lastChargeMajor}`);
            return;
        }
        if (!refundReason.trim()) {
            addToast('error', 'Reason is required');
            return;
        }
        addToast('success', `Refund of ${formatMoney(toMinor(amountMajor))} processed`);
        setRefundSub(null);
    };

    const columns: Column<ProviderSubscriptionRow>[] = [
        { key: 'provider_name', label: t('subscriptions.provider'), sortable: true, render: (row) => <span style={{ fontWeight: 500 }}>{row.provider_name}</span> },
        { key: 'plan_name', label: t('subscriptions.plan'), sortable: true, render: (row) => <span style={{ padding: '2px 8px', borderRadius: 4, background: row.plan_tier === 'enterprise' ? 'var(--color-primary-50)' : row.plan_tier === 'pro' ? 'var(--color-info-light)' : 'var(--bg-tertiary)', fontSize: '0.75rem', fontWeight: 500 }}>{row.plan_name}</span> },
        { key: 'billing_cycle', label: t('subscriptions.cycle'), sortable: true, render: (row) => <span style={{ textTransform: 'capitalize' }}>{row.billing_cycle}</span> },
        { key: 'status', label: t('common.status'), sortable: true, render: (row) => <StatusBadge status={row.status} /> },
        { key: 'amount', label: t('common.amount'), sortable: true, render: (row) => formatMoney(row.amount) },
        { key: 'current_period_end', label: t('subscriptions.renews'), sortable: true, render: (row) => new Date(row.current_period_end).toLocaleDateString() },
        { key: 'auto_renew', label: t('subscriptions.autoRenew'), render: (row) => row.auto_renew ? t('common.yes') : t('common.no') },
        {
            key: 'actions', label: '', width: '320px',
            render: (row) => (
                <PermissionGate module="subscriptions" action="edit">
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(row.status === 'active' || row.status === 'past_due') && <ActionBtn icon={<RefreshCw size={13} />} label={t('subscriptions.renew')} onClick={() => handleRenew(row.uuid)} color={row.status === 'past_due' ? 'var(--color-warning)' : undefined} />}
                        {row.status === 'trial' && <ActionBtn icon={<ArrowUpCircle size={13} />} label={t('subscriptions.upgrade')} onClick={() => handleUpgrade(row.uuid)} />}
                        {row.status === 'trial' && <ActionBtn icon={<Clock size={13} />} label={t('subscriptions.extendTrial')} onClick={() => openExtendTrial(row)} />}
                        {(row.status === 'active' || row.status === 'past_due') && <ActionBtn icon={<Receipt size={13} />} label={t('subscriptions.invoice')} onClick={() => openGenerateInvoice(row)} />}
                        <ActionBtn icon={<Undo2 size={13} />} label={t('subscriptions.refund')} onClick={() => openRefund(row)} color="var(--color-warning)" />
                        {row.status !== 'cancelled' && <ActionBtn icon={<XCircle size={13} />} label={t('common.cancel')} onClick={() => setConfirmCancel(row)} color="var(--color-error)" />}
                        <ActionBtn icon={<Percent size={13} />} label={t('subscriptions.discount')} onClick={() => { setDiscountModal(row); setDiscountValue(''); }} />
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
                    { label: t('subscriptions.active'), value: summary.active, color: 'var(--color-success)' },
                    { label: t('subscriptions.trial'), value: summary.trial, color: 'var(--color-info)' },
                    { label: t('subscriptions.pastDue'), value: summary.past_due, color: 'var(--color-warning)' },
                    { label: t('subscriptions.cancelled'), value: summary.cancelled, color: 'var(--color-error)' },
                    { label: t('subscriptions.mrr'), value: formatMoney(Math.round(summary.mrr)), color: 'var(--color-primary-500)' },
                ].map(s => (
                    <div key={s.label} className={shared.summaryCard} style={{ borderTop: `3px solid ${s.color}` }}>
                        <div className={shared.summaryLabel}>{s.label}</div>
                        <div className={shared.summaryValue}>{s.value}</div>
                    </div>
                ))}
            </div>

            <DataTable<ProviderSubscriptionRow> columns={columns} data={filtered} searchKeys={['provider_name', 'plan_name']} searchPlaceholder={t('subscriptions.searchPlaceholder')} getRowKey={row => row.uuid}
                filters={<select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={shared.filterSelect}><option value="all">{t('finance.allStatus')}</option><option value="active">{t('subscriptions.active')}</option><option value="trial">{t('subscriptions.trial')}</option><option value="past_due">{t('subscriptions.pastDue')}</option><option value="cancelled">{t('subscriptions.cancelled')}</option></select>}
            />

            <ConfirmModal open={!!confirmCancel} onClose={() => setConfirmCancel(null)} onConfirm={handleCancel} title={t('providers.cancelSubscription')} message={`Are you sure you want to cancel the subscription for "${confirmCancel?.provider_name}"? They will lose access at the end of the current billing period.`} confirmLabel={t('providers.cancelSubscription')} variant="danger" />

            <FormModal open={!!discountModal} onClose={() => setDiscountModal(null)} title={`${t('subscriptions.applyDiscount')} — ${discountModal?.provider_name}`} submitLabel={t('subscriptions.applyDiscount')} onSubmit={e => { e.preventDefault(); handleDiscount(); }}>
                {discountModal && <>
                    <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: '0.875rem' }}><strong>{t('subscriptions.currentAmount')}:</strong> {formatMoney(discountModal.amount)} / {discountModal.billing_cycle}</div>
                    <FormField label={t('subscriptions.discountPercentage')} required>
                        <input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} required min={1} max={100} className={shared.formInput} placeholder="e.g. 20" />
                    </FormField>
                    {discountValue && <div style={{ padding: 8, background: 'var(--color-success-light)', borderRadius: 6, fontSize: '0.8125rem', color: '#065f46' }}>{t('subscriptions.newAmount')}: <strong>{formatMoney(Math.round(discountModal.amount * (1 - Number(discountValue) / 100)))}</strong> ({discountValue}% {t('subscriptions.off')})</div>}
                </>}
            </FormModal>

            <FormModal open={!!extendTrialSub} onClose={() => setExtendTrialSub(null)} title={`${t('subscriptions.extendTrial')} — ${extendTrialSub?.provider_name}`} submitLabel={t('subscriptions.extendTrial')} onSubmit={e => { e.preventDefault(); handleExtendTrial(); }}>
                {extendTrialSub && <>
                    <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: '0.875rem' }}>
                        <strong>{t('subscriptions.currentTrialEnds')}:</strong> {extendTrialSub.trial_end ? new Date(extendTrialSub.trial_end).toLocaleDateString() : '—'}
                    </div>
                    <FormField label={t('subscriptions.additionalDays')} required>
                        <input type="number" value={extendDays} onChange={e => setExtendDays(e.target.value)} required min={1} max={90} className={shared.formInput} />
                    </FormField>
                    <FormField label={t('common.reason')} required>
                        <select value={extendReason} onChange={e => setExtendReason(e.target.value)} className={shared.formInput}>
                            <option value="customer_request">{t('subscriptions.customerRequest')}</option>
                            <option value="onboarding_delay">{t('subscriptions.onboardingDelay')}</option>
                            <option value="technical_issue">{t('subscriptions.technicalIssue')}</option>
                            <option value="goodwill">{t('subscriptions.goodwill')}</option>
                            <option value="sales_hold">{t('subscriptions.salesHold')}</option>
                        </select>
                    </FormField>
                </>}
            </FormModal>

            <FormModal open={!!invoiceSub} onClose={() => setInvoiceSub(null)} title={`${t('subscriptions.generateInvoice')} — ${invoiceSub?.provider_name}`} submitLabel={t('subscriptions.generateInvoice')} onSubmit={e => { e.preventDefault(); handleGenerateInvoice(); }} width="lg">
                {invoiceSub && <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px 36px', gap: 8, fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', padding: '4px 0' }}>
                            <div>{t('subscriptions.description')}</div>
                            <div>{t('subscriptions.qty')}</div>
                            <div>{t('subscriptions.unitPrice')}</div>
                            <div></div>
                        </div>
                        {lineItems.map(line => (
                            <div key={line.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px 36px', gap: 8 }}>
                                <input value={line.description} onChange={e => updateLineItem(line.id, { description: e.target.value })} placeholder={t('subscriptions.description')} className={shared.formInput} />
                                <input type="number" min={1} value={line.quantity} onChange={e => updateLineItem(line.id, { quantity: Math.max(1, Number(e.target.value) || 0) })} className={shared.formInput} />
                                <input type="number" min={0} step="0.01" value={line.unit_price} onChange={e => updateLineItem(line.id, { unit_price: Math.max(0, Number(e.target.value) || 0) })} className={shared.formInput} />
                                <button type="button" onClick={() => setLineItems(prev => prev.filter(l => l.id !== line.id))} disabled={lineItems.length === 1} style={{ padding: '0 8px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: 'var(--color-error)', cursor: lineItems.length === 1 ? 'not-allowed' : 'pointer', opacity: lineItems.length === 1 ? 0.4 : 1 }} aria-label="Remove line"><Trash2 size={14} /></button>
                            </div>
                        ))}
                        <button type="button" onClick={() => setLineItems(prev => [...prev, emptyLineItem()])} style={{ alignSelf: 'flex-start', padding: '6px 10px', border: '1px dashed var(--border-color)', borderRadius: 6, background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Plus size={14} /> {t('subscriptions.addLineItem')}
                        </button>
                        <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 8, paddingTop: 8, display: 'grid', gap: 4, fontSize: '0.875rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('subscriptions.subtotal')}</span><strong>EGP {invoiceSubtotal.toLocaleString()}</strong></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('subscriptions.vat')} ({Math.round(VAT_RATE * 100)}%)</span><strong>EGP {invoiceTax.toLocaleString()}</strong></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}><span>{t('common.total')}</span><strong>EGP {invoiceTotal.toLocaleString()}</strong></div>
                        </div>
                        {generatedInvoices.length > 0 && (
                            <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{generatedInvoices.length} invoice(s) generated this session</div>
                        )}
                    </div>
                </>}
            </FormModal>

            <FormModal open={!!refundSub} onClose={() => setRefundSub(null)} title={`${t('subscriptions.refund')} — ${refundSub?.provider_name}`} submitLabel={t('subscriptions.processRefund')} submitVariant="danger" onSubmit={e => { e.preventDefault(); handleRefund(); }}>
                {refundSub && <>
                    <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: '0.875rem' }}>
                        <strong>{t('subscriptions.lastCharge')}:</strong> {formatMoney(refundSub.amount)} ({refundSub.billing_cycle})
                    </div>
                    <FormField label={t('subscriptions.refundType')} required>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <input type="radio" checked={refundType === 'partial'} onChange={() => setRefundType('partial')} /> {t('subscriptions.partial')}
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <input type="radio" checked={refundType === 'full'} onChange={() => setRefundType('full')} /> {t('subscriptions.full')} ({formatMoney(refundSub.amount)})
                            </label>
                        </div>
                    </FormField>
                    {refundType === 'partial' && (
                        <FormField label={t('subscriptions.refundAmount')} required>
                            <input type="number" min={1} max={toMajor(refundSub.amount)} value={refundAmount} onChange={e => setRefundAmount(e.target.value)} required className={shared.formInput} placeholder={`Max ${toMajor(refundSub.amount)}`} />
                        </FormField>
                    )}
                    <FormField label={t('subscriptions.refundDestination')} required>
                        <select value={refundDest} onChange={e => setRefundDest(e.target.value as 'wallet' | 'original')} className={shared.formInput}>
                            <option value="original">{t('subscriptions.originalPaymentMethod')}</option>
                            <option value="wallet">{t('subscriptions.walletCredit')}</option>
                        </select>
                    </FormField>
                    <FormField label={t('common.reason')} required>
                        <textarea value={refundReason} onChange={e => setRefundReason(e.target.value)} required rows={3} className={shared.formInput} style={{ resize: 'vertical' }} placeholder={t('subscriptions.refundReasonPlaceholder')} />
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
