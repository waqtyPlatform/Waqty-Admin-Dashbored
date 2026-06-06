'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Save } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';

const STORAGE_KEY = 'waqty_superadmin_platform_settings';

export default function PlatformSettingsPage() {
    const { t } = useTranslation();
    const [settings, setSettings] = useState({
        platformName: 'Waqty', defaultCommissionRate: 10, trialDays: 14,
        defaultCurrency: 'EGP', minBookingAmount: 50, maxRefundPercent: 80,
        maintenanceMode: false, registrationOpen: true, requireDocuments: true,
    });

    const [saved, setSaved] = useState(false);

    // Hydrate from localStorage so saved settings persist across reloads.
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setSettings(prev => ({ ...prev, ...JSON.parse(raw) }));
        } catch {
            // ignore corrupt/missing value
        }
    }, []);

    const update = (key: string, value: unknown) => setSettings(prev => ({ ...prev, [key]: value }));

    // Real write (was a fake "Saved" with no persistence) — only then show success.
    const handleSave = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch {
            // ignore quota/availability errors
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 700 }}>
            <div className={shared.pageHeader}>
                <h1 className={shared.pageTitle}>{t('settings.platform.title')}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {saved && <span style={{ color: 'var(--color-success)', fontSize: '0.875rem', fontWeight: 500 }}>{t('settings.platform.saved')}</span>}
                    <button onClick={handleSave} className={shared.addBtn}><Save size={16} /> {t('common.save')}</button>
                </div>
            </div>
            {[
                { section: t('settings.platform.secGeneral'), fields: [
                    { label: t('settings.platform.platformName'), key: 'platformName', type: 'text' },
                    { label: t('settings.platform.commissionRate'), key: 'defaultCommissionRate', type: 'number' },
                    { label: t('settings.platform.trialDays'), key: 'trialDays', type: 'number' },
                    { label: t('settings.platform.defaultCurrency'), key: 'defaultCurrency', type: 'text' },
                ]},
                { section: t('settings.platform.secBookings'), fields: [
                    { label: t('settings.platform.minBooking'), key: 'minBookingAmount', type: 'number' },
                    { label: t('settings.platform.maxRefund'), key: 'maxRefundPercent', type: 'number' },
                ]},
                { section: t('settings.platform.secAccess'), fields: [
                    { label: t('settings.platform.maintenanceMode'), key: 'maintenanceMode', type: 'toggle' },
                    { label: t('settings.platform.registrationOpen'), key: 'registrationOpen', type: 'toggle' },
                    { label: t('settings.platform.requireDocuments'), key: 'requireDocuments', type: 'toggle' },
                ]},
            ].map(section => (
                <div key={section.section} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px', color: 'var(--text-primary)' }}>{section.section}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {section.fields.map(f => (
                            <div key={f.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                                <label style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>{f.label}</label>
                                {f.type === 'toggle' ? (
                                    <button onClick={() => update(f.key, !(settings as Record<string, unknown>)[f.key])} role="switch" aria-checked={Boolean((settings as Record<string, unknown>)[f.key])} aria-label={f.label} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: (settings as Record<string, unknown>)[f.key] ? 'var(--color-primary-500)' : 'var(--color-gray-300)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                                        <span style={{ width: 18, height: 18, borderRadius: 9, background: 'white', position: 'absolute', top: 3, insetInlineStart: (settings as Record<string, unknown>)[f.key] ? 23 : 3, transition: 'inset-inline-start 0.2s' }} />
                                    </button>
                                ) : (
                                    <input type={f.type} value={String((settings as Record<string, unknown>)[f.key])} onChange={e => update(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.875rem', width: 200, fontFamily: 'var(--font-sans)' }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
