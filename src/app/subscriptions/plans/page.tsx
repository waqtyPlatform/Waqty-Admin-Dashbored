'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { mockPlans } from '@/mocks/subscriptions';
import type { SubscriptionPlan } from '@/types/subscription';
import { Check, X, Plus, Edit, Users } from 'lucide-react';

const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-primary)', background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', outline: 'none' };

export default function PlansPage() {
    const { t } = useTranslation();
    const [plans, setPlans] = useState(mockPlans);
    const [showCreate, setShowCreate] = useState(false);
    const [editPlan, setEditPlan] = useState<SubscriptionPlan | null>(null);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{t('sidebar.plans')}</h1>
                <PermissionGate module="subscriptions" action="create">
                    <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--color-primary-500)', color: 'white', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                        <Plus size={16} /> {t('subscriptions.addPlan')}
                    </button>
                </PermissionGate>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${plans.length}, 1fr)`, gap: 20 }}>
                {plans.map(plan => (
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
                            <button onClick={() => setEditPlan(plan)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)', width: '100%' }}>
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
                    id: `plan-${Date.now()}`, name: String(fd.get('name') || ''), name_ar: String(fd.get('name_ar') || ''),
                    tier: (fd.get('tier') || 'basic') as SubscriptionPlan['tier'],
                    price_monthly: Number(fd.get('price_monthly') || 0), price_yearly: Number(fd.get('price_yearly') || 0), currency: 'EGP',
                    features: [], limits: { max_branches: Number(fd.get('max_branches') || 1), max_employees: Number(fd.get('max_employees') || 5), max_services: 50, max_bookings_per_month: Number(fd.get('max_bookings') || 100), storage_gb: 5 },
                    active: true, trial_days: Number(fd.get('trial_days') || 14), providers_count: 0, created_at: now, updated_at: now,
                }]);
                setShowCreate(false);
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <FormField label="Plan Name (EN)" required><input name="name" type="text" required style={inputStyle} placeholder="e.g. Business" /></FormField>
                    <FormField label="Plan Name (AR)" required><input name="name_ar" type="text" required style={inputStyle} placeholder="الباقة" dir="rtl" /></FormField>
                </div>
                <FormField label="Tier"><select name="tier" style={inputStyle}><option value="basic">Basic</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option></select></FormField>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <FormField label="Monthly Price (EGP)" required><input name="price_monthly" type="number" required style={inputStyle} /></FormField>
                    <FormField label="Yearly Price (EGP)" required><input name="price_yearly" type="number" required style={inputStyle} /></FormField>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <FormField label="Max Branches"><input name="max_branches" type="number" style={inputStyle} placeholder="-1 for unlimited" /></FormField>
                    <FormField label="Max Employees"><input name="max_employees" type="number" style={inputStyle} placeholder="-1 for unlimited" /></FormField>
                    <FormField label="Max Bookings/mo"><input name="max_bookings" type="number" style={inputStyle} placeholder="-1 for unlimited" /></FormField>
                </div>
                <FormField label="Trial Days"><input name="trial_days" type="number" style={inputStyle} defaultValue={14} /></FormField>
            </FormModal>

            {/* Edit Plan Modal */}
            <FormModal open={!!editPlan} onClose={() => setEditPlan(null)} title={editPlan ? `Edit: ${editPlan.name}` : ''} submitLabel="Save Changes" onSubmit={e => {
                e.preventDefault();
                if (!editPlan) return;
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                setPlans(prev => prev.map(p => p.id === editPlan.id ? {
                    ...p,
                    name: String(fd.get('name') || p.name), name_ar: String(fd.get('name_ar') || p.name_ar),
                    price_monthly: Number(fd.get('price_monthly') || p.price_monthly),
                    price_yearly: Number(fd.get('price_yearly') || p.price_yearly),
                    trial_days: Number(fd.get('trial_days') || p.trial_days),
                    limits: { ...p.limits, max_branches: Number(fd.get('max_branches') || p.limits.max_branches), max_employees: Number(fd.get('max_employees') || p.limits.max_employees), max_bookings_per_month: Number(fd.get('max_bookings') || p.limits.max_bookings_per_month) },
                    updated_at: new Date().toISOString(),
                } : p));
                setEditPlan(null);
            }}>
                {editPlan && <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <FormField label="Plan Name (EN)"><input name="name" type="text" defaultValue={editPlan.name} style={inputStyle} /></FormField>
                        <FormField label="Plan Name (AR)"><input name="name_ar" type="text" defaultValue={editPlan.name_ar} style={inputStyle} dir="rtl" /></FormField>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <FormField label="Monthly Price (EGP)"><input name="price_monthly" type="number" defaultValue={editPlan.price_monthly} style={inputStyle} /></FormField>
                        <FormField label="Yearly Price (EGP)"><input name="price_yearly" type="number" defaultValue={editPlan.price_yearly} style={inputStyle} /></FormField>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <FormField label="Max Branches"><input name="max_branches" type="number" defaultValue={editPlan.limits.max_branches} style={inputStyle} /></FormField>
                        <FormField label="Max Employees"><input name="max_employees" type="number" defaultValue={editPlan.limits.max_employees} style={inputStyle} /></FormField>
                        <FormField label="Max Bookings/mo"><input name="max_bookings" type="number" defaultValue={editPlan.limits.max_bookings_per_month} style={inputStyle} /></FormField>
                    </div>
                    <FormField label="Trial Days"><input name="trial_days" type="number" defaultValue={editPlan.trial_days} style={inputStyle} /></FormField>
                </>}
            </FormModal>
        </div>
    );
}
