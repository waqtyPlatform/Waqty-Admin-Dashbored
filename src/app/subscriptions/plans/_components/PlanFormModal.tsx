'use client';

import React, { useState, useEffect } from 'react';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { useTranslation } from '@/hooks/useTranslation';
import { toMinor, toMajor } from '@/lib/market';
import type { SubscriptionPlanRow } from '@/types/subscription';
import type { PlanTier } from '@/contract/waqty_contract';
import { FeatureListEditor, type FeatureRow } from './FeatureListEditor';
import shared from '@/components/admin/shared.module.css';

interface PlanFormModalProps {
    /** null = closed; 'create' = new plan; a row = edit that plan. */
    mode: 'create' | SubscriptionPlanRow | null;
    onClose: () => void;
    onSave: (plan: SubscriptionPlanRow) => void;
}

const emptyDraft = () => ({
    name: '', name_ar: '', tier: 'basic' as PlanTier,
    price_monthly: '', price_yearly: '', trial_days: '14',
    max_branches: '1', max_employees: '5', max_services: '50', max_bookings: '200', storage_gb: '5',
    active: true,
    features: [] as FeatureRow[],
});

export function PlanFormModal({ mode, onClose, onSave }: PlanFormModalProps) {
    const { t } = useTranslation();
    const editing = mode && mode !== 'create' ? mode : null;
    const isEdit = editing !== null;
    const [d, setD] = useState(emptyDraft());

    useEffect(() => {
        if (editing) {
            setD({
                name: editing.name, name_ar: editing.name_ar, tier: editing.tier,
                price_monthly: String(toMajor(editing.price_monthly)), price_yearly: String(toMajor(editing.price_yearly)),
                trial_days: String(editing.trial_days),
                max_branches: String(editing.limits.max_branches), max_employees: String(editing.limits.max_employees),
                max_services: String(editing.limits.max_services), max_bookings: String(editing.limits.max_bookings_per_month),
                storage_gb: String(editing.limits.storage_gb),
                active: editing.active,
                features: editing.features.map(f => ({ label: f.label, label_ar: f.label_ar, included: f.included })),
            });
        } else if (mode === 'create') {
            setD(emptyDraft());
        }
    }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

    const set = (patch: Partial<ReturnType<typeof emptyDraft>>) => setD(prev => ({ ...prev, ...patch }));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const now = new Date().toISOString();
        const base = editing;
        const features = d.features
            .filter(f => f.label.trim() || f.label_ar.trim())
            .map((f, i) => ({ key: `feat-${i}`, label: f.label.trim(), label_ar: f.label_ar.trim() || f.label.trim(), included: f.included }));
        onSave({
            uuid: base?.uuid ?? `plan-${Date.now()}`,
            name: d.name.trim(), name_ar: d.name_ar.trim(),
            tier: d.tier,
            price_monthly: toMinor(Number(d.price_monthly) || 0),
            price_yearly: toMinor(Number(d.price_yearly) || 0),
            currency: base?.currency ?? 'EGP',
            features,
            limits: {
                max_branches: Number(d.max_branches) || 0,
                max_employees: Number(d.max_employees) || 0,
                max_services: Number(d.max_services) || 0,
                max_bookings_per_month: Number(d.max_bookings) || 0,
                storage_gb: Number(d.storage_gb) || 0,
            },
            trial_days: Number(d.trial_days) || 0,
            active: d.active,
            providers_count: base?.providers_count ?? 0,
            created_at: base?.created_at ?? now,
            updated_at: now,
        });
    };

    return (
        <FormModal
            open={mode !== null}
            onClose={onClose}
            title={editing ? `${t('subscriptions.plans.editPrefix')} ${editing.name}` : t('subscriptions.plans.createPlan')}
            submitLabel={isEdit ? t('common.saveChanges') : t('subscriptions.plans.createPlan')}
            onSubmit={submit}
        >
            <div className={shared.formGrid2}>
                <FormField label={t('subscriptions.plans.nameEn')} required><input value={d.name} onChange={e => set({ name: e.target.value })} required className={shared.formInput} placeholder={t('subscriptions.plans.namePlaceholderEn')} /></FormField>
                <FormField label={t('subscriptions.plans.nameAr')} required><input value={d.name_ar} onChange={e => set({ name_ar: e.target.value })} required className={shared.formInput} placeholder={t('subscriptions.plans.namePlaceholderAr')} dir="rtl" /></FormField>
            </div>

            <div className={shared.formGrid2}>
                <FormField label={t('subscriptions.plans.tier')}>
                    <select value={d.tier} onChange={e => set({ tier: e.target.value as PlanTier })} className={shared.formInput}>
                        <option value="basic">{t('subscriptions.plans.tierBasic')}</option>
                        <option value="pro">{t('subscriptions.plans.tierPro')}</option>
                        <option value="enterprise">{t('subscriptions.plans.tierEnterprise')}</option>
                    </select>
                </FormField>
                <FormField label={t('subscriptions.plans.activeLabel')}>
                    <select value={d.active ? '1' : '0'} onChange={e => set({ active: e.target.value === '1' })} className={shared.formInput}>
                        <option value="1">{t('common.active')}</option>
                        <option value="0">{t('common.inactive')}</option>
                    </select>
                </FormField>
            </div>

            <div className={shared.formGrid2}>
                <FormField label={t('subscriptions.plans.monthlyPrice')} required><input type="number" min={0} value={d.price_monthly} onChange={e => set({ price_monthly: e.target.value })} required className={shared.formInput} /></FormField>
                <FormField label={t('subscriptions.plans.yearlyPrice')} required><input type="number" min={0} value={d.price_yearly} onChange={e => set({ price_yearly: e.target.value })} required className={shared.formInput} /></FormField>
            </div>

            <div className={shared.formGrid3}>
                <FormField label={t('subscriptions.plans.maxBranches')}><input type="number" value={d.max_branches} onChange={e => set({ max_branches: e.target.value })} className={shared.formInput} placeholder={t('subscriptions.plans.unlimitedPlaceholder')} /></FormField>
                <FormField label={t('subscriptions.plans.maxEmployees')}><input type="number" value={d.max_employees} onChange={e => set({ max_employees: e.target.value })} className={shared.formInput} placeholder={t('subscriptions.plans.unlimitedPlaceholder')} /></FormField>
                <FormField label={t('subscriptions.plans.maxServices')}><input type="number" value={d.max_services} onChange={e => set({ max_services: e.target.value })} className={shared.formInput} placeholder={t('subscriptions.plans.unlimitedPlaceholder')} /></FormField>
            </div>
            <div className={shared.formGrid3}>
                <FormField label={t('subscriptions.plans.maxBookings')}><input type="number" value={d.max_bookings} onChange={e => set({ max_bookings: e.target.value })} className={shared.formInput} placeholder={t('subscriptions.plans.unlimitedPlaceholder')} /></FormField>
                <FormField label={t('subscriptions.plans.storageGb')}><input type="number" value={d.storage_gb} onChange={e => set({ storage_gb: e.target.value })} className={shared.formInput} /></FormField>
                <FormField label={t('subscriptions.plans.trialDays')}><input type="number" value={d.trial_days} onChange={e => set({ trial_days: e.target.value })} className={shared.formInput} /></FormField>
            </div>

            <FeatureListEditor rows={d.features} onChange={features => set({ features })} withToggle />
        </FormModal>
    );
}
