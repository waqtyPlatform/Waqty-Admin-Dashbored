'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { FormModal, FormField, ConfirmModal } from '@/components/admin/FormModal';
import { Plus, Eye, Pause, Play, Trash2, BarChart3, Edit } from 'lucide-react';
import type { Ad, AdSlot, AdType } from '@/types/marketing';
import { formatMoney, toMinor, toMajor, activeMarket } from '@/lib/market';
import shared from '@/components/admin/shared.module.css';

// X16 — each ad is a billable canonical `AdPlacement` (type + price + currency +
// AdStatus). A featured-listing purchase lands as a priced placement and the
// total reconciles into platform revenue (the "Ad Revenue" KPI below).
// Prices are canonical Money — integer MINOR units (100 = EGP 1.00).
const mockAds: Ad[] = [
    { id: 'ad-1', providerName: 'Glamour Studio', slot: 'home_banner', title: 'Summer Sale 50% OFF', title_ar: 'تخفيضات الصيف 50%', description: 'Get 50% off on all salon services', description_ar: 'خصم 50% على جميع خدمات الصالون', image_url: '#', target_url: '/offers/summer', targeting: { cities: ['Cairo', 'Alexandria'], categories: ['salon'], user_segments: ['active'] }, priority: 1, analytics: { impressions: 45200, clicks: 3890, ctr: 8.6, conversions: 412 }, placement: { uuid: 'adp-1', provider_uuid: 'prov-001', type: 'banner', placement: 'home_top', start_date: '2026-04-01', end_date: '2026-04-30', price: 1500000, currency: 'EGP', status: 'active', created_at: '2026-03-28T10:00:00Z' } },
    { id: 'ad-2', providerName: 'Elite Barbers', slot: 'category_banner', title: 'New Barbers in Town', title_ar: 'حلاقون جدد في المدينة', description: 'Check out the newest barber shops', description_ar: 'اكتشف أحدث صالونات الحلاقة', image_url: '#', target_url: '/explore/barbers', targeting: { cities: ['Cairo'], categories: ['barber'], user_segments: ['all'] }, priority: 2, analytics: { impressions: 28100, clicks: 2150, ctr: 7.7, conversions: 198 }, placement: { uuid: 'adp-2', provider_uuid: 'prov-002', type: 'banner', placement: 'category:barber', start_date: '2026-04-05', end_date: '2026-05-05', price: 800000, currency: 'EGP', status: 'active', created_at: '2026-04-01T10:00:00Z' } },
    { id: 'ad-3', providerName: 'Glamour Studio', slot: 'search_promoted', title: 'Featured: Glamour Studio', title_ar: 'مميز: استوديو جلامور', description: 'Top rated salon in Cairo', description_ar: 'أفضل صالون في القاهرة', image_url: '#', target_url: '/provider/glamour-studio', targeting: { cities: ['Cairo'], categories: [], user_segments: ['all'] }, priority: 3, analytics: { impressions: 12500, clicks: 980, ctr: 7.8, conversions: 85 }, placement: { uuid: 'adp-3', provider_uuid: 'prov-001', type: 'featured', placement: 'search_top', start_date: '2026-04-10', end_date: '2026-05-10', price: 2500000, currency: 'EGP', status: 'active', created_at: '2026-04-08T10:00:00Z' } },
    { id: 'ad-4', providerName: 'Royal Spa & Wellness', slot: 'home_banner', title: 'Eid Special Packages', title_ar: 'باقات العيد المميزة', description: 'Special grooming packages for Eid', description_ar: 'باقات تجميل خاصة بالعيد', image_url: '#', target_url: '/offers/eid', targeting: { cities: [], categories: [], user_segments: ['all'] }, priority: 1, analytics: { impressions: 0, clicks: 0, ctr: 0, conversions: 0 }, placement: { uuid: 'adp-4', provider_uuid: 'prov-004', type: 'banner', placement: 'home_top', start_date: '2026-06-01', end_date: '2026-06-15', price: 1500000, currency: 'EGP', status: 'scheduled', created_at: '2026-04-12T10:00:00Z' } },
    { id: 'ad-5', providerName: 'Glamour Studio', slot: 'between_listings', title: 'Spring Refresh', title_ar: 'تجديد الربيع', description: 'Fresh looks for spring season', description_ar: 'إطلالات جديدة لموسم الربيع', image_url: '#', target_url: '/offers/spring', targeting: { cities: ['Cairo', 'Giza'], categories: ['salon', 'spa'], user_segments: ['active'] }, priority: 2, analytics: { impressions: 52000, clicks: 4100, ctr: 7.9, conversions: 380 }, placement: { uuid: 'adp-5', provider_uuid: 'prov-001', type: 'banner', placement: 'between_listings', start_date: '2026-03-01', end_date: '2026-03-31', price: 600000, currency: 'EGP', status: 'ended', created_at: '2026-02-25T10:00:00Z' } },
];

type AdFormState = {
    title: string;
    title_ar: string;
    type: AdType;
    slot: AdSlot;
    price: string; // major units (what the admin types); stored as minor
    start_date: string;
    end_date: string;
    target_url: string;
};

const emptyAdForm = (): AdFormState => ({
    title: '',
    title_ar: '',
    type: 'banner',
    slot: 'home_banner',
    price: '',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    target_url: '',
});

// UI slot -> canonical AdPlacement.placement string (where it renders).
const SLOT_TO_PLACEMENT: Record<AdSlot, string> = {
    home_banner: 'home_top',
    category_banner: 'category',
    search_promoted: 'search_top',
    between_listings: 'between_listings',
};

export default function AdsPage() {
    const { t } = useTranslation();
    const [ads, setAds] = useState(mockAds);
    const [showCreate, setShowCreate] = useState(false);
    const [editingAd, setEditingAd] = useState<Ad | null>(null);
    const [form, setForm] = useState<AdFormState>(emptyAdForm());
    const [deleteAd, setDeleteAd] = useState<Ad | null>(null);
    const [analyticsAd, setAnalyticsAd] = useState<Ad | null>(null);

    const typeLabel: Record<AdType, string> = {
        banner: t('marketing.ads.typeBanner'),
        featured: t('marketing.ads.typeFeatured'),
        top_search: t('marketing.ads.typeTopSearch'),
    };

    const slotLabel: Record<AdSlot, string> = {
        home_banner: t('marketing.ads.slotHomeBanner'),
        category_banner: t('marketing.ads.slotCategoryBanner'),
        search_promoted: t('marketing.ads.slotSearchPromoted'),
        between_listings: t('marketing.ads.slotBetweenListings'),
    };

    const openCreate = () => { setEditingAd(null); setForm(emptyAdForm()); setShowCreate(true); };
    const openEdit = (ad: Ad) => {
        setEditingAd(ad);
        setForm({
            title: ad.title,
            title_ar: ad.title_ar,
            type: ad.placement.type,
            slot: ad.slot,
            price: String(toMajor(ad.placement.price)),
            start_date: ad.placement.start_date,
            end_date: ad.placement.end_date,
            target_url: ad.target_url,
        });
        setShowCreate(true);
    };
    const closeForm = () => { setShowCreate(false); setEditingAd(null); };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const priceMinor = toMinor(Number(form.price) || 0);
        if (editingAd) {
            setAds(prev => prev.map(a => a.id === editingAd.id ? {
                ...a,
                title: form.title, title_ar: form.title_ar,
                slot: form.slot, target_url: form.target_url,
                placement: {
                    ...a.placement,
                    type: form.type,
                    placement: SLOT_TO_PLACEMENT[form.slot],
                    price: priceMinor,
                    start_date: form.start_date,
                    end_date: form.end_date,
                },
            } : a));
        } else {
            const id = `ad-${Date.now()}`;
            setAds(prev => [{
                id,
                providerName: '—',
                slot: form.slot,
                title: form.title, title_ar: form.title_ar,
                description: '', description_ar: '',
                image_url: '#', target_url: form.target_url,
                targeting: { cities: [], categories: [], user_segments: ['all'] },
                priority: 1,
                analytics: { impressions: 0, clicks: 0, ctr: 0, conversions: 0 },
                // New billable canonical AdPlacement — defaults to `scheduled`.
                placement: {
                    uuid: `adp-${Date.now()}`,
                    provider_uuid: '',
                    type: form.type,
                    placement: SLOT_TO_PLACEMENT[form.slot],
                    start_date: form.start_date,
                    end_date: form.end_date,
                    price: priceMinor,
                    currency: activeMarket.currency,
                    status: 'scheduled',
                    created_at: new Date().toISOString(),
                },
            }, ...prev]);
        }
        closeForm();
    };

    const toggleStatus = (id: string) => {
        setAds(prev => prev.map(a => a.id === id
            ? { ...a, placement: { ...a.placement, status: a.placement.status === 'active' ? 'paused' as const : 'active' as const } }
            : a));
    };

    const handleDelete = () => {
        if (deleteAd) {
            setAds(prev => prev.filter(a => a.id !== deleteAd.id));
            setDeleteAd(null);
        }
    };

    // Ad Revenue — the 3rd platform revenue stream: sum the price of every
    // running/ran (active|ended) priced placement. This reconciles the ads
    // stream into platform revenue (X16 / SA-2).
    const adRevenue = ads
        .filter(a => a.placement.status === 'active' || a.placement.status === 'ended')
        .reduce((s, a) => s + a.placement.price, 0);
    const ctrAds = ads.filter(a => a.analytics.ctr > 0);

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
                    { label: t('marketing.ads.adRevenue'), value: formatMoney(adRevenue) },
                    { label: t('marketing.ads.activeAds'), value: ads.filter(a => a.placement.status === 'active').length },
                    { label: t('marketing.ads.totalImpressions'), value: ads.reduce((s, a) => s + a.analytics.impressions, 0).toLocaleString() },
                    { label: t('marketing.ads.totalClicks'), value: ads.reduce((s, a) => s + a.analytics.clicks, 0).toLocaleString() },
                    { label: t('marketing.ads.avgCTR'), value: ctrAds.length ? `${(ctrAds.reduce((s, a) => s + a.analytics.ctr, 0) / ctrAds.length).toFixed(1)}%` : '—' },
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{ad.title}</span>
                                <StatusBadge status={ad.placement.status} />
                                <span style={{ fontSize: '0.6875rem', padding: '2px 6px', background: 'var(--color-primary-50, #eff6ff)', borderRadius: 4, color: 'var(--color-primary-600)' }}>{typeLabel[ad.placement.type]}</span>
                                <span style={{ fontSize: '0.6875rem', padding: '2px 6px', background: 'var(--bg-tertiary)', borderRadius: 4, color: 'var(--text-secondary)' }}>{slotLabel[ad.slot]}</span>
                            </div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>{ad.description}</div>
                            <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                <span>{ad.placement.start_date} → {ad.placement.end_date}</span>
                                <span>{ad.providerName}</span>
                                <span>{t('marketing.ads.cities')}: {ad.targeting.cities.length > 0 ? ad.targeting.cities.join(', ') : t('marketing.ads.allCities')}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-primary-600)' }}>{formatMoney(ad.placement.price)}</span>
                            <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                <span><Eye size={12} /> {ad.analytics.impressions.toLocaleString()}</span>
                                <span>{t('marketing.ads.clicks')}: {ad.analytics.clicks.toLocaleString()}</span>
                                <span>{t('marketing.ads.ctr')}: {ad.analytics.ctr}%</span>
                            </div>
                            <PermissionGate module="ads" action="edit">
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <button title={t('common.edit')} onClick={() => openEdit(ad)} style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Edit size={14} /></button>
                                    {(ad.placement.status === 'active' || ad.placement.status === 'paused') && (
                                        <button onClick={() => toggleStatus(ad.id)} title={ad.placement.status === 'active' ? t('common.pause') : t('common.resume')} style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: ad.placement.status === 'active' ? 'var(--color-warning)' : 'var(--color-success)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                            {ad.placement.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                                        </button>
                                    )}
                                    <button title={t('marketing.ads.analytics')} onClick={() => setAnalyticsAd(ad)} style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: 'var(--color-info)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><BarChart3 size={14} /></button>
                                    <button title={t('common.delete')} onClick={() => setDeleteAd(ad)} style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: 'var(--color-error)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Trash2 size={14} /></button>
                                </div>
                            </PermissionGate>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create/Edit Ad Modal */}
            <FormModal open={showCreate} onClose={closeForm} title={editingAd ? `${t('marketing.ads.editAd')} — ${editingAd.title}` : t('marketing.ads.createNewAd')} submitLabel={editingAd ? t('marketing.ads.saveChanges') : t('marketing.ads.createAd')} onSubmit={handleSubmit}>
                <FormField label={t('marketing.ads.titleEn')} required><input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={shared.formInput} placeholder={t('marketing.ads.titlePlaceholderEn')} /></FormField>
                <FormField label={t('marketing.ads.titleAr')} required><input type="text" required value={form.title_ar} onChange={e => setForm(f => ({ ...f, title_ar: e.target.value }))} className={shared.formInput} placeholder={t('marketing.ads.titlePlaceholderAr')} dir="rtl" /></FormField>
                <div className={shared.formGrid2}>
                    <FormField label={t('marketing.ads.adType')}><select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as AdType }))} className={shared.formInput}><option value="banner">{typeLabel.banner}</option><option value="featured">{typeLabel.featured}</option><option value="top_search">{typeLabel.top_search}</option></select></FormField>
                    <FormField label={t('marketing.ads.placement')}><select value={form.slot} onChange={e => setForm(f => ({ ...f, slot: e.target.value as AdSlot }))} className={shared.formInput}><option value="home_banner">{t('marketing.ads.slotHomeBanner')}</option><option value="category_banner">{t('marketing.ads.slotCategoryBanner')}</option><option value="search_promoted">{t('marketing.ads.slotSearchPromoted')}</option><option value="between_listings">{t('marketing.ads.slotBetweenListings')}</option></select></FormField>
                </div>
                <div className={shared.formGrid2}>
                    <FormField label={`${t('marketing.ads.price')} (${activeMarket.currency})`} required><input type="number" min="0" required value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className={shared.formInput} placeholder="0" /></FormField>
                    <FormField label={t('marketing.ads.targetUrl')}><input type="url" value={form.target_url} onChange={e => setForm(f => ({ ...f, target_url: e.target.value }))} className={shared.formInput} placeholder="https://..." /></FormField>
                </div>
                <div className={shared.formGrid2}>
                    <FormField label={t('marketing.ads.startDate')}><input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className={shared.formInput} /></FormField>
                    <FormField label={t('marketing.ads.endDate')}><input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className={shared.formInput} /></FormField>
                </div>
            </FormModal>

            {/* Delete Confirm */}
            <ConfirmModal open={!!deleteAd} onClose={() => setDeleteAd(null)} onConfirm={handleDelete} title={t('marketing.ads.deleteAdTitle')} message={t('marketing.ads.deleteConfirmMessage').replace('{title}', deleteAd?.title ?? '')} confirmLabel={t('common.delete')} variant="danger" />

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
