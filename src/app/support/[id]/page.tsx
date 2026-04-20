'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import type { SupportTicket, TicketMessage, TicketStatus } from '@/types/ticket';
import {
    ArrowLeft, Send, Clock, AlertTriangle, User, Tag, Calendar,
    Paperclip, CheckCircle, XCircle, UserCheck,
} from 'lucide-react';

const mockTicket: SupportTicket = {
    id: 'TK-001', subject: 'Cannot process payment', description: 'My credit card keeps getting declined when trying to pay for subscription renewal. I\'ve tried three different cards and all are rejected. Please help urgently.',
    category: 'billing', priority: 'high', status: 'in_progress',
    submitted_by: { type: 'provider', id: '6', name: 'Fatima Hassan', email: 'fatima@nailart.com' },
    assigned_to: 'SA-SUPPORT', assigned_to_name: 'Support Agent',
    sla_deadline: '2026-04-14T10:00:00Z', sla_breached: false,
    messages: [
        { id: 'msg-1', sender_type: 'customer', sender_name: 'Fatima Hassan', content: 'My credit card keeps getting declined when trying to pay for subscription renewal. I\'ve tried three different cards and all are rejected.', attachments: [], created_at: '2026-04-13T08:00:00Z' },
        { id: 'msg-2', sender_type: 'admin', sender_name: 'Support Agent', content: 'Hi Fatima, thank you for reaching out. Can you please share the error message you\'re seeing when the card is declined? Also, is this for monthly or yearly billing?', attachments: [], created_at: '2026-04-13T09:15:00Z' },
        { id: 'msg-3', sender_type: 'customer', sender_name: 'Fatima Hassan', content: 'The error says "Payment declined by issuer - please contact your bank". This is for monthly billing on the Basic plan.', attachments: [{ name: 'error-screenshot.png', url: '#' }], created_at: '2026-04-13T09:45:00Z' },
        { id: 'msg-4', sender_type: 'admin', sender_name: 'Support Agent', content: 'Thank you. I can see your account is on the Basic plan with a past_due status. I\'ve reset the payment retry for your subscription. Please try adding a new card now via the Settings → Billing page.', attachments: [], created_at: '2026-04-13T10:00:00Z' },
        { id: 'msg-5', sender_type: 'system', sender_name: 'System', content: 'Ticket assigned to Support Agent', attachments: [], created_at: '2026-04-13T10:00:00Z' },
    ],
    tags: ['payment', 'subscription', 'urgent'],
    created_at: '2026-04-13T08:00:00Z', updated_at: '2026-04-13T10:00:00Z', resolved_at: null,
};

const priorityColors: Record<string, string> = { low: 'var(--text-tertiary)', medium: 'var(--color-info)', high: 'var(--color-warning)', urgent: 'var(--color-error)' };

export default function TicketDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [ticket, setTicket] = useState<SupportTicket>({ ...mockTicket, id: (id as string) || 'TK-001' });
    const [newMessage, setNewMessage] = useState('');

    const handleSend = () => {
        if (!newMessage.trim()) return;
        const msg: TicketMessage = {
            id: `msg-${Date.now()}`, sender_type: 'admin', sender_name: 'Super Admin',
            content: newMessage, attachments: [], created_at: new Date().toISOString(),
        };
        setTicket(prev => ({ ...prev, messages: [...prev.messages, msg], updated_at: new Date().toISOString() }));
        setNewMessage('');
    };

    const handleStatusChange = (status: TicketStatus) => {
        setTicket(prev => ({ ...prev, status, resolved_at: status === 'resolved' || status === 'closed' ? new Date().toISOString() : prev.resolved_at }));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <button onClick={() => router.push('/support')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 'none', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', width: 'fit-content' }}>
                <ArrowLeft size={16} /> Support Tickets
            </button>

            {/* Header */}
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
                            {ticket.status !== 'resolved' && <button onClick={() => handleStatusChange('resolved')} style={actionBtn('var(--color-success)')}><CheckCircle size={14} /> Resolve</button>}
                            {ticket.status !== 'closed' && <button onClick={() => handleStatusChange('closed')} style={actionBtn('var(--text-secondary)')}><XCircle size={14} /> Close</button>}
                            <button onClick={() => alert('Reassign ticket')} style={actionBtn('var(--color-info)')}><UserCheck size={14} /> Reassign</button>
                        </div>
                    </PermissionGate>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                    <InfoItem label="Submitted By" value={ticket.submitted_by.email} />
                    <InfoItem label="Assigned To" value={ticket.assigned_to_name || 'Unassigned'} />
                    <InfoItem label="Tags" value={ticket.tags.join(', ')} />
                </div>
            </div>

            {/* Message Thread */}
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>Conversation ({ticket.messages.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                    {ticket.messages.map(msg => (
                        <div key={msg.id} style={{ display: 'flex', gap: 12, flexDirection: msg.sender_type === 'admin' ? 'row-reverse' : 'row' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: msg.sender_type === 'admin' ? 'var(--color-primary-50)' : msg.sender_type === 'system' ? 'var(--bg-tertiary)' : 'var(--color-info-light)', color: msg.sender_type === 'admin' ? 'var(--color-primary-600)' : msg.sender_type === 'system' ? 'var(--text-tertiary)' : '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.875rem', flexShrink: 0 }}>
                                {msg.sender_type === 'system' ? '⚙' : msg.sender_name.charAt(0)}
                            </div>
                            <div style={{ flex: 1, maxWidth: '75%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, justifyContent: msg.sender_type === 'admin' ? 'flex-end' : 'flex-start' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{msg.sender_name}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{new Date(msg.created_at).toLocaleString()}</span>
                                </div>
                                <div style={{ padding: '12px 16px', background: msg.sender_type === 'admin' ? 'var(--color-primary-50)' : msg.sender_type === 'system' ? 'var(--bg-tertiary)' : 'var(--bg-secondary)', borderRadius: 12, fontSize: '0.875rem', lineHeight: 1.5, color: msg.sender_type === 'system' ? 'var(--text-tertiary)' : 'var(--text-primary)', fontStyle: msg.sender_type === 'system' ? 'italic' : 'normal' }}>
                                    {msg.content}
                                </div>
                                {msg.attachments.length > 0 && (
                                    <div style={{ display: 'flex', gap: 6, marginTop: 6, justifyContent: msg.sender_type === 'admin' ? 'flex-end' : 'flex-start' }}>
                                        {msg.attachments.map((a, i) => (
                                            <a key={i} href={a.url} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'var(--bg-tertiary)', borderRadius: 6, fontSize: '0.75rem', color: 'var(--text-secondary)', textDecoration: 'none' }}><Paperclip size={12} /> {a.name}</a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Reply */}
                <PermissionGate module="support" action="edit">
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                        <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type your reply..."
                            style={{ width: '100%', minHeight: 80, padding: 12, border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.875rem', fontFamily: 'var(--font-sans)', resize: 'vertical', outline: 'none', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                            <button onClick={() => alert('Attachment picker')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}><Paperclip size={14} /> Attach</button>
                            <button onClick={handleSend} disabled={!newMessage.trim()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 20px', background: newMessage.trim() ? 'var(--color-primary-500)' : 'var(--color-gray-300)', color: 'white', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500, cursor: newMessage.trim() ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-sans)' }}><Send size={14} /> Send Reply</button>
                        </div>
                    </div>
                </PermissionGate>
            </div>
        </div>
    );
}

const actionBtn = (color: string) => ({
    display: 'inline-flex' as const, alignItems: 'center' as const, gap: 4,
    padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: 6,
    background: 'var(--bg-primary)', color, fontSize: '0.75rem', cursor: 'pointer' as const,
    fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' as const,
});

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: 2, fontWeight: 500 }}>{value}</div>
        </div>
    );
}
