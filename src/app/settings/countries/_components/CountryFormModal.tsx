'use client';

import React from 'react';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';
import type { CountryObject, CityObject, GovernorateObject } from '@/lib/api';

type Tab = 'countries' | 'cities' | 'governorates';
type Entity = CountryObject | CityObject | GovernorateObject;

interface CountryFormModalProps {
    open: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    tab: Tab;
    /** The row being edited (edit mode only). */
    editTarget?: Entity | null;
    /** Countries for the parent-country select (create mode, cities/governorates). */
    allCountries?: CountryObject[];
    formError?: string | null;
    submitting?: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

/**
 * One form for both creating and editing a country / city / governorate. Replaces
 * the two near-identical inline modals the page used to carry. Field set adapts to
 * `tab` (ISO/phone only for countries; parent-country select only when creating a
 * city or governorate) and to `mode` (edit pre-fills from `editTarget`).
 */
export function CountryFormModal({
    open,
    onClose,
    mode,
    tab,
    editTarget,
    allCountries = [],
    formError,
    submitting,
    onSubmit,
}: CountryFormModalProps) {
    const { t } = useTranslation();

    const nameEn = editTarget?.name.en ?? '';
    const nameAr = editTarget?.name.ar ?? '';
    const isCountry = tab === 'countries';
    const needsParentCountry = mode === 'create' && (tab === 'cities' || tab === 'governorates');

    const title = mode === 'edit'
        ? `${t('common.edit')} ${nameEn}`
        : isCountry
            ? t('settings.countries.addCountry')
            : tab === 'cities'
                ? t('settings.countries.addCity')
                : t('settings.countries.addGovernorate');

    const submitLabel = submitting
        ? t('common.saving')
        : mode === 'edit'
            ? t('common.save')
            : t('settings.countries.add');

    return (
        <FormModal open={open} onClose={onClose} title={title} submitLabel={submitLabel} onSubmit={onSubmit}>
            {formError && (
                <div style={{ padding: '10px 12px', marginBottom: 12, borderRadius: 8, background: 'color-mix(in srgb, var(--color-error) 12%, transparent)', color: 'var(--color-error)', fontSize: '0.875rem' }}>
                    {formError}
                </div>
            )}
            <div className={shared.formGrid2}>
                <FormField label={t('settings.countries.nameEn')} required>
                    <input name="name_en" type="text" required className={shared.formInput} defaultValue={nameEn} placeholder={mode === 'create' ? t('settings.countries.namePlaceholderEn') : undefined} />
                </FormField>
                <FormField label={t('settings.countries.nameAr')} required>
                    <input name="name_ar" type="text" required className={shared.formInput} defaultValue={nameAr} placeholder={mode === 'create' ? t('settings.countries.namePlaceholderAr') : undefined} dir="rtl" />
                </FormField>
            </div>

            {isCountry && (
                <div className={shared.formGrid2}>
                    <FormField label={t('settings.countries.iso2Code')}>
                        <input name="iso2" type="text" className={shared.formInput} defaultValue={(editTarget as CountryObject | undefined)?.iso2 ?? ''} placeholder="EG" maxLength={2} />
                    </FormField>
                    <FormField label={t('settings.countries.phoneCode')}>
                        <input name="phone_code" type="text" className={shared.formInput} defaultValue={(editTarget as CountryObject | undefined)?.phone_code ?? ''} placeholder="+20" />
                    </FormField>
                </div>
            )}

            {needsParentCountry && (
                <FormField label={t('settings.countries.country')} required>
                    <select name="country_uuid" required className={shared.formInput}>
                        <option value="">{t('settings.countries.selectCountry')}</option>
                        {allCountries.map(c => (
                            <option key={c.uuid} value={c.uuid}>{c.name.en}</option>
                        ))}
                    </select>
                </FormField>
            )}
        </FormModal>
    );
}
