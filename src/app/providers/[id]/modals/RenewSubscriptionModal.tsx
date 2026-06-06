'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { FormModal, FormField } from '@/components/admin/FormModal';
import shared from '@/components/admin/shared.module.css';

interface RenewSubscriptionModalProps {
    open: boolean;
    onClose: () => void;
    providerName: string;
    onSubmit: () => void;
}

export function RenewSubscriptionModal({ open, onClose, providerName, onSubmit }: RenewSubscriptionModalProps) {
    const { t } = useTranslation();
    const [renewCycle, setRenewCycle] = useState<'monthly' | 'yearly'>('monthly');

    return (
        <FormModal
            open={open}
            onClose={onClose}
            title={t('providers.renewSubscription') + ' — ' + providerName}
            submitLabel={t('providers.renew')}
            onSubmit={e => { e.preventDefault(); onSubmit(); }}
        >
            <div style={{ padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                <strong>{t('providers.currentStatus')}:</strong> {t('common.active')}
            </div>
            <FormField label={t('providers.billingCycle')} required>
                <select value={renewCycle} onChange={e => setRenewCycle(e.target.value as 'monthly' | 'yearly')} className={shared.formInput}>
                    <option value="monthly">{t('providers.monthlyDays')}</option>
                    <option value="yearly">{t('providers.yearlyDays')}</option>
                </select>
            </FormField>
            <div style={{ padding: 'var(--space-2)', background: 'var(--color-success-light)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: '#065f46' }}>
                {t('providers.newPeriodEnds')}: <strong>{new Date(Date.now() + (renewCycle === 'yearly' ? 365 : 30) * 86400000).toLocaleDateString()}</strong>
            </div>
        </FormModal>
    );
}
