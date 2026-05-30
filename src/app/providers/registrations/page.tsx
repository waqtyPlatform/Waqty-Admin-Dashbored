'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { mockRegistrations } from '@/mocks/providers';
import type { ProviderRegistration } from '@/types/provider';
import { Check, X, Clock, Building2, FileText, UserCheck } from 'lucide-react';
import styles from './page.module.css';
import shared from '@/components/admin/shared.module.css';

type StatusFilter = ProviderRegistration['status'] | 'all';
const FILTERS: StatusFilter[] = ['all', 'pending', 'approved', 'rejected'];

export default function RegistrationsPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { addToast } = useToast();

    const [registrations, setRegistrations] = useState<ProviderRegistration[]>(mockRegistrations);
    const [filter, setFilter] = useState<StatusFilter>('pending');
    const [approveTarget, setApproveTarget] = useState<ProviderRegistration | null>(null);
    const [rejectTarget, setRejectTarget] = useState<ProviderRegistration | null>(null);
    const [note, setNote] = useState('');
    const [reason, setReason] = useState('');

    const list = registrations.filter(r => filter === 'all' || r.status === filter);
    const counts = {
        pending: registrations.filter(r => r.status === 'pending').length,
        approved: registrations.filter(r => r.status === 'approved').length,
        rejected: registrations.filter(r => r.status === 'rejected').length,
    };

    // Explicit decision — stamps who/when/why and moves the registration's status.
    const decide = (id: string, status: 'approved' | 'rejected', extra: Partial<ProviderRegistration>) => {
        setRegistrations(prev => prev.map(r => r.id === id ? {
            ...r,
            status,
            reviewed_by: user?.uuid ?? null,
            reviewed_by_name: user?.name ?? null,
            reviewed_at: new Date().toISOString(),
            ...extra,
        } : r));
    };

    const confirmApprove = () => {
        if (!approveTarget) return;
        decide(approveTarget.id, 'approved', { approval_note: note.trim() || null, rejection_reason: null });
        addToast('success', `${approveTarget.business_name} approved`);
        setApproveTarget(null);
        setNote('');
    };

    const confirmReject = () => {
        if (!rejectTarget) return;
        if (!reason.trim()) { addToast('error', t('providers.registrations.reasonRequired')); return; }
        decide(rejectTarget.id, 'rejected', { rejection_reason: reason.trim() });
        addToast('warning', `${rejectTarget.business_name} rejected`);
        setRejectTarget(null);
        setReason('');
    };

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{t('sidebar.registrations')}</h1>
                <span className={styles.badge}>{counts.pending} {t('providers.registrations.pending')}</span>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {FILTERS.map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: '6px 14px', borderRadius: 9999, border: '1px solid var(--border-color)', cursor: 'pointer',
                        background: filter === f ? 'var(--color-primary-500)' : 'var(--bg-primary)',
                        color: filter === f ? '#fff' : 'var(--text-secondary)', fontSize: '0.8125rem', textTransform: 'capitalize',
                    }}>{f === 'all' ? t('reviews.allStatus') : t(`providers.registrations.${f}`)}</button>
                ))}
            </div>

            {list.length === 0 && (
                <div className={styles.emptyState}>
                    <Check size={48} strokeWidth={1} />
                    <p>{t('providers.registrations.none')}</p>
                </div>
            )}

            {list.map(reg => (
                <div key={reg.id} className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardInfo}>
                            <div className={styles.cardAvatar}><Building2 size={20} /></div>
                            <div>
                                <div className={styles.cardName}>{reg.business_name}</div>
                                <div className={styles.cardMeta}>
                                    {reg.provider_name} &middot; {reg.email} &middot; {reg.phone} &middot; <span className={styles.capitalize}>{reg.business_category}</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.cardRight}>
                            <StatusBadge status={reg.status} />
                            <span className={styles.timeAgo}><Clock size={12} /> {new Date(reg.submitted_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '8px 0', fontSize: '0.8125rem' }}>
                        {reg.documents.map(d => (
                            <span key={d.type} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: d.verified ? 'var(--color-success)' : 'var(--text-tertiary)' }}>
                                <FileText size={13} /> {d.type}{d.verified ? ' ✓' : ''}
                            </span>
                        ))}
                    </div>

                    {/* Audit trail for decided registrations */}
                    {reg.status !== 'pending' && reg.reviewed_at && (
                        <div style={{ padding: 10, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span><UserCheck size={13} style={{ verticalAlign: 'middle' }} /> <strong>{reg.status === 'approved' ? t('providers.registrations.approvedBy') : t('providers.registrations.rejectedBy')}:</strong> {reg.reviewed_by_name ?? '—'} &middot; {new Date(reg.reviewed_at).toLocaleString()}</span>
                            {reg.rejection_reason && <span style={{ color: 'var(--color-error)' }}><strong>{t('common.reason')}:</strong> {reg.rejection_reason}</span>}
                            {reg.approval_note && <span style={{ color: 'var(--text-secondary)' }}><strong>{t('providers.registrations.note')}:</strong> {reg.approval_note}</span>}
                        </div>
                    )}

                    {reg.status === 'pending' && (
                        <PermissionGate module="providers" action="edit">
                            <div className={styles.cardActions}>
                                <button className={styles.approveBtn} onClick={() => { setApproveTarget(reg); setNote(''); }}>
                                    <Check size={16} /> {t('providers.approve')}
                                </button>
                                <button className={styles.rejectBtn} onClick={() => { setRejectTarget(reg); setReason(''); }}>
                                    <X size={16} /> {t('providers.reject')}
                                </button>
                            </div>
                        </PermissionGate>
                    )}
                </div>
            ))}

            <FormModal open={!!approveTarget} onClose={() => setApproveTarget(null)} title={`${t('providers.approve')} — ${approveTarget?.business_name ?? ''}`} submitLabel={t('providers.approve')} onSubmit={e => { e.preventDefault(); confirmApprove(); }}>
                <FormField label={t('providers.registrations.note')}>
                    <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} className={shared.formInput} style={{ resize: 'vertical', width: '100%' }} placeholder={t('providers.registrations.notePlaceholder')} />
                </FormField>
            </FormModal>

            <FormModal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title={`${t('providers.reject')} — ${rejectTarget?.business_name ?? ''}`} submitLabel={t('providers.reject')} submitVariant="danger" onSubmit={e => { e.preventDefault(); confirmReject(); }}>
                <FormField label={t('common.reason')} required>
                    <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} required className={shared.formInput} style={{ resize: 'vertical', width: '100%' }} placeholder={t('providers.registrations.reasonPlaceholder')} />
                </FormField>
            </FormModal>
        </div>
    );
}
