'use client';

import React, { useState, useEffect } from 'react';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { useTranslation } from '@/hooks/useTranslation';
import { formatMoney } from '@/lib/market';
import type { ProviderSubscriptionRow } from '@/types/subscription';
import shared from '@/components/admin/shared.module.css';

interface DiscountModalProps {
    sub: ProviderSubscriptionRow | null;
    onClose: () => void;
    /** Called with the discount percentage (1-100) when applied. */
    onApply: (pct: number) => void;
}

export function DiscountModal({ sub, onClose, onApply }: DiscountModalProps) {
    const { t } = useTranslation();
    const [discountValue, setDiscountValue] = useState('');

    useEffect(() => { if (sub) setDiscountValue(''); }, [sub]);

    return (
        <FormModal
            open={!!sub}
            onClose={onClose}
            title={`${t('subscriptions.applyDiscount')} — ${sub?.provider_name}`}
            submitLabel={t('subscriptions.applyDiscount')}
            onSubmit={e => { e.preventDefault(); if (discountValue) onApply(Number(discountValue)); }}
        >
            {sub && (
                <>
                    <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: '0.875rem' }}>
                        <strong>{t('subscriptions.currentAmount')}:</strong> {formatMoney(sub.amount)} / {sub.billing_cycle}
                    </div>
                    <FormField label={t('subscriptions.discountPercentage')} required>
                        <input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} required min={1} max={100} className={shared.formInput} placeholder="e.g. 20" />
                    </FormField>
                    {discountValue && (
                        <div style={{ padding: 8, background: 'var(--color-success-light)', borderRadius: 6, fontSize: '0.8125rem', color: '#065f46' }}>
                            {t('subscriptions.newAmount')}: <strong>{formatMoney(Math.round(sub.amount * (1 - Number(discountValue) / 100)))}</strong> ({discountValue}% {t('subscriptions.off')})
                        </div>
                    )}
                </>
            )}
        </FormModal>
    );
}
