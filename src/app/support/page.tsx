'use client';

import React, { useState } from 'react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { SupportTicket } from '@/types/ticket';
import { MessageSquare, AlertTriangle, Clock } from 'lucide-react';

const mockTickets: SupportTicket[] = [
    { id: 'TK-001', subject: 'Cannot process payment', description: 'My credit card keeps getting declined when trying to pay for subscription', category: 'billing', priority: 'high', status: 'open', submitted_by: { type: 'provider', id: '6', name: 'Fatima Hassan', email: 'fatima@nailart.com' }, assigned_to: null, assigned_to_name: null, sla_deadline: '2026-04-14T10:00:00Z', sla_breached: false, messages: [], tags: ['payment', 'subscription'], created_at: '2026-04-13T08:00:00Z', updated_at: '2026-04-13T08:00:00Z', resolved_at: null },
    { id: 'TK-002', subject: 'Wrong booking time shown to customer', description: 'Customer booked at 3pm but system showed 2pm', category: 'technical', priority: 'urgent', status: 'in_progress', submitted_by: { type: 'provider', id: '1', name: 'Ahmed Khalil', email: 'ahmed@glamourstudio.com' }, assigned_to: 'SA-SUPPORT', assigned_to_name: 'Support Agent', sla_deadline: '2026-04-13T16:00:00Z', sla_breached: false, messages: [], tags: ['booking', 'time'], created_at: '2026-04-12T14:00:00Z', updated_at: '2026-04-13T09:00:00Z', resolved_at: null },
    { id: 'TK-003', subject: 'Refund not received', description: 'I cancelled my booking 3 days ago but havent received my refund', category: 'billing', priority: 'medium', status: 'waiting_on_customer', submitted_by: { type: 'user', id: '3', name: 'Mohamed Ahmed', email: 'mohamed.a@gmail.com' }, assigned_to: 'SA-FINANCE', assigned_to_name: 'Finance Manager', sla_deadline: '2026-04-15T10:00:00Z', sla_breached: false, messages: [], tags: ['refund'], created_at: '2026-04-11T10:00:00Z', updated_at: '2026-04-12T15:00:00Z', resolved_at: null },
    { id: 'TK-004', subject: 'Account suspended without reason', description: 'My provider account was suspended and I dont know why', category: 'account', priority: 'high', status: 'open', submitted_by: { type: 'provider', id: '7', name: 'Khaled Samir', email: 'khaled@gentlemanclub.com' }, assigned_to: null, assigned_to_name: null, sla_deadline: '2026-04-14T08:00:00Z', sla_breached: false, messages: [], tags: ['account', 'suspension'], created_at: '2026-04-13T06:00:00Z', updated_at: '2026-04-13T06:00:00Z', resolved_at: null },
    { id: 'TK-005', subject: 'Feature request: Recurring bookings', description: 'Would love to have recurring booking option for regular clients', category: 'feature_request', priority: 'low', status: 'resolved', submitted_by: { type: 'provider', id: '5', name: 'Youssef Nabil', email: 'youssef@freshcuts.com' }, assigned_to: 'SA-ADMIN', assigned_to_name: 'Platform Admin', sla_deadline: null, sla_breached: false, messages: [], tags: ['feature'], created_at: '2026-04-05T10:00:00Z', updated_at: '2026-04-10T14:00:00Z', resolved_at: '2026-04-10T14:00:00Z' },
    { id: 'TK-006', subject: 'App crashes on booking page', description: 'The user app crashes when I try to select a time slot', category: 'technical', priority: 'urgent', status: 'in_progress', submitted_by: { type: 'user', id: '7', name: 'Layla Mahmoud', email: 'layla.m@gmail.com' }, assigned_to: 'SA-SUPPORT', assigned_to_name: 'Support Agent', sla_deadline: '2026-04-13T12:00:00Z', sla_breached: true, messages: [], tags: ['bug', 'crash'], created_at: '2026-04-12T20:00:00Z', updated_at: '2026-04-13T10:00:00Z', resolved_at: null },
];

const priorityColors: Record<string, string> = { low: 'var(--text-tertiary)', medium: 'var(--color-info)', high: 'var(--color-warning)', urgent: 'var(--color-error)' };

export default function SupportPage() {
    const [statusFilter, setStatusFilter] = useState('all');
    const filtered = mockTickets.filter(t => statusFilter === 'all' || t.status === statusFilter);

    const columns: Column<SupportTicket>[] = [
        { key: 'id', label: 'ID', width: '80px', render: r => <span style={{ fontWeight: 500, fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{r.id}</span> },
        { key: 'subject', label: 'Subject', sortable: true, render: r => (
            <div>
                <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {r.sla_breached && <AlertTriangle size={14} color="var(--color-error)" />}
                    {r.subject}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{r.submitted_by.name} ({r.submitted_by.type})</div>
            </div>
        )},
        { key: 'category', label: 'Category', sortable: true, render: r => <span style={{ textTransform: 'capitalize', fontSize: '0.8125rem' }}>{r.category.replace('_', ' ')}</span> },
        { key: 'priority', label: 'Priority', sortable: true, render: r => <span style={{ color: priorityColors[r.priority], fontWeight: 600, fontSize: '0.8125rem', textTransform: 'uppercase' }}>{r.priority}</span> },
        { key: 'status', label: 'Status', sortable: true, render: r => <StatusBadge status={r.status} /> },
        { key: 'assigned_to_name', label: 'Assigned', render: r => r.assigned_to_name || <span style={{ color: 'var(--text-tertiary)' }}>Unassigned</span> },
        { key: 'created_at', label: 'Created', sortable: true, render: r => new Date(r.created_at).toLocaleDateString() },
    ];

    const summary = { open: mockTickets.filter(t => t.status === 'open').length, inProgress: mockTickets.filter(t => t.status === 'in_progress').length, breached: mockTickets.filter(t => t.sla_breached).length };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Support Tickets</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <MessageSquare size={20} color="var(--color-warning)" />
                    <div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Open</div><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{summary.open}</div></div>
                </div>
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Clock size={20} color="var(--color-info)" />
                    <div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>In Progress</div><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{summary.inProgress}</div></div>
                </div>
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <AlertTriangle size={20} color="var(--color-error)" />
                    <div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SLA Breached</div><div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-error)' }}>{summary.breached}</div></div>
                </div>
            </div>
            <DataTable<SupportTicket> columns={columns} data={filtered} searchKeys={['subject', 'id', 'submitted_by']} searchPlaceholder="Search tickets..." getRowKey={r => r.id}
                filters={<select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'var(--font-sans)' }}>
                    <option value="all">All Status</option><option value="open">Open</option><option value="in_progress">In Progress</option><option value="waiting_on_customer">Waiting</option><option value="resolved">Resolved</option>
                </select>}
            />
        </div>
    );
}
