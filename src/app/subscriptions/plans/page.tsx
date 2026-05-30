'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { mockPlans } from '@/mocks/subscriptions';
import type { SubscriptionPlanRow } from '@/types/subscription';
import { formatMoney, toMinor, toMajor } from '@/lib/market';
import { Check, X, Plus, Edit, Users } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';

export default function PlansPage() {
    const { t } = useTranslation();
    const [plans, setPlans] = useState(mockPlans);
    const [showCreate, setShowCreate] = useState(false);
    const [editPlan, setEditPlan] = useState<SubscriptionPlanRow | null>(null);

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <h1 className={shared.pageTitle}>{t('sidebar.plans')}</h1>
                <PermissionGate module="subscriptions" action="create">
                    <button onClick={() => setShowCreate(true)} className={shared.addBtn}>
                        <Plus size={16} /> {t('subscriptions.addPlan')}
                    </button>
                </PermissionGate>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${plans.length}, 1fr)`, gap: 20 }}>
                {plans.map(plan => (
                    <div key={plan.uuid} style={{ background: 'var(--bg-primary)', border: plan.tier === 'enterprise' ? '2px solid var(--color-primary-500)' : '1px solid var(--border-color)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }}>
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
                            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatMoney(plan.price_monthly)}</span>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>/month</span>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                                or {formatMoney(plan.price_yearly)}/year (save {Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)}%)
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
                            <button onClick={() => setEditPlan(plan)} className={shared.actionBtn} style={{ justifyContent: 'center', width: '100%', padding: '10px' }}>
                                <Edit size={14} /> Edit Plan
                            </button>
                        </PermissionGate>
                    </div>
                ))}
            </div>

            {/* Create Plan Modal */}
            <FormModal open={showCreate} onClose={() => setShowCreate(false)} title="Create Plan" submitLabel="Create Plan" onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const now = new Date().toISOString();
                setPlans(prev => [...prev, {
                    uuid: `plan-${Date.now()}`, name: String(fd.get('name') || ''), name_ar: String(fd.get('name_ar') || ''),
                    tier: (fd.get('tier') || 'basic') as SubscriptionPlanRow['tier'],
                    price_monthly: toMinor(Number(fd.get('price_monthly') || 0)), price_yearly: toMinor(Number(fd.get('price_yearly') || 0)), currency: 'EGP',
                    features: [], limits: { max_branches: Number(fd.get('max_branches') || 1), max_employees: Number(fd.get('max_employees') || 5), max_services: 50, max_bookings_per_month: Number(fd.get('max_bookings') || 100), storage_gb: 5 },
                    active: true, trial_days: Number(fd.get('trial_days') || 14), providers_count: 0, created_at: now, updated_at: now,
                }]);
                setShowCreate(false);
            }}>
                <div className={shared.formGrid2}>
                    <FormField label="Plan Name (EN)" required><input name="name" type="text" required className={shared.formInput} placeholder="e.g. Business" /></FormField>
                    <FormField label="Plan Name (AR)" required><input name="name_ar" type="text" required className={shared.formInput} placeholder="الباقة" dir="rtl" /></FormField>
                </div>
                <FormField label="Tier"><select name="tier" className={shared.formInput}><option value="basic">Basic</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option></select></FormField>
                <div className={shared.formGrid2}>
                    <FormField label="Monthly Price (EGP)" required><input name="price_monthly" type="number" required className={shared.formInput} /></FormField>
                    <FormField label="Yearly Price (EGP)" required><input name="price_yearly" type="number" required className={shared.formInput} /></FormField>
                </div>
                <div className={shared.formGrid3}>
                    <FormField label="Max Branches"><input name="max_branches" type="number" className={shared.formInput} placeholder="-1 for unlimited" /></FormField>
                    <FormField label="Max Employees"><input name="max_employees" type="number" className={shared.formInput} placeholder="-1 for unlimited" /></FormField>
                    <FormField label="Max Bookings/mo"><input name="max_bookings" type="number" className={shared.formInput} placeholder="-1 for unlimited" /></FormField>
                </div>
                <FormField label="Trial Days"><input name="trial_days" type="number" className={shared.formInput} defaultValue={14} /></FormField>
            </FormModal>

            {/* Edit Plan Modal */}
            <FormModal open={!!editPlan} onClose={() => setEditPlan(null)} title={editPlan ? `Edit: ${editPlan.name}` : ''} submitLabel="Save Changes" onSubmit={e => {
                e.preventDefault();
                if (!editPlan) return;
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                setPlans(prev => prev.map(p => p.uuid === editPlan.uuid ? {
                    ...p,
                    name: String(fd.get('name') || p.name), name_ar: String(fd.get('name_ar') || p.name_ar),
                    price_monthly: fd.get('price_monthly') ? toMinor(Number(fd.get('price_monthly'))) : p.price_monthly,
                    price_yearly: fd.get('price_yearly') ? toMinor(Number(fd.get('price_yearly'))) : p.price_yearly,
                    trial_days: Number(fd.get('trial_days') || p.trial_days),
                    limits: { ...p.limits, max_branches: Number(fd.get('max_branches') || p.limits.max_branches), max_employees: Number(fd.get('max_employees') || p.limits.max_employees), max_bookings_per_month: Number(fd.get('max_bookings') || p.limits.max_bookings_per_month) },
                    updated_at: new Date().toISOString(),
                } : p));
                setEditPlan(null);
            }}>
                {editPlan && <>
                    <div className={shared.formGrid2}>
                        <FormField label="Plan Name (EN)"><input name="name" type="text" defaultValue={editPlan.name} className={shared.formInput} /></FormField>
                        <FormField label="Plan Name (AR)"><input name="name_ar" type="text" defaultValue={editPlan.name_ar} className={shared.formInput} dir="rtl" /></FormField>
                    </div>
                    <div className={shared.formGrid2}>
                        <FormField label="Monthly Price (EGP)"><input name="price_monthly" type="number" defaultValue={toMajor(editPlan.price_monthly)} className={shared.formInput} /></FormField>
                        <FormField label="Yearly Price (EGP)"><input name="price_yearly" type="number" defaultValue={toMajor(editPlan.price_yearly)} className={shared.formInput} /></FormField>
                    </div>
                    <div className={shared.formGrid3}>
                        <FormField label="Max Branches"><input name="max_branches" type="number" defaultValue={editPlan.limits.max_branches} className={shared.formInput} /></FormField>
                        <FormField label="Max Employees"><input name="max_employees" type="number" defaultValue={editPlan.limits.max_employees} className={shared.formInput} /></FormField>
                        <FormField label="Max Bookings/mo"><input name="max_bookings" type="number" defaultValue={editPlan.limits.max_bookings_per_month} className={shared.formInput} /></FormField>
                    </div>
                    <FormField label="Trial Days"><input name="trial_days" type="number" defaultValue={editPlan.trial_days} className={shared.formInput} /></FormField>
                </>}
            </FormModal>
        </div>
    );
}
