'use client';

import React, { useState } from 'react';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { useApiQuery, useApiMutation } from '@/hooks/useApiQuery';
import { adminBannersApi, type BannerObject, type BannerPlacement } from '@/lib/api';
import { Plus, Image as ImageIcon, Eye, Loader2, Trash2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

const PLACEMENT_KEYS: { value: BannerPlacement; key: string }[] = [
    { value: 'home_top',    key: 'marketing.banners.placeHomeTop' },
    { value: 'home_middle', key: 'marketing.banners.placeHomeMiddle' },
    { value: 'home_bottom', key: 'marketing.banners.placeHomeBottom' },
    { value: 'category',   key: 'marketing.banners.placeCategory' },
    { value: 'sidebar',    key: 'marketing.banners.placeSidebar' },
];

const DIMENSIONS = ['1200x400', '1200x600', '800x400', '600x300'];

function bannerStatus(b: BannerObject): string {
    if (b.deleted_at) return 'deleted';
    if (!b.active) return 'draft';
    const now = new Date().toISOString().slice(0, 10);
    if (b.ends_at && b.ends_at.slice(0, 10) < now) return 'expired';
    return 'active';
}

export default function BannersPage() {
    const { t } = useTranslation();
    const [showCreate, setShowCreate] = useState(false);
    const [editItem, setEditItem] = useState<BannerObject | null>(null);
    // Per-row busy flag: `${uuid}:toggle` | `${uuid}:delete` while its mutation runs.
    const [rowBusy, setRowBusy] = useState<string | null>(null);

    const placementLabel = (p: string) => {
        const found = PLACEMENT_KEYS.find(x => x.value === p);
        return found ? t(found.key) : p;
    };

    const { data, loading, refetch } = useApiQuery(
        () => adminBannersApi.list({ per_page: 50 }),
        []
    );

    const { mutate: createBanner, loading: creating } = useApiMutation(
        (formData: FormData) => adminBannersApi.create(formData)
    );

    const { mutate: updateBanner, loading: saving } = useApiMutation(
        ({ uuid, formData }: { uuid: string; formData: FormData }) =>
            adminBannersApi.update(uuid, formData)
    );

    const { mutate: toggleActive } = useApiMutation(
        ({ uuid, active }: { uuid: string; active: boolean }) =>
            adminBannersApi.toggleActive(uuid, active)
    );

    const { mutate: deleteBanner } = useApiMutation((uuid: string) =>
        adminBannersApi.delete(uuid)
    );

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        await createBanner(fd);
        setShowCreate(false);
        refetch();
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editItem) return;
        const fd = new FormData(e.currentTarget);
        await updateBanner({ uuid: editItem.uuid, formData: fd });
        setEditItem(null);
        refetch();
    };

    const list = data ?? [];

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <ImageIcon size={24} />
                    <h1 className={shared.pageTitle}>{t('marketing.banners.title')}</h1>
                </div>
                <PermissionGate module="marketing" action="create">
                    <button onClick={() => setShowCreate(true)} className={shared.addBtn}>
                        <Plus size={16} /> {t('marketing.banners.upload')}
                    </button>
                </PermissionGate>
            </div>

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 10, color: 'var(--text-tertiary)' }}>
                    <Loader2 size={22} /> {t('common.loading')}
                </div>
            ) : list.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-tertiary)' }}>{t('marketing.banners.noBanners')}</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                    {list.map(b => {
                        const status = bannerStatus(b);
                        return (
                            <div key={b.uuid} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden' }}>
                                {/* Image preview */}
                                <div style={{ height: 120, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    {b.image_url ? (
                                        <img src={b.image_url} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <ImageIcon size={32} strokeWidth={1} color="var(--text-tertiary)" />
                                    )}
                                </div>

                                <div style={{ padding: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span style={{ fontWeight: 600 }}>{b.title}</span>
                                        <StatusBadge status={status} />
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginBottom: 12 }}>
                                        {placementLabel(b.placement)} &middot; {b.dimensions}
                                        {(b.starts_at || b.ends_at) && (
                                            <> &middot; {b.starts_at?.slice(0, 10) ?? '?'} → {b.ends_at?.slice(0, 10) ?? '∞'}</>
                                        )}
                                    </div>

                                    <PermissionGate module="marketing" action="edit">
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => setEditItem(b)}
                                                style={{ padding: '4px 10px', fontSize: '0.8rem', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', cursor: 'pointer', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
                                            >
                                                {t('common.edit')}
                                            </button>
                                            <button
                                                disabled={rowBusy === `${b.uuid}:toggle`}
                                                onClick={async () => {
                                                    setRowBusy(`${b.uuid}:toggle`);
                                                    try { await toggleActive({ uuid: b.uuid, active: !b.active }); refetch(); }
                                                    finally { setRowBusy(null); }
                                                }}
                                                style={{ padding: '4px 10px', fontSize: '0.8rem', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', cursor: rowBusy === `${b.uuid}:toggle` ? 'not-allowed' : 'pointer', opacity: rowBusy === `${b.uuid}:toggle` ? 0.6 : 1, color: b.active ? 'var(--color-error)' : 'var(--color-success)', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 4 }}
                                            >
                                                {rowBusy === `${b.uuid}:toggle` && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
                                                {b.active ? t('reviews.hide') : t('content.announcements.publish')}
                                            </button>
                                            <PermissionGate module="marketing" action="delete">
                                                <button
                                                    disabled={rowBusy === `${b.uuid}:delete`}
                                                    onClick={async () => {
                                                        setRowBusy(`${b.uuid}:delete`);
                                                        try { await deleteBanner(b.uuid); refetch(); }
                                                        finally { setRowBusy(null); }
                                                    }}
                                                    style={{ padding: '4px 10px', fontSize: '0.8rem', border: '1px solid var(--color-error)', borderRadius: 6, background: 'var(--bg-primary)', cursor: rowBusy === `${b.uuid}:delete` ? 'not-allowed' : 'pointer', opacity: rowBusy === `${b.uuid}:delete` ? 0.6 : 1, color: 'var(--color-error)', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 4 }}
                                                >
                                                    {rowBusy === `${b.uuid}:delete`
                                                        ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                                                        : <Trash2 size={13} />} {t('common.delete')}
                                                </button>
                                            </PermissionGate>
                                        </div>
                                    </PermissionGate>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Modal */}
            <FormModal
                open={showCreate}
                onClose={() => setShowCreate(false)}
                title={t('marketing.banners.upload')}
                submitLabel={creating ? t('marketing.banners.creating') : t('marketing.banners.createBanner')}
                onSubmit={handleCreate}
            >
                <FormField label={t('marketing.banners.bannerTitle')} required>
                    <input name="title" type="text" required className={shared.formInput} placeholder={t('marketing.banners.titlePlaceholder')} />
                </FormField>
                <FormField label={t('marketing.banners.image')}>
                    <input name="image" type="file" accept="image/jpeg,image/png,image/webp" className={shared.formInput} />
                </FormField>
                <div className={shared.formGrid2}>
                    <FormField label={t('marketing.banners.placement')}>
                        <select name="placement" className={shared.formInput}>
                            {PLACEMENT_KEYS.map(p => <option key={p.value} value={p.value}>{t(p.key)}</option>)}
                        </select>
                    </FormField>
                    <FormField label={t('marketing.banners.dimensions')}>
                        <select name="dimensions" className={shared.formInput}>
                            {DIMENSIONS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </FormField>
                </div>
                <div className={shared.formGrid2}>
                    <FormField label={t('marketing.banners.startDate')}>
                        <input name="starts_at" type="date" className={shared.formInput} />
                    </FormField>
                    <FormField label={t('marketing.banners.endDate')}>
                        <input name="ends_at" type="date" className={shared.formInput} />
                    </FormField>
                </div>
            </FormModal>

            {/* Edit Modal */}
            <FormModal
                open={!!editItem}
                onClose={() => setEditItem(null)}
                title={editItem ? `${t('marketing.banners.editPrefix')} ${editItem.title}` : ''}
                submitLabel={saving ? t('common.saving') : t('common.saveChanges')}
                onSubmit={handleUpdate}
            >
                {editItem && (
                    <>
                        <FormField label={t('marketing.banners.bannerTitle')} required>
                            <input name="title" type="text" defaultValue={editItem.title} required className={shared.formInput} />
                        </FormField>
                        <FormField label={t('marketing.banners.replaceImage')}>
                            <input name="image" type="file" accept="image/jpeg,image/png,image/webp" className={shared.formInput} />
                        </FormField>
                        <div className={shared.formGrid2}>
                            <FormField label={t('marketing.banners.placement')}>
                                <select name="placement" defaultValue={editItem.placement} className={shared.formInput}>
                                    {PLACEMENT_KEYS.map(p => <option key={p.value} value={p.value}>{t(p.key)}</option>)}
                                </select>
                            </FormField>
                            <FormField label={t('marketing.banners.dimensions')}>
                                <select name="dimensions" defaultValue={editItem.dimensions} className={shared.formInput}>
                                    {DIMENSIONS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </FormField>
                        </div>
                        <div className={shared.formGrid2}>
                            <FormField label={t('marketing.banners.startDate')}>
                                <input name="starts_at" type="date" defaultValue={editItem.starts_at?.slice(0, 10) ?? ''} className={shared.formInput} />
                            </FormField>
                            <FormField label={t('marketing.banners.endDate')}>
                                <input name="ends_at" type="date" defaultValue={editItem.ends_at?.slice(0, 10) ?? ''} className={shared.formInput} />
                            </FormField>
                        </div>
                    </>
                )}
            </FormModal>
        </div>
    );
}
