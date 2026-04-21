'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { useToast } from '@/components/ui';
import { mockReviews } from '@/mocks/reviews';
import type { Review } from '@/types/review';
import { Star, Flag, Eye, EyeOff, Check, MessageSquare, AlertTriangle, Reply } from 'lucide-react';
import styles from './page.module.css';

export default function ReviewsPage() {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [reviews, setReviews] = useState(mockReviews);
    const statusFilter = searchParams.get('status') || 'all';
    const setStatusFilter = useCallback((value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'all') params.delete('status');
        else params.set('status', value);
        router.replace(`${pathname}${params.toString() ? `?${params}` : ''}`, { scroll: false });
    }, [searchParams, pathname, router]);
    const [respondTo, setRespondTo] = useState<Review | null>(null);
    const [responseText, setResponseText] = useState('');

    const openRespond = (review: Review) => {
        setRespondTo(review);
        setResponseText(review.admin_response || '');
    };

    const handleSubmitResponse = () => {
        if (!respondTo) return;
        const trimmed = responseText.trim();
        setReviews(prev => prev.map(r => r.id === respondTo.id ? { ...r, admin_response: trimmed || undefined, updated_at: new Date().toISOString() } : r));
        addToast('success', trimmed ? 'Platform response saved' : 'Response removed');
        setRespondTo(null);
        setResponseText('');
    };

    const filtered = reviews.filter(r => statusFilter === 'all' || r.status === statusFilter);

    const handleAction = (id: string, newStatus: Review['status']) => {
        setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, updated_at: new Date().toISOString() } : r));
        addToast('success', `Review ${newStatus}`);
    };

    const summary = {
        total: reviews.length,
        published: reviews.filter(r => r.status === 'published').length,
        flagged: reviews.filter(r => r.status === 'flagged').length,
        hidden: reviews.filter(r => r.status === 'hidden').length,
        pending: reviews.filter(r => r.status === 'pending').length,
        avgRating: (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1),
    };

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>{t('reviews.title')}</h1>

            <div className={styles.summaryGrid}>
                {[
                    { label: 'Total', value: summary.total, color: 'var(--text-primary)' },
                    { label: 'Published', value: summary.published, color: 'var(--color-success)' },
                    { label: 'Flagged', value: summary.flagged, color: 'var(--color-warning)' },
                    { label: 'Hidden', value: summary.hidden, color: 'var(--color-error)' },
                    { label: 'Pending', value: summary.pending, color: 'var(--color-info)' },
                    { label: 'Avg Rating', value: summary.avgRating, color: '#f59e0b' },
                ].map(s => (
                    <div key={s.label} className={styles.summaryCard}>
                        <span className={styles.summaryLabel}>{s.label}</span>
                        <span className={styles.summaryValue} style={{ color: s.color }}>{s.value}</span>
                    </div>
                ))}
            </div>

            <div className={styles.filters}>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={styles.filterSelect}>
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="flagged">Flagged</option>
                    <option value="hidden">Hidden</option>
                    <option value="pending">Pending</option>
                </select>
            </div>

            <div className={styles.reviewsList}>
                {filtered.map(review => (
                    <div key={review.id} className={`${styles.reviewCard} ${review.status === 'flagged' ? styles.flaggedCard : ''}`}>
                        <div className={styles.reviewHeader}>
                            <div className={styles.reviewUser}>
                                <div className={styles.reviewAvatar}>{review.user_name.charAt(0)}</div>
                                <div>
                                    <div className={styles.reviewUserName}>{review.user_name}</div>
                                    <div className={styles.reviewMeta}>
                                        on <strong>{review.provider_name}</strong> &middot; {new Date(review.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.reviewRight}>
                                <div className={styles.stars}>
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <Star key={i} size={14} fill={i < review.rating ? '#f59e0b' : 'none'} stroke={i < review.rating ? '#f59e0b' : 'var(--text-tertiary)'} />
                                    ))}
                                </div>
                                <StatusBadge status={review.status} />
                                {review.reported_count > 0 && (
                                    <span className={styles.reportCount}>
                                        <AlertTriangle size={12} /> {review.reported_count} reports
                                    </span>
                                )}
                            </div>
                        </div>

                        <p className={styles.reviewComment}>{review.comment}</p>

                        {review.flag_reason && (
                            <div className={styles.flagReason}>
                                <Flag size={14} /> {review.flag_reason}
                            </div>
                        )}

                        {review.admin_response && (
                            <div className={styles.adminResponse}>
                                <MessageSquare size={14} /> <strong>Admin:</strong> {review.admin_response}
                            </div>
                        )}

                        <PermissionGate module="reviews" action="edit">
                            <div className={styles.reviewActions}>
                                {review.status !== 'published' && (
                                    <button className={styles.actionBtn} onClick={() => handleAction(review.id, 'published')}>
                                        <Check size={14} /> Publish
                                    </button>
                                )}
                                {review.status !== 'flagged' && review.status !== 'hidden' && (
                                    <button className={`${styles.actionBtn} ${styles.warnBtn}`} onClick={() => handleAction(review.id, 'flagged')}>
                                        <Flag size={14} /> Flag
                                    </button>
                                )}
                                {review.status !== 'hidden' && (
                                    <button className={`${styles.actionBtn} ${styles.dangerBtn}`} onClick={() => handleAction(review.id, 'hidden')}>
                                        <EyeOff size={14} /> Hide
                                    </button>
                                )}
                                {review.status === 'hidden' && (
                                    <button className={styles.actionBtn} onClick={() => handleAction(review.id, 'published')}>
                                        <Eye size={14} /> Unhide
                                    </button>
                                )}
                                <button className={styles.actionBtn} onClick={() => openRespond(review)}>
                                    <Reply size={14} /> {review.admin_response ? 'Edit Response' : 'Respond'}
                                </button>
                            </div>
                        </PermissionGate>
                    </div>
                ))}
            </div>

            <FormModal
                open={!!respondTo}
                onClose={() => { setRespondTo(null); setResponseText(''); }}
                title={respondTo?.admin_response ? 'Edit Platform Response' : 'Respond to Review'}
                onSubmit={handleSubmitResponse}
                submitLabel="Save response"
            >
                {respondTo && (
                    <>
                        <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, marginBottom: 12, fontSize: '0.875rem' }}>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>{respondTo.user_name} on {respondTo.provider_name}</div>
                            <div style={{ color: 'var(--text-secondary)' }}>{respondTo.comment}</div>
                        </div>
                        <FormField label="Platform response" required>
                            <textarea
                                value={responseText}
                                onChange={e => setResponseText(e.target.value)}
                                placeholder="Respond on behalf of Hagzy..."
                                rows={5}
                                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.875rem', color: 'var(--text-primary)', background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', outline: 'none', resize: 'vertical' }}
                            />
                        </FormField>
                    </>
                )}
            </FormModal>
        </div>
    );
}
