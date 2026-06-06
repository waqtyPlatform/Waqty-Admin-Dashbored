'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ConfirmModal } from '@/components/admin/FormModal';
import { useToast } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import type { SupportTicket, TicketPriority } from '@/types/ticket';
import { mockTickets } from '@/mocks/support';
import { MessageSquare, AlertTriangle, Clock, UserPlus, CheckCircle, Eye } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const priorityColors: Record<string, string> = { low: 'var(--text-tertiary)', medium: 'var(--color-info)', high: 'var(--color-warning)', urgent: 'var(--color-error)' };
const priorityRank: Record<TicketPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
const ACTIVE: SupportTicket['status'][] = ['open', 'in_progress', 'waiting_on_customer', 'waiting_on_provider'];

type View = 'all' | 'open' | 'unassigned' | 'mine' | 'breached';

const iconBtn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-primary)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
};

export default function SupportPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { user } = useAuth();
    const { addToast } = useToast();

    const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets);
    const [selected, setSelected] = useState<string[]>([]);
    const [view, setView] = useState<View>('all');
    const [confirmClose, setConfirmClose] = useState<string[] | null>(null);
    const [working, setWorking] = useState(false);

    const me = user?.uuid ?? 'me';

    const matchesView = (ticket: SupportTicket, v: View) => {
        switch (v) {
            case 'open': return ACTIVE.includes(ticket.status);
            case 'unassigned': return ticket.assigned_to == null && ACTIVE.includes(ticket.status);
            case 'mine': return ticket.assigned_to === me;
            case 'breached': return ticket.sla_breached;
            default: return true;
        }
    };

    // SLA-first ordering: breached pinned to top, then by priority, then soonest deadline.
    const sortQueue = (a: SupportTicket, b: SupportTicket) => {
        if (a.sla_breached !== b.sla_breached) return a.sla_breached ? -1 : 1;
        if (priorityRank[a.priority] !== priorityRank[b.priority]) return priorityRank[a.priority] - priorityRank[b.priority];
        const ad = a.sla_deadline ? new Date(a.sla_deadline).getTime() : Infinity;
        const bd = b.sla_deadline ? new Date(b.sla_deadline).getTime() : Infinity;
        if (ad !== bd) return ad - bd;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    };

    const filtered = useMemo(
        () => tickets.filter(tk => matchesView(tk, view)).sort(sortQueue),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [tickets, view, me]
    );

    const VIEWS: { key: View; label: string }[] = [
        { key: 'all', label: t('common.all') },
        { key: 'open', label: t('support.open') },
        { key: 'unassigned', label: t('support.unassigned') },
        { key: 'mine', label: t('support.mine') },
        { key: 'breached', label: t('support.slaBreached') },
    ];

    const assignToMe = (ids: string[]) => {
        if (ids.length === 0) return;
        setTickets(prev =>
            prev.map(tk =>
                ids.includes(tk.id)
                    ? { ...tk, assigned_to: me, assigned_to_name: user?.name ?? 'Me', status: tk.status === 'open' ? 'in_progress' : tk.status, updated_at: new Date().toISOString() }
                    : tk
            )
        );
        addToast('success', `${ids.length} ${ids.length > 1 ? t('support.ticketsLower') : t('support.ticketLower')} ${t('support.assignedToYou')}`);
        setSelected([]);
    };

    const closeTickets = () => {
        if (!confirmClose) return;
        setWorking(true);
        const now = new Date().toISOString();
        setTickets(prev =>
            prev.map(tk => (confirmClose.includes(tk.id) ? { ...tk, status: 'resolved', resolved_at: now, updated_at: now } : tk))
        );
        addToast('success', `${confirmClose.length} ${confirmClose.length > 1 ? t('support.ticketsLower') : t('support.ticketLower')} ${t('support.resolvedToast')}`);
        setWorking(false);
        setConfirmClose(null);
        setSelected([]);
    };

    const columns: Column<SupportTicket>[] = [
        { key: 'id', label: t('support.id'), width: '80px', render: r => <span style={{ fontWeight: 500, fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{r.id}</span> },
        {
            key: 'subject',
            label: t('support.subject'),
            sortable: true,
            render: r => (
                <div>
                    <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {r.sla_breached && <AlertTriangle size={14} color="var(--color-error)" />}
                        {r.subject}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{r.submitted_by.name} ({r.submitted_by.type})</div>
                </div>
            ),
        },
        { key: 'category', label: t('support.category'), sortable: true, render: r => <span style={{ textTransform: 'capitalize', fontSize: '0.8125rem' }}>{r.category.replace('_', ' ')}</span> },
        { key: 'priority', label: t('support.priority'), sortable: true, render: r => <span style={{ color: priorityColors[r.priority], fontWeight: 600, fontSize: '0.8125rem', textTransform: 'uppercase' }}>{r.priority}</span> },
        { key: 'status', label: t('common.status'), sortable: true, render: r => <StatusBadge status={r.status} /> },
        { key: 'assigned_to_name', label: t('support.assigned'), render: r => r.assigned_to_name || <span style={{ color: 'var(--text-tertiary)' }}>{t('support.unassigned')}</span> },
        {
            key: 'actions',
            label: '',
            width: '90px',
            render: r => (
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                    {r.assigned_to !== me && ACTIVE.includes(r.status) && (
                        <button style={iconBtn} title={t('support.assignToMe')} onClick={() => assignToMe([r.id])}>
                            <UserPlus size={15} />
                        </button>
                    )}
                    <button style={iconBtn} title={t('common.view')} onClick={() => router.push(`/support/${r.id}`)}>
                        <Eye size={15} />
                    </button>
                </div>
            ),
        },
    ];

    const summary = {
        open: tickets.filter(tk => tk.status === 'open').length,
        inProgress: tickets.filter(tk => tk.status === 'in_progress').length,
        breached: tickets.filter(tk => tk.sla_breached).length,
    };

    const selectedClosable = selected.filter(id => {
        const tk = tickets.find(x => x.id === id);
        return tk && tk.status !== 'resolved';
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{t('support.title')}</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <MessageSquare size={20} color="var(--color-warning)" />
                    <div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('support.open')}</div><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{summary.open}</div></div>
                </div>
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Clock size={20} color="var(--color-info)" />
                    <div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('support.inProgress')}</div><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{summary.inProgress}</div></div>
                </div>
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <AlertTriangle size={20} color="var(--color-error)" />
                    <div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('support.slaBreached')}</div><div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-error)' }}>{summary.breached}</div></div>
                </div>
            </div>

            {/* Saved views */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {VIEWS.map(v => {
                    const active = view === v.key;
                    const count = tickets.filter(tk => matchesView(tk, v.key)).length;
                    return (
                        <button
                            key={v.key}
                            onClick={() => setView(v.key)}
                            aria-pressed={active}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '6px 12px',
                                borderRadius: 'var(--radius-full)',
                                border: `1px solid ${active ? 'var(--color-primary-400)' : 'var(--border-color)'}`,
                                background: active ? 'var(--color-primary-50)' : 'var(--bg-primary)',
                                color: active ? 'var(--color-primary-700)' : 'var(--text-secondary)',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 500,
                                cursor: 'pointer',
                            }}
                        >
                            {v.label}
                            <span style={{ opacity: 0.7, fontVariantNumeric: 'tabular-nums' }}>{count}</span>
                        </button>
                    );
                })}
            </div>

            <DataTable<SupportTicket>
                columns={columns}
                data={filtered}
                searchKeys={['subject', 'id', 'submitted_by']}
                searchPlaceholder={t('support.searchPlaceholder')}
                getRowKey={r => r.id}
                onRowClick={r => router.push(`/support/${r.id}`)}
                selectable
                selectedKeys={selected}
                onSelectionChange={setSelected}
                bulkActions={
                    <>
                        <button style={{ ...iconBtn, width: 'auto', padding: '0 12px', gap: 6 }} onClick={() => assignToMe(selected)}>
                            <UserPlus size={15} /> {t('support.assignToMe')}
                        </button>
                        <button
                            style={{ ...iconBtn, width: 'auto', padding: '0 12px', gap: 6, background: 'var(--color-primary-500)', borderColor: 'var(--color-primary-500)', color: '#fff', opacity: selectedClosable.length === 0 ? 0.5 : 1 }}
                            disabled={selectedClosable.length === 0}
                            onClick={() => setConfirmClose(selectedClosable)}
                        >
                            <CheckCircle size={15} /> {t('support.close')}{selectedClosable.length ? ` ${selectedClosable.length}` : ''}
                        </button>
                    </>
                }
            />

            <ConfirmModal
                open={!!confirmClose}
                onClose={() => setConfirmClose(null)}
                onConfirm={closeTickets}
                title={t('support.close')}
                message={
                    confirmClose
                        ? t('support.closeConfirm')
                              .replace('{n}', String(confirmClose.length))
                              .replace('{s}', confirmClose.length > 1 ? 's' : '')
                        : ''
                }
                confirmLabel={t('support.close')}
                variant="primary"
                loading={working}
            />
        </div>
    );
}
