'use client';

import React, { useCallback, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ConfirmModal } from '@/components/admin/FormModal';
import { SlideOver, useToast } from '@/components/ui';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { useApiQuery, useApiMutation } from '@/hooks/useApiQuery';
import { adminRatingsApi, type RatingObject } from '@/lib/api';
import { Star, EyeOff, Eye, Trash2 } from 'lucide-react';
import styles from './page.module.css';

const iconBtn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-primary)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
};

const Stars = ({ value }: { value: number }) => (
    <span style={{ display: 'inline-flex', gap: 1, whiteSpace: 'nowrap' }}>
        {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={13} fill={i < value ? '#f59e0b' : 'none'} stroke={i < value ? '#f59e0b' : 'var(--text-tertiary)'} />
        ))}
    </span>
);

const statusOf = (r: RatingObject): 'deleted' | 'hidden' | 'published' =>
    r.deleted_at ? 'deleted' : !r.active ? 'hidden' : 'published';

export default function ReviewsPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { addToast } = useToast();

    const statusFilter = searchParams.get('status') || 'all';
    const [page, setPage] = useState(1);
    const setStatusFilter = useCallback((value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'all') params.delete('status');
        else params.set('status', value);
        setPage(1);
        router.replace(`${pathname}${params.toString() ? `?${params}` : ''}`, { scroll: false });
    }, [searchParams, pathname, router]);

    const apiFilters = statusFilter === 'published'
        ? { active: true }
        : statusFilter === 'hidden'
        ? { active: false }
        : statusFilter === 'deleted'
        ? { trashed: 'only' as const }
        : {};

    // Server-paginated (per_page 15 + page) — was fetching 100 rows then slicing
    // client-side, which silently dropped every row past 100.
    const { data: ratings, loading, error, meta, refetch } = useApiQuery(
        () => adminRatingsApi.list({ per_page: 15, page, ...apiFilters }),
        [statusFilter, page]
    );
    const { data: stats, refetch: refetchStats } = useApiQuery(() => adminRatingsApi.stats(), []);

    const { mutate: toggleActive } = useApiMutation(
        (args: { uuid: string; active: boolean }) => adminRatingsApi.toggleActive(args.uuid, args.active)
    );
    const { mutate: deleteRating } = useApiMutation((uuid: string) => adminRatingsApi.delete(uuid));

    const [selected, setSelected] = useState<string[]>([]);
    const [detail, setDetail] = useState<RatingObject | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string[] | null>(null);
    const [working, setWorking] = useState(false);

    const list = ratings ?? [];

    const refresh = () => { refetch(); refetchStats(); };

    const setActive = async (uuids: string[], active: boolean) => {
        if (uuids.length === 0) return;
        setWorking(true);
        await Promise.all(uuids.map(u => toggleActive({ uuid: u, active })));
        addToast('success', `${uuids.length} ${uuids.length > 1 ? t('reviews.reviewsLower') : t('reviews.reviewLower')} ${active ? t('reviews.published').toLowerCase() : t('reviews.hidden').toLowerCase()}`);
        setWorking(false);
        setSelected([]);
        setDetail(null);
        refresh();
    };

    const doDelete = async () => {
        if (!confirmDelete) return;
        setWorking(true);
        await Promise.all(confirmDelete.map(u => deleteRating(u)));
        addToast('success', `${confirmDelete.length} ${confirmDelete.length > 1 ? t('reviews.reviewsLower') : t('reviews.reviewLower')} ${t('reviews.deleted').toLowerCase()}`);
        setWorking(false);
        setConfirmDelete(null);
        setSelected([]);
        setDetail(null);
        refresh();
    };

    const columns: Column<RatingObject>[] = [
        {
            key: 'user',
            label: t('reviews.reviewer'),
            render: r => {
                const name = r.user?.name ?? t('reviews.unknownUser');
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--color-primary-100)', color: 'var(--color-primary-700)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-sm)', fontWeight: 600, flexShrink: 0 }}>
                            {name.charAt(0).toUpperCase()}
                        </span>
                        <span style={{ fontWeight: 500 }}>{name}</span>
                    </div>
                );
            },
        },
        { key: 'provider', label: t('reviews.providerCol'), render: r => r.booking?.provider?.name ?? '—' },
        { key: 'rating', label: t('reviews.ratingCol'), sortable: true, render: r => <Stars value={r.rating} /> },
        {
            key: 'comment',
            label: t('reviews.commentCol'),
            render: r =>
                r.comment ? (
                    <span style={{ display: 'block', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                        {r.comment}
                    </span>
                ) : (
                    <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>{t('reviews.noComment')}</span>
                ),
        },
        { key: 'created_at', label: t('common.date'), sortable: true, render: r => r.created_at?.slice(0, 10) ?? '' },
        { key: 'status', label: t('common.status'), sortable: true, render: r => <StatusBadge status={statusOf(r)} /> },
        {
            key: 'actions',
            label: '',
            width: '120px',
            render: r => {
                const st = statusOf(r);
                return (
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                        {st === 'hidden' && (
                            <button style={iconBtn} title={t('reviews.unhide')} onClick={() => setActive([r.uuid], true)}>
                                <Eye size={16} />
                            </button>
                        )}
                        {st === 'published' && (
                            <button style={{ ...iconBtn, color: 'var(--color-warning)' }} title={t('reviews.hide')} onClick={() => setActive([r.uuid], false)}>
                                <EyeOff size={16} />
                            </button>
                        )}
                        {st !== 'deleted' && (
                            <button style={{ ...iconBtn, color: 'var(--color-error)' }} title={t('common.delete')} onClick={() => setConfirmDelete([r.uuid])}>
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                );
            },
        },
    ];

    const statusForUuid = (u: string) => {
        const r = list.find(x => x.uuid === u);
        return r ? statusOf(r) : null;
    };
    const selectedPublishable = selected.filter(u => statusForUuid(u) === 'hidden');
    const selectedHideable = selected.filter(u => statusForUuid(u) === 'published');
    const selectedDeletable = selected.filter(u => statusForUuid(u) !== 'deleted');

    const FILTERS = [
        { key: 'all', label: t('reviews.allStatus') },
        { key: 'published', label: t('reviews.published') },
        { key: 'hidden', label: t('reviews.hidden') },
        { key: 'deleted', label: t('reviews.deleted') },
    ];

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>{t('reviews.title')}</h1>

            {/* Summary */}
            <div className={styles.summaryGrid}>
                {[
                    { label: t('reviews.total'), value: stats?.total ?? '--', color: 'var(--text-primary)' },
                    { label: t('reviews.published'), value: stats?.published ?? '--', color: 'var(--color-success)' },
                    { label: t('reviews.hidden'), value: stats?.hidden ?? '--', color: 'var(--color-error)' },
                    { label: t('reviews.avgRating'), value: stats?.avg_rating != null ? Number(stats.avg_rating).toFixed(1) : '--', color: '#f59e0b' },
                ].map(s => (
                    <div key={s.label} className={styles.summaryCard}>
                        <span className={styles.summaryLabel}>{s.label}</span>
                        <span className={styles.summaryValue} style={{ color: s.color }}>{s.value}</span>
                    </div>
                ))}
            </div>

            {/* Status filter pills */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', margin: 'var(--space-4) 0' }}>
                {FILTERS.map(f => {
                    const active = statusFilter === f.key;
                    return (
                        <button
                            key={f.key}
                            onClick={() => setStatusFilter(f.key)}
                            aria-pressed={active}
                            style={{
                                padding: '6px 12px',
                                borderRadius: 'var(--radius-full)',
                                border: `1px solid ${active ? 'var(--color-primary-400)' : 'var(--border-color)'}`,
                                background: active ? 'var(--color-primary-50)' : 'var(--bg-primary)',
                                color: active ? 'var(--color-primary-700)' : 'var(--text-secondary)',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 500,
                                cursor: 'pointer',
                            }}
                        >
                            {f.label}
                        </button>
                    );
                })}
            </div>

            {error && (
                <div style={{ padding: '12px 16px', background: 'var(--color-error-50)', color: 'var(--color-error)', borderRadius: 8, fontSize: '0.875rem', marginBottom: 'var(--space-3)' }}>
                    {t('reviews.failedToLoad')}
                </div>
            )}

            <DataTable<RatingObject>
                columns={columns}
                data={list}
                loading={loading}
                searchKeys={['comment']}
                searchPlaceholder={t('reviews.searchPlaceholder')}
                getRowKey={r => r.uuid}
                serverPagination
                currentPage={page}
                totalPages={meta?.pagination?.last_page ?? 1}
                onPageChange={setPage}
                onRowClick={r => setDetail(r)}
                emptyMessage={t('reviews.noneFound')}
                selectable
                selectedKeys={selected}
                onSelectionChange={setSelected}
                bulkActions={
                    <>
                        {selectedPublishable.length > 0 && (
                            <button style={{ ...iconBtn, width: 'auto', padding: '0 12px', gap: 6 }} onClick={() => setActive(selectedPublishable, true)}>
                                <Eye size={15} /> {t('reviews.publish')} {selectedPublishable.length}
                            </button>
                        )}
                        {selectedHideable.length > 0 && (
                            <button style={{ ...iconBtn, width: 'auto', padding: '0 12px', gap: 6, color: 'var(--color-warning)' }} onClick={() => setActive(selectedHideable, false)}>
                                <EyeOff size={15} /> {t('reviews.hide')} {selectedHideable.length}
                            </button>
                        )}
                        <button
                            style={{ ...iconBtn, width: 'auto', padding: '0 12px', gap: 6, color: 'var(--color-error)' }}
                            disabled={selectedDeletable.length === 0}
                            onClick={() => setConfirmDelete(selectedDeletable)}
                        >
                            <Trash2 size={15} /> {t('common.delete')} {selectedDeletable.length}
                        </button>
                    </>
                }
            />

            {/* Delete confirmation */}
            <ConfirmModal
                open={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={doDelete}
                title={t('common.delete')}
                message={
                    confirmDelete
                        ? t('reviews.deleteConfirm')
                              .replace('{n}', String(confirmDelete.length))
                              .replace('{s}', confirmDelete.length > 1 ? 's' : '')
                        : ''
                }
                confirmLabel={t('common.delete')}
                variant="danger"
                loading={working}
            />

            {/* Review detail drawer */}
            <SlideOver open={!!detail} onClose={() => setDetail(null)} title={detail ? (detail.user?.name ?? t('reviews.unknownUser')) : ''}>
                {detail && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Stars value={detail.rating} />
                            <StatusBadge status={statusOf(detail)} />
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                            {t('reviews.on')} <strong style={{ color: 'var(--text-secondary)' }}>{detail.booking?.provider?.name ?? '—'}</strong> · {detail.created_at?.slice(0, 10)}
                        </div>
                        <p style={{ fontSize: 'var(--text-base)', lineHeight: 1.6, color: 'var(--text-primary)', margin: 0 }}>
                            {detail.comment || <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>{t('reviews.noComment')}</span>}
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                            {statusOf(detail) === 'hidden' && (
                                <button style={{ ...iconBtn, width: 'auto', padding: '8px 14px', gap: 6 }} onClick={() => setActive([detail.uuid], true)}>
                                    <Eye size={15} /> {t('reviews.unhide')}
                                </button>
                            )}
                            {statusOf(detail) === 'published' && (
                                <button style={{ ...iconBtn, width: 'auto', padding: '8px 14px', gap: 6, color: 'var(--color-warning)' }} onClick={() => setActive([detail.uuid], false)}>
                                    <EyeOff size={15} /> {t('reviews.hide')}
                                </button>
                            )}
                            {statusOf(detail) !== 'deleted' && (
                                <button style={{ ...iconBtn, width: 'auto', padding: '8px 14px', gap: 6, color: 'var(--color-error)' }} onClick={() => setConfirmDelete([detail.uuid])}>
                                    <Trash2 size={15} /> {t('common.delete')}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </SlideOver>
        </div>
    );
}
