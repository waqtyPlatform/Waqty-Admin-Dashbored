'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { FormModal, FormField } from '@/components/admin/FormModal';
import shared from '@/components/admin/shared.module.css';

interface CommissionModalProps {
    open: boolean;
    onClose: () => void;
    /** The currently-saved commission as a percent (or null when unknown). */
    savedCommissionPct: number | null;
    /** Initial value for the rate input — seeded from the saved fraction (X4a). */
    initialRate: string;
    /** Parent validates 0..50 + toasts. */
    onSubmit: (pct: number) => void;
}

export function CommissionModal({ open, onClose, savedCommissionPct, initialRate, onSubmit }: CommissionModalProps) {
    const { t } = useTranslation();
    const [commissionRate, setCommissionRate] = useState('');
    const [commissionDate, setCommissionDate] = useState('');
    const [commissionReason, setCommissionReason] = useState('');

    // Seed the inputs each time the modal opens (mirrors the old `openCommission`).
    useEffect(() => {
        if (open) {
            setCommissionRate(initialRate);
            setCommissionDate(new Date().toISOString().slice(0, 10));
            setCommissionReason('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    return (
        <FormModal
            open={open}
            onClose={onClose}
            title={t('providers.adjustCommission')}
            submitLabel={t('providers.saveCommission')}
            onSubmit={e => { e.preventDefault(); onSubmit(Number(commissionRate)); }}
        >
            <div style={{ padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                <strong>{t('providers.currentRate')}:</strong> {savedCommissionPct != null ? `${savedCommissionPct}%` : '—'}
            </div>
            <FormField label={t('providers.newRate')} required>
                <input type="number" min={0} max={50} step="0.5" value={commissionRate} onChange={e => setCommissionRate(e.target.value)} required className={shared.formInput} />
            </FormField>
            <FormField label={t('providers.effectiveDate')} required>
                <input type="date" value={commissionDate} onChange={e => setCommissionDate(e.target.value)} required className={shared.formInput} />
            </FormField>
            <FormField label={t('common.reason')} required>
                <textarea value={commissionReason} onChange={e => setCommissionReason(e.target.value)} required rows={3} className={shared.formInput} style={{ resize: 'vertical' }} placeholder={t('providers.commissionPlaceholder')} />
            </FormField>
        </FormModal>
    );
}
