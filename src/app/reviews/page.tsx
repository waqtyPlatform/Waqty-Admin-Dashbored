'use client';

import React, { useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { useApiQuery, useApiMutation } from '@/hooks/useApiQuery';
import { adminRatingsApi, type RatingObject } from '@/lib/api';
import { Star, EyeOff, Eye, Trash2, Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function ReviewsPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const statusFilter = searchParams.get('status') || 'all';
    const setStatusFilter = useCallback((value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'all') params.delete('status');
        else params.set('status', value);
        router.replace(`${pathname}${params.toString() ? `?${params}` : ''}`, { scroll: false });
    }, [searchParams, pathname, router]);

    const apiFilters = statusFilter === 'published'
        ? { active: true }
        : statusFilter === 'hidden'
        ? { active: false }
        : statusFilter === 'deleted'
        ? { trashed: 'only' as const }
        : {};

    const { data: ratings, loading, error, refetch } = useApiQuery(
        () => adminRatingsApi.list({ per_page: 100, ...apiFilters }),
        [statusFilter]
    );

    const { data: stats, refetch: refetchStats } = useApiQuery(
        () => adminRatingsApi.stats(),
        []
    );

    const { mutate: toggleActive } = useApiMutation(
        (args: { uuid: string; active: boolean }) => adminRatingsApi.toggleActive(args.uuid, args.active)
    );
    const { mutate: deleteRating } = useApiMutation((uuid: string) => adminRatingsApi.delete(uuid));

    const handleToggle = async (rating: RatingObject, active: boolean) => {
        await toggleActive({ uuid: rating.uuid, active });
        refetch();
        refetchStats();
    };

    const handleDelete = async (uuid: string) => {
        await deleteRating(uuid);
        refetch();
        refetchStats();
    };

    const list = ratings ?? [];

    return (
        <div className={styles.page}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <h1 className={styles.title}>{t('reviews.title')}</h1>
                <Link href="/reviews/moderation" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--color-primary-500)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>
                    <ShieldCheck size={16} /> {t('reviews.moderation.title')}
                </Link>
            </div>

            <div className={styles.summaryGrid}>
                {[
                    { label: t('reviews.total'),    value: stats?.total     ?? '--', color: 'var(--text-primary)' },
                    { label: t('reviews.published'), value: stats?.published ?? '--', color: 'var(--color-success)' },
                    { label: t('reviews.hidden'),    value: stats?.hidden    ?? '--', color: 'var(--color-error)' },
                    { label: t('reviews.avgRating'), value: stats?.avg_rating != null ? Number(stats.avg_rating).toFixed(1) : '--', color: '#f59e0b' },
                ].map(s => (
                    <div key={s.label} className={styles.summaryCard}>
                        <span className={styles.summaryLabel}>{s.label}</span>
                        <span className={styles.summaryValue} style={{ color: s.color }}>{s.value}</span>
                    </div>
                ))}
            </div>

            <div className={styles.filters}>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={styles.filterSelect}>
                    <option value="all">{t('reviews.allStatus')}</option>
                    <option value="published">{t('reviews.published')}</option>
                    <option value="hidden">{t('reviews.hidden')}</option>
                    <option value="deleted">Deleted</option>
                </select>
            </div>

            {error && (
                <div style={{ padding: '12px 16px', background: 'var(--color-error-50)', color: 'var(--color-error)', borderRadius: 8, fontSize: '0.875rem' }}>
                    Failed to load ratings.
                </div>
            )}

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 10, color: 'var(--text-tertiary)' }}>
                    <Loader2 size={22} /> Loading...
                </div>
            ) : list.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-tertiary)' }}>No ratings found.</div>
            ) : (
                <div className={styles.reviewsList}>
                    {list.map(rating => {
                        const userName  = rating.user?.name ?? 'Unknown User';
                        const provider  = rating.booking?.provider?.name ?? '--';
                        const dateStr   = rating.created_at?.slice(0, 10) ?? '';
                        const isHidden  = !rating.active;
                        const isDeleted = !!rating.deleted_at;

                        return (
                            <div key={rating.uuid} className={`${styles.reviewCard} ${isDeleted ? styles.flaggedCard : ''}`}>
                                <div className={styles.reviewHeader}>
                                    <div className={styles.reviewUser}>
                                        <div className={styles.reviewAvatar}>{userName.charAt(0).toUpperCase()}</div>
                                        <div>
                                            <div className={styles.reviewUserName}>{userName}</div>
                                            <div className={styles.reviewMeta}>
                                                on <strong>{provider}</strong> &middot; {dateStr}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.reviewRight}>
                                        <div className={styles.stars}>
                                            {Array.from({ length: 5 }, (_, i) => (
                                                <Star key={i} size={14} fill={i < rating.rating ? '#f59e0b' : 'none'} stroke={i < rating.rating ? '#f59e0b' : 'var(--text-tertiary)'} />
                                            ))}
                                        </div>
                                        <StatusBadge status={isDeleted ? 'deleted' : isHidden ? 'hidden' : 'published'} />
                                    </div>
                                </div>

                                {rating.comment && <p className={styles.reviewComment}>{rating.comment}</p>}

                                <PermissionGate module="reviews" action="edit">
                                    <div className={styles.reviewActions}>
                                        {!isDeleted && (
                                            isHidden ? (
                                                <button className={styles.actionBtn} onClick={() => handleToggle(rating, true)}>
                                                    <Eye size={14} /> {t('reviews.unhide')}
                                                </button>
                                            ) : (
                                                <button className={`${styles.actionBtn} ${styles.dangerBtn}`} onClick={() => handleToggle(rating, false)}>
                                                    <EyeOff size={14} /> {t('reviews.hide')}
                                                </button>
                                            )
                                        )}
                                        <PermissionGate module="reviews" action="delete">
                                            {!isDeleted && (
                                                <button className={`${styles.actionBtn} ${styles.dangerBtn}`} onClick={() => handleDelete(rating.uuid)}>
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            )}
                                        </PermissionGate>
                                    </div>
                                </PermissionGate>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
