'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { geographicData } from '@/mocks/finance';
import { formatCompactMoney } from '@/lib/market';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

// recharts is heavy — load the chart client-side only so it stays out of the initial bundle.
const GeographicChart = dynamic(() => import('./_components/GeographicChart'), {
    ssr: false,
    loading: () => <div style={{ height: 300, width: '100%' }} />,
});

type GeoRow = typeof geographicData[0];

export default function GeographicReportPage() {
    const { t } = useTranslation();
    const columns: Column<GeoRow>[] = [
        { key: 'city', label: t('common.city'), sortable: true, render: r => <span style={{ fontWeight: 500 }}>{r.city}</span> },
        { key: 'providers', label: t('reports.geographic.providers'), sortable: true },
        { key: 'users', label: t('reports.geographic.users'), sortable: true, render: r => r.users.toLocaleString() },
        { key: 'bookings', label: t('reports.geographic.bookings'), sortable: true, render: r => r.bookings.toLocaleString() },
        { key: 'revenue', label: t('reports.geographic.revenue'), sortable: true, render: r => formatCompactMoney(r.revenue) },
    ];

    return (
        <div className={shared.page}>
            <h1 className={shared.pageTitle}>{t('reports.geographic.title')}</h1>
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>{t('reports.geographic.providersByCity')}</h3>
                <GeographicChart />
            </div>
            <DataTable<GeoRow> columns={columns} data={geographicData} searchKeys={['city']} searchPlaceholder={t('reports.geographic.searchPlaceholder')} getRowKey={r => r.city} />
        </div>
    );
}
