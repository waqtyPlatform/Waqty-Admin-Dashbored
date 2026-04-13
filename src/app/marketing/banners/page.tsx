'use client';

import React from 'react';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { Plus, Image as ImageIcon, Eye } from 'lucide-react';

const mockBanners = [
    { id: '1', title: 'Summer Sale Banner', placement: 'Home Top', dimensions: '1200x400', status: 'active' as const, start: '2026-04-01', end: '2026-04-30', impressions: 85000, clicks: 6200 },
    { id: '2', title: 'New Provider Welcome', placement: 'Category Page', dimensions: '800x200', status: 'active' as const, start: '2026-04-05', end: '2026-05-05', impressions: 42000, clicks: 3100 },
    { id: '3', title: 'Eid Holiday Special', placement: 'Home Top', dimensions: '1200x400', status: 'draft' as const, start: '2026-06-01', end: '2026-06-15', impressions: 0, clicks: 0 },
    { id: '4', title: 'App Update Banner', placement: 'Home Bottom', dimensions: '1200x300', status: 'expired' as const, start: '2026-03-01', end: '2026-03-15', impressions: 62000, clicks: 4800 },
];

export default function BannersPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><ImageIcon size={24} /><h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Banners</h1></div>
                <PermissionGate module="marketing" action="create">
                    <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--color-primary-500)', color: 'white', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}><Plus size={16} /> Upload Banner</button>
                </PermissionGate>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {mockBanners.map(b => (
                    <div key={b.id} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden' }}>
                        <div style={{ height: 120, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                            <ImageIcon size={32} strokeWidth={1} />
                        </div>
                        <div style={{ padding: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontWeight: 600 }}>{b.title}</span>
                                <StatusBadge status={b.status} />
                            </div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginBottom: 12 }}>
                                {b.placement} &middot; {b.dimensions} &middot; {b.start} → {b.end}
                            </div>
                            <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                <span><Eye size={12} /> {b.impressions.toLocaleString()} views</span>
                                <span>{b.clicks.toLocaleString()} clicks</span>
                                <span>{b.impressions > 0 ? (b.clicks / b.impressions * 100).toFixed(1) : 0}% CTR</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
