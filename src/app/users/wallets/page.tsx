'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { mockWallets } from '@/mocks/users';
import type { Wallet } from '@/types/wallet';
import { Wallet as WalletIcon, Lock, Unlock, Plus, Minus } from 'lucide-react';

export default function WalletsPage() {
    const { t } = useTranslation();
    const [wallets, setWallets] = useState(mockWallets);
    const [statusFilter, setStatusFilter] = useState('all');

    const filtered = wallets.filter(w => statusFilter === 'all' || w.status === statusFilter);

    const handleToggleFreeze = (id: string) => {
        setWallets(prev => prev.map(w =>
            w.id === id ? { ...w, status: w.status === 'frozen' ? 'active' as const : 'frozen' as const } : w
        ));
    };

    const columns: Column<Wallet>[] = [
        {
            key: 'user_name', label: 'User', sortable: true,
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{row.user_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{row.user_email}</div>
                </div>
            ),
        },
        { key: 'balance', label: 'Balance', sortable: true, render: (row) => <strong style={{ color: row.balance > 0 ? 'var(--color-success)' : 'var(--text-tertiary)' }}>EGP {row.balance.toLocaleString()}</strong> },
        { key: 'total_credits', label: 'Total Credits', sortable: true, render: (row) => `EGP ${row.total_credits.toLocaleString()}` },
        { key: 'total_debits', label: 'Total Debits', sortable: true, render: (row) => `EGP ${row.total_debits.toLocaleString()}` },
        { key: 'status', label: 'Status', sortable: true, render: (row) => <StatusBadge status={row.status} /> },
        { key: 'last_transaction_at', label: 'Last Transaction', sortable: true, render: (row) => row.last_transaction_at ? new Date(row.last_transaction_at).toLocaleDateString() : '-' },
        {
            key: 'actions', label: '', width: '140px',
            render: (row) => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={e => { e.stopPropagation(); }} title="Add Funds" style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-primary)', color: 'var(--color-success)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Plus size={14} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); }} title="Deduct" style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-primary)', color: 'var(--color-error)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Minus size={14} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleToggleFreeze(row.id); }} title={row.status === 'frozen' ? 'Unfreeze' : 'Freeze'} style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-primary)', color: row.status === 'frozen' ? 'var(--color-info)' : 'var(--color-warning)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        {row.status === 'frozen' ? <Unlock size={14} /> : <Lock size={14} />}
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <WalletIcon size={24} />
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{t('sidebar.wallets')}</h1>
            </div>
            <DataTable<Wallet>
                columns={columns} data={filtered}
                searchKeys={['user_name', 'user_email']}
                searchPlaceholder="Search wallets..."
                getRowKey={row => row.id}
                filters={
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'var(--font-sans)' }}>
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="frozen">Frozen</option>
                    </select>
                }
            />
        </div>
    );
}
