'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { usePermission } from '@/hooks/usePermission';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { mockUsers } from '@/mocks/users';
import type { PlatformUser } from '@/types/user';
import { Plus, MoreHorizontal, Ban, ShieldCheck, Trash2, RotateCcw, Pause, Download, Wallet } from 'lucide-react';
import styles from './page.module.css';

export default function UsersPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const { can } = usePermission();
    const [users, setUsers] = useState(mockUsers);
    const [statusFilter, setStatusFilter] = useState('all');
    const [actionMenuId, setActionMenuId] = useState<string | null>(null);

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{t('users.title')}</h1>
                <PermissionGate module="users" action="create">
                    <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--color-primary-500)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
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
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'var(--font-sans)' }}>
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                        <option value="suspended">Suspended</option>
                        <option value="soft_deleted">Deleted</option>
                    </select>
                }
                actions={
                    <PermissionGate module="users" action="export">
                        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                            <Download size={16} /> Export
                        </button>
                    </PermissionGate>
                }
            />
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
