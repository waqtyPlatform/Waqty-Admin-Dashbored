'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { FormModal, FormField } from '@/components/admin/FormModal';
import type { Campaign } from '@/types/marketing';
import { Plus, Eye, MousePointerClick, Target, DollarSign } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';

const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-primary)', background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', outline: 'none' };

const initialCampaigns: Campaign[] = [
    { id: '1', name: 'Summer Promotion 2026', description: 'Platform-wide summer discount campaign', type: 'push', status: 'active', start_date: '2026-04-01', end_date: '2026-06-30', budget: 50000, spent: 18500, impressions: 125000, clicks: 9800, conversions: 1250, created_at: '2026-03-25T10:00:00Z' },
    { id: '2', name: 'New Providers Welcome', description: 'Featured listing for new providers', type: 'featured_listing', status: 'active', start_date: '2026-01-01', end_date: '2026-12-31', budget: 0, spent: 0, impressions: 45000, clicks: 5200, conversions: 420, created_at: '2026-01-01T00:00:00Z' },
    { id: '3', name: 'Eid Al-Adha Specials', description: 'Holiday special offers push + banners', type: 'banner', status: 'draft', start_date: '2026-06-01', end_date: '2026-06-15', budget: 30000, spent: 0, impressions: 0, clicks: 0, conversions: 0, created_at: '2026-04-10T10:00:00Z' },
    { id: '4', name: 'Q1 Email Newsletter', description: 'Quarterly email to all users', type: 'email', status: 'completed', start_date: '2026-01-15', end_date: '2026-01-15', budget: 5000, spent: 4200, impressions: 48000, clicks: 6100, conversions: 890, created_at: '2026-01-10T10:00:00Z' },
];


export default function CampaignsPage() {
    const { t } = useTranslation();
    const [campaigns, setCampaigns] = useState(initialCampaigns);
    const [showCreate, setShowCreate] = useState(false);

    const typeLabel: Record<Campaign['type'], string> = {
        push: t('marketing.campaigns.typePush'),
        email: t('marketing.campaigns.typeEmail'),
        banner: t('marketing.campaigns.typeBanner'),
        featured_listing: t('marketing.campaigns.typeFeaturedListing'),
    };

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <h1 className={shared.pageTitle}>{t('marketing.campaigns.title')}</h1>
                <PermissionGate module="marketing" action="create">
                    <button onClick={() => setShowCreate(true)} className={shared.addBtn}>
                        <Plus size={16} /> {t('marketing.campaigns.createCampaign')}
                    </button>
                </PermissionGate>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {campaigns.map(c => (
                    <div key={c.id} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontWeight: 600, fontSize: '1rem' }}>{c.name}</span>
                                <StatusBadge status={c.status} />
                                <span style={{ fontSize: '0.6875rem', padding: '2px 6px', background: 'var(--bg-tertiary)', borderRadius: 4, color: 'var(--text-secondary)' }}>{typeLabel[c.type]}</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{c.start_date} → {c.end_date}</span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 16px' }}>{c.description}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Eye size={16} color="var(--text-tertiary)" /><div><div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{t('marketing.campaigns.impressions')}</div><div style={{ fontWeight: 600 }}>{c.impressions.toLocaleString()}</div></div></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MousePointerClick size={16} color="var(--text-tertiary)" /><div><div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{t('marketing.campaigns.clicks')}</div><div style={{ fontWeight: 600 }}>{c.clicks.toLocaleString()}</div></div></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Target size={16} color="var(--text-tertiary)" /><div><div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{t('marketing.campaigns.conversions')}</div><div style={{ fontWeight: 600 }}>{c.conversions.toLocaleString()}</div></div></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><DollarSign size={16} color="var(--text-tertiary)" /><div><div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{t('marketing.campaigns.budgetLabel')}</div><div style={{ fontWeight: 600 }}>{c.budget > 0 ? `EGP ${c.spent.toLocaleString()} / ${c.budget.toLocaleString()}` : t('marketing.campaigns.na')}</div></div></div>
                        </div>
                    </div>
                ))}
            </div>

            <FormModal open={showCreate} onClose={() => setShowCreate(false)} title={t('marketing.campaigns.createCampaign')} submitLabel={t('common.create')} onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                setCampaigns(prev => [{
                    id: String(Date.now()), name: String(fd.get('name') || ''), description: String(fd.get('description') || ''),
                    type: String(fd.get('type') || 'push') as Campaign['type'], status: 'draft' as const,
                    start_date: String(fd.get('start_date') || ''), end_date: String(fd.get('end_date') || ''),
                    budget: Number(fd.get('budget') || 0), spent: 0, impressions: 0, clicks: 0, conversions: 0,
                    created_at: new Date().toISOString(),
                }, ...prev]);
                setShowCreate(false);
            }}>
                <FormField label={t('marketing.campaigns.campaignName')} required><input name="name" type="text" required className={shared.formInput} placeholder={t('marketing.campaigns.namePlaceholder')} /></FormField>
                <FormField label={t('marketing.campaigns.description')}><textarea name="description" style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} placeholder={t('marketing.campaigns.descriptionPlaceholder')} /></FormField>
                <div className={shared.formGrid2}>
                    <FormField label={t('marketing.campaigns.type')}><select name="type" className={shared.formInput}><option value="push">{t('marketing.campaigns.typePush')}</option><option value="email">{t('marketing.campaigns.typeEmail')}</option><option value="banner">{t('marketing.campaigns.typeBanner')}</option><option value="featured_listing">{t('marketing.campaigns.typeFeaturedListing')}</option></select></FormField>
                    <FormField label={t('marketing.campaigns.budget')}><input name="budget" type="number" className={shared.formInput} placeholder={t('marketing.campaigns.budgetPlaceholder')} /></FormField>
                </div>
                <div className={shared.formGrid2}>
                    <FormField label={t('marketing.campaigns.startDate')} required><input name="start_date" type="date" required className={shared.formInput} /></FormField>
                    <FormField label={t('marketing.campaigns.endDate')} required><input name="end_date" type="date" required className={shared.formInput} /></FormField>
                </div>
            </FormModal>
        </div>
    );
}
