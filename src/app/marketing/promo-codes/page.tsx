'use client';

import React, { useState } from 'react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { useApiQuery, useApiMutation } from '@/hooks/useApiQuery';
import { adminPromoCodesApi, type PromoCodeObject, type PromoCodePayload, type PromoCodeType } from '@/lib/api';
import { copyToClipboard } from '@/lib/utils';
import { Plus, Copy, Loader2, Trash2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

function promoStatus(p: PromoCodeObject): string {
    if (p.deleted_at) return 'deleted';
    if (!p.active) return 'draft';
    if (p.is_expired || p.is_exhausted) return 'expired';
    return 'active';
}

export default function PromoCodesPage() {
    const { t } = useTranslation();
    const [showCreate, setShowCreate] = useState(false);
    const [editItem, setEditItem] = useState<PromoCodeObject | null>(null);

    const { data, loading, refetch } = useApiQuery(
        () => adminPromoCodesApi.list({ per_page: 100 }),
        []
    );

    const { mutate: createCode, loading: creating } = useApiMutation(
        (payload: PromoCodePayload & { code: string; value: number; valid_until: string }) =>
            adminPromoCodesApi.create(payload)
    );

    const { mutate: updateCode, loading: saving } = useApiMutation(
        ({ uuid, payload }: { uuid: string; payload: PromoCodePayload }) =>
            adminPromoCodesApi.update(uuid, payload)
    );

    const { mutate: toggleActive } = useApiMutation(
        ({ uuid, active }: { uuid: string; active: boolean }) =>
            adminPromoCodesApi.toggleActive(uuid, active)
    );

    const { mutate: deleteCode } = useApiMutation((uuid: string) =>
        adminPromoCodesApi.delete(uuid)
    );

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        await createCode({
            code:         String(fd.get('code') ?? '').toUpperCase(),
            type:         (fd.get('type') || 'percentage') as PromoCodeType,
            value:        Number(fd.get('value') || 0),
            min_order:    fd.get('min_order')    ? Number(fd.get('min_order'))    : null,
            max_discount: fd.get('max_discount') ? Number(fd.get('max_discount')) : null,
            usage_limit:  fd.get('usage_limit')  ? Number(fd.get('usage_limit'))  : null,
            valid_until:  String(fd.get('valid_until') ?? ''),
        });
        setShowCreate(false);
        refetch();
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editItem) return;
        const fd = new FormData(e.currentTarget);
        await updateCode({
            uuid: editItem.uuid,
            payload: {
                code:         String(fd.get('code') ?? '').toUpperCase() || undefined,
                type:         (fd.get('type') || 'percentage') as PromoCodeType,
                value:        Number(fd.get('value') || 0),
                min_order:    fd.get('min_order')    ? Number(fd.get('min_order'))    : null,
                max_discount: fd.get('max_discount') ? Number(fd.get('max_discount')) : null,
                usage_limit:  fd.get('usage_limit')  ? Number(fd.get('usage_limit'))  : null,
                valid_until:  String(fd.get('valid_until') ?? ''),
            },
        });
        setEditItem(null);
        refetch();
    };

    const list = data ?? [];

    const columns: Column<PromoCodeObject>[] = [
        {
            key: 'code', label: t('marketing.promoCodes.code'), sortable: true,
            render: r => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <code style={{ fontWeight: 600, padding: '2px 8px', background: 'var(--bg-tertiary)', borderRadius: 4, fontSize: '0.8125rem' }}>{r.code}</code>
                    <button onClick={() => copyToClipboard(r.code)} style={{ border: 'none', background: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 2 }}>
                        <Copy size={12} />
                    </button>
                </div>
            ),
        },
        {
            key: 'type', label: t('marketing.promoCodes.type'), sortable: true,
            render: r => r.type === 'percentage' ? `${r.value}%` : `EGP ${r.value}`,
        },
        {
            key: 'min_order', label: t('marketing.promoCodes.minOrder'),
            render: r => r.min_order && r.min_order > 0 ? `EGP ${r.min_order}` : '-',
        },
        {
            key: 'usage_count', label: t('marketing.promoCodes.usage'), sortable: true,
            render: r => `${r.usage_count}${r.usage_limit ? ` / ${r.usage_limit}` : ''}`,
        },
        {
            key: 'valid_until', label: t('marketing.promoCodes.validUntil'), sortable: true,
            render: r => r.valid_until?.slice(0, 10) ?? '--',
        },
        {
            key: 'active', label: t('common.status'),
            render: r => <StatusBadge status={promoStatus(r)} />,
        },
        {
            key: 'uuid', label: 'Actions',
            render: r => (
                <PermissionGate module="marketing" action="edit">
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button
                            onClick={() => setEditItem(r)}
                            style={{ padding: '3px 8px', fontSize: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 5, background: 'var(--bg-primary)', cursor: 'pointer', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
                        >
                            Edit
                        </button>
                        <button
                            onClick={async () => { await toggleActive({ uuid: r.uuid, active: !r.active }); refetch(); }}
                            style={{ padding: '3px 8px', fontSize: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 5, background: 'var(--bg-primary)', cursor: 'pointer', color: r.active ? 'var(--color-error)' : 'var(--color-success)', fontFamily: 'var(--font-sans)' }}
                        >
                            {r.active ? 'Disable' : 'Enable'}
                        </button>
                        <PermissionGate module="marketing" action="delete">
                            <button
                                onClick={async () => { await deleteCode(r.uuid); refetch(); }}
                                style={{ padding: '3px 8px', fontSize: '0.75rem', border: '1px solid var(--color-error)', borderRadius: 5, background: 'var(--bg-primary)', cursor: 'pointer', color: 'var(--color-error)', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 3 }}
                            >
                                <Trash2 size={11} /> Delete
                            </button>
                        </PermissionGate>
                    </div>
                </PermissionGate>
            ),
        },
    ];

    if (loading) {
        return (
            <div className={shared.page}>
                <h1 className={shared.pageTitle}>{t('marketing.promoCodes.title')}</h1>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 10, color: 'var(--text-tertiary)' }}>
                    <Loader2 size={22} /> Loading...
                </div>
            </div>
        );
    }

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <h1 className={shared.pageTitle}>{t('marketing.promoCodes.title')}</h1>
                <PermissionGate module="marketing" action="create">
                    <button onClick={() => setShowCreate(true)} className={shared.addBtn}>
                        <Plus size={16} /> {t('marketing.promoCodes.create')}
                    </button>
                </PermissionGate>
            </div>

            <DataTable<PromoCodeObject>
                columns={columns}
                data={list}
                searchKeys={['code']}
                searchPlaceholder={t('marketing.promoCodes.searchPlaceholder')}
                getRowKey={r => r.uuid}
            />

            {/* Create Modal */}
            <FormModal
                open={showCreate}
                onClose={() => setShowCreate(false)}
                title={t('marketing.promoCodes.createPromoCode')}
                submitLabel={creating ? 'Creating...' : t('common.create')}
                onSubmit={handleCreate}
            >
                <FormField label={t('marketing.promoCodes.code')} required>
                    <input name="code" type="text" required className={shared.formInput} placeholder="e.g. SUMMER50" style={{ textTransform: 'uppercase' }} />
                </FormField>
                <div className={shared.formGrid2}>
                    <FormField label={t('marketing.promoCodes.type')}>
                        <select name="type" className={shared.formInput}>
                            <option value="percentage">{t('marketing.promoCodes.percentage')}</option>
                            <option value="fixed">{t('marketing.promoCodes.fixedAmount')}</option>
                        </select>
                    </FormField>
                    <FormField label={t('marketing.promoCodes.value')} required>
                        <input name="value" type="number" required min="0" step="0.01" className={shared.formInput} placeholder="e.g. 20" />
                    </FormField>
                </div>
                <div className={shared.formGrid2}>
                    <FormField label={t('marketing.promoCodes.minOrderEgp')}>
                        <input name="min_order" type="number" min="0" step="0.01" className={shared.formInput} placeholder="0" />
                    </FormField>
                    <FormField label={t('marketing.promoCodes.maxDiscount')}>
                        <input name="max_discount" type="number" min="0" step="0.01" className={shared.formInput} placeholder="Leave empty for none" />
                    </FormField>
                </div>
                <div className={shared.formGrid2}>
                    <FormField label={t('marketing.promoCodes.usageLimit')}>
                        <input name="usage_limit" type="number" min="1" step="1" className={shared.formInput} placeholder="Leave empty for unlimited" />
                    </FormField>
                    <FormField label={t('marketing.promoCodes.validUntil')} required>
                        <input name="valid_until" type="date" required className={shared.formInput} />
                    </FormField>
                </div>
            </FormModal>

            {/* Edit Modal */}
            <FormModal
                open={!!editItem}
                onClose={() => setEditItem(null)}
                title={editItem ? `Edit: ${editItem.code}` : ''}
                submitLabel={saving ? 'Saving...' : 'Save Changes'}
                onSubmit={handleUpdate}
            >
                {editItem && (
                    <>
                        <FormField label={t('marketing.promoCodes.code')} required>
                            <input name="code" type="text" defaultValue={editItem.code} required className={shared.formInput} style={{ textTransform: 'uppercase' }} />
                        </FormField>
                        <div className={shared.formGrid2}>
                            <FormField label={t('marketing.promoCodes.type')}>
                                <select name="type" defaultValue={editItem.type} className={shared.formInput}>
                                    <option value="percentage">{t('marketing.promoCodes.percentage')}</option>
                                    <option value="fixed">{t('marketing.promoCodes.fixedAmount')}</option>
                                </select>
                            </FormField>
                            <FormField label={t('marketing.promoCodes.value')} required>
                                <input name="value" type="number" defaultValue={editItem.value} required min="0" step="0.01" className={shared.formInput} />
                            </FormField>
                        </div>
                        <div className={shared.formGrid2}>
                            <FormField label={t('marketing.promoCodes.minOrderEgp')}>
                                <input name="min_order" type="number" defaultValue={editItem.min_order ?? ''} min="0" step="0.01" className={shared.formInput} />
                            </FormField>
                            <FormField label={t('marketing.promoCodes.maxDiscount')}>
                                <input name="max_discount" type="number" defaultValue={editItem.max_discount ?? ''} min="0" step="0.01" className={shared.formInput} />
                            </FormField>
                        </div>
                        <div className={shared.formGrid2}>
                            <FormField label={t('marketing.promoCodes.usageLimit')}>
                                <input name="usage_limit" type="number" defaultValue={editItem.usage_limit ?? ''} min="1" step="1" className={shared.formInput} />
                            </FormField>
                            <FormField label={t('marketing.promoCodes.validUntil')} required>
                                <input name="valid_until" type="date" defaultValue={editItem.valid_until?.slice(0, 10) ?? ''} required className={shared.formInput} />
                            </FormField>
                        </div>
                    </>
                )}
            </FormModal>
        </div>
    );
}
