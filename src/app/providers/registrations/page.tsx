'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useApiQuery, useApiMutation } from '@/hooks/useApiQuery';
import { adminProvidersApi, type AdminProviderObject } from '@/lib/api';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { Check, X, Clock, Building2, Loader2, ExternalLink } from 'lucide-react';
import styles from './page.module.css';

export default function RegistrationsPage() {
    const { t } = useTranslation();
    const router = useRouter();

    const { data: providers, loading, refetch } = useApiQuery(
        () => adminProvidersApi.list({ active: false, per_page: 50 }),
        []
    );

    const { mutate: activate, loading: activating } = useApiMutation(
        (uuid: string) => adminProvidersApi.toggleActive(uuid, true)
    );

    const { mutate: reject, loading: rejecting } = useApiMutation(
        (uuid: string) => adminProvidersApi.delete(uuid)
    );

    const [busyUuid, setBusyUuid] = useState<string | null>(null);

    const handleActivate = async (uuid: string) => {
        setBusyUuid(uuid);
        const result = await activate(uuid);
        setBusyUuid(null);
        if (result !== undefined) refetch();
    };

    const handleReject = async (uuid: string) => {
        setBusyUuid(uuid);
        const result = await reject(uuid);
        setBusyUuid(null);
        if (result !== undefined) refetch();
    };

    const list = providers ?? [];

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{t('sidebar.registrations')}</h1>
                {!loading && <span className={styles.badge}>{list.length} pending</span>}
            </div>

            {loading && (
                <div className={styles.emptyState}>
                    <Loader2 size={32} strokeWidth={1.5} style={{ animation: 'spin 1s linear infinite' }} />
                    <p>Loading registrations…</p>
                </div>
            )}

            {!loading && list.length === 0 && (
                <div className={styles.emptyState}>
                    <Check size={48} strokeWidth={1} />
                    <p>No pending registrations</p>
                </div>
            )}

            {list.map(provider => (
                <RegistrationCard
                    key={provider.uuid}
                    provider={provider}
                    busy={busyUuid === provider.uuid}
                    onActivate={handleActivate}
                    onReject={handleReject}
                    onView={() => router.push(`/providers/${provider.uuid}`)}
                    t={t}
                />
            ))}
        </div>
    );
}

function RegistrationCard({
    provider,
    busy,
    onActivate,
    onReject,
    onView,
    t,
}: {
    provider: AdminProviderObject;
    busy: boolean;
    onActivate: (uuid: string) => void;
    onReject: (uuid: string) => void;
    onView: () => void;
    t: (key: string) => string;
}) {
    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={styles.cardInfo}>
                    <div className={styles.cardAvatar}>
                        <Building2 size={20} />
                    </div>
                    <div>
                        <div className={styles.cardName}>{provider.name}</div>
                        <div className={styles.cardMeta}>
                            {provider.email}
                            {provider.phone && <> &middot; {provider.phone}</>}
                            {provider.category && <> &middot; <span className={styles.capitalize}>{provider.category.name}</span></>}
                        </div>
                    </div>
                </div>
                <div className={styles.cardRight}>
                    <span style={{ padding: '2px 10px', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 500, background: 'var(--color-warning-light)', color: '#92400e' }}>
                        Inactive
                    </span>
                    <span className={styles.timeAgo}>
                        <Clock size={12} /> {new Date(provider.created_at).toLocaleDateString()}
                    </span>
                    <button
                        onClick={onView}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
                    >
                        <ExternalLink size={13} /> View Details
                    </button>
                </div>
            </div>

            <PermissionGate module="providers" action="edit">
                <div className={styles.cardActions}>
                    <button
                        className={styles.approveBtn}
                        onClick={() => onActivate(provider.uuid)}
                        disabled={busy}
                    >
                        {busy ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={16} />}
                        {t('providers.approve')}
                    </button>
                    <button
                        className={styles.rejectBtn}
                        onClick={() => onReject(provider.uuid)}
                        disabled={busy}
                    >
                        {busy ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <X size={16} />}
                        {t('providers.reject')}
                    </button>
                </div>
            </PermissionGate>
        </div>
    );
}
