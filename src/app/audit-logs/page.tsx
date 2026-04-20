'use client';

import React from 'react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import type { AuditLog } from '@/types/system';

const mockLogs: AuditLog[] = [
    { id: '1', admin_id: 'SA-SUPER_ADMIN', admin_name: 'Super Admin', admin_role: 'super_admin', action: 'provider.block', entity_type: 'provider', entity_id: '7', details: { reason: 'Policy violation' }, ip_address: '102.45.12.89', user_agent: 'Chrome/120', created_at: '2026-04-13T10:30:00Z' },
    { id: '2', admin_id: 'SA-ADMIN', admin_name: 'Platform Admin', admin_role: 'admin', action: 'subscription.renew', entity_type: 'subscription', entity_id: 'sub-2', details: { plan: 'Enterprise', amount: 1299 }, ip_address: '102.45.12.90', user_agent: 'Chrome/120', created_at: '2026-04-13T09:15:00Z' },
    { id: '3', admin_id: 'SA-MODERATOR', admin_name: 'Content Moderator', admin_role: 'moderator', action: 'review.hide', entity_type: 'review', entity_id: 'rev-9', details: { reason: 'Inappropriate content' }, ip_address: '102.45.12.91', user_agent: 'Firefox/115', created_at: '2026-04-12T16:45:00Z' },
    { id: '4', admin_id: 'SA-FINANCE', admin_name: 'Finance Manager', admin_role: 'finance', action: 'payout.approve', entity_type: 'payout', entity_id: 'pay-3', details: { amount: 52000, provider: 'Beauty Clinic Cairo' }, ip_address: '102.45.12.92', user_agent: 'Chrome/120', created_at: '2026-04-12T14:00:00Z' },
    { id: '5', admin_id: 'SA-SUPER_ADMIN', admin_name: 'Super Admin', admin_role: 'super_admin', action: 'user.soft_delete', entity_type: 'user', entity_id: '8', details: { reason: 'Inactive account cleanup' }, ip_address: '102.45.12.89', user_agent: 'Chrome/120', created_at: '2026-04-12T11:00:00Z' },
    { id: '6', admin_id: 'SA-ADMIN', admin_name: 'Platform Admin', admin_role: 'admin', action: 'provider.approve', entity_type: 'provider', entity_id: '12', details: { business_name: 'Zen Barber Lounge' }, ip_address: '102.45.12.90', user_agent: 'Chrome/120', created_at: '2026-04-11T15:30:00Z' },
    { id: '7', admin_id: 'SA-SUPER_ADMIN', admin_name: 'Super Admin', admin_role: 'super_admin', action: 'settings.update', entity_type: 'settings', entity_id: null, details: { field: 'commission_rate', old: 12, new: 10 }, ip_address: '102.45.12.89', user_agent: 'Chrome/120', created_at: '2026-04-11T10:00:00Z' },
    { id: '8', admin_id: 'SA-FINANCE', admin_name: 'Finance Manager', admin_role: 'finance', action: 'wallet.add', entity_type: 'wallet', entity_id: 'wal-5', details: { amount: 200, reason: 'Loyalty reward' }, ip_address: '102.45.12.92', user_agent: 'Chrome/120', created_at: '2026-04-10T13:00:00Z' },
];

const actionColors: Record<string, string> = { block: 'var(--color-error)', soft_delete: 'var(--color-error)', hide: 'var(--color-warning)', approve: 'var(--color-success)', renew: 'var(--color-success)', update: 'var(--color-info)', add: 'var(--color-info)' };

export default function AuditLogsPage() {
    const columns: Column<AuditLog>[] = [
        { key: 'created_at', label: 'Time', sortable: true, render: r => <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>{new Date(r.created_at).toLocaleString()}</span> },
        { key: 'admin_name', label: 'Admin', sortable: true, render: r => <div><div style={{ fontWeight: 500 }}>{r.admin_name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{r.admin_role}</div></div> },
        { key: 'action', label: 'Action', sortable: true, render: r => { const actionPart = r.action.split('.')[1] || r.action; return <span style={{ fontWeight: 600, color: actionColors[actionPart] || 'var(--text-primary)', fontSize: '0.8125rem' }}>{r.action}</span>; } },
        { key: 'entity_type', label: 'Entity', sortable: true, render: r => <span style={{ textTransform: 'capitalize' }}>{r.entity_type} {r.entity_id ? `#${r.entity_id}` : ''}</span> },
        { key: 'details', label: 'Details', render: r => <code style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: 4 }}>{JSON.stringify(r.details).slice(0, 60)}</code> },
        { key: 'ip_address', label: 'IP', render: r => <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{r.ip_address}</span> },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Audit Logs</h1>
            <DataTable<AuditLog> columns={columns} data={mockLogs} searchKeys={['admin_name', 'action', 'entity_type']} searchPlaceholder="Search logs..." getRowKey={r => r.id} />
        </div>
    );
}
