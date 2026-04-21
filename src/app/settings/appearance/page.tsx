'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

export default function AppearancePage() {
    const { t } = useTranslation();
    const { theme, setTheme } = useTheme();

    const themes = [
        { value: 'light', label: t('settings.appearance.light'), icon: <Sun size={24} />, desc: t('settings.appearance.lightDesc') },
        { value: 'dark', label: t('settings.appearance.dark'), icon: <Moon size={24} />, desc: t('settings.appearance.darkDesc') },
        { value: 'system', label: t('settings.appearance.system'), icon: <Monitor size={24} />, desc: t('settings.appearance.systemDesc') },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 600 }}>
            <h1 className={shared.pageTitle}>{t('settings.appearance.title')}</h1>
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>{t('settings.appearance.theme')}</h3>
                <div className={shared.formGrid3}>
                    {themes.map(t => (
                        <button key={t.value} onClick={() => setTheme(t.value as 'light' | 'dark' | 'system')} style={{ padding: 20, border: `2px solid ${theme === t.value ? 'var(--color-primary-500)' : 'var(--border-color)'}`, borderRadius: 12, background: theme === t.value ? 'var(--color-primary-50)' : 'var(--bg-primary)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.15s' }}>
                            <span style={{ color: theme === t.value ? 'var(--color-primary-500)' : 'var(--text-secondary)' }}>{t.icon}</span>
                            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{t.label}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>{t.desc}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>{t('settings.appearance.brandColor')}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--color-primary-500)' }} />
                    <div>
                        <div style={{ fontWeight: 500 }}>#00B166</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{t('settings.appearance.brandDesc')}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
