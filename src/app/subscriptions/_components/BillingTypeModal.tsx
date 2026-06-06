'use client';

import React, { useState, useEffect } from 'react';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { useTranslation } from '@/hooks/useTranslation';
import { formatMoney } from '@/lib/market';
import { Repeat, CreditCard, Percent } from 'lucide-react';
import type { ProviderSubscriptionRow, SubscriptionBillingType, SubscriptionPlanRow, CommissionPlanRow } from '@/types/subscription';
import type { BillingCycle } from '@/contract/waqty_contract';
import shared from '@/components/admin/shared.module.css';

interface BillingTypeModalProps {
    sub: ProviderSubscriptionRow | null;
    plans: SubscriptionPlanRow[];
    commissionPlans: CommissionPlanRow[];
    onClose: () => void;
    /**
     * planId is the subscription plan uuid for the 'subscription' type, or the
     * commission plan uuid for 'commission'. commissionPct (0-50) is the resolved
     * rate of the chosen commission plan.
     */
    onSave: (billingType: SubscriptionBillingType, commissionPct: number, planId: string) => void;
}

export function BillingTypeModal({ sub, plans, commissionPlans, onClose, onSave }: BillingTypeModalProps) {
    const { t } = useTranslation();
    const [billingType, setBillingType] = useState<SubscriptionBillingType>('subscription');
    const [planId, setPlanId] = useState('');
    const [commPlanId, setCommPlanId] = useState('');

    useEffect(() => {
        if (sub) {
            setBillingType(sub.billing_type);
            setPlanId(sub.billing_type === 'subscription' ? (sub.plan_uuid || plans[0]?.uuid || '') : (plans[0]?.uuid || ''));
            // A commission sub stores its commission-plan uuid in plan_uuid.
            setCommPlanId(sub.billing_type === 'commission' ? (sub.plan_uuid || commissionPlans[0]?.uuid || '') : (commissionPlans[0]?.uuid || ''));
        }
    }, [sub, plans, commissionPlans]);

    const selectedComm = commissionPlans.find(c => c.uuid === commPlanId);
    const commPct = selectedComm ? Math.round(selectedComm.commission_rate * 1000) / 10 : 0;

    const cycleLabel = (c: BillingCycle) =>
        c === 'yearly' ? t('commPlans.cycleYearly') : c === 'quarterly' ? t('commPlans.cycleQuarterly') : t('commPlans.cycleMonthly');

    const optionStyle = (active: boolean): React.CSSProperties => ({
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-lg)',
        border: `1.5px solid ${active ? 'var(--color-primary-500)' : 'var(--border-color)'}`,
        background: active ? 'var(--color-primary-50)' : 'var(--bg-primary)',
        cursor: 'pointer',
        textAlign: 'start',
    });

    return (
        <FormModal
            open={!!sub}
            onClose={onClose}
            title={`${t('subscriptions.billingType')} — ${sub?.provider_name}`}
            submitLabel={t('common.save')}
            onSubmit={e => {
                e.preventDefault();
                if (billingType === 'commission') onSave('commission', commPct, commPlanId);
                else onSave('subscription', 0, planId);
            }}
        >
            {sub && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <FormField label={t('subscriptions.billingTypeChoose')}>
                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                            <button type="button" onClick={() => setBillingType('subscription')} aria-pressed={billingType === 'subscription'} style={optionStyle(billingType === 'subscription')}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                                    <CreditCard size={16} /> {t('subscriptions.typeSubscription')}
                                </span>
                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{t('subscriptions.typeSubscriptionHint')}</span>
                            </button>
                            <button type="button" onClick={() => setBillingType('commission')} aria-pressed={billingType === 'commission'} style={optionStyle(billingType === 'commission')}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                                    <Percent size={16} /> {t('subscriptions.typeCommission')}
                                </span>
                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{t('subscriptions.typeCommissionHint')}</span>
                            </button>
                        </div>
                    </FormField>

                    {billingType === 'subscription' ? (
                        <FormField label={t('subscriptions.plan')} required>
                            <select value={planId} onChange={e => setPlanId(e.target.value)} required className={shared.formInput}>
                                {plans.filter(p => p.active).map(p => (
                                    <option key={p.uuid} value={p.uuid}>{p.name} — {formatMoney(p.price_monthly)}/mo</option>
                                ))}
                            </select>
                        </FormField>
                    ) : (
                        <FormField label={t('subscriptions.commissionPlan')} required>
                            <select value={commPlanId} onChange={e => setCommPlanId(e.target.value)} required className={shared.formInput}>
                                {commissionPlans.filter(p => p.active).map(p => (
                                    <option key={p.uuid} value={p.uuid}>{p.name} — {Math.round(p.commission_rate * 1000) / 10}%</option>
                                ))}
                            </select>
                            {selectedComm && (
                                <div style={{ marginTop: 6, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                    {t('commPlans.settlement')}: {cycleLabel(selectedComm.settlement_cycle)}
                                    {selectedComm.min_monthly_fee > 0 && ` · ${t('commPlans.minFee')}: ${formatMoney(selectedComm.min_monthly_fee)}`}
                                </div>
                            )}
                        </FormField>
                    )}

                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        <Repeat size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                        <span>
                            {billingType === 'commission'
                                ? t('subscriptions.commissionExplain').replace('{rate}', String(commPct))
                                : t('subscriptions.subscriptionExplain')}
                        </span>
                    </div>
                </div>
            )}
        </FormModal>
    );
}
