'use client';

import React, { useState, useMemo } from 'react';
import { Check, X, Clock, FileText, Building2, Eye, ShieldCheck, AlertTriangle, UserCheck } from 'lucide-react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ConfirmModal, FormModal, FormField } from '@/components/admin/FormModal';
import { SlideOver, useToast } from '@/components/ui';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { useAuth } from '@/contexts/AuthContext';
import { mockRegistrations } from '@/mocks/providers';
import type { ProviderRegistration } from '@/types/provider';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

type StatusFilter = ProviderRegistration['status'] | 'all';

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

const daysSince = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
const allVerified = (r: ProviderRegistration) => r.documents.length > 0 && r.documents.every(d => d.verified);

export default function RegistrationsPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { addToast } = useToast();

    const [registrations, setRegistrations] = useState<ProviderRegistration[]>(mockRegistrations);
    const [selected, setSelected] = useState<string[]>([]);
    const [filter, setFilter] = useState<StatusFilter>('pending');
    const [detail, setDetail] = useState<ProviderRegistration | null>(null);
    const [approveConfirm, setApproveConfirm] = useState<string[] | null>(null);
    const [rejectModal, setRejectModal] = useState<string[] | null>(null);
    const [reason, setReason] = useState('');
    const [working, setWorking] = useState(false);

    // ── Summary roll-ups ──
    const pending = useMemo(() => registrations.filter(r => r.status === 'pending'), [registrations]);
    const ready = useMemo(() => pending.filter(allVerified), [pending]);
    const oldestWait = useMemo(
        () => (pending.length ? Math.max(...pending.map(r => daysSince(r.submitted_at))) : 0),
        [pending]
    );
    const counts = {
        pending: pending.length,
        approved: registrations.filter(r => r.status === 'approved').length,
        rejected: registrations.filter(r => r.status === 'rejected').length,
    };

    const filtered = useMemo(
        () => (filter === 'all' ? registrations : registrations.filter(r => r.status === filter)),
        [registrations, filter]
    );

    // Explicit decision — stamps who/when/why and moves the registration's status.
    const decide = (ids: Set<string>, status: 'approved' | 'rejected', extra: Partial<ProviderRegistration>) => {
        setRegistrations(prev =>
            prev.map(r =>
                ids.has(r.id) && r.status === 'pending'
                    ? {
                          ...r,
                          status,
                          reviewed_by: user?.uuid ?? null,
                          reviewed_by_name: user?.name ?? null,
                          reviewed_at: new Date().toISOString(),
                          ...extra,
                      }
                    : r
            )
        );
    };

    const applyApprove = () => {
        if (!approveConfirm) return;
        setWorking(true);
        decide(new Set(approveConfirm), 'approved', { rejection_reason: null });
        addToast('success', t('providers.registrations.approvedToast').replace('{n}', String(approveConfirm.length)).replace('{s}', approveConfirm.length > 1 ? 's' : ''));
        setWorking(false);
        setApproveConfirm(null);
        setSelected([]);
        setDetail(null);
    };

    const applyReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectModal) return;
        if (!reason.trim()) {
            addToast('error', t('providers.registrations.reasonRequired'));
            return;
        }
        setWorking(true);
        decide(new Set(rejectModal), 'rejected', { rejection_reason: reason.trim() });
        addToast('warning', t('providers.registrations.rejectedToast').replace('{n}', String(rejectModal.length)).replace('{s}', rejectModal.length > 1 ? 's' : ''));
        setWorking(false);
        setRejectModal(null);
        setReason('');
        setSelected([]);
        setDetail(null);
    };

    // Bulk eligibility — only pending rows can be decided; only fully-verified can be approved.
    const selectedApprovable = selected.filter(id => {
        const r = registrations.find(x => x.id === id);
        return r?.status === 'pending' && allVerified(r);
    });
    const selectedRejectable = selected.filter(id => registrations.find(x => x.id === id)?.status === 'pending');

    const columns: Column<ProviderRegistration>[] = [
        {
            key: 'business_name',
            label: t('providers.businessName'),
            sortable: true,
            render: r => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-tertiary)',
                            color: 'var(--text-secondary)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <Building2 size={16} />
                    </span>
                    <span style={{ minWidth: 0 }}>
                        <span style={{ display: 'block', fontWeight: 500 }}>{r.business_name}</span>
                        <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                            {r.provider_name} · {r.email}
                        </span>
                    </span>
                </div>
            ),
        },
        {
            key: 'business_category',
            label: t('providers.category'),
            sortable: true,
            render: r => <span style={{ textTransform: 'capitalize' }}>{r.business_category}</span>,
        },
        {
            key: 'documents',
            label: t('providers.registrations.documents'),
            render: r => {
                const ok = r.documents.filter(d => d.verified).length;
                const complete = ok === r.documents.length && r.documents.length > 0;
                return (
                    <span
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'var(--space-1)',
                            fontVariantNumeric: 'tabular-nums',
                            color: complete ? 'var(--color-success)' : 'var(--text-secondary)',
                        }}
                    >
                        <FileText size={13} /> {ok}/{r.documents.length}
                        {complete && <ShieldCheck size={13} />}
                    </span>
                );
            },
        },
        {
            key: 'submitted_at',
            label: t('providers.registrations.submitted'),
            sortable: true,
            render: r => {
                const d = daysSince(r.submitted_at);
                const overdue = r.status === 'pending' && d >= 3;
                return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', whiteSpace: 'nowrap' }}>
                        <Clock size={12} style={{ color: 'var(--text-tertiary)' }} />
                        <span style={{ color: 'var(--text-secondary)' }}>
                            {d === 0 ? t('common.today') : `${d}${t('common.daysShort')}`}
                        </span>
                        {overdue && (
                            <span
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    fontSize: 'var(--text-xs)',
                                    color: 'var(--color-warning)',
                                    background: 'var(--color-warning-light)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '1px var(--space-2)',
                                }}
                            >
                                <AlertTriangle size={11} /> SLA
                            </span>
                        )}
                    </span>
                );
            },
        },
        { key: 'status', label: t('common.status'), sortable: true, render: r => <StatusBadge status={r.status} /> },
        {
            key: 'actions',
            label: '',
            width: '120px',
            render: r => (
                <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                    {r.status === 'pending' && (
                        <PermissionGate module="providers" action="edit">
                            <button
                                style={{
                                    ...iconBtn,
                                    color: allVerified(r) ? 'var(--color-success)' : 'var(--text-tertiary)',
                                    opacity: allVerified(r) ? 1 : 0.5,
                                    cursor: allVerified(r) ? 'pointer' : 'not-allowed',
                                }}
                                title={allVerified(r) ? t('providers.approve') : t('providers.registrations.verifyFirst')}
                                disabled={!allVerified(r)}
                                onClick={() => setApproveConfirm([r.id])}
                            >
                                <Check size={16} />
                            </button>
                            <button
                                style={{ ...iconBtn, color: 'var(--color-error)' }}
                                title={t('providers.reject')}
                                onClick={() => {
                                    setReason('');
                                    setRejectModal([r.id]);
                                }}
                            >
                                <X size={16} />
                            </button>
                        </PermissionGate>
                    )}
                    <button style={iconBtn} title={t('common.view')} onClick={() => setDetail(r)}>
                        <Eye size={16} />
                    </button>
                </div>
            ),
        },
    ];

    const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
        { key: 'all', label: t('reviews.allStatus') },
        { key: 'pending', label: t('providers.registrations.pending') },
        { key: 'approved', label: t('providers.registrations.approved') },
        { key: 'rejected', label: t('providers.registrations.rejected') },
    ];

    return (
        <div className={shared.page}>
            <h1 className={shared.pageTitle}>{t('sidebar.registrations')}</h1>

            {/* Queue summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
                <SummaryCard
                    icon={<Clock size={18} />}
                    tint="var(--color-warning)"
                    bg="var(--color-warning-light)"
                    label={t('providers.registrations.awaitingReview')}
                    value={String(counts.pending)}
                    sub={oldestWait > 0 ? t('providers.registrations.oldestWait').replace('{n}', String(oldestWait)) : '—'}
                />
                <SummaryCard
                    icon={<ShieldCheck size={18} />}
                    tint="var(--color-primary-600)"
                    bg="var(--color-primary-50)"
                    label={t('providers.registrations.readyToApprove')}
                    value={String(ready.length)}
                    sub={t('providers.registrations.docsVerified')}
                />
                <SummaryCard
                    icon={<Check size={18} />}
                    tint="var(--color-success)"
                    bg="var(--color-success-light)"
                    label={t('providers.registrations.approved')}
                    value={String(counts.approved)}
                    sub={t('providers.registrations.rejected') + `: ${counts.rejected}`}
                />
            </div>

            {/* Status filters */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {STATUS_FILTERS.map(f => {
                    const active = filter === f.key;
                    const count = f.key === 'all' ? registrations.length : registrations.filter(r => r.status === f.key).length;
                    return (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            aria-pressed={active}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 'var(--space-2)',
                                padding: 'var(--space-2) var(--space-3)',
                                borderRadius: 'var(--radius-full)',
                                border: `1px solid ${active ? 'var(--color-primary-400)' : 'var(--border-color)'}`,
                                background: active ? 'var(--color-primary-50)' : 'var(--bg-primary)',
                                color: active ? 'var(--color-primary-700)' : 'var(--text-secondary)',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 500,
                                cursor: 'pointer',
                            }}
                        >
                            {f.label}
                            <span style={{ opacity: 0.7, fontVariantNumeric: 'tabular-nums' }}>{count}</span>
                        </button>
                    );
                })}
            </div>

            <DataTable<ProviderRegistration>
                columns={columns}
                data={filtered}
                searchKeys={['business_name', 'provider_name', 'email']}
                searchPlaceholder={t('providers.registrations.searchPlaceholder')}
                getRowKey={r => r.id}
                onRowClick={r => setDetail(r)}
                emptyMessage={t('providers.registrations.none')}
                selectable
                selectedKeys={selected}
                onSelectionChange={setSelected}
                bulkActions={
                    <PermissionGate module="providers" action="edit">
                        <button
                            style={{
                                ...iconBtn,
                                width: 'auto',
                                padding: '0 var(--space-3)',
                                gap: 'var(--space-2)',
                                background: 'var(--color-primary-500)',
                                borderColor: 'var(--color-primary-500)',
                                color: '#fff',
                                opacity: selectedApprovable.length === 0 ? 0.5 : 1,
                            }}
                            disabled={selectedApprovable.length === 0}
                            title={selectedApprovable.length === 0 ? t('providers.registrations.verifyFirst') : undefined}
                            onClick={() => setApproveConfirm(selectedApprovable)}
                        >
                            <Check size={15} /> {t('providers.approve')}
                            {selectedApprovable.length ? ` ${selectedApprovable.length}` : ''}
                        </button>
                        <button
                            style={{ ...iconBtn, width: 'auto', padding: '0 var(--space-3)', gap: 'var(--space-2)', color: 'var(--color-error)' }}
                            disabled={selectedRejectable.length === 0}
                            onClick={() => {
                                setReason('');
                                setRejectModal(selectedRejectable);
                            }}
                        >
                            <X size={15} /> {t('providers.reject')}
                            {selectedRejectable.length ? ` ${selectedRejectable.length}` : ''}
                        </button>
                    </PermissionGate>
                }
            />

            {/* Bulk / single approve confirmation */}
            <ConfirmModal
                open={!!approveConfirm}
                onClose={() => setApproveConfirm(null)}
                onConfirm={applyApprove}
                title={t('providers.approve')}
                message={
                    approveConfirm
                        ? t('providers.registrations.approveConfirm')
                              .replace('{n}', String(approveConfirm.length))
                              .replace('{s}', approveConfirm.length > 1 ? 's' : '')
                        : ''
                }
                confirmLabel={t('providers.approve')}
                variant="primary"
                loading={working}
            />

            {/* Reject reason (single or bulk) */}
            <FormModal
                open={!!rejectModal}
                onClose={() => setRejectModal(null)}
                title={`${t('providers.reject')}${rejectModal && rejectModal.length > 1 ? ` · ${rejectModal.length}` : ''}`}
                submitLabel={t('providers.reject')}
                submitVariant="danger"
                onSubmit={applyReject}
            >
                <FormField label={t('common.reason')} required htmlFor="rejection-reason">
                    <textarea
                        id="rejection-reason"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        rows={3}
                        required
                        className={shared.formInput}
                        style={{ resize: 'vertical', width: '100%' }}
                        placeholder={t('providers.registrations.reasonPlaceholder')}
                    />
                </FormField>
            </FormModal>

            {/* Detail drawer with document checklist */}
            <SlideOver
                open={!!detail}
                onClose={() => setDetail(null)}
                title={detail ? detail.business_name : ''}
            >
                {detail && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <StatusBadge status={detail.status} />
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                                {new Date(detail.submitted_at).toLocaleDateString()} · {daysSince(detail.submitted_at)}
                                {t('common.daysShort')}
                            </span>
                        </div>

                        {/* Applicant */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', fontSize: 'var(--text-sm)' }}>
                            <Row label={t('providers.owner')} value={detail.provider_name} />
                            <Row label={t('providers.category')} value={detail.business_category} capitalize />
                            <Row label={t('common.email')} value={detail.email} />
                            <Row label={t('common.phone')} value={detail.phone} />
                        </div>

                        {/* Document checklist */}
                        <div>
                            <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                                {t('providers.registrations.documents')}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                                {detail.documents.map(d => (
                                    <div
                                        key={d.type}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: 'var(--space-2) var(--space-3)',
                                            background: 'var(--bg-secondary)',
                                            borderRadius: 'var(--radius-md)',
                                            fontSize: 'var(--text-sm)',
                                        }}
                                    >
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                            <FileText size={15} style={{ color: 'var(--text-tertiary)' }} />
                                            <span style={{ textTransform: 'capitalize' }}>{d.type}</span>
                                        </span>
                                        {d.verified ? (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--color-success)' }}>
                                                <ShieldCheck size={14} /> {t('providers.registrations.verified')}
                                            </span>
                                        ) : (
                                            <span style={{ color: 'var(--text-tertiary)' }}>{t('providers.registrations.unverified')}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Audit trail */}
                        {detail.status !== 'pending' && detail.reviewed_at && (
                            <div style={{ padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <UserCheck size={14} />
                                    <strong>
                                        {detail.status === 'approved'
                                            ? t('providers.registrations.approvedBy')
                                            : t('providers.registrations.rejectedBy')}
                                        :
                                    </strong>{' '}
                                    {detail.reviewed_by_name ?? '—'} · {new Date(detail.reviewed_at).toLocaleString()}
                                </span>
                                {detail.rejection_reason && (
                                    <span style={{ color: 'var(--color-error)' }}>
                                        <strong>{t('common.reason')}:</strong> {detail.rejection_reason}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        {detail.status === 'pending' && (
                            <PermissionGate module="providers" action="edit">
                                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                                    <button
                                        style={{
                                            ...iconBtn,
                                            width: 'auto',
                                            padding: 'var(--space-2) var(--space-4)',
                                            gap: 'var(--space-2)',
                                            background: 'var(--color-primary-500)',
                                            borderColor: 'var(--color-primary-500)',
                                            color: '#fff',
                                            opacity: allVerified(detail) ? 1 : 0.5,
                                            cursor: allVerified(detail) ? 'pointer' : 'not-allowed',
                                        }}
                                        disabled={!allVerified(detail)}
                                        title={allVerified(detail) ? undefined : t('providers.registrations.verifyFirst')}
                                        onClick={() => setApproveConfirm([detail.id])}
                                    >
                                        <Check size={15} /> {t('providers.approve')}
                                    </button>
                                    <button
                                        style={{ ...iconBtn, width: 'auto', padding: 'var(--space-2) var(--space-4)', gap: 'var(--space-2)', color: 'var(--color-error)' }}
                                        onClick={() => {
                                            setReason('');
                                            setRejectModal([detail.id]);
                                        }}
                                    >
                                        <X size={15} /> {t('providers.reject')}
                                    </button>
                                </div>
                            </PermissionGate>
                        )}
                    </div>
                )}
            </SlideOver>
        </div>
    );
}

function Row({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
            <span style={{ color: 'var(--text-tertiary)' }}>{label}</span>
            <span style={{ textAlign: 'end', textTransform: capitalize ? 'capitalize' : 'none' }}>{value}</span>
        </div>
    );
}

function SummaryCard({
    icon,
    tint,
    bg,
    label,
    value,
    sub,
}: {
    icon: React.ReactNode;
    tint: string;
    bg: string;
    label: string;
    value: string;
    sub: string;
}) {
    return (
        <div
            style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                display: 'flex',
                gap: 'var(--space-3)',
                alignItems: 'center',
            }}
        >
            <div
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-lg)',
                    background: bg,
                    color: tint,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                {icon}
            </div>
            <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{label}</div>
                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', fontVariantNumeric: 'tabular-nums' }}>
                    {value}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{sub}</div>
            </div>
        </div>
    );
}
