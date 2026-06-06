'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { Megaphone, Ticket, Send, Star, Image as ImageIcon, Bell, ArrowRight } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';

// Lightweight overview KPIs for the marketing hub. (Demo aggregates — each sub-page
// owns its own live data; this root page previously 404'd because no page.tsx existed.)
const KPIS = [
    { key: 'kpiActiveCampaigns', value: 8, color: 'var(--color-primary-500)' },
    { key: 'kpiRunningAds', value: 5, color: 'var(--color-info)' },
    { key: 'kpiPromoCodes', value: 12, color: 'var(--color-warning)' },
    { key: 'kpiReach', value: '245K', color: 'var(--color-success)' },
];

const SECTIONS = [
    { href: '/marketing/ads', labelKey: 'sidebar.ads', descKey: 'marketingHome.descAds', icon: Megaphone, module: 'ads' },
    { href: '/marketing/campaigns', labelKey: 'sidebar.campaigns', descKey: 'marketingHome.descCampaigns', icon: Send, module: 'marketing' },
    { href: '/marketing/promo-codes', labelKey: 'sidebar.promoCodes', descKey: 'marketingHome.descPromoCodes', icon: Ticket, module: 'marketing' },
    { href: '/marketing/push-notifications', labelKey: 'sidebar.pushNotifications', descKey: 'marketingHome.descPush', icon: Bell, module: 'marketing' },
    { href: '/marketing/featured', labelKey: 'sidebar.featured', descKey: 'marketingHome.descFeatured', icon: Star, module: 'marketing' },
    { href: '/marketing/banners', labelKey: 'sidebar.banners', descKey: 'marketingHome.descBanners', icon: ImageIcon, module: 'marketing' },
];

export default function MarketingHomePage() {
    const { t } = useTranslation();

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <div>
                    <h1 className={shared.pageTitle}>{t('marketingHome.title')}</h1>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('marketingHome.subtitle')}</p>
                </div>
            </div>

            {/* KPI strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                {KPIS.map(k => (
                    <div key={k.key} className={shared.summaryCard} style={{ borderTop: `3px solid ${k.color}` }}>
                        <div className={shared.summaryLabel}>{t(`marketingHome.${k.key}`)}</div>
                        <div className={shared.summaryValue}>{k.value}</div>
                    </div>
                ))}
            </div>

            {/* Section cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {SECTIONS.map(s => {
                    const Icon = s.icon;
                    return (
                        <Link
                            key={s.href}
                            href={s.href}
                            style={{
                                display: 'flex', alignItems: 'flex-start', gap: 14, padding: 20, textDecoration: 'none',
                                background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)',
                                transition: 'var(--transition-base)',
                            }}
                        >
                            <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={20} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t(s.labelKey)}</span>
                                    <ArrowRight size={15} style={{ color: 'var(--text-tertiary)', flexShrink: 0, transform: 'var(--rtl-flip, none)' }} />
                                </div>
                                <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{t(s.descKey)}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
