'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { mockRegistrations } from '@/mocks/providers';
import type { ProviderRegistration } from '@/types/provider';
import { Check, X, FileText, Clock } from 'lucide-react';
import styles from './page.module.css';

export default function RegistrationsPage() {
    const { t } = useTranslation();
    const [registrations, setRegistrations] = useState(mockRegistrations);

    const handleAction = (id: string, action: 'approved' | 'rejected') => {
        setRegistrations(prev =>
            prev.map(r => r.id === id ? { ...r, status: action, reviewed_at: new Date().toISOString() } : r)
        );
    };

    const pending = registrations.filter(r => r.status === 'pending');
    const reviewed = registrations.filter(r => r.status !== 'pending');

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{t('sidebar.registrations')}</h1>
                <span className={styles.badge}>{pending.length} pending</span>
            </div>

            {pending.length === 0 && (
                <div className={styles.emptyState}>
                    <Check size={48} strokeWidth={1} />
                    <p>No pending registrations</p>
                </div>
            )}

            {pending.map(reg => (
                <RegistrationCard key={reg.id} registration={reg} onAction={handleAction} t={t} />
            ))}

            {reviewed.length > 0 && (
                <>
                    <h2 className={styles.sectionTitle}>Recently Reviewed</h2>
                    {reviewed.map(reg => (
                        <RegistrationCard key={reg.id} registration={reg} onAction={handleAction} t={t} />
                    ))}
                </>
            )}
        </div>
    );
}

function RegistrationCard({
    registration: reg,
    onAction,
    t,
}: {
    registration: ProviderRegistration;
    onAction: (id: string, action: 'approved' | 'rejected') => void;
    t: (key: string) => string;
}) {
    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={styles.cardInfo}>
                    <div className={styles.cardAvatar}>{reg.business_name.charAt(0)}</div>
                    <div>
                        <div className={styles.cardName}>{reg.business_name}</div>
                        <div className={styles.cardMeta}>
                            {reg.provider_name} &middot; {reg.email} &middot;{' '}
                            <span className={styles.capitalize}>{reg.business_category}</span>
                        </div>
                    </div>
                </div>
                <div className={styles.cardRight}>
                    <StatusBadge status={reg.status} />
                    <span className={styles.timeAgo}>
                        <Clock size={12} /> {new Date(reg.submitted_at).toLocaleDateString()}
                    </span>
                </div>
            </div>

            <div className={styles.documents}>
                <span className={styles.docLabel}>Documents:</span>
                {reg.documents.map((doc, i) => (
                    <span key={i} className={`${styles.docChip} ${doc.verified ? styles.docVerified : ''}`}>
                        <FileText size={12} /> {doc.type} {doc.verified && <Check size={12} />}
                    </span>
                ))}
            </div>

            {reg.status === 'pending' && (
                <PermissionGate module="providers" action="edit">
                    <div className={styles.cardActions}>
                        <button
                            className={styles.approveBtn}
                            onClick={() => onAction(reg.id, 'approved')}
                        >
                            <Check size={16} /> {t('providers.approve')}
                        </button>
                        <button
                            className={styles.rejectBtn}
                            onClick={() => onAction(reg.id, 'rejected')}
                        >
                            <X size={16} /> {t('providers.reject')}
                        </button>
                    </div>
                </PermissionGate>
            )}
        </div>
    );
}
