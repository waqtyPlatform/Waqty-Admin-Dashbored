'use client';

import React from 'react';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { Plus, Star, ArrowUp, ArrowDown } from 'lucide-react';

const mockFeatured = [
    { id: '1', provider: 'Glamour Studio', category: 'Salon', city: 'Cairo', position: 1, active: true, start: '2026-04-01', end: '2026-04-30', impressions: 12500, clicks: 980 },
    { id: '2', provider: 'Elite Barbers', category: 'Barber', city: 'Cairo', position: 2, active: true, start: '2026-04-01', end: '2026-04-30', impressions: 9800, clicks: 720 },
    { id: '3', provider: 'Beauty Clinic Cairo', category: 'Clinic', city: 'Cairo', position: 3, active: true, start: '2026-04-05', end: '2026-05-05', impressions: 7200, clicks: 540 },
    { id: '4', provider: 'Royal Spa & Wellness', category: 'Spa', city: 'Alexandria', position: 4, active: false, start: '2026-03-01', end: '2026-03-31', impressions: 5400, clicks: 380 },
];

export default function FeaturedPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Star size={24} /><h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Featured Providers</h1></div>
                <PermissionGate module="marketing" action="create">
                    <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--color-primary-500)', color: 'white', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}><Plus size={16} /> Add Featured</button>
                </PermissionGate>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {mockFeatured.map(f => (
                    <div key={f.id} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                            <button style={{ border: '1px solid var(--border-color)', borderRadius: 4, background: 'var(--bg-primary)', cursor: 'pointer', padding: 2, color: 'var(--text-tertiary)' }}><ArrowUp size={14} /></button>
                            <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-primary-500)' }}>#{f.position}</span>
                            <button style={{ border: '1px solid var(--border-color)', borderRadius: 4, background: 'var(--bg-primary)', cursor: 'pointer', padding: 2, color: 'var(--text-tertiary)' }}><ArrowDown size={14} /></button>
                        </div>
                        <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{f.provider.charAt(0)}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontWeight: 600 }}>{f.provider}</span>
                                <StatusBadge status={f.active ? 'active' : 'expired'} />
                                <span style={{ fontSize: '0.6875rem', padding: '2px 6px', background: 'var(--bg-tertiary)', borderRadius: 4, color: 'var(--text-secondary)' }}>{f.category}</span>
                            </div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: 4 }}>{f.city} &middot; {f.start} → {f.end}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
                            <div><div style={{ color: 'var(--text-tertiary)', fontSize: '0.6875rem' }}>Impressions</div><div style={{ fontWeight: 600 }}>{f.impressions.toLocaleString()}</div></div>
                            <div><div style={{ color: 'var(--text-tertiary)', fontSize: '0.6875rem' }}>Clicks</div><div style={{ fontWeight: 600 }}>{f.clicks.toLocaleString()}</div></div>
                            <div><div style={{ color: 'var(--text-tertiary)', fontSize: '0.6875rem' }}>CTR</div><div style={{ fontWeight: 600 }}>{(f.clicks / f.impressions * 100).toFixed(1)}%</div></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
