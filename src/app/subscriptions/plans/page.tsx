'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { mockPlans } from '@/mocks/subscriptions';
import { Check, X, Plus, Edit, Users } from 'lucide-react';

export default function PlansPage() {
    const { t } = useTranslation();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{t('sidebar.plans')}</h1>
                <PermissionGate module="subscriptions" action="create">
                    <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--color-primary-500)', color: 'white', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                        <Plus size={16} /> {t('subscriptions.addPlan')}
                    </button>
                </PermissionGate>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${mockPlans.length}, 1fr)`, gap: 20 }}>
                {mockPlans.map(plan => (
                    <div key={plan.id} style={{ background: 'var(--bg-primary)', border: plan.tier === 'enterprise' ? '2px solid var(--color-primary-500)' : '1px solid var(--border-color)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }}>
                        {plan.tier === 'enterprise' && (
                            <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--color-primary-500)', color: 'white', padding: '2px 12px', borderRadius: 9999, fontSize: '0.6875rem', fontWeight: 600 }}>POPULAR</span>
                        )}

                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>{plan.name}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                <Users size={12} /> {plan.providers_count} providers
                            </div>
                        </div>

                        <div>
                            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>EGP {plan.price_monthly}</span>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>/month</span>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                                or EGP {plan.price_yearly.toLocaleString()}/year (save {Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)}%)
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Limits</div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                                {plan.limits.max_branches === -1 ? 'Unlimited' : plan.limits.max_branches} branches &middot;{' '}
                                {plan.limits.max_employees === -1 ? 'Unlimited' : plan.limits.max_employees} employees &middot;{' '}
                                {plan.limits.max_bookings_per_month === -1 ? 'Unlimited' : plan.limits.max_bookings_per_month} bookings/mo
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                            {plan.features.map(f => (
                                <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: f.included ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                                    {f.included ? <Check size={16} color="var(--color-success)" /> : <X size={16} />}
                                    {f.label}
                                </div>
                            ))}
                        </div>

                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                            {plan.trial_days}-day free trial
                        </div>

                        <PermissionGate module="subscriptions" action="edit">
                            <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)', width: '100%' }}>
                                <Edit size={14} /> Edit Plan
                            </button>
                        </PermissionGate>
                    </div>
                ))}
            </div>
        </div>
    );
}
