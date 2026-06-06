'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { SupportTicket, TicketMessage, TicketStatus } from '@/types/ticket';
import { TicketHeader } from './_components/TicketHeader';
import { TicketConversation } from './_components/TicketConversation';
import { ReassignModal } from './_components/ReassignModal';

const mockSupportAdmins = [
    { id: 'SA-SUPPORT', name: 'Support Agent' },
    { id: 'SA-LEAD', name: 'Sarah Ahmed (Lead)' },
    { id: 'SA-TECH', name: 'Omar Tech' },
    { id: 'SA-BILLING', name: 'Mona Billing' },
    { id: 'SA-ADMIN', name: 'Super Admin' },
];

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

export default function TicketDetailPage() {
    const { t } = useTranslation();
    const { id } = useParams();
    const router = useRouter();
    const [ticket, setTicket] = useState<SupportTicket>({ ...mockTicket, id: (id as string) || 'TK-001' });
    const [showReassign, setShowReassign] = useState(false);

    const handleSend = (content: string, attachments: { name: string; url: string }[]) => {
        if (!content.trim() && attachments.length === 0) return;
        const msg: TicketMessage = {
            id: `msg-${Date.now()}`, sender_type: 'admin', sender_name: 'Super Admin',
            content, attachments, created_at: new Date().toISOString(),
        };
        setTicket(prev => ({ ...prev, messages: [...prev.messages, msg], updated_at: new Date().toISOString() }));
    };

    const handleReassign = (adminId: string) => {
        const admin = mockSupportAdmins.find(a => a.id === adminId);
        if (!admin) return;
        setTicket(prev => ({
            ...prev,
            assigned_to: admin.id,
            assigned_to_name: admin.name,
            messages: [...prev.messages, {
                id: `msg-${Date.now()}`,
                sender_type: 'system',
                sender_name: 'System',
                content: `Ticket reassigned to ${admin.name}`,
                attachments: [],
                created_at: new Date().toISOString(),
            }],
            updated_at: new Date().toISOString(),
        }));
        setShowReassign(false);
    };

    const handleStatusChange = (status: TicketStatus) => {
        setTicket(prev => ({ ...prev, status, resolved_at: status === 'resolved' || status === 'closed' ? new Date().toISOString() : prev.resolved_at }));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <button onClick={() => router.push('/support')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 'none', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', width: 'fit-content' }}>
                <ArrowLeft size={16} /> {t('support.backToTickets')}
            </button>

            <TicketHeader ticket={ticket} onStatusChange={handleStatusChange} onReassign={() => setShowReassign(true)} />

            <TicketConversation messages={ticket.messages} onSend={handleSend} />

            <ReassignModal
                open={showReassign}
                onClose={() => setShowReassign(false)}
                ticketId={ticket.id}
                currentAssigneeId={ticket.assigned_to || ''}
                currentAssigneeName={ticket.assigned_to_name || ''}
                admins={mockSupportAdmins}
                onReassign={handleReassign}
            />
        </div>
    );
}
