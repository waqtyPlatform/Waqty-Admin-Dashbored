'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { usePermission } from '@/hooks/usePermission';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { FormModal, ConfirmModal, FormField } from '@/components/admin/FormModal';
import { mockProviders } from '@/mocks/providers';
import type { Provider } from '@/types/provider';
import { exportToCSV } from '@/lib/utils';
import { scoreProvider, assessChurnRisk, type ProviderScore, type ChurnRisk } from '@/lib/analytics';
import {
    Plus,
    MoreHorizontal,
    Ban,
    ShieldCheck,
    Trash2,
    RotateCcw,
    LogIn,
    Pause,
    Play,
    Download,
} from 'lucide-react';
import styles from './page.module.css';

export default function ProvidersPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { t } = useTranslation();
    const { can } = usePermission();
    const [providers, setProviders] = useState(mockProviders);
    const statusFilter = searchParams.get('status') || 'all';
    const categoryFilter = searchParams.get('category') || 'all';
    const churnFilter = searchParams.get('churn') || 'all';

    const scoreMap = useMemo<Map<string, ProviderScore>>(() => {
        const m = new Map<string, ProviderScore>();
        providers.forEach(p => m.set(p.id, scoreProvider(p, providers)));
        return m;
    }, [providers]);
    const churnMap = useMemo<Map<string, ChurnRisk>>(() => {
        const m = new Map<string, ChurnRisk>();
        providers.forEach(p => m.set(p.id, assessChurnRisk(p, providers)));
        return m;
    }, [providers]);
    const setFilter = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'all') params.delete(key);
        else params.set(key, value);
        router.replace(`${pathname}${params.toString() ? `?${params}` : ''}`, { scroll: false });
    }, [searchParams, pathname, router]);
    const [actionMenuId, setActionMenuId] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ id: string; action: string; name: string } | null>(null);
    const [newProvider, setNewProvider] = useState({ business_name: '', name: '', email: '', phone: '', business_category: 'salon', city: '', commission_rate: 10 });

    const filtered = providers.filter(p => {
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;
        if (categoryFilter !== 'all' && p.business_category !== categoryFilter) return false;
        if (churnFilter !== 'all' && churnMap.get(p.id)?.risk !== churnFilter) return false;
        return true;
    });

    const handleAction = (id: string, action: string) => {
        setActionMenuId(null);
        setProviders(prev =>
            prev.map(p => {
                if (p.id !== id) return p;
                switch (action) {
                    case 'block': return { ...p, status: 'blocked' as const };
                    case 'unblock': return { ...p, status: 'active' as const };
                    case 'suspend': return { ...p, status: 'suspended' as const };
                    case 'activate': return { ...p, status: 'active' as const };
                    case 'soft_delete': return { ...p, status: 'soft_deleted' as const, deleted_at: new Date().toISOString() };
                    case 'restore': return { ...p, status: 'active' as const, deleted_at: null };
                    default: return p;
                }
            })
        );
    };

    const columns: Column<Provider>[] = [
        {
            key: 'business_name',
            label: t('providers.businessName'),
            sortable: true,
            render: (row) => {
                const churn = churnMap.get(row.id);
                const isHigh = churn?.risk === 'high';
                return (
                    <div className={styles.providerCell} style={isHigh ? { borderInlineStart: '3px solid var(--color-error)', paddingInlineStart: 8, marginInlineStart: -11 } : undefined}>
                        <div className={styles.providerAvatar}>{row.business_name.charAt(0)}</div>
                        <div>
                            <div className={styles.providerName}>
                                {row.business_name}
                                {isHigh && (
                                    <span title={churn?.reasons.join(' • ')} style={{ marginInlineStart: 8, padding: '1px 6px', fontSize: '0.6875rem', borderRadius: 4, background: 'color-mix(in srgb, var(--color-error) 14%, transparent)', color: 'var(--color-error)', fontWeight: 600 }}>
                                        {t('providers.churnRisk.level.high')}
                                    </span>
                                )}
                            </div>
                            <div className={styles.providerEmail}>{row.email}</div>
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'business_category',
            label: t('providers.category'),
            sortable: true,
            render: (row) => <span className={styles.categoryBadge}>{row.business_category}</span>,
        },
        {
            key: 'status',
            label: t('common.status'),
            sortable: true,
            render: (row) => <StatusBadge status={row.status} />,
        },
        {
            key: 'subscription_status',
            label: t('providers.subscription'),
            sortable: true,
            render: (row) => <StatusBadge status={row.subscription_status} />,
        },
        {
            key: 'branches_count',
            label: t('providers.branches'),
            sortable: true,
        },
        {
            key: 'employees_count',
            label: t('providers.employees'),
            sortable: true,
        },
        {
            key: 'total_bookings',
            label: t('providers.bookings'),
            sortable: true,
            render: (row) => row.total_bookings.toLocaleString(),
        },
        {
            key: 'total_revenue',
            label: t('providers.revenue'),
            sortable: true,
            render: (row) => `EGP ${(row.total_revenue / 1000).toFixed(0)}K`,
        },
        {
            key: 'score',
            label: t('providers.score.title'),
            sortable: true,
            render: (row) => {
                const s = scoreMap.get(row.id);
                if (!s) return null;
                const tierColor = s.tier === 'elite' ? 'var(--color-success)'
                    : s.tier === 'strong' ? 'var(--color-info)'
                    : s.tier === 'average' ? 'var(--color-warning)'
                    : 'var(--color-error)';
                return (
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '3px 10px',
                        borderRadius: 999,
                        background: `color-mix(in srgb, ${tierColor} 14%, transparent)`,
                        color: tierColor,
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                    }}>
                        {s.score}
                        <span style={{ fontSize: '0.6875rem', fontWeight: 500, textTransform: 'uppercase', opacity: 0.85 }}>
                            {t(`providers.score.tier.${s.tier === 'at_risk' ? 'atRisk' : s.tier}`)}
                        </span>
                    </span>
                );
            },
        },
        {
            key: 'actions',
            label: '',
            width: '48px',
            render: (row) => (
                <div className={styles.actionWrap}>
                    <button
                        className={styles.actionBtn}
                        onClick={(e) => { e.stopPropagation(); setActionMenuId(actionMenuId === row.id ? null : row.id); }}
                    >
                        <MoreHorizontal size={16} />
                    </button>
                    {actionMenuId === row.id && (
                        <div className={styles.actionMenu} onClick={e => e.stopPropagation()}>
                            {row.status === 'active' && can('providers', 'edit') && (
                                <>
                                    <button onClick={() => setConfirmAction({ id: row.id, action: 'suspend', name: row.business_name })}>
                                        <Pause size={14} /> {t('providers.suspend')}
                                    </button>
                                    <button onClick={() => setConfirmAction({ id: row.id, action: 'block', name: row.business_name })}>
                                        <Ban size={14} /> {t('providers.block')}
                                    </button>
                                </>
                            )}
                            {row.status === 'suspended' && can('providers', 'edit') && (
                                <button onClick={() => handleAction(row.id, 'activate')}>
                                    <Play size={14} /> {t('providers.activate')}
                                </button>
                            )}
                            {row.status === 'blocked' && can('providers', 'edit') && (
                                <button onClick={() => handleAction(row.id, 'unblock')}>
                                    <ShieldCheck size={14} /> {t('providers.unblock')}
                                </button>
                            )}
                            {row.status === 'soft_deleted' && can('providers', 'edit') && (
                                <button onClick={() => handleAction(row.id, 'restore')}>
                                    <RotateCcw size={14} /> {t('providers.restore')}
                                </button>
                            )}
                            {row.status !== 'soft_deleted' && can('providers', 'delete') && (
                                <button className={styles.danger} onClick={() => setConfirmAction({ id: row.id, action: 'soft_delete', name: row.business_name })}>
                                    <Trash2 size={14} /> {t('providers.softDelete')}
                                </button>
                            )}
                            {can('providers', 'impersonate') && row.status === 'active' && (
                                <button className={styles.impersonate} onClick={() => setActionMenuId(null)}>
                                    <LogIn size={14} /> {t('providers.impersonate')}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{t('providers.title')}</h1>
                <PermissionGate module="providers" action="create">
                    <button className={styles.addBtn} onClick={() => setShowCreateModal(true)}>
                        <Plus size={16} /> {t('providers.addNew')}
                    </button>
                </PermissionGate>
            </div>

            <DataTable<Provider>
                columns={columns}
                data={filtered}
                searchKeys={['business_name', 'email', 'name', 'city']}
                searchPlaceholder={t('providers.searchPlaceholder')}
                getRowKey={(row) => row.id}
                onRowClick={(row) => router.push(`/providers/${row.id}`)}
                filters={
                    <div className={styles.filterGroup}>
                        <select
                            value={statusFilter}
                            onChange={e => setFilter('status', e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="all">{t('providers.allStatus')}</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="blocked">Blocked</option>
                            <option value="soft_deleted">Deleted</option>
                            <option value="pending_review">Pending</option>
                        </select>
                        <select
                            value={categoryFilter}
                            onChange={e => setFilter('category', e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="all">{t('providers.allCategory')}</option>
                            <option value="salon">Salon</option>
                            <option value="barber">Barber</option>
                            <option value="clinic">Clinic</option>
                            <option value="spa">Spa</option>
                            <option value="nails">Nails</option>
                        </select>
                        <select
                            value={churnFilter}
                            onChange={e => setFilter('churn', e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="all">{t('providers.churnRisk.title')}: {t('common.all')}</option>
                            <option value="high">{t('providers.churnRisk.level.high')}</option>
                            <option value="watch">{t('providers.churnRisk.level.watch')}</option>
                            <option value="none">{t('providers.churnRisk.level.none')}</option>
                        </select>
                    </div>
                }
                actions={
                    <PermissionGate module="providers" action="export">
                        <button className={styles.exportBtn} onClick={() => exportToCSV(filtered, 'providers', [{key:'business_name',label:'Business'},{key:'email',label:'Email'},{key:'status',label:'Status'},{key:'business_category',label:'Category'},{key:'total_bookings',label:'Bookings'},{key:'total_revenue',label:'Revenue'}])}><Download size={16} /> {t('common.export')}</button>
                    </PermissionGate>
                }
            />

            {/* Create Provider Modal */}
            <FormModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title={t('providers.addNewProvider')}
                submitLabel={t('providers.createProvider')}
                onSubmit={(e) => {
                    e.preventDefault();
                    const id = String(Date.now());
                    setProviders(prev => [{
                        id, uuid: `prov-${id}`, name: newProvider.name, email: newProvider.email, phone: newProvider.phone,
                        business_name: newProvider.business_name, business_category: newProvider.business_category as Provider['business_category'],
                        status: 'active', subscription_plan_id: null, subscription_status: 'trial',
                        country: 'Egypt', city: newProvider.city, branches_count: 0, employees_count: 0,
                        total_bookings: 0, total_revenue: 0, commission_rate: newProvider.commission_rate,
                        registered_at: new Date().toISOString(), verified_at: new Date().toISOString(),
                        last_active_at: new Date().toISOString(), created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(), deleted_at: null,
                    }, ...prev]);
                    setShowCreateModal(false);
                    setNewProvider({ business_name: '', name: '', email: '', phone: '', business_category: 'salon', city: '', commission_rate: 10 });
                }}
            >
                <FormField label={t('providers.businessName')} required>
                    <input type="text" value={newProvider.business_name} onChange={e => setNewProvider(p => ({ ...p, business_name: e.target.value }))} required className={styles.formInput} placeholder="e.g. Glamour Studio" />
                </FormField>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <FormField label={t('providers.ownerName')} required>
                        <input type="text" value={newProvider.name} onChange={e => setNewProvider(p => ({ ...p, name: e.target.value }))} required className={styles.formInput} placeholder="Full name" />
                    </FormField>
                    <FormField label={t('providers.category')} required>
                        <select value={newProvider.business_category} onChange={e => setNewProvider(p => ({ ...p, business_category: e.target.value }))} className={styles.formInput}>
                            <option value="salon">Salon</option>
                            <option value="barber">Barber</option>
                            <option value="clinic">Clinic</option>
                            <option value="spa">Spa</option>
                            <option value="nails">Nails</option>
                        </select>
                    </FormField>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <FormField label={t('common.email')} required>
                        <input type="email" value={newProvider.email} onChange={e => setNewProvider(p => ({ ...p, email: e.target.value }))} required className={styles.formInput} placeholder="email@example.com" />
                    </FormField>
                    <FormField label={t('common.phone')} required>
                        <input type="tel" value={newProvider.phone} onChange={e => setNewProvider(p => ({ ...p, phone: e.target.value }))} required className={styles.formInput} placeholder="+201012345678" />
                    </FormField>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <FormField label={t('common.city')} required>
                        <input type="text" value={newProvider.city} onChange={e => setNewProvider(p => ({ ...p, city: e.target.value }))} required className={styles.formInput} placeholder="Cairo" />
                    </FormField>
                    <FormField label={`${t('providers.commissionRate')} (%)`}>
                        <input type="number" value={newProvider.commission_rate} onChange={e => setNewProvider(p => ({ ...p, commission_rate: Number(e.target.value) }))} className={styles.formInput} min={0} max={100} />
                    </FormField>
                </div>
            </FormModal>

            {/* Confirm Action Modal */}
            <ConfirmModal
                open={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={() => { if (confirmAction) { handleAction(confirmAction.id, confirmAction.action); setConfirmAction(null); } }}
                title={confirmAction ? `${confirmAction.action === 'soft_delete' ? 'Delete' : confirmAction.action.charAt(0).toUpperCase() + confirmAction.action.slice(1)} Provider` : ''}
                message={confirmAction ? `Are you sure you want to ${confirmAction.action.replace('_', ' ')} "${confirmAction.name}"? ${confirmAction.action === 'soft_delete' ? 'The provider data will be preserved but hidden from the platform.' : confirmAction.action === 'block' ? 'The provider will not be able to log in.' : ''}` : ''}
                confirmLabel={confirmAction?.action === 'soft_delete' ? 'Delete' : confirmAction?.action === 'block' ? 'Block' : 'Confirm'}
                variant={confirmAction?.action === 'soft_delete' || confirmAction?.action === 'block' ? 'danger' : 'warning'}
            />
        </div>
    );
}
