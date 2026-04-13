'use client';

import React from 'react';
import { monthlyRevenueData } from '@/mocks/finance';
import { Download } from 'lucide-react';

export default function TaxReportsPage() {
    const taxRate = 0.14;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Tax Reports</h1>
                <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}><Download size={16} /> Export CSV</button>
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
