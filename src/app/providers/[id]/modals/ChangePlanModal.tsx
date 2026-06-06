'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { mockPlans } from '@/mocks/subscriptions';
import { formatMoney } from '@/lib/market';
import shared from '@/components/admin/shared.module.css';

interface ChangePlanModalProps {
    open: boolean;
    onClose: () => void;
    /** Parent looks up the plan, applies it, and toasts. */
    onSubmit: (planId: string) => void;
}

export function ChangePlanModal({ open, onClose, onSubmit }: ChangePlanModalProps) {
    const { t } = useTranslation();
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');

    const handleClose = () => {
        setSelectedPlanId('');
        onClose();
    };

    return (
        <FormModal
            open={open}
            onClose={handleClose}
            title={t('providers.changePlan')}
            submitLabel={t('providers.applyChange')}
            onSubmit={e => { e.preventDefault(); onSubmit(selectedPlanId); }}
        >
            <div style={{ padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                <strong>{t('providers.currentPlan')}:</strong> {t('providers.noPlan')}
            </div>
            <FormField label={t('providers.newPlan')} required>
                <select value={selectedPlanId} onChange={e => setSelectedPlanId(e.target.value)} required className={shared.formInput}>
                    <option value="">{t('providers.selectPlan')}</option>
                    {mockPlans.filter(p => p.active).map(p => (
                        <option key={p.uuid} value={p.uuid}>{p.name} — {formatMoney(p.price_monthly)}/mo ({formatMoney(p.price_yearly)}/yr)</option>
                    ))}
                </select>
            </FormField>
        </FormModal>
    );
}
