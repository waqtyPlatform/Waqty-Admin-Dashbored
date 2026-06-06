'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { useToast } from '@/components/ui';
import { mockPlans, mockCommissionPlans } from '@/mocks/subscriptions';
import type { SubscriptionPlanRow, CommissionPlanRow } from '@/types/subscription';
import type { BillingCycle } from '@/contract/waqty_contract';
import { formatMoney } from '@/lib/market';
import { Check, X, Plus, Edit, Users, Percent, CalendarClock, CreditCard } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';
import { PlanFormModal } from './_components/PlanFormModal';
import { CommissionPlanFormModal } from './_components/CommissionPlanFormModal';

type PlanKind = 'subscription' | 'commission';

const ratePct = (r: number) => `${(r * 100) % 1 === 0 ? (r * 100).toFixed(0) : (r * 100).toFixed(1)}%`;

export default function PlansPage() {
    const { t, lang } = useTranslation();
    const { addToast } = useToast();
    const [kind, setKind] = useState<PlanKind>('subscription');

    const [plans, setPlans] = useState(mockPlans);
    const [planModal, setPlanModal] = useState<'create' | SubscriptionPlanRow | null>(null);

    const [commPlans, setCommPlans] = useState(mockCommissionPlans);
    const [commModal, setCommModal] = useState<'create' | CommissionPlanRow | null>(null);

    const cycleLabel = (c: BillingCycle) =>
        c === 'yearly' ? t('commPlans.cycleYearly') : c === 'quarterly' ? t('commPlans.cycleQuarterly') : t('commPlans.cycleMonthly');

    const savePlan = (plan: SubscriptionPlanRow) => {
        setPlans(prev => prev.some(p => p.uuid === plan.uuid) ? prev.map(p => p.uuid === plan.uuid ? plan : p) : [...prev, plan]);
        addToast('success', (planModal === 'create' ? t('subscriptions.plans.toastCreated') : t('subscriptions.plans.toastUpdated')).replace('{name}', plan.name));
        setPlanModal(null);
    };
    const saveComm = (plan: CommissionPlanRow) => {
        setCommPlans(prev => prev.some(p => p.uuid === plan.uuid) ? prev.map(p => p.uuid === plan.uuid ? plan : p) : [...prev, plan]);
        addToast('success', (commModal === 'create' ? t('commPlans.toastCreated') : t('commPlans.toastUpdated')).replace('{name}', plan.name));
        setCommModal(null);
    };

    const segBtn = (active: boolean): React.CSSProperties => ({
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--radius-full)',
        border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 600,
        background: active ? 'var(--bg-primary)' : 'transparent',
        color: active ? 'var(--color-primary-700)' : 'var(--text-secondary)',
        boxShadow: active ? 'var(--shadow-xs)' : 'none',
        transition: 'var(--transition-base)',
    });

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <h1 className={shared.pageTitle}>{t('sidebar.plans')}</h1>
                <PermissionGate module="subscriptions" action="create">
                    {kind === 'subscription'
                        ? <button onClick={() => setPlanModal('create')} className={shared.addBtn}><Plus size={16} /> {t('subscriptions.addPlan')}</button>
                        : <button onClick={() => setCommModal('create')} className={shared.addBtn}><Plus size={16} /> {t('commPlans.add')}</button>}
                </PermissionGate>
            </div>

            {/* Subscription ↔ Commission toggle */}
            <div role="tablist" aria-label={t('sidebar.plans')} style={{ display: 'inline-flex', gap: 4, padding: 4, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', marginBottom: 24 }}>
                <button role="tab" aria-selected={kind === 'subscription'} onClick={() => setKind('subscription')} style={segBtn(kind === 'subscription')}>
                    <CreditCard size={15} /> {t('commPlans.subTab')}
                </button>
                <button role="tab" aria-selected={kind === 'commission'} onClick={() => setKind('commission')} style={segBtn(kind === 'commission')}>
                    <Percent size={15} /> {t('commPlans.commTab')}
                </button>
            </div>

            {/* ─────────────── Subscription plans ─────────────── */}
            {kind === 'subscription' && (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(plans.length, 1)}, 1fr)`, gap: 20 }}>
                    {plans.map(plan => (
                        <div key={plan.uuid} style={{ background: 'var(--bg-primary)', border: plan.tier === 'enterprise' ? '2px solid var(--color-primary-500)' : '1px solid var(--border-color)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, position: 'relative', opacity: plan.active ? 1 : 0.6 }}>
                            {plan.tier === 'enterprise' && (
                                <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--color-primary-500)', color: 'white', padding: '2px 12px', borderRadius: 9999, fontSize: '0.6875rem', fontWeight: 600 }}>{t('subscriptions.plans.popular')}</span>
                            )}

                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>{lang === 'ar' && plan.name_ar ? plan.name_ar : plan.name}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                    <Users size={12} /> {plan.providers_count} {t('subscriptions.plans.providersSuffix')}
                                    {!plan.active && <span style={{ marginInlineStart: 6, padding: '1px 6px', borderRadius: 4, background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{t('common.inactive')}</span>}
                                </div>
                            </div>

                            <div>
                                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatMoney(plan.price_monthly)}</span>
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t('subscriptions.plans.perMonth')}</span>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                                    {t('subscriptions.plans.or')} {formatMoney(plan.price_yearly)}{t('subscriptions.plans.perYearSave')} {plan.price_monthly > 0 ? Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100) : 0}%)
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('subscriptions.plans.limits')}</div>
                                <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                                    {plan.limits.max_branches === -1 ? t('subscriptions.plans.unlimited') : plan.limits.max_branches} {t('subscriptions.plans.branchesSuffix')} &middot;{' '}
                                    {plan.limits.max_employees === -1 ? t('subscriptions.plans.unlimited') : plan.limits.max_employees} {t('subscriptions.plans.employeesSuffix')} &middot;{' '}
                                    {plan.limits.max_bookings_per_month === -1 ? t('subscriptions.plans.unlimited') : plan.limits.max_bookings_per_month} {t('subscriptions.plans.bookingsSuffix')}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                                {plan.features.length === 0 && <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{t('subscriptions.plans.featuresEmpty')}</span>}
                                {plan.features.map((f, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: f.included ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                                        {f.included ? <Check size={16} color="var(--color-success)" /> : <X size={16} />}
                                        {lang === 'ar' && f.label_ar ? f.label_ar : f.label}
                                    </div>
                                ))}
                            </div>

                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                {plan.trial_days}{t('subscriptions.plans.freeTrialSuffix')}
                            </div>

                            <PermissionGate module="subscriptions" action="edit">
                                <button onClick={() => setPlanModal(plan)} className={shared.actionBtn} style={{ justifyContent: 'center', width: '100%', padding: '10px' }}>
                                    <Edit size={14} /> {t('subscriptions.plans.editPlan')}
                                </button>
                            </PermissionGate>
                        </div>
                    ))}
                </div>
            )}

            {/* ─────────────── Commission plans ─────────────── */}
            {kind === 'commission' && (
                commPlans.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-tertiary)', fontSize: '0.875rem', border: '1px dashed var(--border-color)', borderRadius: 16 }}>
                        {t('commPlans.empty')}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${commPlans.length}, 1fr)`, gap: 20 }}>
                        {commPlans.map(plan => (
                            <div key={plan.uuid} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, position: 'relative', opacity: plan.active ? 1 : 0.6 }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>{lang === 'ar' && plan.name_ar ? plan.name_ar : plan.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                        <Users size={12} /> {plan.providers_count} {t('commPlans.providersSuffix')}
                                        {!plan.active && <span style={{ marginInlineStart: 6, padding: '1px 6px', borderRadius: 4, background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{t('common.inactive')}</span>}
                                    </div>
                                </div>

                                <div>
                                    <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-primary-600)' }}>{ratePct(plan.commission_rate)}</span>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginInlineStart: 6 }}>{t('commPlans.ofRevenue')}</span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                        <CalendarClock size={15} /> {t('commPlans.settlement')}: <strong style={{ color: 'var(--text-primary)' }}>{cycleLabel(plan.settlement_cycle)}</strong>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                        <CreditCard size={15} /> {plan.min_monthly_fee > 0 ? `${t('commPlans.minFee')}: ${formatMoney(plan.min_monthly_fee)}` : t('commPlans.noMinFee')}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('commPlans.included')}</div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                                    {(lang === 'ar' && plan.features_ar?.length ? plan.features_ar : plan.features).map((f, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                                            <Check size={16} color="var(--color-success)" /> {f}
                                        </div>
                                    ))}
                                </div>

                                <PermissionGate module="subscriptions" action="edit">
                                    <button onClick={() => setCommModal(plan)} className={shared.actionBtn} style={{ justifyContent: 'center', width: '100%', padding: '10px' }}>
                                        <Edit size={14} /> {t('commPlans.editPlan')}
                                    </button>
                                </PermissionGate>
                            </div>
                        ))}
                    </div>
                )
            )}

            <PlanFormModal mode={planModal} onClose={() => setPlanModal(null)} onSave={savePlan} />
            <CommissionPlanFormModal mode={commModal} onClose={() => setCommModal(null)} onSave={saveComm} />
        </div>
    );
}
