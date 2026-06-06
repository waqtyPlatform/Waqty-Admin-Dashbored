'use client';

import React, { useState, useEffect } from 'react';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { useTranslation } from '@/hooks/useTranslation';
import { formatMoney, toMajor } from '@/lib/market';
import type { ProviderSubscriptionRow } from '@/types/subscription';
import shared from '@/components/admin/shared.module.css';

interface RefundModalProps {
    sub: ProviderSubscriptionRow | null;
    onClose: () => void;
    /** Called with the MAJOR-unit amount, reason and destination; parent validates + closes on success. */
    onRefund: (amountMajor: number, reason: string, dest: 'wallet' | 'original') => void;
}

export function RefundModal({ sub, onClose, onRefund }: RefundModalProps) {
    const { t } = useTranslation();
    const [refundType, setRefundType] = useState<'full' | 'partial'>('partial');
    const [refundAmount, setRefundAmount] = useState('');
    const [refundReason, setRefundReason] = useState('');
    const [refundDest, setRefundDest] = useState<'wallet' | 'original'>('original');

    useEffect(() => {
        if (sub) { setRefundType('partial'); setRefundAmount(''); setRefundReason(''); setRefundDest('original'); }
    }, [sub]);

    if (!sub) return <FormModal open={false} onClose={onClose} title="" submitLabel="" onSubmit={e => e.preventDefault()}>{null}</FormModal>;

    const maxMajor = toMajor(sub.amount);

    return (
        <FormModal
            open={!!sub}
            onClose={onClose}
            title={`${t('subscriptions.refund')} — ${sub.provider_name}`}
            submitLabel={t('subscriptions.processRefund')}
            submitVariant="danger"
            onSubmit={e => {
                e.preventDefault();
                const amountMajor = refundType === 'full' ? maxMajor : Number(refundAmount);
                onRefund(amountMajor, refundReason, refundDest);
            }}
        >
            <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: '0.875rem' }}>
                <strong>{t('subscriptions.lastCharge')}:</strong> {formatMoney(sub.amount)} ({sub.billing_cycle})
            </div>
            <FormField label={t('subscriptions.refundType')} required>
                <div style={{ display: 'flex', gap: 16 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input type="radio" checked={refundType === 'partial'} onChange={() => setRefundType('partial')} /> {t('subscriptions.partial')}
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input type="radio" checked={refundType === 'full'} onChange={() => setRefundType('full')} /> {t('subscriptions.full')} ({formatMoney(sub.amount)})
                    </label>
                </div>
            </FormField>
            {refundType === 'partial' && (
                <FormField label={t('subscriptions.refundAmount')} required>
                    <input type="number" min={1} max={maxMajor} value={refundAmount} onChange={e => setRefundAmount(e.target.value)} required className={shared.formInput} placeholder={t('subscriptions.maxPlaceholder').replace('{max}', String(maxMajor))} />
                </FormField>
            )}
            <FormField label={t('subscriptions.refundDestination')} required>
                <select value={refundDest} onChange={e => setRefundDest(e.target.value as 'wallet' | 'original')} className={shared.formInput}>
                    <option value="original">{t('subscriptions.originalPaymentMethod')}</option>
                    <option value="wallet">{t('subscriptions.walletCredit')}</option>
                </select>
            </FormField>
            <FormField label={t('common.reason')} required>
                <textarea value={refundReason} onChange={e => setRefundReason(e.target.value)} required rows={3} className={shared.formInput} style={{ resize: 'vertical' }} placeholder={t('subscriptions.refundReasonPlaceholder')} />
            </FormField>
        </FormModal>
    );
}
