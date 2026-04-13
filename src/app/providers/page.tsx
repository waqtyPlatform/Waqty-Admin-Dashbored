'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { usePermission } from '@/hooks/usePermission';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { mockProviders } from '@/mocks/providers';
import type { Provider } from '@/types/provider';
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
    const { t } = useTranslation();
    const { can } = usePermission();
    const [providers, setProviders] = useState(mockProviders);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [actionMenuId, setActionMenuId] = useState<string | null>(null);

    const filtered = providers.filter(p => {
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;
        if (categoryFilter !== 'all' && p.business_category !== categoryFilter) return false;
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
            render: (row) => (
                <div className={styles.providerCell}>
                    <div className={styles.providerAvatar}>{row.business_name.charAt(0)}</div>
                    <div>
                        <div className={styles.providerName}>{row.business_name}</div>
                        <div className={styles.providerEmail}>{row.email}</div>
                    </div>
                </div>
            ),
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
            label: 'Bookings',
            sortable: true,
            render: (row) => row.total_bookings.toLocaleString(),
        },
        {
            key: 'total_revenue',
            label: 'Revenue',
            sortable: true,
            render: (row) => `EGP ${(row.total_revenue / 1000).toFixed(0)}K`,
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
                                    <button onClick={() => handleAction(row.id, 'suspend')}>
                                        <Pause size={14} /> {t('providers.suspend')}
                                    </button>
                                    <button onClick={() => handleAction(row.id, 'block')}>
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
                                <button className={styles.danger} onClick={() => handleAction(row.id, 'soft_delete')}>
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
                    <button className={styles.addBtn}>
                        <Plus size={16} /> {t('providers.addNew')}
                    </button>
                </PermissionGate>
            </div>

            <DataTable<Provider>
                columns={columns}
                data={filtered}
                searchKeys={['business_name', 'email', 'name', 'city']}
                searchPlaceholder="Search providers..."
                getRowKey={(row) => row.id}
                onRowClick={(row) => router.push(`/providers/${row.id}`)}
                filters={
                    <div className={styles.filterGroup}>
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="all">{t('common.all')} Status</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="blocked">Blocked</option>
                            <option value="soft_deleted">Deleted</option>
                            <option value="pending_review">Pending</option>
                        </select>
                        <select
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="all">{t('common.all')} Category</option>
                            <option value="salon">Salon</option>
                            <option value="barber">Barber</option>
                            <option value="clinic">Clinic</option>
                            <option value="spa">Spa</option>
                            <option value="nails">Nails</option>
                        </select>
                    </div>
                }
                actions={
                    <PermissionGate module="providers" action="export">
                        <button className={styles.exportBtn}><Download size={16} /> {t('common.export')}</button>
                    </PermissionGate>
                }
            />
        </div>
    );
}
