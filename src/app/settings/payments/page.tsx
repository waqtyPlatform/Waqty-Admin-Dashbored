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
import { formatMoney, toMinor } from '@/lib/market';
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
        else setFormError(t('settings.payments.failedUpdate'));
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
            label: t('settings.payments.method'),
            render: r => (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <CreditCard size={14} />
                    {r.payment_method === 'paymob' ? 'Paymob' : t('settings.payments.cash')}
                </span>
            ),
        },
        {
            key: 'amount',
            label: t('common.amount'),
            render: r => <span style={{ fontWeight: 600 }}>{formatMoney(toMinor(Number(r.amount)))}</span>,
        },
        {
            key: 'status',
            label: t('common.status'),
            render: r => (
                <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: `color-mix(in srgb, ${statusColors[r.status]} 15%, transparent)`, color: statusColors[r.status] }}>
                    {t(`settings.payments.${r.status}`)}
                </span>
            ),
        },
        {
            key: 'transaction_id',
            label: t('settings.payments.transactionId'),
            render: r => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{r.transaction_id ?? '—'}</span>,
        },
        {
            key: 'created_at',
            label: t('common.date'),
            render: r => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{new Date(r.created_at).toLocaleDateString()}</span>,
        },
        {
            key: 'actions',
            label: '',
            render: r => (
                <div style={{ position: 'relative' }}>
                    <button onClick={() => setActionMenuId(actionMenuId === r.uuid ? null : r.uuid)}
                        aria-label={t('common.actions')}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', borderRadius: 6 }}>
                        <MoreHorizontal size={16} />
                    </button>
                    {actionMenuId === r.uuid && (
                        <div style={{ position: 'absolute', insetInlineEnd: 0, top: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 50, minWidth: 140, padding: 'var(--space-1)' }}>
                            <PermissionGate module="settings" action="edit">
                                <button onClick={() => { setEditTarget(r); setActionMenuId(null); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: 6 }}>
                                    <Pencil size={14} /> {t('common.edit')}
                                </button>
                            </PermissionGate>
                            <PermissionGate module="settings" action="delete">
                                <button onClick={() => { setDeleteTarget(r); setActionMenuId(null); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-error)', borderRadius: 6 }}>
                                    <Trash2 size={14} /> {t('common.delete')}
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
                <option value="all">{t('settings.payments.allStatuses')}</option>
                <option value="pending">{t('settings.payments.pending')}</option>
                <option value="completed">{t('settings.payments.completed')}</option>
                <option value="failed">{t('settings.payments.failed')}</option>
                <option value="refunded">{t('settings.payments.refunded')}</option>
            </select>
            <select value={methodFilter ?? 'all'} onChange={e => setFilter('payment_method', e.target.value)} className={shared.filterSelect}>
                <option value="all">{t('settings.payments.allMethods')}</option>
                <option value="cash">{t('settings.payments.cash')}</option>
                <option value="paymob">Paymob</option>
            </select>
        </div>
    );

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CreditCard size={24} />
                    <h1 className={shared.pageTitle}>{t('settings.payments.pageTitle')}</h1>
                </div>
            </div>

            <DataTable<PaymentObject>
                columns={columns}
                data={payments ?? []}
                loading={loading}
                searchKeys={['uuid', 'transaction_id']}
                searchPlaceholder={t('settings.payments.searchPlaceholder')}
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
                    title={t('settings.payments.editPayment')}
                    submitLabel={updating ? t('common.saving') : t('common.saveChanges')}
                    onSubmit={handleUpdate}
                >
                    {formError && (
                        <div style={{ padding: '10px 12px', marginBottom: 12, borderRadius: 8, background: 'color-mix(in srgb, var(--color-error) 12%, transparent)', color: 'var(--color-error)', fontSize: '0.875rem' }}>{formError}</div>
                    )}
                    <FormField label={t('settings.payments.paymentMethod')} required>
                        <select name="payment_method" defaultValue={editTarget.payment_method} className={shared.filterSelect} style={{ width: '100%' }}>
                            <option value="cash">{t('settings.payments.cash')}</option>
                            <option value="paymob">Paymob</option>
                        </select>
                    </FormField>
                    <FormField label={t('settings.payments.amountEgp')} required>
                        <input name="amount" type="number" defaultValue={String(editTarget.amount)} required className={shared.filterSelect} style={{ width: '100%' }} />
                    </FormField>
                    <FormField label={t('common.status')} required>
                        <select name="status" defaultValue={editTarget.status} className={shared.filterSelect} style={{ width: '100%' }}>
                            <option value="pending">{t('settings.payments.pending')}</option>
                            <option value="completed">{t('settings.payments.completed')}</option>
                            <option value="failed">{t('settings.payments.failed')}</option>
                            <option value="refunded">{t('settings.payments.refunded')}</option>
                        </select>
                    </FormField>
                    <FormField label={t('settings.payments.transactionId')}>
                        <input name="transaction_id" defaultValue={editTarget.transaction_id ?? ''} className={shared.filterSelect} style={{ width: '100%' }} />
                    </FormField>
                    <FormField label={t('settings.payments.notes')}>
                        <input name="notes" defaultValue={editTarget.notes ?? ''} className={shared.filterSelect} style={{ width: '100%' }} />
                    </FormField>
                </FormModal>
            )}

            {/* Delete Confirm Modal */}
            {deleteTarget && (
                <FormModal
                    open={!!deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    title={t('settings.payments.deletePayment')}
                    submitLabel={deleting ? t('common.loading') : t('common.delete')}
                    onSubmit={async e => { e.preventDefault(); await handleDelete(); }}
                    submitVariant="danger"
                >
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                        {t('settings.payments.confirmDeletePrefix')} <strong style={{ fontFamily: 'monospace' }}>{deleteTarget.uuid.slice(0, 8)}…</strong>{t('settings.payments.confirmDeleteSuffix')}
                    </p>
                </FormModal>
            )}
        </div>
    );
}

