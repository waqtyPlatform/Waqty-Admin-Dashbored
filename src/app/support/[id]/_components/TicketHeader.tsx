'use client';

import React from 'react';
import { Clock, AlertTriangle, User, Tag, Calendar, CheckCircle, XCircle, UserCheck } from 'lucide-react';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { useTranslation } from '@/hooks/useTranslation';
import type { SupportTicket, TicketStatus } from '@/types/ticket';

const priorityColors: Record<string, string> = {
    low: 'var(--text-tertiary)',
    medium: 'var(--color-info)',
    high: 'var(--color-warning)',
    urgent: 'var(--color-error)',
};

const actionBtn = (color: string): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '6px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: 6,
    background: 'var(--bg-primary)',
    color,
    fontSize: '0.75rem',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    whiteSpace: 'nowrap',
});

interface TicketHeaderProps {
    ticket: SupportTicket;
    onStatusChange: (status: TicketStatus) => void;
    onReassign: () => void;
}

export function TicketHeader({ ticket, onStatusChange, onReassign }: TicketHeaderProps) {
    const { t } = useTranslation();

    return (
        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <code style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{ticket.id}</code>
                        <StatusBadge status={ticket.status} />
                        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: priorityColors[ticket.priority], textTransform: 'uppercase' }}>{ticket.priority}</span>
                        {ticket.sla_breached && <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-error)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={12} /> SLA BREACHED</span>}
                    </div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{ticket.subject}</h1>
                    <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.8125rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><User size={14} /> {ticket.submitted_by.name} ({ticket.submitted_by.type})</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Calendar size={14} /> {new Date(ticket.created_at).toLocaleString()}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Tag size={14} /> {ticket.category.replace('_', ' ')}</span>
                        {ticket.sla_deadline && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: ticket.sla_breached ? 'var(--color-error)' : 'var(--text-secondary)' }}><Clock size={14} /> SLA: {new Date(ticket.sla_deadline).toLocaleString()}</span>}
                    </div>
                </div>
                <PermissionGate module="support" action="edit">
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {ticket.status !== 'resolved' && <button onClick={() => onStatusChange('resolved')} style={actionBtn('var(--color-success)')}><CheckCircle size={14} /> {t('support.resolve')}</button>}
                        {ticket.status !== 'closed' && <button onClick={() => onStatusChange('closed')} style={actionBtn('var(--text-secondary)')}><XCircle size={14} /> {t('support.close')}</button>}
                        <button onClick={onReassign} style={actionBtn('var(--color-info)')}><UserCheck size={14} /> {t('support.reassign')}</button>
                    </div>
                </PermissionGate>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                <InfoItem label={t('support.submittedBy')} value={ticket.submitted_by.email} />
                <InfoItem label={t('support.assignedTo')} value={ticket.assigned_to_name || t('support.unassigned')} />
                <InfoItem label={t('support.tags')} value={ticket.tags.join(', ')} />
            </div>
        </div>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: 2, fontWeight: 500 }}>{value}</div>
        </div>
    );
}
