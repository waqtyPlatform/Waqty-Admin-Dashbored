'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { AdminProviderObject } from '@/lib/api';
import { InfoRow } from '../_components/InfoRow';
import styles from '../page.module.css';

export function OverviewTab({ apiProvider }: { apiProvider: AdminProviderObject }) {
    const { t, tn } = useTranslation();

    return (
        <div className={styles.overviewGrid}>
            <div className={styles.infoCard}>
                <h3>{t('providers.businessInfo')}</h3>
                <div className={styles.infoRows}>
                    <InfoRow label={t('common.name')} value={tn(apiProvider.name, apiProvider.name_ar)} />
                    <InfoRow label={t('common.email')} value={apiProvider.email} />
                    <InfoRow label={t('common.phone')} value={apiProvider.phone} />
                    <InfoRow label={t('providers.category')} value={apiProvider.category?.name ?? '—'} />
                    <InfoRow label={t('providers.detail.registered')} value={new Date(apiProvider.created_at).toLocaleDateString()} />
                    {apiProvider.deleted_at && <InfoRow label={t('providers.detail.deleted')} value={new Date(apiProvider.deleted_at).toLocaleDateString()} />}
                </div>
            </div>
            <div className={styles.infoCard}>
                <h3>{t('providers.detail.accountStatus')}</h3>
                <div className={styles.infoRows}>
                    <div className={styles.infoRow}><span>{t('common.active')}</span><span><StatusBadge status={apiProvider.active ? 'active' : 'inactive'} /></span></div>
                    <div className={styles.infoRow}><span>{t('common.blocked')}</span><span><StatusBadge status={apiProvider.blocked ? 'blocked' : 'active'} /></span></div>
                    <div className={styles.infoRow}><span>{t('common.banned')}</span><span><StatusBadge status={apiProvider.banned ? 'banned' : 'active'} /></span></div>
                </div>
            </div>
        </div>
    );
}
