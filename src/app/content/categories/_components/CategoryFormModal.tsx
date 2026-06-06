'use client';

import React, { useState, useEffect } from 'react';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { useTranslation } from '@/hooks/useTranslation';
import { Upload } from 'lucide-react';
import type { AdminCategoryObject, AdminSubcategoryObject } from '@/lib/api';

type Tab = 'categories' | 'subcategories';
type Entity = AdminCategoryObject | AdminSubcategoryObject;

interface CategoryFormModalProps {
    open: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    tab: Tab;
    editTarget?: Entity | null;
    /** Parent categories for the subcategory select. */
    allCategories?: AdminCategoryObject[];
    formError?: string | null;
    saving?: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid var(--border-color)', borderRadius: 10,
    fontSize: '0.875rem', background: 'var(--bg-secondary)',
    color: 'var(--text-primary)', outline: 'none',
    fontFamily: 'var(--font-sans)', boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
};
const focusField = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--color-primary-500)';
    e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent)';
};
const blurField = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--border-color)';
    e.target.style.boxShadow = 'none';
};

/**
 * One form for creating or editing a category / subcategory. Replaces the two
 * near-identical inline modals (plus the shared NameFields / CommonFields / image
 * uploader) the page used to carry. Owns its own image-preview state, reset each
 * time it opens. Input `name` attributes are preserved so the page's existing
 * FormData submit handlers keep working unchanged.
 */
export function CategoryFormModal({
    open,
    onClose,
    mode,
    tab,
    editTarget,
    allCategories = [],
    formError,
    saving,
    onSubmit,
}: CategoryFormModalProps) {
    const { t } = useTranslation();
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (open) setImagePreview(null);
    }, [open]);

    const isCat = tab === 'categories';
    const isSub = tab === 'subcategories';
    const title = mode === 'edit'
        ? (isCat ? t('content.categories.editCategory') : t('content.categories.editSubcategory'))
        : (isCat ? t('content.categories.addCategory') : t('content.categories.addSubcategory'));
    const submitLabel = saving
        ? t('common.saving')
        : mode === 'edit' ? t('common.saveChanges') : t('common.create');

    const currentCategoryImage = mode === 'edit' && isCat ? (editTarget as AdminCategoryObject | undefined)?.image_url : undefined;

    return (
        <FormModal open={open} onClose={onClose} title={title} submitLabel={submitLabel} onSubmit={onSubmit}>
            {formError && (
                <div style={{ padding: '10px 12px', marginBottom: 12, borderRadius: 8, background: 'color-mix(in srgb, var(--color-error) 12%, transparent)', color: 'var(--color-error)', fontSize: '0.875rem' }}>{formError}</div>
            )}

            {/* Name (EN / AR) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FormField label={t('content.categories.nameEn')} required>
                    <input name="name_en" type="text" required defaultValue={editTarget?.name.en ?? ''}
                        placeholder={t('content.categories.namePlaceholderEn')} style={fieldStyle} onFocus={focusField} onBlur={blurField} />
                </FormField>
                <FormField label={t('content.categories.nameAr')} required>
                    <input name="name_ar" type="text" required defaultValue={editTarget?.name.ar ?? ''}
                        placeholder={t('content.categories.namePlaceholderAr')} dir="rtl" style={fieldStyle} onFocus={focusField} onBlur={blurField} />
                </FormField>
            </div>

            {/* Parent category (subcategories) */}
            {isSub && (
                <FormField label={t('content.categories.category')} required>
                    <select name="category_uuid" required defaultValue={mode === 'edit' ? (editTarget as AdminSubcategoryObject | undefined)?.category_uuid : ''}
                        style={{ ...fieldStyle, cursor: 'pointer' }} onFocus={focusField} onBlur={blurField}>
                        {mode === 'create' && <option value="">{t('content.categories.selectCategory')}</option>}
                        {allCategories.map(c => <option key={c.uuid} value={c.uuid}>{c.name.en}</option>)}
                    </select>
                </FormField>
            )}

            {/* Sort order + status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FormField label={t('content.categories.sortOrder')}>
                    <input name="sort_order" type="number" min={0} defaultValue={editTarget ? String(editTarget.sort_order ?? '') : ''}
                        placeholder="0" style={fieldStyle} onFocus={focusField} onBlur={blurField} />
                </FormField>
                <FormField label={t('common.status')}>
                    <select name="active" defaultValue={editTarget ? (editTarget.active ? 'true' : 'false') : 'true'}
                        style={{ ...fieldStyle, cursor: 'pointer' }} onFocus={focusField} onBlur={blurField}>
                        <option value="true">{t('common.active')}</option>
                        <option value="false">{t('common.inactive')}</option>
                    </select>
                </FormField>
            </div>

            {/* Image uploader */}
            <FormField label={t('content.categories.image')}>
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: imagePreview ? 8 : '22px 16px', border: '2px dashed var(--border-color)', borderRadius: 12, cursor: 'pointer', background: 'var(--bg-secondary)', transition: 'all 0.2s', minHeight: 110, position: 'relative', overflow: 'hidden' }}>
                    {imagePreview ? (
                        <>
                            <img src={imagePreview} alt="preview" style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 8 }} />
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-primary-500)', fontWeight: 500 }}>{t('content.categories.clickToReplace')}</span>
                        </>
                    ) : (
                        <>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'color-mix(in srgb, var(--color-primary-500) 10%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-500)' }}>
                                <Upload size={22} />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{t('content.categories.clickToUpload')}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{t('content.categories.imageHint')}</div>
                            </div>
                        </>
                    )}
                    <input type="file" name="image" accept="image/jpeg,image/png,image/webp"
                        onChange={e => { const f = e.target.files?.[0]; setImagePreview(f ? URL.createObjectURL(f) : null); }}
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                </label>
            </FormField>

            {/* Current image (editing a category that already has one) */}
            {currentCategoryImage && !imagePreview && (
                <div style={{ marginTop: -4 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t('content.categories.currentImage')}</span>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img src={currentCategoryImage} alt="current" style={{ height: 72, borderRadius: 10, objectFit: 'cover', display: 'block' }} />
                    </div>
                </div>
            )}
        </FormModal>
    );
}
