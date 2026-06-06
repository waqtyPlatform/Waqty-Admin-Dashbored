'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { usePermission } from '@/hooks/usePermission';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { ConfirmModal } from '@/components/admin/FormModal';
import { useApiQuery, useApiMutation } from '@/hooks/useApiQuery';
import { adminUsersApi, type UserObject } from '@/lib/api';
import { exportToCSV } from '@/lib/utils';
import { MoreHorizontal, Ban, ShieldCheck, Trash2, RotateCcw, Download, AlertTriangle, UserX } from 'lucide-react';
import styles from './page.module.css';
import shared from '@/components/admin/shared.module.css';

type StatusFilter = 'all' | 'active' | 'inactive' | 'blocked' | 'banned' | 'deleted';

function deriveStatus(u: UserObject): string {
    if (u.deleted_at) return 'deleted';
    if (u.banned) return 'banned';
    if (u.blocked) return 'blocked';
    if (!u.active) return 'inactive';
    return 'active';
}

function buildFilters(statusFilter: StatusFilter) {
    switch (statusFilter) {
        case 'active':   return { active: true };
        case 'inactive': return { active: false };
        case 'blocked':  return { blocked: true };
        case 'banned':   return { banned: true };
        case 'deleted':  return { trashed: 'only' as const };
        default:         return {};
    }
}

export default function UsersPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { t } = useTranslation();
    const { can } = usePermission();

    const statusFilter = (searchParams.get('status') || 'all') as StatusFilter;
    const [page, setPage] = useState(1);
    const setStatusFilter = useCallback((value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'all') params.delete('status');
        else params.set('status', value);
        setPage(1);
        router.replace(`${pathname}${params.toString() ? `?${params}` : ''}`, { scroll: false });
    }, [searchParams, pathname, router]);

    const [actionMenuId, setActionMenuId] = useState<string | null>(null);
    // Destructive actions (delete/ban/block) are gated behind a confirmation;
    // reversible toggles (activate/deactivate/unblock/unban/restore) stay instant.
    const [confirmAction, setConfirmAction] = useState<{ user: UserObject; action: 'delete' | 'ban' | 'block' } | null>(null);

    const apiFilters = buildFilters(statusFilter);
    // Server-paginated (per_page 15 + page) — was fetching 100 rows then slicing
    // client-side, which silently dropped every row past 100.
    const { data: users, loading, error, meta, refetch } = useApiQuery(
        () => adminUsersApi.list({ per_page: 15, page, ...apiFilters }),
        [statusFilter, page],
        { fallbackData: [] as UserObject[] }
    );

    const { mutate: toggleActive }  = useApiMutation((args: { uuid: string; active: boolean })  => adminUsersApi.toggleActive(args.uuid, args.active));
    const { mutate: toggleBlock }   = useApiMutation((args: { uuid: string; blocked: boolean }) => adminUsersApi.toggleBlock(args.uuid, args.blocked));
    const { mutate: toggleBan }     = useApiMutation((args: { uuid: string; banned: boolean })  => adminUsersApi.toggleBan(args.uuid, args.banned));
    const { mutate: deleteUser }    = useApiMutation((uuid: string) => adminUsersApi.delete(uuid));
    const { mutate: restoreUser }   = useApiMutation((uuid: string) => adminUsersApi.restore(uuid));

    const handleAction = async (user: UserObject, action: string) => {
        setActionMenuId(null);
        switch (action) {
            case 'activate':   await toggleActive({ uuid: user.uuid, active: true });  break;
            case 'deactivate': await toggleActive({ uuid: user.uuid, active: false }); break;
            case 'block':      await toggleBlock({ uuid: user.uuid, blocked: true });  break;
            case 'unblock':    await toggleBlock({ uuid: user.uuid, blocked: false }); break;
            case 'ban':        await toggleBan({ uuid: user.uuid, banned: true });     break;
            case 'unban':      await toggleBan({ uuid: user.uuid, banned: false });    break;
            case 'delete':     await deleteUser(user.uuid);  break;
            case 'restore':    await restoreUser(user.uuid); break;
        }
        refetch();
    };

    const columns: Column<UserObject>[] = [
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
        { key: 'phone', label: t('common.phone'), sortable: true },
        { key: 'gender', label: t('users.gender'), sortable: true, render: (row) => row.gender ? row.gender.charAt(0).toUpperCase() + row.gender.slice(1) : '—' },
        { key: 'date_birth', label: t('users.dateOfBirth'), render: (row) => row.date_birth ?? '—' },
        {
            key: 'active', label: t('common.status'), sortable: true,
            render: (row) => <StatusBadge status={deriveStatus(row)} />,
        },
        {
            key: 'actions', label: '', width: '48px',
            render: (row) => {
                const status = deriveStatus(row);
                return (
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={e => { e.stopPropagation(); setActionMenuId(actionMenuId === row.uuid ? null : row.uuid); }}
                            aria-label={t('common.actions')}
                            title={t('common.actions')}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, border: 'none', borderRadius: '6px', background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                            <MoreHorizontal size={16} />
                        </button>
                        {actionMenuId === row.uuid && (
                            <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', insetInlineEnd: 0, top: '100%', zIndex: 50, minWidth: 180, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', padding: 'var(--space-1)' }}>
                                {status === 'deleted' && can('users', 'edit') && (
                                    <ActionItem icon={<RotateCcw size={14} />} label={t('common.restore')} onClick={() => handleAction(row, 'restore')} />
                                )}
                                {status !== 'deleted' && (
                                    <>
                                        {!row.active && can('users', 'edit') && (
                                            <ActionItem icon={<ShieldCheck size={14} />} label={t('common.activate')} onClick={() => handleAction(row, 'activate')} />
                                        )}
                                        {row.active && can('users', 'edit') && (
                                            <ActionItem icon={<UserX size={14} />} label={t('common.deactivate')} onClick={() => handleAction(row, 'deactivate')} />
                                        )}
                                        {!row.blocked && can('users', 'edit') && (
                                            <ActionItem icon={<Ban size={14} />} label={t('common.block')} onClick={() => { setActionMenuId(null); setConfirmAction({ user: row, action: 'block' }); }} />
                                        )}
                                        {row.blocked && can('users', 'edit') && (
                                            <ActionItem icon={<ShieldCheck size={14} />} label={t('common.unblock')} onClick={() => handleAction(row, 'unblock')} />
                                        )}
                                        {!row.banned && can('users', 'edit') && (
                                            <ActionItem icon={<AlertTriangle size={14} />} label={t('common.ban')} onClick={() => { setActionMenuId(null); setConfirmAction({ user: row, action: 'ban' }); }} />
                                        )}
                                        {row.banned && can('users', 'edit') && (
                                            <ActionItem icon={<ShieldCheck size={14} />} label={t('common.unban')} onClick={() => handleAction(row, 'unban')} />
                                        )}
                                        {can('users', 'delete') && (
                                            <ActionItem icon={<Trash2 size={14} />} label={t('common.delete')} onClick={() => { setActionMenuId(null); setConfirmAction({ user: row, action: 'delete' }); }} danger />
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <h1 className={shared.pageTitle}>{t('users.title')}</h1>
            </div>
            {error && (
                <div style={{ padding: '12px 16px', background: 'var(--color-error-50)', color: 'var(--color-error)', borderRadius: 8, marginBottom: 16, fontSize: '0.875rem' }}>
                    {t('users.failedToLoad')}
                </div>
            )}
            <DataTable<UserObject>
                columns={columns}
                data={users ?? []}
                loading={loading}
                searchKeys={['name', 'email', 'phone']}
                searchPlaceholder={t('users.searchPlaceholder')}
                getRowKey={row => row.uuid}
                serverPagination
                currentPage={page}
                totalPages={meta?.pagination?.last_page ?? 1}
                onPageChange={setPage}
                onRowClick={row => router.push(`/users/${row.uuid}`)}
                filters={
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={shared.filterSelect}>
                        <option value="all">{t('common.allStatus')}</option>
                        <option value="active">{t('common.active')}</option>
                        <option value="inactive">{t('common.inactive')}</option>
                        <option value="blocked">{t('common.blocked')}</option>
                        <option value="banned">{t('common.banned')}</option>
                        <option value="deleted">{t('common.deleted')}</option>
                    </select>
                }
                actions={
                    <PermissionGate module="users" action="export">
                        <button
                            onClick={() => exportToCSV(users ?? [], 'users', [
                                { key: 'name', label: t('common.name') },
                                { key: 'email', label: t('common.email') },
                                { key: 'phone', label: t('common.phone') },
                                { key: 'gender', label: t('users.gender') },
                                { key: 'date_birth', label: t('users.dateOfBirth') },
                            ])}
                            className={shared.exportBtn}>
                            <Download size={16} /> {t('common.export')}
                        </button>
                    </PermissionGate>
                }
            />
            {confirmAction && (
                <ConfirmModal
                    open={!!confirmAction}
                    onClose={() => setConfirmAction(null)}
                    onConfirm={() => { const c = confirmAction; setConfirmAction(null); handleAction(c.user, c.action); }}
                    title={confirmAction.action === 'delete' ? t('common.delete') : confirmAction.action === 'ban' ? t('common.ban') : t('common.block')}
                    message={(confirmAction.action === 'delete' ? t('users.confirmDelete') : confirmAction.action === 'ban' ? t('users.confirmBan') : t('users.confirmBlock')).replace('{name}', confirmAction.user.name)}
                    confirmLabel={confirmAction.action === 'delete' ? t('common.delete') : confirmAction.action === 'ban' ? t('common.ban') : t('common.block')}
                    variant="danger"
                />
            )}
        </div>
    );
}

function ActionItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
    return (
        <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: '100%', padding: 'var(--space-2) var(--space-3)', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', color: danger ? 'var(--color-error)' : 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', textAlign: 'start' }}>
            {icon} {label}
        </button>
    );
}
