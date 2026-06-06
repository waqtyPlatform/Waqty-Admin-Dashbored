'use client';

import React, { useState, useEffect } from 'react';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { useTranslation } from '@/hooks/useTranslation';
import { toMinor, toMajor } from '@/lib/market';
import type { CommissionPlanRow } from '@/types/subscription';
import type { BillingCycle } from '@/contract/waqty_contract';
import { FeatureListEditor, type FeatureRow } from './FeatureListEditor';
import shared from '@/components/admin/shared.module.css';

interface CommissionPlanFormModalProps {
    /** null = closed; 'create' = new plan; a row = edit that plan. */
    mode: 'create' | CommissionPlanRow | null;
    onClose: () => void;
    onSave: (plan: CommissionPlanRow) => void;
}

const emptyDraft = () => ({
    name: '', name_ar: '', rate: '12', settlement_cycle: 'monthly' as BillingCycle, min_fee: '0',
    active: true,
    features: [] as FeatureRow[],
});

export function CommissionPlanFormModal({ mode, onClose, onSave }: CommissionPlanFormModalProps) {
    const { t } = useTranslation();
    const editing = mode && mode !== 'create' ? mode : null;
    const isEdit = editing !== null;
    const [d, setD] = useState(emptyDraft());

    useEffect(() => {
        if (editing) {
            setD({
                name: editing.name, name_ar: editing.name_ar,
                rate: String(Math.round(editing.commission_rate * 1000) / 10),
                settlement_cycle: editing.settlement_cycle,
                min_fee: String(toMajor(editing.min_monthly_fee)),
                active: editing.active,
                features: editing.features.map((f, i) => ({ label: f, label_ar: editing.features_ar[i] ?? f, included: true })),
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
        const kept = d.features.filter(f => f.label.trim() || f.label_ar.trim());
        onSave({
            uuid: base?.uuid ?? `comm-${Date.now()}`,
            name: d.name.trim(), name_ar: d.name_ar.trim(),
            commission_rate: Math.max(0, Math.min(50, Number(d.rate) || 0)) / 100,
            settlement_cycle: d.settlement_cycle,
            min_monthly_fee: toMinor(Number(d.min_fee) || 0),
            features: kept.map(f => f.label.trim() || f.label_ar.trim()),
            features_ar: kept.map(f => f.label_ar.trim() || f.label.trim()),
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
            title={editing ? `${t('subscriptions.plans.editPrefix')} ${editing.name}` : t('commPlans.create')}
            submitLabel={isEdit ? t('common.saveChanges') : t('commPlans.create')}
            onSubmit={submit}
        >
            <div className={shared.formGrid2}>
                <FormField label={t('commPlans.nameEn')} required><input value={d.name} onChange={e => set({ name: e.target.value })} required className={shared.formInput} placeholder={t('commPlans.namePlaceholderEn')} /></FormField>
                <FormField label={t('commPlans.nameAr')} required><input value={d.name_ar} onChange={e => set({ name_ar: e.target.value })} required className={shared.formInput} placeholder={t('commPlans.namePlaceholderAr')} dir="rtl" /></FormField>
            </div>

            <div className={shared.formGrid2}>
                <FormField label={t('commPlans.rate')} required><input type="number" min={0} max={50} step="0.5" value={d.rate} onChange={e => set({ rate: e.target.value })} required className={shared.formInput} placeholder="12" /></FormField>
                <FormField label={t('commPlans.settlementCycle')}>
                    <select value={d.settlement_cycle} onChange={e => set({ settlement_cycle: e.target.value as BillingCycle })} className={shared.formInput}>
                        <option value="monthly">{t('commPlans.cycleMonthly')}</option>
                        <option value="quarterly">{t('commPlans.cycleQuarterly')}</option>
                        <option value="yearly">{t('commPlans.cycleYearly')}</option>
                    </select>
                </FormField>
            </div>

            <div className={shared.formGrid2}>
                <FormField label={t('commPlans.minFeeLabel')}><input type="number" min={0} value={d.min_fee} onChange={e => set({ min_fee: e.target.value })} className={shared.formInput} /></FormField>
                <FormField label={t('subscriptions.plans.activeLabel')}>
                    <select value={d.active ? '1' : '0'} onChange={e => set({ active: e.target.value === '1' })} className={shared.formInput}>
                        <option value="1">{t('common.active')}</option>
                        <option value="0">{t('common.inactive')}</option>
                    </select>
                </FormField>
            </div>

            <FeatureListEditor rows={d.features} onChange={features => set({ features })} />
        </FormModal>
    );
}
