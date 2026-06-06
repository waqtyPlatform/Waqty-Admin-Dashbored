'use client';

import React, { useState, useMemo } from 'react';
import { CheckCircle, Banknote, Eye, Clock, Wallet, RotateCcw } from 'lucide-react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ConfirmModal } from '@/components/admin/FormModal';
import { SlideOver, useToast } from '@/components/ui';
import { platformPayouts } from '@/mocks/finance';
import type { PayoutRow, PayoutStatus } from '@/types/finance';
import { formatMoney } from '@/lib/market';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

type BulkAction = 'approve' | 'pay';

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

const STATUS_FILTERS: { key: 'all' | PayoutStatus; labelKey: string }[] = [
    { key: 'all', labelKey: 'common.all' },
    { key: 'pending', labelKey: 'finance.payouts.awaitingApproval' },
    { key: 'processing', labelKey: 'finance.payouts.readyToPay' },
    { key: 'paid', labelKey: 'finance.payouts.paid' },
    { key: 'failed', labelKey: 'finance.payouts.failed' },
];

export default function PayoutsPage() {
    const { t } = useTranslation();
    const { addToast } = useToast();

    const [payouts, setPayouts] = useState<PayoutRow[]>(platformPayouts);
    const [selected, setSelected] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<'all' | PayoutStatus>('all');
    const [detail, setDetail] = useState<PayoutRow | null>(null);
    const [confirm, setConfirm] = useState<{ action: BulkAction; ids: string[] } | null>(null);
    const [working, setWorking] = useState(false);

    // ── Summary roll-ups ──
    const pending = useMemo(() => payouts.filter(p => p.status === 'pending'), [payouts]);
    const processing = useMemo(() => payouts.filter(p => p.status === 'processing'), [payouts]);
    const sum = (rows: PayoutRow[]) => rows.reduce((s, p) => s + p.net_payable, 0);
    const pendingTotal = sum(pending);
    const processingTotal = sum(processing);

    const filtered = useMemo(
        () => (statusFilter === 'all' ? payouts : payouts.filter(p => p.status === statusFilter)),
        [payouts, statusFilter]
    );

    const askConfirm = (action: BulkAction, ids: string[]) => {
        if (ids.length === 0) return;
        setConfirm({ action, ids });
    };

    const applyAction = () => {
        if (!confirm) return;
        setWorking(true);
        const ids = new Set(confirm.ids);
        const paidAt = new Date().toISOString();
        setPayouts(prev =>
            prev.map(p => {
                if (!ids.has(p.uuid)) return p;
                if (confirm.action === 'approve' && p.status === 'pending') return { ...p, status: 'processing' };
                if (confirm.action === 'pay' && (p.status === 'pending' || p.status === 'processing'))
                    return { ...p, status: 'paid', paid_at: paidAt };
                return p;
            })
        );
        addToast(
            'success',
            (confirm.action === 'approve' ? t('finance.payouts.approvedToast') : t('finance.payouts.paidToast'))
                .replace('{n}', String(confirm.ids.length))
                .replace('{s}', confirm.ids.length > 1 ? 's' : '')
        );
        setWorking(false);
        setConfirm(null);
        setSelected([]);
    };

    const revert = (uuid: string) => {
        setPayouts(prev => prev.map(p => (p.uuid === uuid && p.status === 'processing' ? { ...p, status: 'pending' } : p)));
        addToast('success', t('finance.payouts.revertedToast'));
    };

    const columns: Column<PayoutRow>[] = [
        {
            key: 'provider_name',
            label: t('finance.provider'),
            sortable: true,
            render: r => <span style={{ fontWeight: 500 }}>{r.provider_name}</span>,
        },
        { key: 'gross', label: t('finance.commissions.bookingAmount'), sortable: true, render: r => formatMoney(r.gross) },
        { key: 'commission_total', label: t('finance.commissions'), sortable: true, render: r => formatMoney(r.commission_total) },
        { key: 'fees_total', label: t('finance.fees'), sortable: true, render: r => formatMoney(r.fees_total) },
        {
            key: 'net_payable',
            label: t('finance.payouts.netPayable'),
            sortable: true,
            render: r => <strong>{formatMoney(r.net_payable)}</strong>,
        },
        { key: 'status', label: t('common.status'), sortable: true, render: r => <StatusBadge status={r.status} /> },
        {
            key: 'actions',
            label: '',
            width: '120px',
            render: r => (
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                    {r.status === 'pending' && (
                        <button style={iconBtn} title={t('finance.payouts.approve')} aria-label={t('finance.payouts.approve')} onClick={() => askConfirm('approve', [r.uuid])}>
                            <CheckCircle size={16} />
                        </button>
                    )}
                    {(r.status === 'pending' || r.status === 'processing') && (
                        <button style={iconBtn} title={t('finance.payouts.markAsPaid')} aria-label={t('finance.payouts.markAsPaid')} onClick={() => askConfirm('pay', [r.uuid])}>
                            <Banknote size={16} />
                        </button>
                    )}
                    {r.status === 'processing' && (
                        <button style={iconBtn} title={t('finance.payouts.returnToApproval')} aria-label={t('finance.payouts.returnToApproval')} onClick={() => revert(r.uuid)}>
                            <RotateCcw size={16} />
                        </button>
                    )}
                    <button style={iconBtn} title={t('finance.payouts.viewBreakdown')} aria-label={t('finance.payouts.viewBreakdown')} onClick={() => setDetail(r)}>
                        <Eye size={16} />
                    </button>
                </div>
            ),
        },
    ];

    const selectedPending = selected.filter(id => payouts.find(p => p.uuid === id)?.status === 'pending');
    const selectedPayable = selected.filter(id => {
        const st = payouts.find(p => p.uuid === id)?.status;
        return st === 'pending' || st === 'processing';
    });

    const confirmAmount = confirm ? sum(payouts.filter(p => confirm.ids.includes(p.uuid))) : 0;

    return (
        <div className={shared.page}>
            <h1 className={shared.pageTitle}>{t('finance.payouts.title')}</h1>

            {/* Pay-run summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
                <SummaryCard
                    icon={<Wallet size={18} />}
                    tint="var(--color-primary-600)"
                    bg="var(--color-primary-50)"
                    label={t('finance.payouts.totalPayable')}
                    value={formatMoney(pendingTotal + processingTotal)}
                    sub={`${pending.length + processing.length} ${t('finance.payouts.countSuffix')}`}
                />
                <SummaryCard
                    icon={<Clock size={18} />}
                    tint="var(--color-warning)"
                    bg="var(--color-warning-light)"
                    label={t('finance.payouts.awaitingApproval')}
                    value={formatMoney(pendingTotal)}
                    sub={`${pending.length} ${t('finance.payouts.countSuffix')}`}
                />
                <SummaryCard
                    icon={<Banknote size={18} />}
                    tint="var(--color-info)"
                    bg="var(--color-info-light)"
                    label={t('finance.payouts.readyToPay')}
                    value={formatMoney(processingTotal)}
                    sub={`${processing.length} ${t('finance.payouts.countSuffix')}`}
                />
            </div>

            {/* Status filters */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {STATUS_FILTERS.map(f => {
                    const active = statusFilter === f.key;
                    const count = f.key === 'all' ? payouts.length : payouts.filter(p => p.status === f.key).length;
                    return (
                        <button
                            key={f.key}
                            onClick={() => setStatusFilter(f.key)}
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
                            {t(f.labelKey)}
                            <span style={{ opacity: 0.7, fontVariantNumeric: 'tabular-nums' }}>{count}</span>
                        </button>
                    );
                })}
            </div>

            <DataTable<PayoutRow>
                columns={columns}
                data={filtered}
                searchKeys={['provider_name']}
                searchPlaceholder={t('finance.payouts.searchPlaceholder')}
                getRowKey={r => r.uuid}
                onRowClick={r => setDetail(r)}
                selectable
                selectedKeys={selected}
                onSelectionChange={setSelected}
                bulkActions={
                    <>
                        <button
                            style={{ ...iconBtn, width: 'auto', padding: '0 12px', gap: 6 }}
                            disabled={selectedPending.length === 0}
                            onClick={() => askConfirm('approve', selectedPending)}
                        >
                            <CheckCircle size={15} /> {t('finance.payouts.approve')}{selectedPending.length ? ` ${selectedPending.length}` : ''}
                        </button>
                        <button
                            style={{
                                ...iconBtn,
                                width: 'auto',
                                padding: '0 12px',
                                gap: 6,
                                background: 'var(--color-primary-500)',
                                borderColor: 'var(--color-primary-500)',
                                color: '#fff',
                                opacity: selectedPayable.length === 0 ? 0.5 : 1,
                            }}
                            disabled={selectedPayable.length === 0}
                            onClick={() => askConfirm('pay', selectedPayable)}
                        >
                            <Banknote size={15} /> {t('finance.payouts.markPaid')}{selectedPayable.length ? ` ${selectedPayable.length}` : ''}
                        </button>
                    </>
                }
            />

            {/* Confirm bulk action */}
            <ConfirmModal
                open={!!confirm}
                onClose={() => setConfirm(null)}
                onConfirm={applyAction}
                title={confirm?.action === 'approve' ? t('finance.payouts.approveTitle') : t('finance.payouts.markPaidTitle')}
                message={
                    confirm
                        ? (confirm.action === 'approve' ? t('finance.payouts.confirmApproveMsg') : t('finance.payouts.confirmPayMsg'))
                              .replace('{n}', String(confirm.ids.length))
                              .replace('{s}', confirm.ids.length > 1 ? 's' : '')
                              .replace('{amount}', formatMoney(confirmAmount))
                        : ''
                }
                confirmLabel={confirm?.action === 'approve' ? t('finance.payouts.approve') : t('finance.payouts.markPaid')}
                variant={confirm?.action === 'approve' ? 'primary' : 'warning'}
                loading={working}
            />

            {/* Payout detail drawer */}
            <SlideOver open={!!detail} onClose={() => setDetail(null)} title={detail ? `${t('finance.payouts.title')} · ${detail.provider_name}` : ''}>
                {detail && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <StatusBadge status={detail.status} />
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                                {new Date(detail.period_start).toLocaleDateString()} –{' '}
                                {new Date(detail.period_end).toLocaleDateString()}
                            </span>
                        </div>
                        {(
                            [
                                [t('finance.payouts.gross'), detail.gross],
                                [t('finance.commissions'), detail.commission_total],
                                [t('finance.fees'), detail.fees_total],
                            ] as const
                        ).map(([label, val]) => (
                            <div
                                key={label}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: 'var(--text-sm)',
                                    padding: 'var(--space-2) 0',
                                    borderBottom: '1px solid var(--border-color)',
                                }}
                            >
                                <span style={{ color: 'var(--text-tertiary)' }}>{label}</span>
                                <span>{formatMoney(val)}</span>
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-2)' }}>
                            <strong>{t('finance.payouts.netPayable')}</strong>
                            <strong style={{ fontSize: 'var(--text-lg)', color: 'var(--color-primary-600)' }}>
                                {formatMoney(detail.net_payable)}
                            </strong>
                        </div>
                        {detail.reference && (
                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                                {t('finance.payouts.reference')}: {detail.reference}
                            </div>
                        )}
                        {detail.paid_at && (
                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                                {t('finance.payouts.paidOn')} {new Date(detail.paid_at).toLocaleString()}
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                            {detail.status === 'pending' && (
                                <button
                                    style={{ ...iconBtn, width: 'auto', padding: '8px 14px', gap: 6 }}
                                    onClick={() => {
                                        askConfirm('approve', [detail.uuid]);
                                        setDetail(null);
                                    }}
                                >
                                    <CheckCircle size={15} /> {t('finance.payouts.approve')}
                                </button>
                            )}
                            {(detail.status === 'pending' || detail.status === 'processing') && (
                                <button
                                    style={{
                                        ...iconBtn,
                                        width: 'auto',
                                        padding: '8px 14px',
                                        gap: 6,
                                        background: 'var(--color-primary-500)',
                                        borderColor: 'var(--color-primary-500)',
                                        color: '#fff',
                                    }}
                                    onClick={() => {
                                        askConfirm('pay', [detail.uuid]);
                                        setDetail(null);
                                    }}
                                >
                                    <Banknote size={15} /> {t('finance.payouts.markPaid')}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </SlideOver>
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
