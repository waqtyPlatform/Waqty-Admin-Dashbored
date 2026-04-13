'use client';

import React from 'react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { AppVersion } from '@/types/system';
import { Smartphone, Plus } from 'lucide-react';
import { PermissionGate } from '@/components/admin/PermissionGate';

const mockVersions: AppVersion[] = [
    { id: '1', app: 'user_ios', version: '2.1.58', build_number: 158, min_required_version: '2.0.0', force_update: false, release_notes: 'Bug fixes and performance improvements', release_notes_ar: 'إصلاح الأخطاء وتحسين الأداء', released_at: '2026-04-10T10:00:00Z', created_at: '2026-04-10T10:00:00Z' },
    { id: '2', app: 'user_android', version: '2.1.58', build_number: 158, min_required_version: '2.0.0', force_update: false, release_notes: 'Bug fixes and performance improvements', release_notes_ar: 'إصلاح الأخطاء وتحسين الأداء', released_at: '2026-04-10T10:00:00Z', created_at: '2026-04-10T10:00:00Z' },
    { id: '3', app: 'employee_ios', version: '1.4.2', build_number: 42, min_required_version: '1.3.0', force_update: false, release_notes: 'Added biometric login and payslip download', release_notes_ar: 'إضافة الدخول البيومتري وتحميل كشف الراتب', released_at: '2026-04-08T10:00:00Z', created_at: '2026-04-08T10:00:00Z' },
    { id: '4', app: 'employee_android', version: '1.4.2', build_number: 42, min_required_version: '1.3.0', force_update: false, release_notes: 'Added biometric login and payslip download', release_notes_ar: 'إضافة الدخول البيومتري وتحميل كشف الراتب', released_at: '2026-04-08T10:00:00Z', created_at: '2026-04-08T10:00:00Z' },
    { id: '5', app: 'user_ios', version: '2.1.55', build_number: 155, min_required_version: '2.0.0', force_update: true, release_notes: 'Critical security patch', release_notes_ar: 'تحديث أمني مهم', released_at: '2026-03-25T10:00:00Z', created_at: '2026-03-25T10:00:00Z' },
];

const appLabels: Record<string, string> = { user_ios: 'User (iOS)', user_android: 'User (Android)', employee_ios: 'Employee (iOS)', employee_android: 'Employee (Android)' };

export default function AppVersionsPage() {
    const columns: Column<AppVersion>[] = [
        { key: 'app', label: 'App', sortable: true, render: r => <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Smartphone size={16} /><span style={{ fontWeight: 500 }}>{appLabels[r.app]}</span></div> },
        { key: 'version', label: 'Version', sortable: true, render: r => <code style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.version}</code> },
        { key: 'build_number', label: 'Build', sortable: true },
        { key: 'min_required_version', label: 'Min Required', render: r => <code style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{r.min_required_version}</code> },
        { key: 'force_update', label: 'Force Update', render: r => r.force_update ? <StatusBadge status="urgent" /> : <span style={{ color: 'var(--text-tertiary)' }}>No</span> },
        { key: 'release_notes', label: 'Notes', render: r => <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{r.release_notes.slice(0, 50)}{r.release_notes.length > 50 ? '...' : ''}</span> },
        { key: 'released_at', label: 'Released', sortable: true, render: r => new Date(r.released_at).toLocaleDateString() },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>App Versions</h1>
                <PermissionGate module="app_versions" action="create">
                    <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--color-primary-500)', color: 'white', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}><Plus size={16} /> Add Version</button>
                </PermissionGate>
            </div>
            <DataTable<AppVersion> columns={columns} data={mockVersions} searchKeys={['app', 'version', 'release_notes']} searchPlaceholder="Search versions..." getRowKey={r => r.id} />
        </div>
    );
}
