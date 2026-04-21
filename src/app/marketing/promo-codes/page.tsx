'use client';

import React, { useState } from 'react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { copyToClipboard } from '@/lib/utils';
import type { PromoCode } from '@/types/marketing';
import { Plus, Copy } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

const initialCodes: PromoCode[] = [
    { id: '1', code: 'WELCOME20', type: 'percentage', value: 20, min_order: 100, max_discount: 200, usage_limit: 1000, used_count: 487, valid_from: '2026-01-01', valid_until: '2026-12-31', active: true, created_at: '2026-01-01T00:00:00Z' },
    { id: '2', code: 'SUMMER50', type: 'fixed', value: 50, min_order: 200, max_discount: null, usage_limit: 500, used_count: 312, valid_from: '2026-04-01', valid_until: '2026-06-30', active: true, created_at: '2026-03-28T00:00:00Z' },
    { id: '3', code: 'VIP10', type: 'percentage', value: 10, min_order: 0, max_discount: 500, usage_limit: null, used_count: 1250, valid_from: '2025-01-01', valid_until: '2026-12-31', active: true, created_at: '2025-01-01T00:00:00Z' },
    { id: '4', code: 'EID2026', type: 'percentage', value: 30, min_order: 150, max_discount: 300, usage_limit: 2000, used_count: 0, valid_from: '2026-06-01', valid_until: '2026-06-15', active: false, created_at: '2026-04-10T00:00:00Z' },
    { id: '5', code: 'FIRST100', type: 'fixed', value: 100, min_order: 300, max_discount: null, usage_limit: 100, used_count: 100, valid_from: '2026-02-01', valid_until: '2026-03-31', active: false, created_at: '2026-02-01T00:00:00Z' },
];


export default function PromoCodesPage() {
    const { t } = useTranslation();
    const [codes, setCodes] = useState(initialCodes);
    const [showCreate, setShowCreate] = useState(false);

    const columns: Column<PromoCode>[] = [
        { key: 'code', label: t('marketing.promoCodes.code'), sortable: true, render: r => <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><code style={{ fontWeight: 600, padding: '2px 8px', background: 'var(--bg-tertiary)', borderRadius: 4, fontSize: '0.8125rem' }}>{r.code}</code><button onClick={() => copyToClipboard(r.code)} style={{ border: 'none', background: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 2 }}><Copy size={12} /></button></div> },
        { key: 'type', label: t('marketing.promoCodes.type'), sortable: true, render: r => r.type === 'percentage' ? `${r.value}%` : `EGP ${r.value}` },
        { key: 'min_order', label: t('marketing.promoCodes.minOrder'), render: r => r.min_order > 0 ? `EGP ${r.min_order}` : '-' },
        { key: 'used_count', label: t('marketing.promoCodes.usage'), sortable: true, render: r => `${r.used_count}${r.usage_limit ? ` / ${r.usage_limit}` : ''}` },
        { key: 'valid_until', label: t('marketing.promoCodes.validUntil'), sortable: true, render: r => new Date(r.valid_until).toLocaleDateString() },
        { key: 'active', label: t('common.status'), render: r => <StatusBadge status={r.active ? 'active' : (r.used_count >= (r.usage_limit || Infinity) ? 'expired' : 'draft')} /> },
    ];

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <h1 className={shared.pageTitle}>{t('marketing.promoCodes.title')}</h1>
                <PermissionGate module="marketing" action="create">
                    <button onClick={() => setShowCreate(true)} className={shared.addBtn}><Plus size={16} /> {t('marketing.promoCodes.create')}</button>
                </PermissionGate>
            </div>
            <DataTable<PromoCode> columns={columns} data={codes} searchKeys={['code']} searchPlaceholder={t('marketing.promoCodes.searchPlaceholder')} getRowKey={r => r.id} />

            <FormModal open={showCreate} onClose={() => setShowCreate(false)} title={t('marketing.promoCodes.createPromoCode')} submitLabel={t('common.create')} onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const newCode: PromoCode = {
                    id: String(Date.now()),
                    code: String(fd.get('code') || '').toUpperCase(),
                    type: String(fd.get('type') || 'percentage') as PromoCode['type'],
                    value: Number(fd.get('value') || 0),
                    min_order: Number(fd.get('min_order') || 0),
                    max_discount: fd.get('max_discount') ? Number(fd.get('max_discount')) : null,
                    usage_limit: fd.get('usage_limit') ? Number(fd.get('usage_limit')) : null,
                    used_count: 0,
                    valid_from: String(fd.get('valid_from') || new Date().toISOString().slice(0, 10)),
                    valid_until: String(fd.get('valid_until') || ''),
                    active: true,
                    created_at: new Date().toISOString(),
                };
                setCodes(prev => [newCode, ...prev]);
                setShowCreate(false);
            }}>
                <FormField label={t('marketing.promoCodes.code')} required><input name="code" type="text" required className={shared.formInput} placeholder="e.g. SUMMER50" /></FormField>
                <div className={shared.formGrid2}>
                    <FormField label={t('marketing.promoCodes.type')}><select name="type" className={shared.formInput}><option value="percentage">{t('marketing.promoCodes.percentage')}</option><option value="fixed">{t('marketing.promoCodes.fixedAmount')}</option></select></FormField>
                    <FormField label={t('marketing.promoCodes.value')} required><input name="value" type="number" required className={shared.formInput} placeholder="e.g. 20" /></FormField>
                </div>
                <div className={shared.formGrid2}>
                    <FormField label={t('marketing.promoCodes.minOrderEgp')}><input name="min_order" type="number" className={shared.formInput} placeholder="0" /></FormField>
                    <FormField label={t('marketing.promoCodes.maxDiscount')}><input name="max_discount" type="number" className={shared.formInput} placeholder="Leave empty for none" /></FormField>
                </div>
                <div className={shared.formGrid2}>
                    <FormField label={t('marketing.promoCodes.usageLimit')}><input name="usage_limit" type="number" className={shared.formInput} placeholder="Leave empty for unlimited" /></FormField>
                    <FormField label={t('marketing.promoCodes.validUntil')} required><input name="valid_until" type="date" required className={shared.formInput} /></FormField>
                </div>
            </FormModal>
        </div>
    );
}
