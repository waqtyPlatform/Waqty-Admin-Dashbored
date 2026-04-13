'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { usePermission } from '@/hooks/usePermission';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { FormModal, ConfirmModal, FormField } from '@/components/admin/FormModal';
import { mockProviders } from '@/mocks/providers';
import type { Provider } from '@/types/provider';
import { exportToCSV } from '@/lib/utils';
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
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ id: string; action: string; name: string } | null>(null);
    const [newProvider, setNewProvider] = useState({ business_name: '', name: '', email: '', phone: '', business_category: 'salon', city: '', commission_rate: 10 });

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
                        <button className={styles.exportBtn} onClick={() => exportToCSV(filtered, 'providers', [{key:'business_name',label:'Business'},{key:'email',label:'Email'},{key:'status',label:'Status'},{key:'business_category',label:'Category'},{key:'total_bookings',label:'Bookings'},{key:'total_revenue',label:'Revenue'}])}><Download size={16} /> {t('common.export')}</button>
                    </PermissionGate>
                }
            />

            {/* Create Provider Modal */}
            <FormModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Add New Provider"
                submitLabel="Create Provider"
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
                <FormField label="Business Name" required>
                    <input type="text" value={newProvider.business_name} onChange={e => setNewProvider(p => ({ ...p, business_name: e.target.value }))} required className={styles.formInput} placeholder="e.g. Glamour Studio" />
                </FormField>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <FormField label="Owner Name" required>
                        <input type="text" value={newProvider.name} onChange={e => setNewProvider(p => ({ ...p, name: e.target.value }))} required className={styles.formInput} placeholder="Full name" />
                    </FormField>
                    <FormField label="Category" required>
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
                    <FormField label="Email" required>
                        <input type="email" value={newProvider.email} onChange={e => setNewProvider(p => ({ ...p, email: e.target.value }))} required className={styles.formInput} placeholder="email@example.com" />
                    </FormField>
                    <FormField label="Phone" required>
                        <input type="tel" value={newProvider.phone} onChange={e => setNewProvider(p => ({ ...p, phone: e.target.value }))} required className={styles.formInput} placeholder="+201012345678" />
                    </FormField>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <FormField label="City" required>
                        <input type="text" value={newProvider.city} onChange={e => setNewProvider(p => ({ ...p, city: e.target.value }))} required className={styles.formInput} placeholder="Cairo" />
                    </FormField>
                    <FormField label="Commission Rate (%)">
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
