'use client';

import React, { useState } from 'react';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { Plus, Star, ArrowUp, ArrowDown } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';


const initialFeatured = [
    { id: '1', provider: 'Glamour Studio', category: 'Salon', city: 'Cairo', position: 1, active: true, start: '2026-04-01', end: '2026-04-30', impressions: 12500, clicks: 980 },
    { id: '2', provider: 'Elite Barbers', category: 'Barber', city: 'Cairo', position: 2, active: true, start: '2026-04-01', end: '2026-04-30', impressions: 9800, clicks: 720 },
    { id: '3', provider: 'Beauty Clinic Cairo', category: 'Clinic', city: 'Cairo', position: 3, active: true, start: '2026-04-05', end: '2026-05-05', impressions: 7200, clicks: 540 },
    { id: '4', provider: 'Royal Spa & Wellness', category: 'Spa', city: 'Alexandria', position: 4, active: false, start: '2026-03-01', end: '2026-03-31', impressions: 5400, clicks: 380 },
];

export default function FeaturedPage() {
    const [featured, setFeatured] = useState(initialFeatured);
    const [showCreate, setShowCreate] = useState(false);

    const swapPositions = (idx: number, dir: -1 | 1) => {
        setFeatured(prev => {
            const arr = [...prev];
            const targetIdx = idx + dir;
            if (targetIdx < 0 || targetIdx >= arr.length) return prev;
            const tempPos = arr[idx].position;
            arr[idx] = { ...arr[idx], position: arr[targetIdx].position };
            arr[targetIdx] = { ...arr[targetIdx], position: tempPos };
            [arr[idx], arr[targetIdx]] = [arr[targetIdx], arr[idx]];
            return arr;
        });
    };

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Star size={24} /><h1 className={shared.pageTitle}>Featured Providers</h1></div>
                <PermissionGate module="marketing" action="create">
                    <button onClick={() => setShowCreate(true)} className={shared.addBtn}><Plus size={16} /> Add Featured</button>
                </PermissionGate>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {featured.map((f, idx) => (
                    <div key={f.id} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                            <button onClick={() => swapPositions(idx, -1)} disabled={idx === 0} style={{ border: '1px solid var(--border-color)', borderRadius: 4, background: 'var(--bg-primary)', cursor: idx === 0 ? 'default' : 'pointer', padding: 2, color: 'var(--text-tertiary)', opacity: idx === 0 ? 0.3 : 1 }}><ArrowUp size={14} /></button>
                            <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-primary-500)' }}>#{f.position}</span>
                            <button onClick={() => swapPositions(idx, 1)} disabled={idx === featured.length - 1} style={{ border: '1px solid var(--border-color)', borderRadius: 4, background: 'var(--bg-primary)', cursor: idx === featured.length - 1 ? 'default' : 'pointer', padding: 2, color: 'var(--text-tertiary)', opacity: idx === featured.length - 1 ? 0.3 : 1 }}><ArrowDown size={14} /></button>
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

            <FormModal open={showCreate} onClose={() => setShowCreate(false)} title="Add Featured Provider" submitLabel="Add" onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const newPos = featured.length + 1;
                setFeatured(prev => [...prev, { id: String(Date.now()), provider: String(fd.get('provider') || ''), category: String(fd.get('category') || 'Salon'), city: String(fd.get('city') || ''), position: newPos, active: true, start: String(fd.get('start') || ''), end: String(fd.get('end') || ''), impressions: 0, clicks: 0 }]);
                setShowCreate(false);
            }}>
                <FormField label="Provider Name" required><input name="provider" type="text" required className={shared.formInput} placeholder="e.g. Glamour Studio" /></FormField>
                <div className={shared.formGrid2}>
                    <FormField label="Category"><select name="category" className={shared.formInput}><option value="Salon">Salon</option><option value="Barber">Barber</option><option value="Clinic">Clinic</option><option value="Spa">Spa</option></select></FormField>
                    <FormField label="City" required><input name="city" type="text" required className={shared.formInput} placeholder="Cairo" /></FormField>
                </div>
                <div className={shared.formGrid2}>
                    <FormField label="Start Date" required><input name="start" type="date" required className={shared.formInput} /></FormField>
                    <FormField label="End Date" required><input name="end" type="date" required className={shared.formInput} /></FormField>
                </div>
            </FormModal>
        </div>
    );
}
