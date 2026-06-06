'use client';

import React, { useState, useEffect } from 'react';
import { FormModal } from '@/components/admin/FormModal';
import { useTranslation } from '@/hooks/useTranslation';
import { formatMoney, toMinor, toMajor, activeMarket } from '@/lib/market';
import type { ProviderSubscriptionRow } from '@/types/subscription';
import { Plus, Trash2 } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';

const VAT_RATE = activeMarket.vat_rate;

interface LineItem { id: string; description: string; quantity: number; unit_price: number; }
const emptyLineItem = (): LineItem => ({ id: Math.random().toString(36).slice(2, 9), description: '', quantity: 1, unit_price: 0 });

interface InvoiceModalProps {
    sub: ProviderSubscriptionRow | null;
    /** Number of invoices generated this session (for the footer hint). */
    generatedCount: number;
    onClose: () => void;
    /** Called with MAJOR-unit subtotal/tax/total when the invoice is generated. */
    onGenerate: (subtotal: number, tax: number, total: number) => void;
}

export function InvoiceModal({ sub, generatedCount, onClose, onGenerate }: InvoiceModalProps) {
    const { t } = useTranslation();
    const [lineItems, setLineItems] = useState<LineItem[]>([emptyLineItem()]);

    // Seed the first line from the subscription whenever the modal opens.
    useEffect(() => {
        if (sub) {
            setLineItems([{ id: emptyLineItem().id, description: `${sub.plan_name} — ${sub.billing_cycle}`, quantity: 1, unit_price: toMajor(sub.amount) }]);
        }
    }, [sub]);

    const invoiceSubtotal = lineItems.reduce((sum, l) => sum + l.quantity * l.unit_price, 0);
    const invoiceTax = Math.round(invoiceSubtotal * VAT_RATE * 100) / 100;
    const invoiceTotal = invoiceSubtotal + invoiceTax;

    const updateLineItem = (id: string, patch: Partial<LineItem>) => {
        setLineItems(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));
    };

    return (
        <FormModal
            open={!!sub}
            onClose={onClose}
            title={`${t('subscriptions.generateInvoice')} — ${sub?.provider_name}`}
            submitLabel={t('subscriptions.generateInvoice')}
            onSubmit={e => {
                e.preventDefault();
                if (lineItems.length === 0 || invoiceSubtotal <= 0) return;
                onGenerate(invoiceSubtotal, invoiceTax, invoiceTotal);
            }}
            width="lg"
        >
            {sub && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px 36px', gap: 8, fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', padding: '4px 0' }}>
                        <div>{t('subscriptions.description')}</div>
                        <div>{t('subscriptions.qty')}</div>
                        <div>{t('subscriptions.unitPrice')}</div>
                        <div></div>
                    </div>
                    {lineItems.map(line => (
                        <div key={line.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px 36px', gap: 8 }}>
                            <input value={line.description} onChange={e => updateLineItem(line.id, { description: e.target.value })} placeholder={t('subscriptions.description')} className={shared.formInput} />
                            <input type="number" min={1} value={line.quantity} onChange={e => updateLineItem(line.id, { quantity: Math.max(1, Number(e.target.value) || 0) })} className={shared.formInput} />
                            <input type="number" min={0} step="0.01" value={line.unit_price} onChange={e => updateLineItem(line.id, { unit_price: Math.max(0, Number(e.target.value) || 0) })} className={shared.formInput} />
                            <button type="button" onClick={() => setLineItems(prev => prev.filter(l => l.id !== line.id))} disabled={lineItems.length === 1} style={{ padding: '0 8px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: 'var(--color-error)', cursor: lineItems.length === 1 ? 'not-allowed' : 'pointer', opacity: lineItems.length === 1 ? 0.4 : 1 }} aria-label={t('subscriptions.removeLine')}><Trash2 size={14} /></button>
                        </div>
                    ))}
                    <button type="button" onClick={() => setLineItems(prev => [...prev, emptyLineItem()])} style={{ alignSelf: 'flex-start', padding: '6px 10px', border: '1px dashed var(--border-color)', borderRadius: 6, background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Plus size={14} /> {t('subscriptions.addLineItem')}
                    </button>
                    <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 8, paddingTop: 8, display: 'grid', gap: 4, fontSize: '0.875rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('subscriptions.subtotal')}</span><strong>{formatMoney(toMinor(invoiceSubtotal))}</strong></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('subscriptions.vat')} ({Math.round(VAT_RATE * 100)}%)</span><strong>{formatMoney(toMinor(invoiceTax))}</strong></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}><span>{t('common.total')}</span><strong>{formatMoney(toMinor(invoiceTotal))}</strong></div>
                    </div>
                    {generatedCount > 0 && (
                        <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t('subscriptions.invoicesGeneratedSession').replace('{count}', String(generatedCount))}</div>
                    )}
                </div>
            )}
        </FormModal>
    );
}
