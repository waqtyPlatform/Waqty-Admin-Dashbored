'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { ConfirmModal } from '@/components/admin/FormModal';
import { useToast } from '@/components/ui';
import { mockSubscriptions, mockPlans, mockCommissionPlans } from '@/mocks/subscriptions';
import type { ProviderSubscriptionRow, InvoiceRow, SubscriptionBillingType } from '@/types/subscription';
import { formatMoney, toMinor, toMajor } from '@/lib/market';
import { RefreshCw, ArrowUpCircle, XCircle, Percent, Clock, Receipt, Undo2, Repeat } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';
import { DiscountModal } from './_components/DiscountModal';
import { ExtendTrialModal } from './_components/ExtendTrialModal';
import { InvoiceModal } from './_components/InvoiceModal';
import { RefundModal } from './_components/RefundModal';
import { BillingTypeModal } from './_components/BillingTypeModal';

const pctLabel = (rate: number) => `${(rate * 100) % 1 === 0 ? (rate * 100).toFixed(0) : (rate * 100).toFixed(1)}%`;

export default function SubscriptionsPage() {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const [subs, setSubs] = useState(mockSubscriptions);
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState<'all' | SubscriptionBillingType>('all');

    // Which modal is open (the modal components own their own input state).
    const [confirmCancel, setConfirmCancel] = useState<ProviderSubscriptionRow | null>(null);
    const [discountSub, setDiscountSub] = useState<ProviderSubscriptionRow | null>(null);
    const [extendTrialSub, setExtendTrialSub] = useState<ProviderSubscriptionRow | null>(null);
    const [invoiceSub, setInvoiceSub] = useState<ProviderSubscriptionRow | null>(null);
    const [refundSub, setRefundSub] = useState<ProviderSubscriptionRow | null>(null);
    const [billingTypeSub, setBillingTypeSub] = useState<ProviderSubscriptionRow | null>(null);
    const [generatedInvoices, setGeneratedInvoices] = useState<InvoiceRow[]>([]);

    const filtered = subs.filter(s =>
        (statusFilter === 'all' || s.status === statusFilter) &&
        (typeFilter === 'all' || s.billing_type === typeFilter)
    );

    const summary = {
        active: subs.filter(s => s.status === 'active').length,
        trial: subs.filter(s => s.status === 'trial').length,
        past_due: subs.filter(s => s.status === 'past_due').length,
        commission: subs.filter(s => s.billing_type === 'commission').length,
        // MRR only includes flat subscription plans — commission accounts have no fixed fee.
        mrr: subs.filter(s => s.status === 'active' && s.billing_type === 'subscription')
            .reduce((sum, s) => sum + (s.billing_cycle === 'monthly' ? s.amount : s.amount / 12), 0),
    };

    // ── Data-mutation handlers (kept in the orchestrator) ──
    const handleRenew = (uuid: string) => {
        setSubs(prev => prev.map(s => s.uuid === uuid ? { ...s, status: 'active' as const, current_period_start: new Date().toISOString(), current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(), auto_renew: true } : s));
        addToast('success', t('subscriptions.toastRenewed'));
    };

    const handleCancel = () => {
        if (!confirmCancel) return;
        setSubs(prev => prev.map(s => s.uuid === confirmCancel.uuid ? { ...s, status: 'cancelled' as const, auto_renew: false } : s));
        addToast('warning', t('subscriptions.toastCancelled').replace('{name}', confirmCancel.provider_name));
        setConfirmCancel(null);
    };

    const handleUpgrade = (uuid: string) => {
        setSubs(prev => prev.map(s => s.uuid === uuid ? { ...s, plan_name: 'Pro', plan_tier: 'pro' as const, status: 'active' as const, amount: toMinor(599) } : s));
        addToast('success', t('subscriptions.toastUpgraded'));
    };

    const applyDiscount = (pct: number) => {
        if (!discountSub) return;
        setSubs(prev => prev.map(s => s.uuid === discountSub.uuid ? { ...s, amount: Math.round(s.amount * (1 - pct / 100)) } : s));
        addToast('success', t('subscriptions.toastDiscountApplied').replace('{pct}', String(pct)));
        setDiscountSub(null);
    };

    const applyExtendTrial = (days: number) => {
        if (!extendTrialSub) return;
        const d = Math.min(90, Math.max(1, days));
        const base = extendTrialSub.trial_end ? new Date(extendTrialSub.trial_end) : new Date();
        const newEnd = new Date(base.getTime() + d * 86400000).toISOString();
        setSubs(prev => prev.map(s => s.uuid === extendTrialSub.uuid ? { ...s, trial_end: newEnd, updated_at: new Date().toISOString() } : s));
        addToast('success', t('subscriptions.toastTrialExtended').replace('{days}', String(d)));
        setExtendTrialSub(null);
    };

    const generateInvoice = (subtotal: number, tax: number, total: number) => {
        if (!invoiceSub) return;
        const now = new Date();
        const invoice: InvoiceRow = {
            uuid: `INV-${Date.now()}`,
            provider_uuid: invoiceSub.provider_uuid,
            provider_name: invoiceSub.provider_name,
            subscription_uuid: invoiceSub.uuid,
            amount: toMinor(subtotal),
            tax: toMinor(tax),
            total: toMinor(total),
            currency: invoiceSub.currency,
            status: 'pending',
            issued_at: now.toISOString(),
            due_at: new Date(now.getTime() + 14 * 86400000).toISOString(),
            paid_at: null,
            pdf_url: null,
        };
        setGeneratedInvoices(prev => [invoice, ...prev]);
        addToast('success', t('subscriptions.toastInvoiceGenerated').replace('{amount}', total.toLocaleString()));
        setInvoiceSub(null);
    };

    const processRefund = (amountMajor: number, reason: string) => {
        if (!refundSub) return;
        const lastChargeMajor = toMajor(refundSub.amount);
        if (!amountMajor || amountMajor <= 0 || amountMajor > lastChargeMajor) {
            addToast('error', t('subscriptions.toastAmountRange').replace('{max}', String(lastChargeMajor)));
            return;
        }
        if (!reason.trim()) {
            addToast('error', t('subscriptions.toastReasonRequired'));
            return;
        }
        addToast('success', t('subscriptions.toastRefundProcessed').replace('{amount}', formatMoney(toMinor(amountMajor))));
        setRefundSub(null);
    };

    // Switch a provider between flat-subscription and commission billing.
    const changeBillingType = (billingType: SubscriptionBillingType, commissionPct: number, planId: string) => {
        if (!billingTypeSub) return;
        setSubs(prev => prev.map(s => {
            if (s.uuid !== billingTypeSub.uuid) return s;
            if (billingType === 'commission') {
                // planId is the chosen commission plan; store its uuid in plan_uuid and its name for display.
                const commPlan = mockCommissionPlans.find(p => p.uuid === planId);
                return { ...s, billing_type: 'commission', commission_rate: commissionPct / 100, plan_uuid: planId, plan_name: commPlan?.name ?? 'Commission', amount: 0, updated_at: new Date().toISOString() };
            }
            const plan = mockPlans.find(p => p.uuid === planId);
            return {
                ...s,
                billing_type: 'subscription',
                commission_rate: 0,
                plan_uuid: planId,
                plan_name: plan?.name ?? s.plan_name,
                plan_tier: plan?.tier ?? s.plan_tier,
                amount: plan ? (s.billing_cycle === 'yearly' ? plan.price_yearly : plan.price_monthly) : s.amount,
                updated_at: new Date().toISOString(),
            };
        }));
        addToast('success', billingType === 'commission'
            ? t('subscriptions.toastSwitchedCommission').replace('{rate}', String(commissionPct))
            : t('subscriptions.toastSwitchedSubscription'));
        setBillingTypeSub(null);
    };

    const columns: Column<ProviderSubscriptionRow>[] = [
        { key: 'provider_name', label: t('subscriptions.provider'), sortable: true, render: (row) => <span style={{ fontWeight: 500 }}>{row.provider_name}</span> },
        {
            key: 'plan_name', label: t('subscriptions.plan'), sortable: true,
            render: (row) => row.billing_type === 'commission'
                ? <span style={{ padding: '2px 8px', borderRadius: 4, background: 'var(--color-primary-50)', color: 'var(--color-primary-700)', fontSize: '0.75rem', fontWeight: 500 }}>{row.plan_name}</span>
                : <span style={{ padding: '2px 8px', borderRadius: 4, background: row.plan_tier === 'enterprise' ? 'var(--color-primary-50)' : row.plan_tier === 'pro' ? 'var(--color-info-light)' : 'var(--bg-tertiary)', fontSize: '0.75rem', fontWeight: 500 }}>{row.plan_name}</span>,
        },
        {
            key: 'billing_type', label: t('subscriptions.billing'), sortable: true,
            render: (row) => row.billing_type === 'commission'
                ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary-50)', color: 'var(--color-primary-700)', fontSize: '0.75rem', fontWeight: 600 }}><Percent size={11} /> {t('subscriptions.typeCommission')}</span>
                : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 500 }}>{t('subscriptions.typeSubscription')}</span>,
        },
        { key: 'status', label: t('common.status'), sortable: true, render: (row) => <StatusBadge status={row.status} /> },
        {
            key: 'amount', label: t('subscriptions.feeRate'), sortable: true,
            render: (row) => row.billing_type === 'commission'
                ? <strong>{pctLabel(row.commission_rate)} <span style={{ fontWeight: 400, color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{t('subscriptions.ofRevenue')}</span></strong>
                : formatMoney(row.amount),
        },
        { key: 'current_period_end', label: t('subscriptions.renews'), sortable: true, render: (row) => new Date(row.current_period_end).toLocaleDateString() },
        {
            key: 'actions', label: '', width: '360px',
            render: (row) => (
                <PermissionGate module="subscriptions" action="edit">
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        <ActionBtn icon={<Repeat size={13} />} label={t('subscriptions.billingType')} onClick={() => setBillingTypeSub(row)} color="var(--color-info)" />
                        {row.billing_type === 'subscription' && (row.status === 'active' || row.status === 'past_due') && <ActionBtn icon={<RefreshCw size={13} />} label={t('subscriptions.renew')} onClick={() => handleRenew(row.uuid)} color={row.status === 'past_due' ? 'var(--color-warning)' : undefined} />}
                        {row.billing_type === 'subscription' && row.status === 'trial' && <ActionBtn icon={<ArrowUpCircle size={13} />} label={t('subscriptions.upgrade')} onClick={() => handleUpgrade(row.uuid)} />}
                        {row.billing_type === 'subscription' && row.status === 'trial' && <ActionBtn icon={<Clock size={13} />} label={t('subscriptions.extendTrial')} onClick={() => setExtendTrialSub(row)} />}
                        {row.billing_type === 'subscription' && (row.status === 'active' || row.status === 'past_due') && <ActionBtn icon={<Receipt size={13} />} label={t('subscriptions.invoice')} onClick={() => setInvoiceSub(row)} />}
                        {row.billing_type === 'subscription' && <ActionBtn icon={<Percent size={13} />} label={t('subscriptions.discount')} onClick={() => setDiscountSub(row)} />}
                        {row.billing_type === 'subscription' && <ActionBtn icon={<Undo2 size={13} />} label={t('subscriptions.refund')} onClick={() => setRefundSub(row)} color="var(--color-warning)" />}
                        {row.status !== 'cancelled' && <ActionBtn icon={<XCircle size={13} />} label={t('common.cancel')} onClick={() => setConfirmCancel(row)} color="var(--color-error)" />}
                    </div>
                </PermissionGate>
            ),
        },
    ];

    return (
        <div className={shared.page}>
            <h1 className={shared.pageTitle}>{t('subscriptions.title')}</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
                {[
                    { label: t('subscriptions.active'), value: summary.active, color: 'var(--color-success)' },
                    { label: t('subscriptions.trial'), value: summary.trial, color: 'var(--color-info)' },
                    { label: t('subscriptions.pastDue'), value: summary.past_due, color: 'var(--color-warning)' },
                    { label: t('subscriptions.commissionAccounts'), value: summary.commission, color: 'var(--color-primary-600)' },
                    { label: t('subscriptions.mrr'), value: formatMoney(Math.round(summary.mrr)), color: 'var(--color-primary-500)' },
                ].map(s => (
                    <div key={s.label} className={shared.summaryCard} style={{ borderTop: `3px solid ${s.color}` }}>
                        <div className={shared.summaryLabel}>{s.label}</div>
                        <div className={shared.summaryValue}>{s.value}</div>
                    </div>
                ))}
            </div>

            <DataTable<ProviderSubscriptionRow> columns={columns} data={filtered} searchKeys={['provider_name', 'plan_name']} searchPlaceholder={t('subscriptions.searchPlaceholder')} getRowKey={row => row.uuid}
                filters={
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as 'all' | SubscriptionBillingType)} className={shared.filterSelect}>
                            <option value="all">{t('subscriptions.allTypes')}</option>
                            <option value="subscription">{t('subscriptions.typeSubscription')}</option>
                            <option value="commission">{t('subscriptions.typeCommission')}</option>
                        </select>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={shared.filterSelect}>
                            <option value="all">{t('finance.allStatus')}</option>
                            <option value="active">{t('subscriptions.active')}</option>
                            <option value="trial">{t('subscriptions.trial')}</option>
                            <option value="past_due">{t('subscriptions.pastDue')}</option>
                            <option value="cancelled">{t('subscriptions.cancelled')}</option>
                        </select>
                    </div>
                }
            />

            <ConfirmModal open={!!confirmCancel} onClose={() => setConfirmCancel(null)} onConfirm={handleCancel} title={t('providers.cancelSubscription')} message={t('subscriptions.cancelConfirmMessage').replace('{name}', confirmCancel?.provider_name ?? '')} confirmLabel={t('providers.cancelSubscription')} variant="danger" />

            <DiscountModal sub={discountSub} onClose={() => setDiscountSub(null)} onApply={applyDiscount} />
            <ExtendTrialModal sub={extendTrialSub} onClose={() => setExtendTrialSub(null)} onExtend={applyExtendTrial} />
            <InvoiceModal sub={invoiceSub} generatedCount={generatedInvoices.length} onClose={() => setInvoiceSub(null)} onGenerate={generateInvoice} />
            <RefundModal sub={refundSub} onClose={() => setRefundSub(null)} onRefund={processRefund} />
            <BillingTypeModal sub={billingTypeSub} plans={mockPlans} commissionPlans={mockCommissionPlans} onClose={() => setBillingTypeSub(null)} onSave={changeBillingType} />
        </div>
    );
}

function ActionBtn({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color?: string; onClick: () => void }) {
    return (
        <button title={label} aria-label={label} onClick={e => { e.stopPropagation(); onClick(); }} style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: color || 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontFamily: 'var(--font-sans)' }}>
            {icon} {label}
        </button>
    );
}
