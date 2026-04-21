'use client';

import React from 'react';
import { ROLE_PERMISSIONS, ALL_MODULES } from '@/lib/permissions';
import type { SuperAdminRole } from '@/types/admin';
import { Shield, Check, X } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';

const roleLabels: Record<SuperAdminRole, { name: string; desc: string; color: string }> = {
    super_admin: { name: 'Super Admin', desc: 'Full access including impersonation', color: 'var(--color-error)' },
    admin: { name: 'Admin', desc: 'Full CRUD, no impersonation', color: 'var(--color-primary-500)' },
    moderator: { name: 'Moderator', desc: 'Reviews, content, support management', color: '#8b5cf6' },
    support: { name: 'Support Agent', desc: 'Support tickets and user viewing', color: 'var(--color-info)' },
    finance: { name: 'Finance', desc: 'Subscriptions, finance, reports', color: 'var(--color-warning)' },
    viewer: { name: 'Viewer', desc: 'Read-only access to all modules', color: 'var(--text-tertiary)' },
};

const roles = Object.keys(ROLE_PERMISSIONS) as SuperAdminRole[];

export default function RolesPage() {
    return (
        <div className={shared.page}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Shield size={24} />
                <h1 className={shared.pageTitle}>Roles & Permissions</h1>
            </div>

            <div className={shared.formGrid3}>
                {roles.map(role => {
                    const info = roleLabels[role];
                    const perms = ROLE_PERMISSIONS[role];
                    return (
                        <div key={role} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, borderTop: `3px solid ${info.color}` }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 4px', color: 'var(--text-primary)' }}>{info.name}</h3>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0 0 12px' }}>{info.desc}</p>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                {perms.length} module{perms.length !== 1 ? 's' : ''} accessible
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-secondary)' }}>
                            <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--text-secondary)', fontWeight: 500, borderBottom: '1px solid var(--border-color)', position: 'sticky', left: 0, background: 'var(--bg-secondary)' }}>Module</th>
                            {roles.map(r => (
                                <th key={r} style={{ textAlign: 'center', padding: '10px 8px', color: roleLabels[r].color, fontWeight: 600, borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>{roleLabels[r].name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {ALL_MODULES.map(mod => (
                            <tr key={mod} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '8px 16px', fontWeight: 500, textTransform: 'capitalize', position: 'sticky', left: 0, background: 'var(--bg-primary)' }}>{mod.replace('_', ' ')}</td>
                                {roles.map(role => {
                                    const perm = ROLE_PERMISSIONS[role].find(p => p.module === mod);
                                    return (
                                        <td key={role} style={{ textAlign: 'center', padding: '8px' }}>
                                            {perm ? (
                                                <span title={perm.actions.join(', ')} style={{ color: 'var(--color-success)', cursor: 'help' }}>
                                                    <Check size={16} />
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--text-tertiary)' }}><X size={16} /></span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
