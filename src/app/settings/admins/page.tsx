'use client';

import React, { useState } from 'react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { PermissionGate } from '@/components/admin/PermissionGate';
import type { SuperAdminUser, SuperAdminRole } from '@/types/admin';
import { Plus, Shield } from 'lucide-react';

const mockAdmins: SuperAdminUser[] = [
    { id: '1', uuid: 'sa-1', name: 'Super Admin', email: 'superadmin@hagzy.com', role: 'super_admin', permissions: [], active: true, last_login_at: '2026-04-13T10:00:00Z', created_at: '2023-01-01T00:00:00Z', updated_at: '2026-04-13T10:00:00Z' },
    { id: '2', uuid: 'sa-2', name: 'Platform Admin', email: 'admin@hagzy.com', role: 'admin', permissions: [], active: true, last_login_at: '2026-04-13T09:00:00Z', created_at: '2023-06-01T00:00:00Z', updated_at: '2026-04-13T09:00:00Z' },
    { id: '3', uuid: 'sa-3', name: 'Content Moderator', email: 'moderator@hagzy.com', role: 'moderator', permissions: [], active: true, last_login_at: '2026-04-12T16:00:00Z', created_at: '2024-01-15T00:00:00Z', updated_at: '2026-04-12T16:00:00Z' },
    { id: '4', uuid: 'sa-4', name: 'Support Agent', email: 'support@hagzy.com', role: 'support', permissions: [], active: true, last_login_at: '2026-04-13T08:00:00Z', created_at: '2024-03-01T00:00:00Z', updated_at: '2026-04-13T08:00:00Z' },
    { id: '5', uuid: 'sa-5', name: 'Finance Manager', email: 'finance@hagzy.com', role: 'finance', permissions: [], active: true, last_login_at: '2026-04-12T14:00:00Z', created_at: '2024-06-01T00:00:00Z', updated_at: '2026-04-12T14:00:00Z' },
    { id: '6', uuid: 'sa-6', name: 'Report Viewer', email: 'viewer@hagzy.com', role: 'viewer', permissions: [], active: false, last_login_at: '2026-03-01T10:00:00Z', created_at: '2025-01-01T00:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
];

const roleColors: Record<SuperAdminRole, string> = { super_admin: '#dc2626', admin: '#00b166', moderator: '#8b5cf6', support: '#3b82f6', finance: '#f59e0b', viewer: '#6b7280' };
const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-primary)', background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', outline: 'none' };

export default function AdminsPage() {
    const [showCreate, setShowCreate] = useState(false);

    const columns: Column<SuperAdminUser>[] = [
        { key: 'name', label: 'Name', sortable: true, render: r => <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 36, height: 36, borderRadius: '50%', background: `color-mix(in srgb, ${roleColors[r.role]} 15%, transparent)`, color: roleColors[r.role], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.875rem' }}>{r.name.charAt(0)}</div><div><div style={{ fontWeight: 500 }}>{r.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{r.email}</div></div></div> },
        { key: 'role', label: 'Role', sortable: true, render: r => <span style={{ color: roleColors[r.role], fontWeight: 600, fontSize: '0.8125rem', textTransform: 'capitalize' }}>{r.role.replace('_', ' ')}</span> },
        { key: 'active', label: 'Status', render: r => <StatusBadge status={r.active ? 'active' : 'deactivated'} /> },
        { key: 'last_login_at', label: 'Last Login', sortable: true, render: r => r.last_login_at ? new Date(r.last_login_at).toLocaleDateString() : 'Never' },
        { key: 'created_at', label: 'Created', sortable: true, render: r => new Date(r.created_at).toLocaleDateString() },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Shield size={24} /><h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Admin Users</h1></div>
                <PermissionGate module="settings" action="create">
                    <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--color-primary-500)', color: 'white', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                        <Plus size={16} /> Add Admin
                    </button>
                </PermissionGate>
            </div>
            <DataTable<SuperAdminUser> columns={columns} data={mockAdmins} searchKeys={['name', 'email', 'role']} searchPlaceholder="Search admins..." getRowKey={r => r.id} />

            <FormModal open={showCreate} onClose={() => setShowCreate(false)} title="Add Admin User" submitLabel="Create Admin" onSubmit={e => { e.preventDefault(); setShowCreate(false); }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <FormField label="Full Name" required><input type="text" required style={inputStyle} placeholder="Admin name" /></FormField>
                    <FormField label="Email" required><input type="email" required style={inputStyle} placeholder="admin@hagzy.com" /></FormField>
                </div>
                <FormField label="Role" required>
                    <select required style={inputStyle}>
                        <option value="">Select role...</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                        <option value="support">Support Agent</option>
                        <option value="finance">Finance</option>
                        <option value="viewer">Viewer</option>
                    </select>
                </FormField>
                <FormField label="Temporary Password" required><input type="password" required style={inputStyle} placeholder="Min 8 characters" minLength={8} /></FormField>
            </FormModal>
        </div>
    );
}
