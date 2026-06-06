'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { BookingObject } from '@/lib/api';
import styles from '../page.module.css';

// Fallback rows — shown (and exported) only when the live API is unreachable, so the
// tab and the page's CSV export still render offline. The page wires the real
// `GET /admin/bookings?provider_uuid=` and maps it through `bookingToRow` below.
export const mockBookings = [
    { id: 'BK-1001', customer: 'Fatima Al-Rashid', service: 'Hair Color', date: '2026-04-13', time: '10:00 AM', status: 'confirmed' },
    { id: 'BK-1002', customer: 'Mohamed Ahmed', service: 'Haircut', date: '2026-04-13', time: '11:00 AM', status: 'completed' },
    { id: 'BK-1003', customer: 'Layla Mahmoud', service: 'Keratin Treatment', date: '2026-04-13', time: '2:00 PM', status: 'in_progress' },
    { id: 'BK-1004', customer: 'Khaled Samir', service: 'Beard Trim', date: '2026-04-12', time: '3:00 PM', status: 'completed' },
    { id: 'BK-1005', customer: 'Reem Adel', service: 'Haircut', date: '2026-04-12', time: '4:00 PM', status: 'cancelled' },
    { id: 'BK-1006', customer: 'Youssef Nabil', service: 'Hair Color', date: '2026-04-11', time: '10:00 AM', status: 'no_show' },
];

export interface BookingRow {
    id: string;
    customer: string;
    service: string;
    date: string;
    time: string;
    status: string;
}

function localizedName(n: { ar?: string; en?: string } | string | undefined | null): string {
    if (!n) return '—';
    if (typeof n === 'string') return n;
    return n.en || n.ar || '—';
}

/** Map a live admin BookingObject to the row shape the table renders. */
export function bookingToRow(b: BookingObject): BookingRow {
    return {
        id: b.uuid,
        customer: b.user?.name ?? b.user_name ?? '—',
        service: localizedName(b.service_snapshot?.name ?? b.service?.name),
        date: b.booking_date,
        time: b.start_time ? b.start_time.slice(0, 5) : '',
        status: b.status,
    };
}

export function BookingsTab({ rows = mockBookings }: { rows?: BookingRow[] }) {
    const { t } = useTranslation();

    return (
        <div className={styles.infoCard}>
            <h3>{t('providers.tabBookings')}</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginTop: 'var(--space-4)' }}>
                <thead><tr style={{ background: 'var(--bg-secondary)' }}>
                    {[t('common.bookingId'), t('common.customer'), t('common.service'), t('common.date'), t('common.time'), t('common.status')].map(h => <th key={h} style={{ textAlign: 'start', padding: 'var(--space-3) var(--space-3)', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>{h}</th>)}
                </tr></thead>
                <tbody>{rows.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: 'var(--space-3) var(--space-3)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 500 }}>{b.id}</td>
                        <td style={{ padding: 'var(--space-3) var(--space-3)', fontWeight: 500 }}>{b.customer}</td>
                        <td style={{ padding: 'var(--space-3) var(--space-3)' }}>{b.service}</td>
                        <td style={{ padding: 'var(--space-3) var(--space-3)' }}>{b.date ? new Date(b.date).toLocaleDateString() : '—'}</td>
                        <td style={{ padding: 'var(--space-3) var(--space-3)' }}>{b.time}</td>
                        <td style={{ padding: 'var(--space-3) var(--space-3)' }}><StatusBadge status={b.status} /></td>
                    </tr>
                ))}</tbody>
            </table>
        </div>
    );
}
