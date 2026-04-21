'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { FormModal, FormField, ConfirmModal } from '@/components/admin/FormModal';
import { Plus, Eye, Pause, Play, Trash2, BarChart3, Edit } from 'lucide-react';
import type { Ad } from '@/types/marketing';
import shared from '@/components/admin/shared.module.css';

const mockAds: Ad[] = [
    { id: 'ad-1', title: 'Summer Sale 50% OFF', title_ar: 'تخفيضات الصيف 50%', description: 'Get 50% off on all salon services', description_ar: 'خصم 50% على جميع خدمات الصالون', image_url: '#', target_url: '/offers/summer', placement: 'home_banner', ad_type: 'image_banner', targeting: { cities: ['Cairo', 'Alexandria'], categories: ['salon'], user_segments: ['active'] }, schedule: { start_date: '2026-04-01', end_date: '2026-04-30' }, priority: 1, status: 'active', analytics: { impressions: 45200, clicks: 3890, ctr: 8.6, conversions: 412 }, created_at: '2026-03-28T10:00:00Z', updated_at: '2026-04-13T10:00:00Z' },
    { id: 'ad-2', title: 'New Barbers in Town', title_ar: 'حلاقون جدد في المدينة', description: 'Check out the newest barber shops', description_ar: 'اكتشف أحدث صالونات الحلاقة', image_url: '#', target_url: '/explore/barbers', placement: 'category_banner', ad_type: 'promotional_card', targeting: { cities: ['Cairo'], categories: ['barber'], user_segments: ['all'] }, schedule: { start_date: '2026-04-05', end_date: '2026-05-05' }, priority: 2, status: 'active', analytics: { impressions: 28100, clicks: 2150, ctr: 7.7, conversions: 198 }, created_at: '2026-04-01T10:00:00Z', updated_at: '2026-04-13T10:00:00Z' },
    { id: 'ad-3', title: 'Featured: Glamour Studio', title_ar: 'مميز: استوديو جلامور', description: 'Top rated salon in Cairo', description_ar: 'أفضل صالون في القاهرة', image_url: '#', target_url: '/provider/glamour-studio', placement: 'search_promoted', ad_type: 'featured_provider', targeting: { cities: ['Cairo'], categories: [], user_segments: ['all'] }, schedule: { start_date: '2026-04-10', end_date: '2026-05-10' }, priority: 3, status: 'active', analytics: { impressions: 12500, clicks: 980, ctr: 7.8, conversions: 85 }, created_at: '2026-04-08T10:00:00Z', updated_at: '2026-04-13T10:00:00Z' },
    { id: 'ad-4', title: 'Eid Special Packages', title_ar: 'باقات العيد المميزة', description: 'Special grooming packages for Eid', description_ar: 'باقات تجميل خاصة بالعيد', image_url: '#', target_url: '/offers/eid', placement: 'home_banner', ad_type: 'image_banner', targeting: { cities: [], categories: [], user_segments: ['all'] }, schedule: { start_date: '2026-06-01', end_date: '2026-06-15' }, priority: 1, status: 'draft', analytics: { impressions: 0, clicks: 0, ctr: 0, conversions: 0 }, created_at: '2026-04-12T10:00:00Z', updated_at: '2026-04-12T10:00:00Z' },
    { id: 'ad-5', title: 'Spring Refresh', title_ar: 'تجديد الربيع', description: 'Fresh looks for spring season', description_ar: 'إطلالات جديدة لموسم الربيع', image_url: '#', target_url: '/offers/spring', placement: 'between_listings', ad_type: 'promotional_card', targeting: { cities: ['Cairo', 'Giza'], categories: ['salon', 'spa'], user_segments: ['active'] }, schedule: { start_date: '2026-03-01', end_date: '2026-03-31' }, priority: 2, status: 'expired', analytics: { impressions: 52000, clicks: 4100, ctr: 7.9, conversions: 380 }, created_at: '2026-02-25T10:00:00Z', updated_at: '2026-04-01T10:00:00Z' },
];

type AdFormState = {
    title: string;
    title_ar: string;
    placement: Ad['placement'];
    ad_type: Ad['ad_type'];
    start_date: string;
    end_date: string;
    target_url: string;
};

const emptyAdForm = (): AdFormState => ({
    title: '',
    title_ar: '',
    placement: 'home_banner',
    ad_type: 'image_banner',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    target_url: '',
});

export default function AdsPage() {
    const { t } = useTranslation();
    const [ads, setAds] = useState(mockAds);
    const [showCreate, setShowCreate] = useState(false);
    const [editingAd, setEditingAd] = useState<Ad | null>(null);
    const [form, setForm] = useState<AdFormState>(emptyAdForm());
    const [deleteAd, setDeleteAd] = useState<Ad | null>(null);
    const [analyticsAd, setAnalyticsAd] = useState<Ad | null>(null);

    const openCreate = () => { setEditingAd(null); setForm(emptyAdForm()); setShowCreate(true); };
    const openEdit = (ad: Ad) => {
        setEditingAd(ad);
        setForm({
            title: ad.title,
            title_ar: ad.title_ar,
            placement: ad.placement,
            ad_type: ad.ad_type,
            start_date: ad.schedule.start_date,
            end_date: ad.schedule.end_date,
            target_url: ad.target_url,
        });
        setShowCreate(true);
    };
    const closeForm = () => { setShowCreate(false); setEditingAd(null); };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAd) {
            setAds(prev => prev.map(a => a.id === editingAd.id ? {
                ...a,
                title: form.title, title_ar: form.title_ar,
                placement: form.placement, ad_type: form.ad_type,
                target_url: form.target_url,
                schedule: { start_date: form.start_date, end_date: form.end_date },
                updated_at: new Date().toISOString(),
            } : a));
        } else {
            setAds(prev => [{
                id: `ad-${Date.now()}`,
                title: form.title, title_ar: form.title_ar,
                description: '', description_ar: '',
                image_url: '#', target_url: form.target_url,
                placement: form.placement, ad_type: form.ad_type,
                targeting: { cities: [], categories: [], user_segments: ['all'] },
                schedule: { start_date: form.start_date, end_date: form.end_date },
                priority: 1, status: 'draft',
                analytics: { impressions: 0, clicks: 0, ctr: 0, conversions: 0 },
                created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
            }, ...prev]);
        }
        closeForm();
    };

    const toggleStatus = (id: string) => {
        setAds(prev => prev.map(a => a.id === id ? { ...a, status: a.status === 'active' ? 'paused' as const : 'active' as const } : a));
    };

    const handleDelete = () => {
        if (deleteAd) {
            setAds(prev => prev.filter(a => a.id !== deleteAd.id));
            setDeleteAd(null);
        }
    };

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <h1 className={shared.pageTitle}>{t('marketing.ads.management')}</h1>
                <PermissionGate module="ads" action="create">
                    <button onClick={openCreate} className={shared.addBtn}>
                        <Plus size={16} /> {t('marketing.ads.createAd')}
                    </button>
                </PermissionGate>
            </div>

            <div className={shared.kpiGrid}>
                {[
                    { label: t('marketing.ads.activeAds'), value: ads.filter(a => a.status === 'active').length },
                    { label: t('marketing.ads.totalImpressions'), value: ads.reduce((s, a) => s + a.analytics.impressions, 0).toLocaleString() },
                    { label: t('marketing.ads.totalClicks'), value: ads.reduce((s, a) => s + a.analytics.clicks, 0).toLocaleString() },
                    { label: t('marketing.ads.avgCTR'), value: `${(ads.filter(a => a.analytics.ctr > 0).reduce((s, a) => s + a.analytics.ctr, 0) / ads.filter(a => a.analytics.ctr > 0).length).toFixed(1)}%` },
                ].map(k => (
                    <div key={k.label} className={shared.summaryCard} style={{ textAlign: 'center' }}>
                        <div className={shared.summaryLabel}>{k.label}</div>
                        <div className={shared.summaryValue}>{k.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {ads.map(ad => (
                    <div key={ad.id} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ width: 80, height: 60, borderRadius: 8, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '0.75rem', flexShrink: 0 }}>{t('marketing.ads.adImage')}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{ad.title}</span>
                                <StatusBadge status={ad.status} />
                                <span style={{ fontSize: '0.6875rem', padding: '2px 6px', background: 'var(--bg-tertiary)', borderRadius: 4, color: 'var(--text-secondary)' }}>{ad.placement.replace('_', ' ')}</span>
                            </div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>{ad.description}</div>
                            <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                <span>{ad.schedule.start_date} → {ad.schedule.end_date}</span>
                                <span>Cities: {ad.targeting.cities.length > 0 ? ad.targeting.cities.join(', ') : 'All'}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                            <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                <span><Eye size={12} /> {ad.analytics.impressions.toLocaleString()}</span>
                                <span>Clicks: {ad.analytics.clicks.toLocaleString()}</span>
                                <span>CTR: {ad.analytics.ctr}%</span>
                            </div>
                            <PermissionGate module="ads" action="edit">
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <button title="Edit" onClick={() => openEdit(ad)} style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Edit size={14} /></button>
                                    {(ad.status === 'active' || ad.status === 'paused') && (
                                        <button onClick={() => toggleStatus(ad.id)} title={ad.status === 'active' ? 'Pause' : 'Resume'} style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: ad.status === 'active' ? 'var(--color-warning)' : 'var(--color-success)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                            {ad.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                                        </button>
                                    )}
                                    <button title="Analytics" onClick={() => setAnalyticsAd(ad)} style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: 'var(--color-info)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><BarChart3 size={14} /></button>
                                    <button title="Delete" onClick={() => setDeleteAd(ad)} style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: 'var(--color-error)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Trash2 size={14} /></button>
                                </div>
                            </PermissionGate>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create/Edit Ad Modal */}
            <FormModal open={showCreate} onClose={closeForm} title={editingAd ? `${t('marketing.ads.editAd')} — ${editingAd.title}` : t('marketing.ads.createNewAd')} submitLabel={editingAd ? t('marketing.ads.saveChanges') : t('marketing.ads.createAd')} onSubmit={handleSubmit}>
                <FormField label={t('marketing.ads.titleEn')} required><input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={shared.formInput} placeholder="e.g. Summer Sale 50% OFF" /></FormField>
                <FormField label={t('marketing.ads.titleAr')} required><input type="text" required value={form.title_ar} onChange={e => setForm(f => ({ ...f, title_ar: e.target.value }))} className={shared.formInput} placeholder="العنوان بالعربي" dir="rtl" /></FormField>
                <div className={shared.formGrid2}>
                    <FormField label={t('marketing.ads.placement')}><select value={form.placement} onChange={e => setForm(f => ({ ...f, placement: e.target.value as Ad['placement'] }))} className={shared.formInput}><option value="home_banner">Home Banner</option><option value="category_banner">Category Banner</option><option value="search_promoted">Search Promoted</option><option value="between_listings">Between Listings</option></select></FormField>
                    <FormField label={t('marketing.ads.adType')}><select value={form.ad_type} onChange={e => setForm(f => ({ ...f, ad_type: e.target.value as Ad['ad_type'] }))} className={shared.formInput}><option value="image_banner">Image Banner</option><option value="promotional_card">Promotional Card</option><option value="featured_provider">Featured Provider</option></select></FormField>
                </div>
                <div className={shared.formGrid2}>
                    <FormField label={t('marketing.ads.startDate')}><input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className={shared.formInput} /></FormField>
                    <FormField label={t('marketing.ads.endDate')}><input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className={shared.formInput} /></FormField>
                </div>
                <FormField label={t('marketing.ads.targetUrl')}><input type="url" value={form.target_url} onChange={e => setForm(f => ({ ...f, target_url: e.target.value }))} className={shared.formInput} placeholder="https://..." /></FormField>
            </FormModal>

            {/* Delete Confirm */}
            <ConfirmModal open={!!deleteAd} onClose={() => setDeleteAd(null)} onConfirm={handleDelete} title={t('marketing.ads.deleteAdTitle')} message={`Are you sure you want to delete "${deleteAd?.title}"? This action cannot be undone.`} confirmLabel={t('common.delete')} variant="danger" />

            {/* Analytics Detail */}
            <FormModal open={!!analyticsAd} onClose={() => setAnalyticsAd(null)} title={`${t('marketing.ads.analytics')} — ${analyticsAd?.title}`} submitLabel={t('common.close')} onSubmit={e => { e.preventDefault(); setAnalyticsAd(null); }}>
                {analyticsAd && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {[{ label: t('marketing.ads.impressions'), value: analyticsAd.analytics.impressions.toLocaleString() }, { label: t('marketing.ads.clicks'), value: analyticsAd.analytics.clicks.toLocaleString() }, { label: t('marketing.ads.ctr'), value: `${analyticsAd.analytics.ctr}%` }, { label: t('marketing.ads.conversions'), value: analyticsAd.analytics.conversions.toLocaleString() }].map(s => (
                        <div key={s.label} style={{ padding: 16, background: 'var(--bg-tertiary)', borderRadius: 8, textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase' }}>{s.label}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 4 }}>{s.value}</div>
                        </div>
                    ))}
                </div>}
            </FormModal>
        </div>
    );
}
