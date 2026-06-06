'use client';

import React from 'react';
import { monthlyRevenueData } from '@/mocks/finance';
import { formatMoney, toMajor } from '@/lib/market';
import { exportToCSV } from '@/lib/utils';
import { Download } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

export default function TaxReportsPage() {
    const { t } = useTranslation();
    const taxRate = 0.14;
    const headers = [
        t('finance.taxReports.month'),
        t('finance.taxReports.subscriptionRevenue'),
        t('finance.taxReports.commissionRevenue'),
        t('finance.taxReports.totalRevenue'),
        `${t('finance.taxReports.vat')} (${taxRate * 100}%)`,
        t('finance.taxReports.netRevenue'),
    ];
    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <h1 className={shared.pageTitle}>{t('finance.taxReports.title')}</h1>
                <button onClick={() => {
                    // CSV exports MAJOR-unit numbers (toMajor) for readability,
                    // though the series is stored in canonical minor units.
                    const data = monthlyRevenueData.map(row => { const vat = Math.round(row.total * taxRate); return { month: `${row.month} 2026`, subscriptions: toMajor(row.subscriptions), commissions: toMajor(row.commissions), total: toMajor(row.total), vat: toMajor(vat), net: toMajor(row.total - vat) }; });
                    exportToCSV(data, 'tax-reports', [{key:'month',label:'Month'},{key:'subscriptions',label:'Subscription Revenue'},{key:'commissions',label:'Commission Revenue'},{key:'total',label:'Total Revenue'},{key:'vat',label:'VAT'},{key:'net',label:'Net Revenue'}]);
                }} className={shared.exportBtn}><Download size={16} /> {t('finance.taxReports.exportCSV')}</button>
            </div>
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-secondary)' }}>
                            {headers.map(h => (
                                <th key={h} style={{ textAlign: 'start', padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {monthlyRevenueData.map(row => {
                            const tax = Math.round(row.total * taxRate);
                            return (
                                <tr key={row.month} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{row.month} 2026</td>
                                    <td style={{ padding: '12px 16px' }}>{formatMoney(row.subscriptions)}</td>
                                    <td style={{ padding: '12px 16px' }}>{formatMoney(row.commissions)}</td>
                                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{formatMoney(row.total)}</td>
                                    <td style={{ padding: '12px 16px', color: 'var(--color-error)' }}>{formatMoney(tax)}</td>
                                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-success)' }}>{formatMoney(row.total - tax)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
