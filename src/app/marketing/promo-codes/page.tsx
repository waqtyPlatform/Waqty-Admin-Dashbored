'use client';

import React from 'react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import type { PromoCode } from '@/types/marketing';
import { Plus, Copy } from 'lucide-react';

const mockCodes: PromoCode[] = [
    { id: '1', code: 'WELCOME20', type: 'percentage', value: 20, min_order: 100, max_discount: 200, usage_limit: 1000, used_count: 487, valid_from: '2026-01-01', valid_until: '2026-12-31', active: true, created_at: '2026-01-01T00:00:00Z' },
    { id: '2', code: 'SUMMER50', type: 'fixed', value: 50, min_order: 200, max_discount: null, usage_limit: 500, used_count: 312, valid_from: '2026-04-01', valid_until: '2026-06-30', active: true, created_at: '2026-03-28T00:00:00Z' },
    { id: '3', code: 'VIP10', type: 'percentage', value: 10, min_order: 0, max_discount: 500, usage_limit: null, used_count: 1250, valid_from: '2025-01-01', valid_until: '2026-12-31', active: true, created_at: '2025-01-01T00:00:00Z' },
    { id: '4', code: 'EID2026', type: 'percentage', value: 30, min_order: 150, max_discount: 300, usage_limit: 2000, used_count: 0, valid_from: '2026-06-01', valid_until: '2026-06-15', active: false, created_at: '2026-04-10T00:00:00Z' },
    { id: '5', code: 'FIRST100', type: 'fixed', value: 100, min_order: 300, max_discount: null, usage_limit: 100, used_count: 100, valid_from: '2026-02-01', valid_until: '2026-03-31', active: false, created_at: '2026-02-01T00:00:00Z' },
];

export default function PromoCodesPage() {
    const columns: Column<PromoCode>[] = [
        { key: 'code', label: 'Code', sortable: true, render: r => <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><code style={{ fontWeight: 600, padding: '2px 8px', background: 'var(--bg-tertiary)', borderRadius: 4, fontSize: '0.8125rem' }}>{r.code}</code><button style={{ border: 'none', background: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 2 }}><Copy size={12} /></button></div> },
        { key: 'type', label: 'Type', sortable: true, render: r => r.type === 'percentage' ? `${r.value}%` : `EGP ${r.value}` },
        { key: 'min_order', label: 'Min Order', render: r => r.min_order > 0 ? `EGP ${r.min_order}` : '-' },
        { key: 'used_count', label: 'Usage', sortable: true, render: r => `${r.used_count}${r.usage_limit ? ` / ${r.usage_limit}` : ''}` },
        { key: 'valid_until', label: 'Valid Until', sortable: true, render: r => new Date(r.valid_until).toLocaleDateString() },
        { key: 'active', label: 'Status', render: r => <StatusBadge status={r.active ? 'active' : (r.used_count >= (r.usage_limit || Infinity) ? 'expired' : 'draft')} /> },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Promo Codes</h1>
                <PermissionGate module="marketing" action="create">
                    <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--color-primary-500)', color: 'white', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}><Plus size={16} /> Create Code</button>
                </PermissionGate>
            </div>
            <DataTable<PromoCode> columns={columns} data={mockCodes} searchKeys={['code']} searchPlaceholder="Search promo codes..." getRowKey={r => r.id} />
        </div>
    );
}
