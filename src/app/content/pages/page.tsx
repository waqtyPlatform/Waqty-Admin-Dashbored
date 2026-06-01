'use client';

import React, { useState } from 'react';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { useApiQuery, useApiMutation } from '@/hooks/useApiQuery';
import { adminPagesApi, type ContentPageObject, type ContentPagePayload } from '@/lib/api';
import { Plus, Edit, FileText, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)',
    borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-primary)',
    background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', outline: 'none',
};

export default function ContentPagesPage() {
    const { t } = useTranslation();
    const [editPage, setEditPage] = useState<ContentPageObject | null>(null);
    const [showCreate, setShowCreate] = useState(false);

    const { data: pages, loading, refetch } = useApiQuery(
        () => adminPagesApi.list(),
        []
    );

    const { mutate: updatePage, loading: saving } = useApiMutation(
        ({ uuid, payload }: { uuid: string; payload: ContentPagePayload }) =>
            adminPagesApi.update(uuid, payload)
    );

    const { mutate: createPage, loading: creating } = useApiMutation(
        (payload: ContentPagePayload & { slug: string; title_en: string; title_ar: string }) =>
            adminPagesApi.create(payload)
    );

    const { mutate: toggleActive } = useApiMutation(
        ({ uuid, active }: { uuid: string; active: boolean }) =>
            adminPagesApi.toggleActive(uuid, active)
    );

    const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editPage) return;
        const fd = new FormData(e.currentTarget);
        await updatePage({
            uuid: editPage.uuid,
            payload: {
                title_en:   String(fd.get('title_en')   ?? ''),
                title_ar:   String(fd.get('title_ar')   ?? ''),
                content_en: String(fd.get('content_en') ?? ''),
                content_ar: String(fd.get('content_ar') ?? ''),
            },
        });
        setEditPage(null);
        refetch();
    };

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        await createPage({
            slug:       String(fd.get('slug')       ?? ''),
            title_en:   String(fd.get('title_en')   ?? ''),
            title_ar:   String(fd.get('title_ar')   ?? ''),
            content_en: String(fd.get('content_en') ?? ''),
            content_ar: String(fd.get('content_ar') ?? ''),
        });
        setShowCreate(false);
        refetch();
    };

    const list = pages ?? [];

    return (
        <div className={shared.page}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FileText size={24} />
                    <h1 className={shared.pageTitle}>{t('content.pages.title')}</h1>
                </div>
                <PermissionGate module="content" action="create">
                    <button onClick={() => setShowCreate(true)} className={shared.btnPrimary} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Plus size={16} /> {t('content.pages.newPageBtn')}
                    </button>
                </PermissionGate>
            </div>

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 10, color: 'var(--text-tertiary)' }}>
                    <Loader2 size={22} /> {t('common.loading')}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {list.map(page => (
                        <div key={page.uuid} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{page.title_en}</h3>
                                <StatusBadge status={page.active ? 'published' : 'draft'} />
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: '0 0 4px' }}>{page.title_ar}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '0 0 12px' }}>
                                {t('content.pages.lastUpdated')}{page.updated_by ? ` ${t('content.pages.by')} ${page.updated_by.name}` : ''} {t('content.pages.on')} {page.updated_at.slice(0, 10)}
                            </p>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <PermissionGate module="content" action="edit">
                                    <button
                                        onClick={() => setEditPage(page)}
                                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
                                    >
                                        <Edit size={14} /> {t('common.edit')}
                                    </button>
                                    <button
                                        onClick={async () => { await toggleActive({ uuid: page.uuid, active: !page.active }); refetch(); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: page.active ? 'var(--color-error)' : 'var(--color-success)', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
                                    >
                                        {page.active ? t('content.pages.hide') : t('content.pages.publish')}
                                    </button>
                                </PermissionGate>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit modal */}
            <FormModal
                open={!!editPage}
                onClose={() => setEditPage(null)}
                title={editPage ? `${t('common.edit')}: ${editPage.title_en}` : ''}
                submitLabel={saving ? t('common.saving') : t('content.pages.saveChanges')}
                onSubmit={handleEdit}
            >
                {editPage && (
                    <>
                        <div className={shared.formGrid2}>
                            <FormField label={t('content.pages.titleEn')}>
                                <input name="title_en" type="text" defaultValue={editPage.title_en} className={shared.formInput} />
                            </FormField>
                            <FormField label={t('content.pages.titleAr')}>
                                <input name="title_ar" type="text" defaultValue={editPage.title_ar} className={shared.formInput} dir="rtl" />
                            </FormField>
                        </div>
                        <FormField label={t('content.pages.contentEn')}>
                            <textarea name="content_en" defaultValue={editPage.content_en ?? ''} style={{ ...inputStyle, minHeight: 150, resize: 'vertical' }} />
                        </FormField>
                        <FormField label={t('content.pages.contentAr')}>
                            <textarea name="content_ar" defaultValue={editPage.content_ar ?? ''} style={{ ...inputStyle, minHeight: 150, resize: 'vertical' }} dir="rtl" />
                        </FormField>
                    </>
                )}
            </FormModal>

            {/* Create modal */}
            <FormModal
                open={showCreate}
                onClose={() => setShowCreate(false)}
                title={t('content.pages.newPage')}
                submitLabel={creating ? t('content.pages.creating') : t('content.pages.createPage')}
                onSubmit={handleCreate}
            >
                <div className={shared.formGrid2}>
                    <FormField label={t('content.pages.slug')}>
                        <input name="slug" type="text" placeholder="e.g. terms-conditions" className={shared.formInput} />
                    </FormField>
                    <div />
                </div>
                <div className={shared.formGrid2}>
                    <FormField label={t('content.pages.titleEn')}>
                        <input name="title_en" type="text" className={shared.formInput} />
                    </FormField>
                    <FormField label={t('content.pages.titleAr')}>
                        <input name="title_ar" type="text" className={shared.formInput} dir="rtl" />
                    </FormField>
                </div>
                <FormField label={t('content.pages.contentEn')}>
                    <textarea name="content_en" style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }} />
                </FormField>
                <FormField label={t('content.pages.contentAr')}>
                    <textarea name="content_ar" style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }} dir="rtl" />
                </FormField>
            </FormModal>
        </div>
    );
}
