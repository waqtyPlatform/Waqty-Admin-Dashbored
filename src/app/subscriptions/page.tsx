'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { mockSubscriptions } from '@/mocks/subscriptions';
import type { ProviderSubscription } from '@/types/subscription';
import { RefreshCw, ArrowUpCircle, ArrowDownCircle, XCircle, Percent } from 'lucide-react';

export default function SubscriptionsPage() {
    const { t } = useTranslation();
    const [subs] = useState(mockSubscriptions);
    const [statusFilter, setStatusFilter] = useState('all');

    const filtered = subs.filter(s => statusFilter === 'all' || s.status === statusFilter);

    const summary = {
        active: subs.filter(s => s.status === 'active').length,
        trial: subs.filter(s => s.status === 'trial').length,
        past_due: subs.filter(s => s.status === 'past_due').length,
        cancelled: subs.filter(s => s.status === 'cancelled').length,
        mrr: subs.filter(s => s.status === 'active').reduce((sum, s) => sum + (s.billing_cycle === 'monthly' ? s.amount : s.amount / 12), 0),
    };

    const columns: Column<ProviderSubscription>[] = [
        { key: 'provider_name', label: 'Provider', sortable: true, render: (row) => <span style={{ fontWeight: 500 }}>{row.provider_name}</span> },
        { key: 'plan_name', label: 'Plan', sortable: true, render: (row) => <span style={{ padding: '2px 8px', borderRadius: 4, background: row.plan_tier === 'enterprise' ? 'var(--color-primary-50)' : row.plan_tier === 'pro' ? 'var(--color-info-light)' : 'var(--bg-tertiary)', fontSize: '0.75rem', fontWeight: 500 }}>{row.plan_name}</span> },
        { key: 'billing_cycle', label: 'Cycle', sortable: true, render: (row) => <span style={{ textTransform: 'capitalize' }}>{row.billing_cycle}</span> },
        { key: 'status', label: 'Status', sortable: true, render: (row) => <StatusBadge status={row.status} /> },
        { key: 'amount', label: 'Amount', sortable: true, render: (row) => `EGP ${row.amount.toLocaleString()}` },
        { key: 'current_period_end', label: 'Renews', sortable: true, render: (row) => new Date(row.current_period_end).toLocaleDateString() },
        { key: 'auto_renew', label: 'Auto-Renew', render: (row) => row.auto_renew ? 'Yes' : 'No' },
        {
            key: 'actions', label: '', width: '180px',
            render: (row) => (
                <PermissionGate module="subscriptions" action="edit">
                    <div style={{ display: 'flex', gap: 4 }}>
                        {row.status === 'active' && <ActionBtn icon={<RefreshCw size={13} />} label="Renew" />}
                        {row.status === 'trial' && <ActionBtn icon={<ArrowUpCircle size={13} />} label="Upgrade" />}
                        {row.status === 'past_due' && <ActionBtn icon={<RefreshCw size={13} />} label="Renew" color="var(--color-warning)" />}
                        {row.status !== 'cancelled' && <ActionBtn icon={<XCircle size={13} />} label="Cancel" color="var(--color-error)" />}
                        <ActionBtn icon={<Percent size={13} />} label="Discount" />
                    </div>
                </PermissionGate>
            ),
        },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{t('subscriptions.title')}</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
                {[
                    { label: 'Active', value: summary.active, color: 'var(--color-success)' },
                    { label: 'Trial', value: summary.trial, color: 'var(--color-info)' },
                    { label: 'Past Due', value: summary.past_due, color: 'var(--color-warning)' },
                    { label: 'Cancelled', value: summary.cancelled, color: 'var(--color-error)' },
                    { label: 'MRR', value: `EGP ${Math.round(summary.mrr).toLocaleString()}`, color: 'var(--color-primary-500)' },
                ].map(s => (
                    <div key={s.label} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, borderTop: `3px solid ${s.color}` }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>{s.label}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <DataTable<ProviderSubscription>
                columns={columns} data={filtered}
                searchKeys={['provider_name', 'plan_name']}
                searchPlaceholder="Search subscriptions..."
                getRowKey={row => row.id}
                filters={
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'var(--font-sans)' }}>
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="trial">Trial</option>
                        <option value="past_due">Past Due</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                }
            />
        </div>
    );
}

function ActionBtn({ icon, label, color }: { icon: React.ReactNode; label: string; color?: string }) {
    return (
        <button title={label} style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: color || 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontFamily: 'var(--font-sans)' }}>
            {icon} {label}
        </button>
    );
}
