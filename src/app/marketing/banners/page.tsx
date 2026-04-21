'use client';

import React, { useState } from 'react';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { Plus, Image as ImageIcon, Eye } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';


const initialBanners = [
    { id: '1', title: 'Summer Sale Banner', placement: 'Home Top', dimensions: '1200x400', status: 'active' as const, start: '2026-04-01', end: '2026-04-30', impressions: 85000, clicks: 6200 },
    { id: '2', title: 'New Provider Welcome', placement: 'Category Page', dimensions: '800x200', status: 'active' as const, start: '2026-04-05', end: '2026-05-05', impressions: 42000, clicks: 3100 },
    { id: '3', title: 'Eid Holiday Special', placement: 'Home Top', dimensions: '1200x400', status: 'draft' as const, start: '2026-06-01', end: '2026-06-15', impressions: 0, clicks: 0 },
    { id: '4', title: 'App Update Banner', placement: 'Home Bottom', dimensions: '1200x300', status: 'expired' as const, start: '2026-03-01', end: '2026-03-15', impressions: 62000, clicks: 4800 },
];

export default function BannersPage() {
    const [banners, setBanners] = useState(initialBanners);
    const [showCreate, setShowCreate] = useState(false);

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><ImageIcon size={24} /><h1 className={shared.pageTitle}>Banners</h1></div>
                <PermissionGate module="marketing" action="create">
                    <button onClick={() => setShowCreate(true)} className={shared.addBtn}><Plus size={16} /> Upload Banner</button>
                </PermissionGate>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {banners.map(b => (
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

            <FormModal open={showCreate} onClose={() => setShowCreate(false)} title="Upload Banner" submitLabel="Create Banner" onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                setBanners(prev => [{ id: String(Date.now()), title: String(fd.get('title') || ''), placement: String(fd.get('placement') || 'Home Top'), dimensions: String(fd.get('dimensions') || '1200x400'), status: 'draft' as const, start: String(fd.get('start') || ''), end: String(fd.get('end') || ''), impressions: 0, clicks: 0 }, ...prev]);
                setShowCreate(false);
            }}>
                <FormField label="Banner Title" required><input name="title" type="text" required className={shared.formInput} placeholder="e.g. Summer Sale Banner" /></FormField>
                <div className={shared.formGrid2}>
                    <FormField label="Placement"><select name="placement" className={shared.formInput}><option value="Home Top">Home Top</option><option value="Home Bottom">Home Bottom</option><option value="Category Page">Category Page</option><option value="Search Results">Search Results</option></select></FormField>
                    <FormField label="Dimensions"><select name="dimensions" className={shared.formInput}><option value="1200x400">1200x400</option><option value="1200x300">1200x300</option><option value="800x200">800x200</option><option value="600x600">600x600</option></select></FormField>
                </div>
                <div className={shared.formGrid2}>
                    <FormField label="Start Date" required><input name="start" type="date" required className={shared.formInput} /></FormField>
                    <FormField label="End Date" required><input name="end" type="date" required className={shared.formInput} /></FormField>
                </div>
            </FormModal>
        </div>
    );
}
