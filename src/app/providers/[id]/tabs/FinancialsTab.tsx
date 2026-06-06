'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { formatMoney } from '@/lib/market';
import type { Provider } from '@/types/provider';
import { Percent, Download } from 'lucide-react';
import { InfoRow } from '../_components/InfoRow';
import styles from '../page.module.css';

interface FinancialsTabProps {
    provider: Provider | undefined;
    /** Saved commission as a percent (model stores a 0..1 fraction). */
    savedCommissionPct: number | null;
    onAdjustCommission: () => void;
    onExport: () => void;
}

export function FinancialsTab({ provider, savedCommissionPct, onAdjustCommission, onExport }: FinancialsTabProps) {
    const { t } = useTranslation();

    return (
        <div className={styles.overviewGrid}>
            <div className={styles.infoCard}>
                <h3>{t('providers.financials.summary')}</h3>
                {provider ? (
                    <div className={styles.infoRows}>
                        <InfoRow label={t('providers.revenue')} value={formatMoney(provider.total_revenue)} />
                        <InfoRow label={t('providers.bookings')} value={provider.total_bookings.toLocaleString()} />
                        <InfoRow label={t('providers.financials.commissionRate')} value={savedCommissionPct != null ? `${savedCommissionPct}%` : '—'} />
                        <InfoRow label={t('providers.financials.commissionEarned')} value={formatMoney(Math.round(provider.total_revenue * (provider.commission_rate ?? 0)))} />
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                        {t('providers.financials.noData')}
                    </div>
                )}
            </div>
            <div className={styles.infoCard}>
                <h3>{t('providers.financials.actions')}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                    <PermissionGate module="providers" action="edit">
                        <button
                            style={{ padding: 'var(--space-3) var(--space-4)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
                            onClick={onAdjustCommission}
                            disabled={!provider}
                        >
                            <Percent size={16} /> {t('providers.adjustCommission')}
                        </button>
                    </PermissionGate>
                    <button
                        style={{ padding: 'var(--space-3) var(--space-4)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', color: 'var(--color-info)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
                        onClick={onExport}
                        disabled={!provider}
                    >
                        <Download size={16} /> {t('providers.financials.export')}
                    </button>
                </div>
            </div>
        </div>
    );
}
