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
            key: 'user_name', label: t('users.wallets.user'), sortable: true,
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{row.user_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{row.user_email}</div>
                </div>
            ),
        },
        { key: 'balance', label: t('users.wallets.balance'), sortable: true, render: (row) => <strong style={{ color: row.balance > 0 ? 'var(--color-success)' : 'var(--text-tertiary)' }}>{formatMoney(row.balance)}</strong> },
        { key: 'total_credits', label: t('users.wallets.totalCredits'), sortable: true, render: (row) => formatMoney(row.total_credits) },
        { key: 'total_debits', label: t('users.wallets.totalDebits'), sortable: true, render: (row) => formatMoney(row.total_debits) },
        { key: 'status', label: t('common.status'), sortable: true, render: (row) => <StatusBadge status={row.status} /> },
        { key: 'last_transaction_at', label: t('users.wallets.lastTransaction'), sortable: true, render: (row) => row.last_transaction_at ? new Date(row.last_transaction_at).toLocaleDateString() : '-' },
        {
            key: 'actions', label: '', width: '140px',
            render: (row) => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={e => { e.stopPropagation(); setWalletAction({ wallet: row, type: 'add' }); setActionAmount(''); setActionReason(''); }} title={t('users.wallets.addFunds')} style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-primary)', color: 'var(--color-success)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Plus size={14} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); setWalletAction({ wallet: row, type: 'deduct' }); setActionAmount(''); setActionReason(''); }} title={t('users.wallets.deduct')} style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-primary)', color: 'var(--color-error)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Minus size={14} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleToggleFreeze(row.id); }} title={row.status === 'frozen' ? t('users.wallets.unfreeze') : t('users.wallets.freeze')} style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-primary)', color: row.status === 'frozen' ? 'var(--color-info)' : 'var(--color-warning)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
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
                searchPlaceholder={t('users.wallets.searchPlaceholder')}
                getRowKey={row => row.id}
                filters={
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={shared.filterSelect}>
                        <option value="all">{t('common.allStatus')}</option>
                        <option value="active">{t('common.active')}</option>
                        <option value="frozen">{t('users.wallets.frozen')}</option>
                    </select>
                }
            />

            {/* Add/Deduct Wallet Modal */}
            <FormModal
                open={!!walletAction}
                onClose={() => setWalletAction(null)}
                title={walletAction ? `${walletAction.type === 'add' ? t('users.wallets.addFundsTo') : t('users.wallets.deductFrom')} ${walletAction.wallet.user_name} — ${t('users.wallets.walletSuffix')}` : ''}
                submitLabel={walletAction?.type === 'add' ? t('users.wallets.addFunds') : t('users.wallets.deduct')}
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
                            <strong>{t('users.wallets.currentBalance')}:</strong> {formatMoney(walletAction.wallet.balance)}
                        </div>
                        <FormField label={t('users.wallets.amountEgp')} required>
                            <input type="number" value={actionAmount} onChange={e => setActionAmount(e.target.value)} required min={1} max={walletAction.type === 'deduct' ? toMajor(walletAction.wallet.balance) : 100000} className={shared.formInput} placeholder={t('users.wallets.enterAmount')} />
                        </FormField>
                        <FormField label={t('common.reason')} required>
                            <input type="text" value={actionReason} onChange={e => setActionReason(e.target.value)} required className={shared.formInput} placeholder={walletAction.type === 'add' ? t('users.wallets.addReasonPlaceholder') : t('users.wallets.deductReasonPlaceholder')} />
                        </FormField>
                    </>
                )}
            </FormModal>
        </div>
    );
}
