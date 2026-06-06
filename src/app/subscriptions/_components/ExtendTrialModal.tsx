'use client';

import React, { useState, useEffect } from 'react';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { useTranslation } from '@/hooks/useTranslation';
import type { ProviderSubscriptionRow } from '@/types/subscription';
import shared from '@/components/admin/shared.module.css';

interface ExtendTrialModalProps {
    sub: ProviderSubscriptionRow | null;
    onClose: () => void;
    /** Called with the requested number of days + reason; parent clamps + applies. */
    onExtend: (days: number, reason: string) => void;
}

export function ExtendTrialModal({ sub, onClose, onExtend }: ExtendTrialModalProps) {
    const { t } = useTranslation();
    const [extendDays, setExtendDays] = useState('7');
    const [extendReason, setExtendReason] = useState('customer_request');

    useEffect(() => {
        if (sub) { setExtendDays('7'); setExtendReason('customer_request'); }
    }, [sub]);

    return (
        <FormModal
            open={!!sub}
            onClose={onClose}
            title={`${t('subscriptions.extendTrial')} — ${sub?.provider_name}`}
            submitLabel={t('subscriptions.extendTrial')}
            onSubmit={e => { e.preventDefault(); onExtend(Number(extendDays) || 0, extendReason); }}
        >
            {sub && (
                <>
                    <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: '0.875rem' }}>
                        <strong>{t('subscriptions.currentTrialEnds')}:</strong> {sub.trial_end ? new Date(sub.trial_end).toLocaleDateString() : '—'}
                    </div>
                    <FormField label={t('subscriptions.additionalDays')} required>
                        <input type="number" value={extendDays} onChange={e => setExtendDays(e.target.value)} required min={1} max={90} className={shared.formInput} />
                    </FormField>
                    <FormField label={t('common.reason')} required>
                        <select value={extendReason} onChange={e => setExtendReason(e.target.value)} className={shared.formInput}>
                            <option value="customer_request">{t('subscriptions.customerRequest')}</option>
                            <option value="onboarding_delay">{t('subscriptions.onboardingDelay')}</option>
                            <option value="technical_issue">{t('subscriptions.technicalIssue')}</option>
                            <option value="goodwill">{t('subscriptions.goodwill')}</option>
                            <option value="sales_hold">{t('subscriptions.salesHold')}</option>
                        </select>
                    </FormField>
                </>
            )}
        </FormModal>
    );
}
