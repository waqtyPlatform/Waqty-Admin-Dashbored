'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import type { AdminProviderObject } from '@/lib/api';
import { Building2, Users, CalendarDays, DollarSign } from 'lucide-react';
import styles from '../page.module.css';

interface ProviderStatsCardsProps {
    apiProvider: AdminProviderObject;
    /** Resolved branch count (live list length OR mock fallback). */
    branchesCount: number;
    /** Resolved employee count (live list length OR mock fallback). */
    employeesCount: number;
}

export function ProviderStatsCards({ apiProvider, branchesCount, employeesCount }: ProviderStatsCardsProps) {
    const { t } = useTranslation();

    const stats = [
        { label: t('providers.branches'), value: branchesCount, icon: <Building2 size={18} /> },
        { label: t('providers.employees'), value: employeesCount, icon: <Users size={18} /> },
        { label: t('providers.detail.joined'), value: new Date(apiProvider.created_at).toLocaleDateString(), icon: <CalendarDays size={18} /> },
        { label: t('providers.category'), value: apiProvider.category?.name ?? '—', icon: <DollarSign size={18} /> },
    ];

    return (
        <div className={styles.statsGrid}>
            {stats.map(s => (
                <div key={s.label} className={styles.statCard}><div className={styles.statIcon}>{s.icon}</div><div><div className={styles.statValue}>{s.value}</div><div className={styles.statLabel}>{s.label}</div></div></div>
            ))}
        </div>
    );
}
