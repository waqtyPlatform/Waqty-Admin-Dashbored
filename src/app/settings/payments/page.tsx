'use client';

import React, { useState, useCallback } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useApiQuery, useApiMutation } from '@/hooks/useApiQuery';
import { paymentsApi, type PaymentObject, type UpdatePaymentBody, type PaymentMethodType, type ApiPaymentStatus } from '@/lib/api';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { CreditCard, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';

export default function PaymentsPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // ── Filters ───────────────────────────────────────────
    const statusFilter   = searchParams.get('status') as ApiPaymentStatus | null;
    const methodFilter   = searchParams.get('payment_method') as PaymentMethodType | null;
    const [page, setPage] = useState(1);

    const setFilter = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (!value || value === 'all') params.delete(key);
        else params.set(key, value);
        setPage(1);
        router.replace(`${pathname}${params.toString() ? `?${params}` : ''}`, { scroll: false });
    }, [searchParams, pathname, router]);

    // ── Data ──────────────────────────────────────────────
    const { data: payments, loading, meta, refetch } = useApiQuery(
        () => paymentsApi.list({
            ...(statusFilter !== null && { status: statusFilter }),
            ...(methodFilter !== null && { payment_method: methodFilter }),
            page,
            per_page: 15,
        }),
        [statusFilter, methodFilter, page]
    );

    // ── Mutations ─────────────────────────────────────────
    const { mutate: updatePayment, loading: updating } = useApiMutation(
        ({ uuid, body }: { uuid: string; body: UpdatePaymentBody }) => paymentsApi.update(uuid, body)
    );
    const { mutate: deletePayment, loading: deleting } = useApiMutation(
        (uuid: string) => paymentsApi.delete(uuid)
    );

    // ── Local UI state ────────────────────────────────────
    const [actionMenuId, setActionMenuId] = useState<string | null>(null);
    const [editTarget,   setEditTarget]   = useState<PaymentObject | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<PaymentObject | null>(null);
    const [formError,    setFormError]    = useState<string | null>(null);

    // ── Handlers ──────────────────────────────────────────
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTarget) return;
        setFormError(null);
        const fd = new FormData(e.currentTarget as HTMLFormElement);
        const body: UpdatePaymentBody = {
            payment_method: (fd.get('payment_method') as PaymentMethodType) || undefined,
            amount:         fd.get('amount') ? Number(fd.get('amount')) : undefined,
            status:         (fd.get('status') as ApiPaymentStatus) || undefined,
            transaction_id: (fd.get('transaction_id') as string) || undefined,
            notes:          (fd.get('notes') as string) || undefined,
        };
        const result = await updatePayment({ uuid: editTarget.uuid, body });
        if (result) { setEditTarget(null); refetch(); }
        else setFormError('Failed to update payment.');
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const result = await deletePayment(deleteTarget.uuid);
        if (result !== undefined) { setDeleteTarget(null); refetch(); }
    };

    // ── Columns ───────────────────────────────────────────
    const statusColors: Record<ApiPaymentStatus, string> = {
        pending:   '#f59e0b',
        completed: '#10b981',
        failed:    '#ef4444',
        refunded:  '#6366f1',
    };

    const columns: Column<PaymentObject>[] = [
        {
            key: 'uuid',
            label: 'UUID',
            render: r => <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.uuid.slice(0, 8)}…</span>,
        },
        {
            key: 'payment_method',
            label: 'Method',
            render: r => (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <CreditCard size={14} />
                    {r.payment_method === 'paymob' ? 'Paymob' : 'Cash'}
                </span>
            ),
        },
        {
            key: 'amount',
            label: 'Amount',
            render: r => <span style={{ fontWeight: 600 }}>EGP {Number(r.amount).toFixed(2)}</span>,
        },
        {
            key: 'status',
            label: 'Status',
            render: r => (
                <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: `color-mix(in srgb, ${statusColors[r.status]} 15%, transparent)`, color: statusColors[r.status] }}>
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                </span>
            ),
        },
        {
            key: 'transaction_id',
            label: 'Transaction ID',
            render: r => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{r.transaction_id ?? '—'}</span>,
        },
        {
            key: 'created_at',
            label: 'Date',
            render: r => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{new Date(r.created_at).toLocaleDateString()}</span>,
        },
        {
            key: 'actions',
            label: '',
            render: r => (
                <div style={{ position: 'relative' }}>
                    <button onClick={() => setActionMenuId(actionMenuId === r.uuid ? null : r.uuid)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-secondary)', borderRadius: 6 }}>
                        <MoreHorizontal size={16} />
                    </button>
                    {actionMenuId === r.uuid && (
                        <div style={{ position: 'absolute', right: 0, top: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 50, minWidth: 140, padding: 4 }}>
                            <PermissionGate module="settings" action="edit">
                                <button onClick={() => { setEditTarget(r); setActionMenuId(null); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: 6 }}>
                                    <Pencil size={14} /> Edit
                                </button>
                            </PermissionGate>
                            <PermissionGate module="settings" action="delete">
                                <button onClick={() => { setDeleteTarget(r); setActionMenuId(null); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-error)', borderRadius: 6 }}>
                                    <Trash2 size={14} /> Delete
                                </button>
                            </PermissionGate>
                        </div>
                    )}
                </div>
            ),
        },
    ];

    // ── Filter controls ───────────────────────────────────
    const filterControls = (
        <div style={{ display: 'flex', gap: 8 }}>
            <select value={statusFilter ?? 'all'} onChange={e => setFilter('status', e.target.value)} className={shared.filterSelect}>
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
            </select>
            <select value={methodFilter ?? 'all'} onChange={e => setFilter('payment_method', e.target.value)} className={shared.filterSelect}>
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="paymob">Paymob</option>
            </select>
        </div>
    );

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CreditCard size={24} />
                    <h1 className={shared.pageTitle}>Payments</h1>
                </div>
            </div>

            <DataTable<PaymentObject>
                columns={columns}
                data={payments ?? []}
                loading={loading}
                searchKeys={['uuid', 'transaction_id']}
                searchPlaceholder="Search by UUID or transaction ID…"
                getRowKey={r => r.uuid}
                filters={filterControls}
                serverPagination
                currentPage={page}
                totalPages={meta?.pagination?.last_page ?? 1}
                totalCount={meta?.pagination?.total}
                onPageChange={setPage}
            />

            {/* Edit Modal */}
            {editTarget && (
                <FormModal
                    open={!!editTarget}
                    onClose={() => { setEditTarget(null); setFormError(null); }}
                    title="Edit Payment"
                    submitLabel={updating ? t('common.saving') : 'Save Changes'}
                    onSubmit={handleUpdate}
                >
                    {formError && (
                        <div style={{ padding: '10px 12px', marginBottom: 12, borderRadius: 8, background: 'color-mix(in srgb, var(--color-error) 12%, transparent)', color: 'var(--color-error)', fontSize: '0.875rem' }}>{formError}</div>
                    )}
                    <FormField label="Payment Method" required>
                        <select name="payment_method" defaultValue={editTarget.payment_method} className={shared.filterSelect} style={{ width: '100%' }}>
                            <option value="cash">Cash</option>
                            <option value="paymob">Paymob</option>
                        </select>
                    </FormField>
                    <FormField label="Amount (EGP)" required>
                        <input name="amount" type="number" defaultValue={String(editTarget.amount)} required className={shared.filterSelect} style={{ width: '100%' }} />
                    </FormField>
                    <FormField label="Status" required>
                        <select name="status" defaultValue={editTarget.status} className={shared.filterSelect} style={{ width: '100%' }}>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </FormField>
                    <FormField label="Transaction ID">
                        <input name="transaction_id" defaultValue={editTarget.transaction_id ?? ''} className={shared.filterSelect} style={{ width: '100%' }} />
                    </FormField>
                    <FormField label="Notes">
                        <input name="notes" defaultValue={editTarget.notes ?? ''} className={shared.filterSelect} style={{ width: '100%' }} />
                    </FormField>
                </FormModal>
            )}

            {/* Delete Confirm Modal */}
            {deleteTarget && (
                <FormModal
                    open={!!deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    title="Delete Payment"
                    submitLabel={deleting ? 'Deleting…' : 'Delete'}
                    onSubmit={async e => { e.preventDefault(); await handleDelete(); }}
                    submitVariant="danger"
                >
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                        Are you sure you want to delete payment <strong style={{ fontFamily: 'monospace' }}>{deleteTarget.uuid.slice(0, 8)}…</strong>? This action cannot be undone.
                    </p>
                </FormModal>
            )}
        </div>
    );
}

