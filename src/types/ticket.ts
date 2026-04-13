export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'waiting_on_customer' | 'waiting_on_provider' | 'resolved' | 'closed';
export type TicketCategory = 'billing' | 'technical' | 'account' | 'booking' | 'complaint' | 'feature_request' | 'other';

export interface SupportTicket {
    id: string;
    subject: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    submitted_by: {
        type: 'user' | 'provider';
        id: string;
        name: string;
        email: string;
    };
    assigned_to: string | null;
    assigned_to_name: string | null;
    sla_deadline: string | null;
    sla_breached: boolean;
    messages: TicketMessage[];
    tags: string[];
    created_at: string;
    updated_at: string;
    resolved_at: string | null;
}

export interface TicketMessage {
    id: string;
    sender_type: 'customer' | 'admin' | 'system';
    sender_name: string;
    content: string;
    attachments: { name: string; url: string }[];
    created_at: string;
}
