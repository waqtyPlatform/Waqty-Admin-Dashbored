'use client';

import React, { useState, useCallback } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useApiQuery, useApiMutation } from '@/hooks/useApiQuery';
import { adminsApi, type AdminObject, type CreateAdminBody, type UpdateAdminBody } from '@/lib/api';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { Plus, Shield, MoreHorizontal, ShieldCheck, ShieldOff, Pencil } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';

export default function AdminsPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // ── Filters ───────────────────────────────────────────
    const activeFilter = searchParams.get('active');
    const searchQuery   = searchParams.get('search') ?? '';

    const setFilter = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (!value || value === 'all') params.delete(key);
        else params.set(key, value);
        router.replace(`${pathname}${params.toString() ? `?${params}` : ''}`, { scroll: false });
    }, [searchParams, pathname, router]);

    // ── Data from real API ────────────────────────────────
    const { data: admins, loading, error: listError, refetch } = useApiQuery(
        () => adminsApi.list({
            ...(activeFilter !== null && { active: activeFilter === 'true' }),
            ...(searchQuery && { search: searchQuery }),
        }),
        [activeFilter, searchQuery]
    );

    // ── Mutations ─────────────────────────────────────────
    const { mutate: createAdmin, loading: creating } = useApiMutation(
        (body: CreateAdminBody) => adminsApi.create(body)
    );
    const { mutate: updateAdmin, loading: updating } = useApiMutation(
        ({ id, body }: { id: number; body: UpdateAdminBody }) => adminsApi.update(id, body)
    );
    const { mutate: toggleActive, loading: toggling } = useApiMutation(
        ({ id, active }: { id: number; active: boolean }) => adminsApi.toggleActive(id, active)
    );

    // ── Local UI state ────────────────────────────────────
    const [actionMenuId, setActionMenuId] = useState<number | null>(null);
    const [showCreate, setShowCreate]     = useState(false);
    const [editTarget, setEditTarget]     = useState<AdminObject | null>(null);
    const [formError,  setFormError]      = useState<string | null>(null);

    // ── Handlers ──────────────────────────────────────────
    const handleToggleActive = async (admin: AdminObject) => {
        setActionMenuId(null);
        const result = await toggleActive({ id: admin.id, active: !admin.active });
        if (result) refetch();
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        const fd = new FormData(e.currentTarget as HTMLFormElement);
        const body: CreateAdminBody = {
            name:     String(fd.get('name')     || ''),
            email:    String(fd.get('email')    || ''),
            password: String(fd.get('password') || ''),
            active:   true,
        };
        const result = await createAdmin(body);
        if (result) {
            setShowCreate(false);
            refetch();
        } else {
            setFormError(t('settings.admins.failedCreate'));
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTarget) return;
        setFormError(null);
        const fd = new FormData(e.currentTarget as HTMLFormElement);
        const body: UpdateAdminBody = {
            name:  String(fd.get('name')  || ''),
            email: String(fd.get('email') || ''),
            ...(fd.get('password') ? { password: String(fd.get('password')) } : {}),
        };
        const result = await updateAdmin({ id: editTarget.id, body });
        if (result) {
            setEditTarget(null);
            refetch();
        } else {
            setFormError(t('settings.admins.failedUpdate'));
        }
    };

    // ── Columns ───────────────────────────────────────────
    const columns: Column<AdminObject>[] = [
        {
            key: 'name', label: t('common.name'), sortable: true,
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.875rem', flexShrink: 0 }}>
                        {row.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontWeight: 500 }}>{row.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{row.email}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'active', label: t('common.status'), sortable: true,
            render: (row) => <StatusBadge status={row.active ? 'active' : 'deactivated'} />,
        },
        {
            key: 'actions', label: '', width: '48px',
            render: (row) => (
                <div style={{ position: 'relative' }}>
                    <button
                        disabled={toggling}
                        onClick={e => { e.stopPropagation(); setActionMenuId(actionMenuId === row.id ? null : row.id); }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, border: 'none', borderRadius: '6px', background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer', opacity: toggling ? 0.5 : 1 }}
                    >
                        <MoreHorizontal size={16} />
                    </button>
                    {actionMenuId === row.id && (
                        <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', right: 0, top: '100%', zIndex: 50, minWidth: 170, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'var(--shadow-lg)', padding: '4px' }}>
                            <ActionItem icon={<Pencil size={14} />} label={t('common.edit')} onClick={() => { setActionMenuId(null); setEditTarget(row); }} />
                            {row.active
                                ? <ActionItem icon={<ShieldOff size={14} />} label={t('common.deactivate')} onClick={() => handleToggleActive(row)} danger />
                                : <ActionItem icon={<ShieldCheck size={14} />} label={t('common.activate')} onClick={() => handleToggleActive(row)} />
                            }
                        </div>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Shield size={24} />
                    <h1 className={shared.pageTitle}>{t('settings.admins.adminUsers')}</h1>
                </div>
                <PermissionGate module="settings" action="create">
                    <button onClick={() => setShowCreate(true)} className={shared.addBtn}>
                        <Plus size={16} /> {t('settings.admins.addNew')}
                    </button>
                </PermissionGate>
            </div>

            <DataTable<AdminObject>
                columns={columns}
                data={admins ?? []}
                loading={loading}
                searchKeys={['name', 'email']}
                searchPlaceholder={t('settings.admins.searchPlaceholder')}
                getRowKey={row => String(row.id)}
                filters={
                    <select value={activeFilter ?? 'all'} onChange={e => setFilter('active', e.target.value)} className={shared.filterSelect}>
                        <option value="all">{t('common.all')} {t('common.status')}</option>
                        <option value="true">{t('common.active')}</option>
                        <option value="false">{t('common.inactive')}</option>
                    </select>
                }
            />

            {/* Create Modal */}
            <FormModal
                open={showCreate}
                onClose={() => { setShowCreate(false); setFormError(null); }}
                title={t('settings.admins.addAdminTitle')}
                submitLabel={creating ? t('common.saving') : t('settings.admins.createAdmin')}
                onSubmit={handleCreate}
            >
                {formError && <div style={{ padding: '10px 12px', marginBottom: 12, borderRadius: 8, background: 'color-mix(in srgb, var(--color-error) 12%, transparent)', color: 'var(--color-error)', fontSize: '0.875rem' }}>{formError}</div>}
                <div className={shared.formGrid2}>
                    <FormField label={t('settings.admins.fullName')} required>
                        <input name="name" type="text" required className={shared.formInput} placeholder={t('settings.admins.adminName')} />
                    </FormField>
                    <FormField label={t('common.email')} required>
                        <input name="email" type="email" required className={shared.formInput} placeholder="admin@example.com" />
                    </FormField>
                </div>
                <FormField label={t('settings.admins.tempPassword')} required>
                    <input name="password" type="password" required minLength={8} className={shared.formInput} placeholder={t('settings.admins.passwordHint')} />
                </FormField>
            </FormModal>

            {/* Edit Modal */}
            <FormModal
                open={!!editTarget}
                onClose={() => { setEditTarget(null); setFormError(null); }}
                title={t('common.edit') + ' ' + (editTarget?.name ?? '')}
                submitLabel={updating ? t('common.saving') : t('common.save')}
                onSubmit={handleUpdate}
            >
                {formError && <div style={{ padding: '10px 12px', marginBottom: 12, borderRadius: 8, background: 'color-mix(in srgb, var(--color-error) 12%, transparent)', color: 'var(--color-error)', fontSize: '0.875rem' }}>{formError}</div>}
                <div className={shared.formGrid2}>
                    <FormField label={t('settings.admins.fullName')} required>
                        <input name="name" type="text" required defaultValue={editTarget?.name} className={shared.formInput} />
                    </FormField>
                    <FormField label={t('common.email')} required>
                        <input name="email" type="email" required defaultValue={editTarget?.email} className={shared.formInput} />
                    </FormField>
                </div>
                <FormField label={t('settings.admins.newPassword')}>
                    <input name="password" type="password" minLength={8} className={shared.formInput} placeholder={t('settings.admins.leaveBlank')} />
                </FormField>
            </FormModal>
        </div>
    );
}

function ActionItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
    return (
        <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', borderRadius: '4px', background: 'transparent', color: danger ? 'var(--color-error)' : 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', textAlign: 'left' }}>
            {icon} {label}
        </button>
    );
}
