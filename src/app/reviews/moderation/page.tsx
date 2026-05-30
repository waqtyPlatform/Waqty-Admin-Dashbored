'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { useToast } from '@/components/ui';
import { mockReviews } from '@/mocks/reviews';
import type { ReviewRow, ReviewStatus } from '@/types/review';
import { Star, CheckCircle, Flag, EyeOff, Eye } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';

const STATUSES: (ReviewStatus | 'all')[] = ['all', 'pending', 'published', 'flagged', 'hidden'];

export default function ReviewModerationPage() {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const [reviews, setReviews] = useState<ReviewRow[]>(mockReviews);
    const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all');
    // Modal for capturing a reason / admin_response when flagging or hiding.
    const [action, setAction] = useState<{ review: ReviewRow; to: 'flagged' | 'hidden' } | null>(null);
    const [reasonText, setReasonText] = useState('');

    const filtered = reviews.filter(r => statusFilter === 'all' || r.status === statusFilter);
    const counts = {
        pending: reviews.filter(r => r.status === 'pending').length,
        published: reviews.filter(r => r.status === 'published').length,
        flagged: reviews.filter(r => r.status === 'flagged').length,
        hidden: reviews.filter(r => r.status === 'hidden').length,
    };

    const transition = (uuid: string, patch: Partial<ReviewRow>) => {
        setReviews(prev => prev.map(r => r.uuid === uuid ? { ...r, ...patch, updated_at: new Date().toISOString() } : r));
    };

    const publish = (r: ReviewRow) => {
        transition(r.uuid, { status: 'published', flag_reason: null });
        addToast('success', `Review by ${r.user_name} published`);
    };

    const openAction = (review: ReviewRow, to: 'flagged' | 'hidden') => {
        setAction({ review, to });
        setReasonText(to === 'flagged' ? (review.flag_reason ?? '') : (review.admin_response ?? ''));
    };

    const confirmAction = () => {
        if (!action) return;
        if (action.to === 'flagged') {
            transition(action.review.uuid, { status: 'flagged', flag_reason: reasonText.trim() || 'Flagged for review' });
            addToast('warning', `Review flagged`);
        } else {
            transition(action.review.uuid, { status: 'hidden', admin_response: reasonText.trim() || null });
            addToast('warning', `Review hidden`);
        }
        setAction(null);
        setReasonText('');
    };

    return (
        <div className={shared.page}>
            <h1 className={shared.pageTitle}>{t('reviews.moderation.title')}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: -8 }}>{t('reviews.moderation.subtitle')}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {[
                    { label: t('reviews.moderation.pending'), value: counts.pending, color: 'var(--color-warning)' },
                    { label: t('reviews.published'), value: counts.published, color: 'var(--color-success)' },
                    { label: t('reviews.moderation.flagged'), value: counts.flagged, color: 'var(--color-warning)' },
                    { label: t('reviews.hidden'), value: counts.hidden, color: 'var(--color-error)' },
                ].map(s => (
                    <div key={s.label} className={shared.summaryCard} style={{ borderTop: `3px solid ${s.color}` }}>
                        <div className={shared.summaryLabel}>{s.label}</div>
                        <div className={shared.summaryValue}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '16px 0' }}>
                {STATUSES.map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)} style={{
                        padding: '6px 14px', borderRadius: 9999, border: '1px solid var(--border-color)', cursor: 'pointer',
                        background: statusFilter === s ? 'var(--color-primary-500)' : 'var(--bg-primary)',
                        color: statusFilter === s ? '#fff' : 'var(--text-secondary)', fontSize: '0.8125rem', textTransform: 'capitalize',
                    }}>{s === 'all' ? t('reviews.allStatus') : s}</button>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-tertiary)' }}>No reviews in this state.</div>
                ) : filtered.map(r => (
                    <div key={r.uuid} className={shared.infoCard} style={{ padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontWeight: 600 }}>{r.user_name} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>on</span> {r.provider_name}</div>
                                <div style={{ display: 'flex', gap: 2, margin: '4px 0' }}>
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <Star key={i} size={14} fill={i < r.rating ? '#f59e0b' : 'none'} stroke={i < r.rating ? '#f59e0b' : 'var(--text-tertiary)'} />
                                    ))}
                                    <span style={{ marginInlineStart: 8, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{new Date(r.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <StatusBadge status={r.status} />
                        </div>

                        {r.comment && <p style={{ margin: '8px 0', color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{r.comment}</p>}
                        {r.flag_reason && <div style={{ fontSize: '0.8125rem', color: 'var(--color-warning)' }}><Flag size={12} style={{ verticalAlign: 'middle' }} /> {r.flag_reason} {r.reported_count > 0 && `· ${r.reported_count} reports`}</div>}
                        {r.admin_response && <div style={{ marginTop: 6, padding: 8, background: 'var(--bg-tertiary)', borderRadius: 6, fontSize: '0.8125rem' }}><strong>{t('reviews.moderation.adminResponse')}:</strong> {r.admin_response}</div>}

                        <PermissionGate module="reviews" action="edit">
                            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                                {r.status !== 'published' && (
                                    <ModBtn icon={<CheckCircle size={14} />} label={r.status === 'hidden' ? t('reviews.unhide') : t('reviews.moderation.publish')} color="var(--color-success)" onClick={() => publish(r)} />
                                )}
                                {r.status !== 'flagged' && r.status !== 'hidden' && (
                                    <ModBtn icon={<Flag size={14} />} label={t('reviews.moderation.flag')} color="var(--color-warning)" onClick={() => openAction(r, 'flagged')} />
                                )}
                                {r.status !== 'hidden' && (
                                    <ModBtn icon={<EyeOff size={14} />} label={t('reviews.hide')} color="var(--color-error)" onClick={() => openAction(r, 'hidden')} />
                                )}
                                {r.status === 'hidden' && (
                                    <ModBtn icon={<Eye size={14} />} label={t('reviews.unhide')} color="var(--color-success)" onClick={() => publish(r)} />
                                )}
                            </div>
                        </PermissionGate>
                    </div>
                ))}
            </div>

            <FormModal
                open={!!action}
                onClose={() => setAction(null)}
                title={action?.to === 'flagged' ? t('reviews.moderation.flagTitle') : t('reviews.moderation.hideTitle')}
                submitLabel={action?.to === 'flagged' ? t('reviews.moderation.flag') : t('reviews.hide')}
                submitVariant="danger"
                onSubmit={e => { e.preventDefault(); confirmAction(); }}
            >
                <FormField label={action?.to === 'flagged' ? t('reviews.moderation.flagReason') : t('reviews.moderation.adminResponse')} required>
                    <textarea value={reasonText} onChange={e => setReasonText(e.target.value)} rows={3} className={shared.formInput} style={{ resize: 'vertical' }} />
                </FormField>
            </FormModal>
        </div>
    );
}

function ModBtn({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color: string; onClick: () => void }) {
    return (
        <button onClick={onClick} style={{ padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', fontFamily: 'var(--font-sans)' }}>
            {icon} {label}
        </button>
    );
}
