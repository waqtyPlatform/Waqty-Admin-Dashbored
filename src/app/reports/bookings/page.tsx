'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { bookingTrendsData } from '@/mocks/finance';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

// recharts is heavy — load the chart client-side only so it stays out of the initial bundle.
const BookingTrendsChart = dynamic(() => import('./_components/BookingTrendsChart'), {
    ssr: false,
    loading: () => <div style={{ height: 350, width: '100%' }} />,
});

export default function BookingsReportPage() {
    const { t } = useTranslation();
    const latest = bookingTrendsData[bookingTrendsData.length - 1];
    const completionRate = ((latest.completed / latest.bookings) * 100).toFixed(1);
    return (
        <div className={shared.page}>
            <h1 className={shared.pageTitle}>{t('reports.bookings.title')}</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {[
                    { label: t('reports.bookings.totalApr'), value: latest.bookings.toLocaleString(), color: 'var(--text-primary)' },
                    { label: t('reports.bookings.completed'), value: latest.completed.toLocaleString(), color: 'var(--color-success)' },
                    { label: t('reports.bookings.cancelled'), value: latest.cancelled.toLocaleString(), color: 'var(--color-error)' },
                    { label: t('reports.bookings.completionRate'), value: `${completionRate}%`, color: 'var(--color-info)' },
                ].map(k => (
                    <div key={k.label} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase' }}>{k.label}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: k.color, marginTop: 4 }}>{k.value}</div>
                    </div>
                ))}
            </div>
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>{t('reports.bookings.trends')}</h3>
                <BookingTrendsChart />
            </div>
        </div>
    );
}
