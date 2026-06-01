'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useApiQuery, useApiMutation } from '@/hooks/useApiQuery';
import { adminProvidersApi, type AdminProviderObject } from '@/lib/api';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { FormModal } from '@/components/admin/FormModal';
import {
    MoreHorizontal,
    Ban,
    ShieldCheck,
    Trash2,
    RotateCcw,
    Play,
    ShieldOff,
    Building2,
} from 'lucide-react';
import styles from './page.module.css';
import shared from '@/components/admin/shared.module.css';

export default function ProvidersPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { t, tn } = useTranslation();

    // ── Filters ───────────────────────────────────────────
    const activeFilter  = searchParams.get('active');
    const blockedFilter = searchParams.get('blocked');
    const bannedFilter  = searchParams.get('banned');
    const [page, setPage] = useState(1);

    const setFilter = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (!value || value === 'all') params.delete(key);
        else params.set(key, value);
        setPage(1);
        router.replace(`${pathname}${params.toString() ? `?${params}` : ''}`, { scroll: false });
    }, [searchParams, pathname, router]);

    // ── Data ──────────────────────────────────────────────
    const { data: providers, loading, meta, refetch } = useApiQuery(
        () => adminProvidersApi.list({
            ...(activeFilter  !== null && { active:  activeFilter  === 'true' }),
            ...(blockedFilter !== null && { blocked: blockedFilter === 'true' }),
            ...(bannedFilter  !== null && { banned:  bannedFilter  === 'true' }),
            page,
            per_page: 15,
        }),
        [activeFilter, blockedFilter, bannedFilter, page]
    );

    // ── Mutations ─────────────────────────────────────────
    const { mutate: toggleActive } = useApiMutation(
        ({ uuid, active }: { uuid: string; active: boolean }) => adminProvidersApi.toggleActive(uuid, active)
    );
    const { mutate: blockProvider } = useApiMutation(
        ({ uuid, blocked, reason }: { uuid: string; blocked: boolean; reason?: string }) => adminProvidersApi.block(uuid, blocked, reason)
    );
    const { mutate: banProvider } = useApiMutation(
        ({ uuid, banned, reason }: { uuid: string; banned: boolean; reason?: string }) => adminProvidersApi.ban(uuid, banned, reason)
    );
    const { mutate: softDelete } = useApiMutation(
        (uuid: string) => adminProvidersApi.delete(uuid)
    );
    const { mutate: restoreProvider } = useApiMutation(
        (uuid: string) => adminProvidersApi.restore(uuid)
    );

    // ── Local UI state ────────────────────────────────────
    const [actionMenuId, setActionMenuId] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ uuid: string; action: string; name: string } | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // ── Handlers ──────────────────────────────────────────
    const handleConfirm = async () => {
        if (!confirmAction) return;
        setActionLoading(true);
        const { uuid, action } = confirmAction;
        let result: unknown;
        if (action === 'activate')  result = await toggleActive({ uuid, active: true });
        else if (action === 'deactivate') result = await toggleActive({ uuid, active: false });
        else if (action === 'block')      result = await blockProvider({ uuid, blocked: true });
        else if (action === 'unblock')    result = await blockProvider({ uuid, blocked: false });
        else if (action === 'ban')        result = await banProvider({ uuid, banned: true });
        else if (action === 'unban')      result = await banProvider({ uuid, banned: false });
        else if (action === 'delete')     result = await softDelete(uuid);
        else if (action === 'restore')    result = await restoreProvider(uuid);
        setActionLoading(false);
        if (result !== undefined) { setConfirmAction(null); refetch(); }
    };

    // ── Status helper ─────────────────────────────────────
    const getProviderStatus = (p: AdminProviderObject) => {
        if (p.deleted_at) return 'deleted';
        if (p.banned) return 'banned';
        if (p.blocked) return 'blocked';
        return p.active ? 'active' : 'inactive';
    };

    // ── Columns ───────────────────────────────────────────
    const columns: Column<AdminProviderObject>[] = [
        {
            key: 'name',
            label: t('providers.colProvider'),
            render: r => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-600)', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>
                        {r.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{tn(r.name, r.name_ar)}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.email}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'phone',
            label: t('common.phone'),
            render: r => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{r.phone}</span>,
        },
        {
            key: 'category',
            label: t('providers.category'),
            render: r => r.category
                ? <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{r.category.name}</span>
                : <span style={{ color: 'var(--text-tertiary)' }}>—</span>,
        },
        {
            key: 'status',
            label: t('common.status'),
            render: r => <StatusBadge status={getProviderStatus(r)} />,
        },
        {
            key: 'created_at',
            label: t('providers.detail.joined'),
            render: r => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{new Date(r.created_at).toLocaleDateString()}</span>,
        },
        {
            key: 'actions',
            label: '',
            render: r => (
                <div style={{ position: 'relative' }}>
                    <button onClick={e => { e.stopPropagation(); setActionMenuId(actionMenuId === r.uuid ? null : r.uuid); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-secondary)', borderRadius: 6 }}>
                        <MoreHorizontal size={16} />
                    </button>
                    {actionMenuId === r.uuid && (
                        <div style={{ position: 'absolute', right: 0, top: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 50, minWidth: 160, padding: 4 }} onClick={e => e.stopPropagation()}>
                            {!r.deleted_at && (
                                <>
                                    <PermissionGate module="providers" action="edit">
                                        {r.active
                                            ? <button onClick={() => { setConfirmAction({ uuid: r.uuid, action: 'deactivate', name: r.name }); setActionMenuId(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: 6 }}><ShieldOff size={14} /> {t('common.deactivate')}</button>
                                            : <button onClick={() => { setConfirmAction({ uuid: r.uuid, action: 'activate', name: r.name }); setActionMenuId(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: 6 }}><Play size={14} /> {t('providers.activate')}</button>
                                        }
                                        {r.blocked
                                            ? <button onClick={() => { setConfirmAction({ uuid: r.uuid, action: 'unblock', name: r.name }); setActionMenuId(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: 6 }}><ShieldCheck size={14} /> {t('providers.unblock')}</button>
                                            : <button onClick={() => { setConfirmAction({ uuid: r.uuid, action: 'block', name: r.name }); setActionMenuId(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-warning)', borderRadius: 6 }}><Ban size={14} /> {t('providers.block')}</button>
                                        }
                                        {r.banned
                                            ? <button onClick={() => { setConfirmAction({ uuid: r.uuid, action: 'unban', name: r.name }); setActionMenuId(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: 6 }}><ShieldCheck size={14} /> {t('common.unban')}</button>
                                            : <button onClick={() => { setConfirmAction({ uuid: r.uuid, action: 'ban', name: r.name }); setActionMenuId(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-error)', borderRadius: 6 }}><Ban size={14} /> {t('common.ban')}</button>
                                        }
                                    </PermissionGate>
                                    <PermissionGate module="providers" action="delete">
                                        <button onClick={() => { setConfirmAction({ uuid: r.uuid, action: 'delete', name: r.name }); setActionMenuId(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-error)', borderRadius: 6 }}><Trash2 size={14} /> {t('providers.softDelete')}</button>
                                    </PermissionGate>
                                </>
                            )}
                            {r.deleted_at && (
                                <PermissionGate module="providers" action="edit">
                                    <button onClick={() => { setConfirmAction({ uuid: r.uuid, action: 'restore', name: r.name }); setActionMenuId(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: 6 }}><RotateCcw size={14} /> {t('providers.restore')}</button>
                                </PermissionGate>
                            )}
                        </div>
                    )}
                </div>
            ),
        },
    ];

    const filterControls = (
        <div style={{ display: 'flex', gap: 8 }}>
            <select value={activeFilter ?? 'all'} onChange={e => setFilter('active', e.target.value)} className={shared.filterSelect}>
                <option value="all">{t('common.allStatus')}</option>
                <option value="true">{t('common.active')}</option>
                <option value="false">{t('common.inactive')}</option>
            </select>
            <select value={blockedFilter ?? 'all'} onChange={e => setFilter('blocked', e.target.value)} className={shared.filterSelect}>
                <option value="all">{t('providers.allBlocked')}</option>
                <option value="true">{t('common.blocked')}</option>
                <option value="false">{t('providers.notBlocked')}</option>
            </select>
            <select value={bannedFilter ?? 'all'} onChange={e => setFilter('banned', e.target.value)} className={shared.filterSelect}>
                <option value="all">{t('providers.allBanned')}</option>
                <option value="true">{t('common.banned')}</option>
                <option value="false">{t('providers.notBanned')}</option>
            </select>
        </div>
    );

    const actionVerb: Record<string, string> = {
        activate: t('providers.activate'),
        deactivate: t('common.deactivate'),
        block: t('providers.block'),
        unblock: t('providers.unblock'),
        ban: t('common.ban'),
        unban: t('common.unban'),
        delete: t('providers.softDelete'),
        restore: t('providers.restore'),
    };
    const confirmVerb = confirmAction ? (actionVerb[confirmAction.action] ?? confirmAction.action) : '';

    const isDanger = confirmAction?.action === 'delete' || confirmAction?.action === 'ban' || confirmAction?.action === 'block';

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Building2 size={24} />
                    <h1 className={styles.pageTitle}>{t('providers.title')}</h1>
                </div>
            </div>

            <DataTable<AdminProviderObject>
                columns={columns}
                data={providers ?? []}
                loading={loading}
                searchKeys={['name', 'email', 'phone']}
                searchPlaceholder={t('providers.searchPlaceholder')}
                getRowKey={r => r.uuid}
                onRowClick={r => router.push(`/providers/${r.uuid}`)}
                filters={filterControls}
                serverPagination
                currentPage={page}
                totalPages={meta?.pagination?.last_page ?? 1}
                totalCount={meta?.pagination?.total}
                onPageChange={setPage}
            />

            {/* Confirm Modal */}
            {confirmAction && (
                <FormModal
                    open={!!confirmAction}
                    onClose={() => setConfirmAction(null)}
                    title={`${confirmVerb} ${t('providers.providerWord')}`}
                    submitLabel={actionLoading ? t('common.processing') : confirmVerb}
                    onSubmit={async e => { e.preventDefault(); await handleConfirm(); }}
                    submitVariant={isDanger ? 'danger' : 'primary'}
                >
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                        {t('providers.confirmBody')
                            .replace('{action}', confirmVerb.toLowerCase())
                            .replace('{name}', confirmAction.name)}
                        {confirmAction.action === 'delete' && t('providers.confirmDeleteNote')}
                        {confirmAction.action === 'block' && t('providers.confirmBlockNote')}
                        {confirmAction.action === 'ban' && t('providers.confirmBanNote')}
                    </p>
                </FormModal>
            )}
        </div>
    );
}

