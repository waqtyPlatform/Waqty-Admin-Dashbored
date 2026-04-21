'use client';

import React from 'react';
import { monthlyRevenueData } from '@/mocks/finance';
import { exportToCSV } from '@/lib/utils';
import { Download } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';

export default function TaxReportsPage() {
    const taxRate = 0.14;
    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <h1 className={shared.pageTitle}>Tax Reports</h1>
                <button onClick={() => {
                    const data = monthlyRevenueData.map(row => ({ month: `${row.month} 2026`, subscriptions: row.subscriptions, commissions: row.commissions, total: row.total, vat: Math.round(row.total * taxRate), net: row.total - Math.round(row.total * taxRate) }));
                    exportToCSV(data, 'tax-reports', [{key:'month',label:'Month'},{key:'subscriptions',label:'Subscription Revenue'},{key:'commissions',label:'Commission Revenue'},{key:'total',label:'Total Revenue'},{key:'vat',label:'VAT'},{key:'net',label:'Net Revenue'}]);
                }} className={shared.exportBtn}><Download size={16} /> Export CSV</button>
            </div>
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-secondary)' }}>
                            {['Month', 'Subscription Revenue', 'Commission Revenue', 'Total Revenue', `VAT (${taxRate * 100}%)`, 'Net Revenue'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {monthlyRevenueData.map(row => {
                            const tax = Math.round(row.total * taxRate);
                            return (
                                <tr key={row.month} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{row.month} 2026</td>
                                    <td style={{ padding: '12px 16px' }}>EGP {row.subscriptions.toLocaleString()}</td>
                                    <td style={{ padding: '12px 16px' }}>EGP {row.commissions.toLocaleString()}</td>
                                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>EGP {row.total.toLocaleString()}</td>
                                    <td style={{ padding: '12px 16px', color: 'var(--color-error)' }}>EGP {tax.toLocaleString()}</td>
                                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-success)' }}>EGP {(row.total - tax).toLocaleString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
