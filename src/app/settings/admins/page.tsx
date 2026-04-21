'use client';

import React, { useState } from 'react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { PermissionGate } from '@/components/admin/PermissionGate';
import type { SuperAdminUser, SuperAdminRole } from '@/types/admin';
import { getPermissionsForRole } from '@/lib/permissions';
import { useValidatedForm } from '@/hooks/useValidatedForm';
import { adminCreateSchema, type AdminCreateInput } from '@/lib/validations';
import { Plus, Shield } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';

const initialAdmins: SuperAdminUser[] = [
    { id: '1', uuid: 'sa-1', name: 'Super Admin', email: 'superadmin@hagzy.com', role: 'super_admin', permissions: [], active: true, last_login_at: '2026-04-13T10:00:00Z', created_at: '2023-01-01T00:00:00Z', updated_at: '2026-04-13T10:00:00Z' },
    { id: '2', uuid: 'sa-2', name: 'Platform Admin', email: 'admin@hagzy.com', role: 'admin', permissions: [], active: true, last_login_at: '2026-04-13T09:00:00Z', created_at: '2023-06-01T00:00:00Z', updated_at: '2026-04-13T09:00:00Z' },
    { id: '3', uuid: 'sa-3', name: 'Content Moderator', email: 'moderator@hagzy.com', role: 'moderator', permissions: [], active: true, last_login_at: '2026-04-12T16:00:00Z', created_at: '2024-01-15T00:00:00Z', updated_at: '2026-04-12T16:00:00Z' },
    { id: '4', uuid: 'sa-4', name: 'Support Agent', email: 'support@hagzy.com', role: 'support', permissions: [], active: true, last_login_at: '2026-04-13T08:00:00Z', created_at: '2024-03-01T00:00:00Z', updated_at: '2026-04-13T08:00:00Z' },
    { id: '5', uuid: 'sa-5', name: 'Finance Manager', email: 'finance@hagzy.com', role: 'finance', permissions: [], active: true, last_login_at: '2026-04-12T14:00:00Z', created_at: '2024-06-01T00:00:00Z', updated_at: '2026-04-12T14:00:00Z' },
    { id: '6', uuid: 'sa-6', name: 'Report Viewer', email: 'viewer@hagzy.com', role: 'viewer', permissions: [], active: false, last_login_at: '2026-03-01T10:00:00Z', created_at: '2025-01-01T00:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
];

const roleColors: Record<SuperAdminRole, string> = {
    super_admin: 'var(--color-error)',
    admin: 'var(--color-primary-500)',
    moderator: '#8b5cf6',
    support: 'var(--color-info)',
    finance: 'var(--color-warning)',
    viewer: 'var(--text-tertiary)',
};

export default function AdminsPage() {
    const [admins, setAdmins] = useState(initialAdmins);
    const [showCreate, setShowCreate] = useState(false);
    const form = useValidatedForm<AdminCreateInput>({
        schema: adminCreateSchema,
        defaultValues: { name: '', email: '', role: 'viewer', password: '' },
    });

    const onCreateAdmin = form.handleSubmit(values => {
        const now = new Date().toISOString();
        const id = String(Date.now());
        setAdmins(prev => [{
            id, uuid: `sa-${id}`, name: values.name, email: values.email,
            role: values.role, permissions: getPermissionsForRole(values.role),
            active: true, last_login_at: null, created_at: now, updated_at: now,
        }, ...prev]);
        form.reset();
        setShowCreate(false);
    });

    const columns: Column<SuperAdminUser>[] = [
        { key: 'name', label: 'Name', sortable: true, render: r => <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 36, height: 36, borderRadius: '50%', background: `color-mix(in srgb, ${roleColors[r.role]} 15%, transparent)`, color: roleColors[r.role], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.875rem' }}>{r.name.charAt(0)}</div><div><div style={{ fontWeight: 500 }}>{r.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{r.email}</div></div></div> },
        { key: 'role', label: 'Role', sortable: true, render: r => <span style={{ color: roleColors[r.role], fontWeight: 600, fontSize: '0.8125rem', textTransform: 'capitalize' }}>{r.role.replace('_', ' ')}</span> },
        { key: 'active', label: 'Status', render: r => <StatusBadge status={r.active ? 'active' : 'deactivated'} /> },
        { key: 'last_login_at', label: 'Last Login', sortable: true, render: r => r.last_login_at ? new Date(r.last_login_at).toLocaleDateString() : 'Never' },
        { key: 'created_at', label: 'Created', sortable: true, render: r => new Date(r.created_at).toLocaleDateString() },
    ];

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Shield size={24} /><h1 className={shared.pageTitle}>Admin Users</h1></div>
                <PermissionGate module="settings" action="create">
                    <button onClick={() => setShowCreate(true)} className={shared.addBtn}>
                        <Plus size={16} /> Add Admin
                    </button>
                </PermissionGate>
            </div>
            <DataTable<SuperAdminUser> columns={columns} data={admins} searchKeys={['name', 'email', 'role']} searchPlaceholder="Search admins..." getRowKey={r => r.id} />

            <FormModal open={showCreate} onClose={() => { setShowCreate(false); form.reset(); }} title="Add Admin User" submitLabel="Create Admin" onSubmit={onCreateAdmin}>
                <div className={shared.formGrid2}>
                    <FormField label="Full Name" required error={form.getError('name')}>
                        <input {...form.register('name')} type="text" className={shared.formInput} placeholder="Admin name" />
                    </FormField>
                    <FormField label="Email" required error={form.getError('email')}>
                        <input {...form.register('email')} type="email" className={shared.formInput} placeholder="admin@hagzy.com" />
                    </FormField>
                </div>
                <FormField label="Role" required error={form.getError('role')}>
                    <select {...form.register('role')} className={shared.formInput}>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                        <option value="support">Support Agent</option>
                        <option value="finance">Finance</option>
                        <option value="viewer">Viewer</option>
                    </select>
                </FormField>
                <FormField label="Temporary Password" required error={form.getError('password')}>
                    <input {...form.register('password')} type="password" className={shared.formInput} placeholder="Min 8, upper, number, special" />
                </FormField>
            </FormModal>
        </div>
    );
}
