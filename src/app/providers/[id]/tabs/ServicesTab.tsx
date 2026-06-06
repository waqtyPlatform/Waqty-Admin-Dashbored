'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { formatMoney, toMinor } from '@/lib/market';
import { Scissors, Clock } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { adminServicesApi, adminServicePricesApi } from '@/lib/api';
import styles from '../page.module.css';

// Fallback rows — shown only when the live API is unreachable (offline/dev).
const mockServices = [
    { id: '1', name: 'Haircut', category: 'Hair', price: 150, duration: 30, active: true, bookings: 520 as number | null },
    { id: '2', name: 'Hair Color', category: 'Hair', price: 350, duration: 60, active: true, bookings: 280 as number | null },
    { id: '3', name: 'Beard Trim', category: 'Beard', price: 80, duration: 15, active: true, bookings: 410 as number | null },
    { id: '4', name: 'Keratin Treatment', category: 'Hair', price: 500, duration: 90, active: true, bookings: 120 as number | null },
    { id: '5', name: 'Scalp Treatment', category: 'Hair', price: 200, duration: 30, active: false, bookings: 65 as number | null },
];

interface ServiceRow {
    id: string;
    name: string;
    category: string;
    price: number;
    duration: number;
    active: boolean;
    bookings: number | null;
}

function localizedName(n: { ar?: string; en?: string } | string | undefined | null): string {
    if (!n) return '—';
    if (typeof n === 'string') return n;
    return n.en || n.ar || '—';
}

export function ServicesTab({ providerUuid }: { providerUuid?: string }) {
    const { t } = useTranslation();

    const { data: apiServices } = useApiQuery(
        () => adminServicesApi.list({ provider_uuid: providerUuid, per_page: 100 }),
        [providerUuid],
        { enabled: !!providerUuid }
    );
    // Prices live on a separate resource (scoped per branch/employee). Join the lowest
    // active price per service to show a representative "from" price in the table.
    const { data: apiPrices } = useApiQuery(
        () => adminServicePricesApi.list({ provider_uuid: providerUuid, per_page: 100 }),
        [providerUuid],
        { enabled: !!providerUuid }
    );

    const priceMap = React.useMemo(() => {
        const m: Record<string, number> = {};
        (apiPrices ?? []).forEach(p => {
            if (p.active === false || !p.service_uuid) return;
            const val = Number(p.price);
            if (!Number.isFinite(val)) return;
            if (m[p.service_uuid] === undefined || val < m[p.service_uuid]) m[p.service_uuid] = val;
        });
        return m;
    }, [apiPrices]);

    const rows: ServiceRow[] = (apiServices && apiServices.length)
        ? apiServices.map(s => {
            const prov = s.providers?.find(p => p.uuid === providerUuid) ?? s.providers?.[0];
            return {
                id: s.uuid,
                name: localizedName(s.name),
                category: s.category ?? s.sub_category_name ?? '—',
                price: priceMap[s.uuid] ?? 0,
                duration: prov?.estimated_duration_minutes ?? 0,
                active: prov?.active ?? true,
                bookings: null,
            };
        })
        : mockServices;

    // Bound the rendered rows (the join can return up to 100) with simple client paging.
    const PAGE_SIZE = 15;
    const [page, setPage] = React.useState(1);
    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    return (
        <div className={styles.infoCard}>
            <h3>{t('providers.tabServices')} ({rows.length})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginTop: 'var(--space-4)' }}>
                <thead><tr style={{ background: 'var(--bg-secondary)' }}>
                    {[t('common.service'), t('providers.category'), t('common.price'), t('common.duration'), t('providers.bookings'), t('common.status')].map(h => <th key={h} style={{ textAlign: 'start', padding: 'var(--space-3) var(--space-3)', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>{h}</th>)}
                </tr></thead>
                <tbody>{pageRows.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: 'var(--space-3) var(--space-3)', fontWeight: 500 }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}><Scissors size={14} /> {s.name}</span></td>
                        <td style={{ padding: 'var(--space-3) var(--space-3)' }}>{s.category}</td>
                        <td style={{ padding: 'var(--space-3) var(--space-3)', fontWeight: 600 }}>{formatMoney(toMinor(s.price))}</td>
                        <td style={{ padding: 'var(--space-3) var(--space-3)' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--text-secondary)' }}><Clock size={14} /> {s.duration}m</span></td>
                        <td style={{ padding: 'var(--space-3) var(--space-3)' }}>{s.bookings ?? '—'}</td>
                        <td style={{ padding: 'var(--space-3) var(--space-3)' }}><StatusBadge status={s.active ? 'active' : 'deactivated'} /></td>
                    </tr>
                ))}</tbody>
            </table>
            {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={safePage === 1}
                        style={{ padding: 'var(--space-1) var(--space-3)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: safePage === 1 ? 'not-allowed' : 'pointer', opacity: safePage === 1 ? 0.5 : 1, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)' }}
                    >
                        {t('common.previous')}
                    </button>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{safePage} / {totalPages}</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={safePage === totalPages}
                        style={{ padding: 'var(--space-1) var(--space-3)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: safePage === totalPages ? 'not-allowed' : 'pointer', opacity: safePage === totalPages ? 0.5 : 1, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)' }}
                    >
                        {t('common.next')}
                    </button>
                </div>
            )}
        </div>
    );
}
