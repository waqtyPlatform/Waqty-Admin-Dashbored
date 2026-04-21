'use client';

import React from 'react';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { SystemHealthMetric } from '@/types/system';
import { Activity, Server, Database, Wifi, Smartphone } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

const mockHealth: SystemHealthMetric[] = [
    { service: 'API Server', status: 'healthy', uptime_percent: 99.97, avg_response_ms: 45, error_rate: 0.02, last_checked_at: '2026-04-13T12:00:00Z' },
    { service: 'Database', status: 'healthy', uptime_percent: 99.99, avg_response_ms: 12, error_rate: 0.01, last_checked_at: '2026-04-13T12:00:00Z' },
    { service: 'CDN / Static Assets', status: 'healthy', uptime_percent: 100, avg_response_ms: 8, error_rate: 0, last_checked_at: '2026-04-13T12:00:00Z' },
    { service: 'Push Notifications', status: 'degraded', uptime_percent: 98.5, avg_response_ms: 230, error_rate: 1.2, last_checked_at: '2026-04-13T12:00:00Z' },
    { service: 'Payment Gateway', status: 'healthy', uptime_percent: 99.95, avg_response_ms: 180, error_rate: 0.05, last_checked_at: '2026-04-13T12:00:00Z' },
    { service: 'SMS Provider', status: 'healthy', uptime_percent: 99.8, avg_response_ms: 320, error_rate: 0.15, last_checked_at: '2026-04-13T12:00:00Z' },
    { service: 'User App (iOS)', status: 'healthy', uptime_percent: 99.9, avg_response_ms: 0, error_rate: 0.3, last_checked_at: '2026-04-13T12:00:00Z' },
    { service: 'User App (Android)', status: 'healthy', uptime_percent: 99.9, avg_response_ms: 0, error_rate: 0.25, last_checked_at: '2026-04-13T12:00:00Z' },
];

const icons: Record<string, React.ReactNode> = { 'API Server': <Server size={20} />, 'Database': <Database size={20} />, 'CDN / Static Assets': <Wifi size={20} />, 'Push Notifications': <Activity size={20} />, 'Payment Gateway': <Activity size={20} />, 'SMS Provider': <Activity size={20} />, 'User App (iOS)': <Smartphone size={20} />, 'User App (Android)': <Smartphone size={20} /> };

export default function SystemHealthPage() {
    const { t } = useTranslation();
    const allHealthy = mockHealth.every(m => m.status === 'healthy');
    return (
        <div className={shared.page}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h1 className={shared.pageTitle}>{t('systemHealth.title')}</h1>
                <StatusBadge status={allHealthy ? 'healthy' : 'degraded'} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {mockHealth.map(m => (
                    <div key={m.service} style={{ background: 'var(--bg-primary)', border: `1px solid ${m.status === 'degraded' ? 'var(--color-warning)' : 'var(--border-color)'}`, borderRadius: 12, padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ color: m.status === 'healthy' ? 'var(--color-success)' : m.status === 'degraded' ? 'var(--color-warning)' : 'var(--color-error)' }}>{icons[m.service] || <Activity size={20} />}</span>
                                <span style={{ fontWeight: 600 }}>{m.service}</span>
                            </div>
                            <StatusBadge status={m.status} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                            <div><div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{t('systemHealth.uptime')}</div><div style={{ fontWeight: 700, color: m.uptime_percent >= 99.9 ? 'var(--color-success)' : 'var(--color-warning)' }}>{m.uptime_percent}%</div></div>
                            <div><div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{t('systemHealth.latency')}</div><div style={{ fontWeight: 700 }}>{m.avg_response_ms}ms</div></div>
                            <div><div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{t('systemHealth.errors')}</div><div style={{ fontWeight: 700, color: m.error_rate > 1 ? 'var(--color-error)' : 'var(--text-primary)' }}>{m.error_rate}%</div></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
