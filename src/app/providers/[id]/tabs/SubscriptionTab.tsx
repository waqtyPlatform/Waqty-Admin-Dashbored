'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { formatMoney } from '@/lib/market';
import type { ProviderSubscriptionRow } from '@/types/subscription';
import { ExternalLink, CreditCard, Percent, Trash2 } from 'lucide-react';
import { InfoRow } from '../_components/InfoRow';
import styles from '../page.module.css';

interface SubscriptionTabProps {
    /** The provider's live subscription row (flat plan OR commission billing). */
    providerSub: ProviderSubscriptionRow | undefined;
    onRenew: () => void;
    onChangePlan: () => void;
    onCancel: () => void;
}

export function SubscriptionTab({ providerSub, onRenew, onChangePlan, onCancel }: SubscriptionTabProps) {
    const { t } = useTranslation();

    return (
        <div className={styles.overviewGrid}>
            <div className={styles.infoCard}>
                <h3>{t('providers.currentPlan')}</h3>
                {providerSub ? (
                    <div className={styles.infoRows}>
                        <div className={styles.infoRow}>
                            <span>{t('subscriptions.billing')}</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', padding: '2px var(--space-2)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, background: providerSub.billing_type === 'commission' ? 'var(--color-primary-50)' : 'var(--bg-tertiary)', color: providerSub.billing_type === 'commission' ? 'var(--color-primary-700)' : 'var(--text-secondary)' }}>
                                {providerSub.billing_type === 'commission' ? <><Percent size={11} /> {t('subscriptions.typeCommission')}</> : t('subscriptions.typeSubscription')}
                            </span>
                        </div>
                        <InfoRow label={t('providers.plan')} value={providerSub.plan_name} />
                        {providerSub.billing_type === 'commission' ? (
                            <InfoRow label={t('subscriptions.feeRate')} value={`${Math.round((providerSub.commission_rate ?? 0) * 1000) / 10}% ${t('subscriptions.ofRevenue')}`} />
                        ) : (
                            <>
                                <InfoRow label={t('providers.billingCycle')} value={providerSub.billing_cycle === 'yearly' ? t('providers.yearly') : t('providers.monthly')} />
                                <InfoRow label={t('common.amount')} value={formatMoney(providerSub.amount)} />
                            </>
                        )}
                        <div className={styles.infoRow}><span>{t('common.status')}</span><span><StatusBadge status={providerSub.status} /></span></div>
                        <InfoRow label={t('subscriptions.renews')} value={new Date(providerSub.current_period_end).toLocaleDateString()} />
                    </div>
                ) : (
                    <div className={styles.infoRows}>
                        <InfoRow label={t('providers.plan')} value={t('providers.noPlan')} />
                        <InfoRow label={t('providers.billingCycle')} value={t('providers.monthly')} />
                        <InfoRow label={t('common.amount')} value="—" />
                    </div>
                )}
            </div>
            <div className={styles.infoCard}>
                <h3>{t('providers.subscriptionActions')}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                    <button style={{ padding: 'var(--space-3) var(--space-4)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }} onClick={onRenew}><CreditCard size={16} /> {t('providers.renewSubscription')}</button>
                    <button style={{ padding: 'var(--space-3) var(--space-4)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', color: 'var(--color-info)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }} onClick={onChangePlan}><ExternalLink size={16} /> {t('providers.changePlan')}</button>
                    <button style={{ padding: 'var(--space-3) var(--space-4)', border: '1px solid var(--color-error-light)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', color: 'var(--color-error)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }} onClick={onCancel}><Trash2 size={16} /> {t('providers.cancelSubscription')}</button>
                </div>
            </div>
        </div>
    );
}
