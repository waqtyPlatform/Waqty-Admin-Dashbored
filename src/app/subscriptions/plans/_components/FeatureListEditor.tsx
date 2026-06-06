'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Plus, Trash2, Check } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';

export interface FeatureRow {
    label: string;
    label_ar: string;
    /** Only meaningful when withToggle — whether the feature is included in the plan. */
    included: boolean;
}

interface FeatureListEditorProps {
    rows: FeatureRow[];
    onChange: (rows: FeatureRow[]) => void;
    /** Show an "included / not included" toggle per row (subscription plans). Commission perks are always included. */
    withToggle?: boolean;
}

/**
 * Flexible, controlled bilingual feature editor — add / remove / reorder-free list
 * of {label, label_ar, included}. Shared by subscription plans (withToggle) and
 * commission plans (perks, always included).
 */
export function FeatureListEditor({ rows, onChange, withToggle = false }: FeatureListEditorProps) {
    const { t } = useTranslation();

    const update = (i: number, patch: Partial<FeatureRow>) =>
        onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
    const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
    const add = () => onChange([...rows, { label: '', label_ar: '', included: true }]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('subscriptions.plans.featuresTitle')}</span>
                <button type="button" onClick={add} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', color: 'var(--color-primary-600)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                    <Plus size={13} /> {t('subscriptions.plans.featuresAdd')}
                </button>
            </div>

            {rows.length === 0 && (
                <div style={{ padding: 12, border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                    {t('subscriptions.plans.featuresEmpty')}
                </div>
            )}

            {rows.map((row, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input
                        value={row.label}
                        onChange={e => update(i, { label: e.target.value })}
                        className={shared.formInput}
                        placeholder={t('subscriptions.plans.featureEn')}
                        style={{ flex: 1 }}
                    />
                    <input
                        value={row.label_ar}
                        onChange={e => update(i, { label_ar: e.target.value })}
                        className={shared.formInput}
                        placeholder={t('subscriptions.plans.featureAr')}
                        dir="rtl"
                        style={{ flex: 1 }}
                    />
                    {withToggle && (
                        <button
                            type="button"
                            onClick={() => update(i, { included: !row.included })}
                            aria-pressed={row.included}
                            aria-label={t('subscriptions.plans.featureIncluded')}
                            title={t('subscriptions.plans.featureIncluded')}
                            style={{
                                flexShrink: 0, width: 34, height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: 'var(--radius-md)', cursor: 'pointer',
                                border: `1px solid ${row.included ? 'var(--color-success)' : 'var(--border-color)'}`,
                                background: row.included ? 'var(--color-success-light)' : 'var(--bg-primary)',
                                color: row.included ? 'var(--color-success)' : 'var(--text-tertiary)',
                            }}
                        >
                            <Check size={15} />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => remove(i)}
                        aria-label={t('subscriptions.plans.featureRemove')}
                        title={t('subscriptions.plans.featureRemove')}
                        style={{ flexShrink: 0, width: 34, height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)', cursor: 'pointer', border: '1px solid var(--color-error-light)', background: 'var(--bg-primary)', color: 'var(--color-error)' }}
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            ))}
        </div>
    );
}
