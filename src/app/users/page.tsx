'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { usePermission } from '@/hooks/usePermission';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { mockUsers } from '@/mocks/users';
import type { PlatformUser } from '@/types/user';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { exportToCSV } from '@/lib/utils';
import { Plus, MoreHorizontal, Ban, ShieldCheck, Trash2, RotateCcw, Pause, Download, Wallet } from 'lucide-react';
import styles from './page.module.css';
import shared from '@/components/admin/shared.module.css';

export default function UsersPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { t } = useTranslation();
    const { can } = usePermission();
    const [users, setUsers] = useState(mockUsers);
    const statusFilter = searchParams.get('status') || 'all';
    const setStatusFilter = useCallback((value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'all') params.delete('status');
        else params.set('status', value);
        router.replace(`${pathname}${params.toString() ? `?${params}` : ''}`, { scroll: false });
    }, [searchParams, pathname, router]);
    const [actionMenuId, setActionMenuId] = useState<string | null>(null);
    const [showCreateUser, setShowCreateUser] = useState(false);


    const filtered = users.filter(u => statusFilter === 'all' || u.status === statusFilter);

    const handleAction = (id: string, action: string) => {
        setActionMenuId(null);
        setUsers(prev => prev.map(u => {
            if (u.id !== id) return u;
            switch (action) {
                case 'block': return { ...u, status: 'blocked' as const };
                case 'unblock': return { ...u, status: 'active' as const };
                case 'suspend': return { ...u, status: 'suspended' as const };
                case 'soft_delete': return { ...u, status: 'soft_deleted' as const, deleted_at: new Date().toISOString() };
                case 'restore': return { ...u, status: 'active' as const, deleted_at: null };
                default: return u;
            }
        }));
    };

    const columns: Column<PlatformUser>[] = [
        {
            key: 'name', label: t('common.name'), sortable: true,
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.875rem', flexShrink: 0 }}>
                        {row.name.charAt(0)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 500 }}>{row.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{row.email}</div>
                    </div>
                </div>
            ),
        },
        { key: 'phone', label: t('common.phone'), sortable: true },
        { key: 'city', label: 'City', sortable: true },
        { key: 'status', label: t('common.status'), sortable: true, render: (row) => <StatusBadge status={row.status} /> },
        { key: 'total_bookings', label: 'Bookings', sortable: true },
        { key: 'total_spent', label: 'Spent', sortable: true, render: (row) => `EGP ${row.total_spent.toLocaleString()}` },
        { key: 'wallet_balance', label: 'Wallet', sortable: true, render: (row) => <span style={{ color: row.wallet_balance > 0 ? 'var(--color-success)' : 'var(--text-tertiary)' }}>EGP {row.wallet_balance}</span> },
        {
            key: 'actions', label: '', width: '48px',
            render: (row) => (
                <div style={{ position: 'relative' }}>
                    <button onClick={e => { e.stopPropagation(); setActionMenuId(actionMenuId === row.id ? null : row.id); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, border: 'none', borderRadius: '6px', background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                        <MoreHorizontal size={16} />
                    </button>
                    {actionMenuId === row.id && (
                        <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', right: 0, top: '100%', zIndex: 50, minWidth: 170, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'var(--shadow-lg)', padding: '4px' }}>
                            {row.status === 'active' && can('users', 'edit') && (
                                <>
                                    <ActionItem icon={<Pause size={14} />} label={t('users.suspend')} onClick={() => handleAction(row.id, 'suspend')} />
                                    <ActionItem icon={<Ban size={14} />} label={t('users.block')} onClick={() => handleAction(row.id, 'block')} />
                                </>
                            )}
                            {row.status === 'suspended' && can('users', 'edit') && <ActionItem icon={<ShieldCheck size={14} />} label="Activate" onClick={() => handleAction(row.id, 'unblock')} />}
                            {row.status === 'blocked' && can('users', 'edit') && <ActionItem icon={<ShieldCheck size={14} />} label={t('users.unblock')} onClick={() => handleAction(row.id, 'unblock')} />}
                            {row.status === 'soft_deleted' && can('users', 'edit') && <ActionItem icon={<RotateCcw size={14} />} label={t('users.restore')} onClick={() => handleAction(row.id, 'restore')} />}
                            {can('wallets', 'view') && <ActionItem icon={<Wallet size={14} />} label="Manage Wallet" onClick={() => { setActionMenuId(null); router.push(`/users/${row.id}`); }} />}
                            {row.status !== 'soft_deleted' && can('users', 'delete') && <ActionItem icon={<Trash2 size={14} />} label={t('users.softDelete')} onClick={() => handleAction(row.id, 'soft_delete')} danger />}
                        </div>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <h1 className={shared.pageTitle}>{t('users.title')}</h1>
                <PermissionGate module="users" action="create">
                    <button onClick={() => setShowCreateUser(true)} className={shared.addBtn}>
                        <Plus size={16} /> {t('users.addNew')}
                    </button>
                </PermissionGate>
            </div>
            <DataTable<PlatformUser>
                columns={columns} data={filtered}
                searchKeys={['name', 'email', 'phone', 'city']}
                searchPlaceholder="Search users..."
                getRowKey={row => row.id}
                onRowClick={row => router.push(`/users/${row.id}`)}
                filters={
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={shared.filterSelect}>
                        <option value="all">{t('common.all')} {t('common.status')}</option>
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                        <option value="suspended">Suspended</option>
                        <option value="soft_deleted">Deleted</option>
                    </select>
                }
                actions={
                    <PermissionGate module="users" action="export">
                        <button onClick={() => exportToCSV(filtered, 'users', [{key:'name',label:'Name'},{key:'email',label:'Email'},{key:'phone',label:'Phone'},{key:'city',label:'City'},{key:'status',label:'Status'},{key:'total_bookings',label:'Bookings'},{key:'total_spent',label:'Spent'}])} className={shared.exportBtn}>
                            <Download size={16} /> {t('common.export')}
                        </button>
                    </PermissionGate>
                }
            />

            <FormModal open={showCreateUser} onClose={() => setShowCreateUser(false)} title="Add New User" submitLabel="Create User" onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const id = String(Date.now());
                const now = new Date().toISOString();
                setUsers(prev => [{
                    id, uuid: `user-${id}`, name: String(fd.get('name') || ''), email: String(fd.get('email') || ''),
                    phone: String(fd.get('phone') || ''), city: String(fd.get('city') || ''), country: 'Egypt',
                    status: 'active' as const, total_bookings: 0, total_spent: 0, wallet_balance: 0, preferred_language: 'en' as const,
                    last_booking_at: null, registered_at: now, last_active_at: now, created_at: now, updated_at: now, deleted_at: null,
                } satisfies PlatformUser, ...prev]);
                setShowCreateUser(false);
            }}>
                <div className={shared.formGrid2}>
                    <FormField label="Full Name" required><input name="name" type="text" required className={shared.formInput} placeholder="User name" /></FormField>
                    <FormField label="Email" required><input name="email" type="email" required className={shared.formInput} placeholder="email@example.com" /></FormField>
                </div>
                <div className={shared.formGrid2}>
                    <FormField label="Phone" required><input name="phone" type="tel" required className={shared.formInput} placeholder="+201012345678" /></FormField>
                    <FormField label="City"><input name="city" type="text" className={shared.formInput} placeholder="Cairo" /></FormField>
                </div>
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
