'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { mockWallets } from '@/mocks/users';
import type { Wallet } from '@/types/wallet';
import { formatMoney, toMinor, toMajor } from '@/lib/market';
import { Wallet as WalletIcon, Lock, Unlock, Plus, Minus } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';

export default function WalletsPage() {
    const { t } = useTranslation();
    const [wallets, setWallets] = useState(mockWallets);
    const [statusFilter, setStatusFilter] = useState('all');
    const [walletAction, setWalletAction] = useState<{ wallet: Wallet; type: 'add' | 'deduct' } | null>(null);
    const [actionAmount, setActionAmount] = useState('');
    const [actionReason, setActionReason] = useState('');

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
        { key: 'balance', label: 'Balance', sortable: true, render: (row) => <strong style={{ color: row.balance > 0 ? 'var(--color-success)' : 'var(--text-tertiary)' }}>{formatMoney(row.balance)}</strong> },
        { key: 'total_credits', label: 'Total Credits', sortable: true, render: (row) => formatMoney(row.total_credits) },
        { key: 'total_debits', label: 'Total Debits', sortable: true, render: (row) => formatMoney(row.total_debits) },
        { key: 'status', label: 'Status', sortable: true, render: (row) => <StatusBadge status={row.status} /> },
        { key: 'last_transaction_at', label: 'Last Transaction', sortable: true, render: (row) => row.last_transaction_at ? new Date(row.last_transaction_at).toLocaleDateString() : '-' },
        {
            key: 'actions', label: '', width: '140px',
            render: (row) => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={e => { e.stopPropagation(); setWalletAction({ wallet: row, type: 'add' }); setActionAmount(''); setActionReason(''); }} title="Add Funds" style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-primary)', color: 'var(--color-success)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Plus size={14} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); setWalletAction({ wallet: row, type: 'deduct' }); setActionAmount(''); setActionReason(''); }} title="Deduct" style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-primary)', color: 'var(--color-error)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
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
        <div className={shared.page}>
            <div className={shared.pageHeader} style={{ justifyContent: 'flex-start' }}>
                <WalletIcon size={24} />
                <h1 className={shared.pageTitle}>{t('sidebar.wallets')}</h1>
            </div>
            <DataTable<Wallet>
                columns={columns} data={filtered}
                searchKeys={['user_name', 'user_email']}
                searchPlaceholder="Search wallets..."
                getRowKey={row => row.id}
                filters={
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={shared.filterSelect}>
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="frozen">Frozen</option>
                    </select>
                }
            />

            {/* Add/Deduct Wallet Modal */}
            <FormModal
                open={!!walletAction}
                onClose={() => setWalletAction(null)}
                title={walletAction ? `${walletAction.type === 'add' ? 'Add Funds to' : 'Deduct from'} ${walletAction.wallet.user_name}'s Wallet` : ''}
                submitLabel={walletAction?.type === 'add' ? 'Add Funds' : 'Deduct'}
                submitVariant={walletAction?.type === 'deduct' ? 'danger' : 'primary'}
                onSubmit={e => {
                    e.preventDefault();
                    if (walletAction && actionAmount) {
                        const amt = toMinor(Number(actionAmount)); // input is major units; store minor
                        setWallets(prev => prev.map(w => w.id === walletAction.wallet.id ? {
                            ...w,
                            balance: walletAction.type === 'add' ? w.balance + amt : Math.max(0, w.balance - amt),
                            total_credits: walletAction.type === 'add' ? w.total_credits + amt : w.total_credits,
                            total_debits: walletAction.type === 'deduct' ? w.total_debits + amt : w.total_debits,
                        } : w));
                    }
                    setWalletAction(null);
                }}
            >
                {walletAction && (
                    <>
                        <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: '0.875rem' }}>
                            <strong>Current Balance:</strong> {formatMoney(walletAction.wallet.balance)}
                        </div>
                        <FormField label="Amount (EGP)" required>
                            <input type="number" value={actionAmount} onChange={e => setActionAmount(e.target.value)} required min={1} max={walletAction.type === 'deduct' ? toMajor(walletAction.wallet.balance) : 100000} className={shared.formInput} placeholder="Enter amount" />
                        </FormField>
                        <FormField label="Reason" required>
                            <input type="text" value={actionReason} onChange={e => setActionReason(e.target.value)} required className={shared.formInput} placeholder={walletAction.type === 'add' ? 'e.g. Loyalty reward, Refund' : 'e.g. Duplicate refund correction'} />
                        </FormField>
                    </>
                )}
            </FormModal>
        </div>
    );
}
