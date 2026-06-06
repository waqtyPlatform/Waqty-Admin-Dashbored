'use client';

import React, { useState } from 'react';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { FormModal, FormField, ConfirmModal } from '@/components/admin/FormModal';
import { useApiQuery, useApiMutation } from '@/hooks/useApiQuery';
import {
    adminAnnouncementsApi,
    type AnnouncementObject,
    type AnnouncementPayload,
    type AnnouncementTarget,
    type AnnouncementPriority,
} from '@/lib/api';
import { Plus, Megaphone, Loader2, Trash2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)',
    borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-primary)',
    background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', outline: 'none',
};

const priorityColors: Record<string, string> = {
    low: 'var(--text-tertiary)',
    normal: 'var(--color-info)',
    high: 'var(--color-warning)',
    urgent: 'var(--color-error)',
};

export default function AnnouncementsPage() {
    const { t } = useTranslation();
    const [showCreate, setShowCreate] = useState(false);
    const [editItem, setEditItem] = useState<AnnouncementObject | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const { data, loading, refetch } = useApiQuery(
        () => adminAnnouncementsApi.list({ per_page: 50 }),
        []
    );

    const { mutate: createItem, loading: creating } = useApiMutation(
        (payload: AnnouncementPayload & { title_en: string; title_ar: string; message_en: string; message_ar: string }) =>
            adminAnnouncementsApi.create(payload)
    );

    const { mutate: updateItem, loading: saving } = useApiMutation(
        ({ uuid, payload }: { uuid: string; payload: AnnouncementPayload }) =>
            adminAnnouncementsApi.update(uuid, payload)
    );

    const { mutate: toggleActive } = useApiMutation(
        ({ uuid, active }: { uuid: string; active: boolean }) =>
            adminAnnouncementsApi.toggleActive(uuid, active)
    );

    const { mutate: deleteItem } = useApiMutation((uuid: string) =>
        adminAnnouncementsApi.delete(uuid)
    );

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        await createItem({
            title_en:   String(fd.get('title_en')   ?? ''),
            title_ar:   String(fd.get('title_ar')   ?? ''),
            message_en: String(fd.get('message_en') ?? ''),
            message_ar: String(fd.get('message_ar') ?? ''),
            target:     (fd.get('target')   || 'all')    as AnnouncementTarget,
            priority:   (fd.get('priority') || 'normal') as AnnouncementPriority,
            ends_at:    fd.get('ends_at') ? String(fd.get('ends_at')) : undefined,
        });
        setShowCreate(false);
        refetch();
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editItem) return;
        const fd = new FormData(e.currentTarget);
        await updateItem({
            uuid: editItem.uuid,
            payload: {
                title_en:   String(fd.get('title_en')   ?? ''),
                title_ar:   String(fd.get('title_ar')   ?? ''),
                message_en: String(fd.get('message_en') ?? ''),
                message_ar: String(fd.get('message_ar') ?? ''),
                target:     (fd.get('target')   || 'all')    as AnnouncementTarget,
                priority:   (fd.get('priority') || 'normal') as AnnouncementPriority,
                ends_at:    fd.get('ends_at') ? String(fd.get('ends_at')) : null,
            },
        });
        setEditItem(null);
        refetch();
    };

    const list = data ?? [];

    const targetLabel: Record<string, string> = {
        all: t('content.announcements.targetAll'),
        users: t('content.announcements.targetUsers'),
        providers: t('content.announcements.targetProviders'),
        employees: t('content.announcements.targetEmployees'),
        branches: t('content.announcements.targetBranches'),
    };
    const priorityLabel: Record<string, string> = {
        normal: t('content.announcements.priorityNormal'),
        low: t('content.announcements.priorityLow'),
        high: t('content.announcements.priorityHigh'),
        urgent: t('content.announcements.priorityUrgent'),
    };

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Megaphone size={24} />
                    <h1 className={shared.pageTitle}>{t('content.announcements.title')}</h1>
                </div>
                <PermissionGate module="content" action="create">
                    <button onClick={() => setShowCreate(true)} className={shared.addBtn}>
                        <Plus size={16} /> {t('content.announcements.new')}
                    </button>
                </PermissionGate>
            </div>

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 10, color: 'var(--text-tertiary)' }}>
                    <Loader2 size={22} /> {t('common.loading')}
                </div>
            ) : list.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-tertiary)' }}>{t('content.announcements.noneFound')}</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {list.map(a => (
                        <div key={a.uuid} style={{ background: 'var(--bg-primary)', border: `1px solid ${a.priority === 'high' || a.priority === 'urgent' ? 'var(--color-warning)' : 'var(--border-color)'}`, borderRadius: 12, padding: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontWeight: 600 }}>{a.title_en}</span>
                                    <StatusBadge status={a.active ? 'active' : 'draft'} />
                                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: priorityColors[a.priority], textTransform: 'uppercase' }}>{priorityLabel[a.priority] ?? a.priority}</span>
                                    <span style={{ fontSize: '0.6875rem', padding: '2px 6px', background: 'var(--bg-tertiary)', borderRadius: 4 }}>{targetLabel[a.target] ?? a.target}</span>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                    {a.ends_at ? `${t('content.announcements.endsPrefix')} ${a.ends_at.slice(0, 10)}` : t('content.announcements.noExpiry')}
                                </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{a.message_en}</p>
                            <p style={{ margin: '4px 0 8px', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }} dir="rtl">{a.message_ar}</p>
                            <PermissionGate module="content" action="edit">
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        onClick={() => setEditItem(a)}
                                        style={{ padding: '4px 10px', fontSize: '0.8rem', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', cursor: 'pointer', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
                                    >
                                        {t('common.edit')}
                                    </button>
                                    <button
                                        onClick={async () => { await toggleActive({ uuid: a.uuid, active: !a.active }); refetch(); }}
                                        style={{ padding: '4px 10px', fontSize: '0.8rem', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', cursor: 'pointer', color: a.active ? 'var(--color-error)' : 'var(--color-success)', fontFamily: 'var(--font-sans)' }}
                                    >
                                        {a.active ? t('content.announcements.hide') : t('content.announcements.publish')}
                                    </button>
                                    <PermissionGate module="content" action="delete">
                                        <button
                                            onClick={() => setConfirmDelete(a.uuid)}
                                            style={{ padding: '4px 10px', fontSize: '0.8rem', border: '1px solid var(--color-error)', borderRadius: 6, background: 'var(--bg-primary)', cursor: 'pointer', color: 'var(--color-error)', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 4 }}
                                        >
                                            <Trash2 size={13} /> {t('common.delete')}
                                        </button>
                                    </PermissionGate>
                                </div>
                            </PermissionGate>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <FormModal
                open={showCreate}
                onClose={() => setShowCreate(false)}
                title={t('content.announcements.new')}
                submitLabel={creating ? t('content.announcements.publishing') : t('content.announcements.publish')}
                onSubmit={handleCreate}
            >
                <div className={shared.formGrid2}>
                    <FormField label={t('content.announcements.titleEn')} required>
                        <input name="title_en" type="text" required className={shared.formInput} />
                    </FormField>
                    <FormField label={t('content.announcements.titleAr')} required>
                        <input name="title_ar" type="text" required className={shared.formInput} dir="rtl" />
                    </FormField>
                </div>
                <div className={shared.formGrid2}>
                    <FormField label={t('content.announcements.messageEn')} required>
                        <textarea name="message_en" required style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} />
                    </FormField>
                    <FormField label={t('content.announcements.messageAr')} required>
                        <textarea name="message_ar" required style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} dir="rtl" />
                    </FormField>
                </div>
                <div className={shared.formGrid3}>
                    <FormField label={t('content.announcements.target')}>
                        <select name="target" className={shared.formInput}>
                            <option value="all">{t('content.announcements.targetAll')}</option>
                            <option value="users">{t('content.announcements.targetUsers')}</option>
                            <option value="providers">{t('content.announcements.targetProviders')}</option>
                            <option value="employees">{t('content.announcements.targetEmployees')}</option>
                            <option value="branches">{t('content.announcements.targetBranches')}</option>
                        </select>
                    </FormField>
                    <FormField label={t('content.announcements.priority')}>
                        <select name="priority" className={shared.formInput}>
                            <option value="normal">{t('content.announcements.priorityNormal')}</option>
                            <option value="low">{t('content.announcements.priorityLow')}</option>
                            <option value="high">{t('content.announcements.priorityHigh')}</option>
                            <option value="urgent">{t('content.announcements.priorityUrgent')}</option>
                        </select>
                    </FormField>
                    <FormField label={t('content.announcements.endDate')}>
                        <input name="ends_at" type="date" className={shared.formInput} />
                    </FormField>
                </div>
            </FormModal>

            {/* Edit Modal */}
            <FormModal
                open={!!editItem}
                onClose={() => setEditItem(null)}
                title={editItem ? `${t('content.announcements.editPrefix')} ${editItem.title_en}` : ''}
                submitLabel={saving ? t('common.saving') : t('common.saveChanges')}
                onSubmit={handleUpdate}
            >
                {editItem && (
                    <>
                        <div className={shared.formGrid2}>
                            <FormField label={t('content.announcements.titleEn')} required>
                                <input name="title_en" type="text" defaultValue={editItem.title_en} required className={shared.formInput} />
                            </FormField>
                            <FormField label={t('content.announcements.titleAr')} required>
                                <input name="title_ar" type="text" defaultValue={editItem.title_ar} required className={shared.formInput} dir="rtl" />
                            </FormField>
                        </div>
                        <div className={shared.formGrid2}>
                            <FormField label={t('content.announcements.messageEn')} required>
                                <textarea name="message_en" defaultValue={editItem.message_en} required style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} />
                            </FormField>
                            <FormField label={t('content.announcements.messageAr')} required>
                                <textarea name="message_ar" defaultValue={editItem.message_ar} required style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} dir="rtl" />
                            </FormField>
                        </div>
                        <div className={shared.formGrid3}>
                            <FormField label={t('content.announcements.target')}>
                                <select name="target" defaultValue={editItem.target} className={shared.formInput}>
                                    <option value="all">{t('content.announcements.targetAll')}</option>
                                    <option value="users">{t('content.announcements.targetUsers')}</option>
                                    <option value="providers">{t('content.announcements.targetProviders')}</option>
                                    <option value="employees">{t('content.announcements.targetEmployees')}</option>
                                    <option value="branches">{t('content.announcements.targetBranches')}</option>
                                </select>
                            </FormField>
                            <FormField label={t('content.announcements.priority')}>
                                <select name="priority" defaultValue={editItem.priority} className={shared.formInput}>
                                    <option value="normal">{t('content.announcements.priorityNormal')}</option>
                                    <option value="low">{t('content.announcements.priorityLow')}</option>
                                    <option value="high">{t('content.announcements.priorityHigh')}</option>
                                    <option value="urgent">{t('content.announcements.priorityUrgent')}</option>
                                </select>
                            </FormField>
                            <FormField label={t('content.announcements.endDate')}>
                                <input name="ends_at" type="date" defaultValue={editItem.ends_at?.slice(0, 10) ?? ''} className={shared.formInput} />
                            </FormField>
                        </div>
                    </>
                )}
            </FormModal>

            <ConfirmModal
                open={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={async () => { const uuid = confirmDelete; setConfirmDelete(null); if (uuid) { await deleteItem(uuid); refetch(); } }}
                title={t('common.delete')}
                message={t('common.confirmDeleteItem')}
                confirmLabel={t('common.delete')}
                variant="danger"
            />
        </div>
    );
}
