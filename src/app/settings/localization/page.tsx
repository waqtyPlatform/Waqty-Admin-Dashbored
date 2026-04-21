'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { Save, Globe, Plus } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';

const initialLanguages = [
    { code: 'en', name: 'English', native: 'English', rtl: false, active: true, completion: 100, isDefault: true },
    { code: 'ar', name: 'Arabic', native: 'العربية', rtl: true, active: true, completion: 100, isDefault: false },
    { code: 'fr', name: 'French', native: 'Français', rtl: false, active: false, completion: 45, isDefault: false },
    { code: 'es', name: 'Spanish', native: 'Español', rtl: false, active: false, completion: 30, isDefault: false },
];

const currencies = [
    { code: 'EGP', name: 'Egyptian Pound', symbol: 'EGP', isDefault: true },
    { code: 'USD', name: 'US Dollar', symbol: '$', isDefault: false },
    { code: 'EUR', name: 'Euro', symbol: '€', isDefault: false },
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR', isDefault: false },
    { code: 'AED', name: 'UAE Dirham', symbol: 'AED', isDefault: false },
];

export default function LocalizationSettingsPage() {
    const { t } = useTranslation();
    const [languages, setLanguages] = useState(initialLanguages);
    const [defaultLang, setDefaultLang] = useState('en');
    const [defaultCurrency, setDefaultCurrency] = useState('EGP');
    const [timezone, setTimezone] = useState('Africa/Cairo');
    const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
    const [firstDayOfWeek, setFirstDayOfWeek] = useState('saturday');
    const [saved, setSaved] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [newLang, setNewLang] = useState({ code: '', name: '', native: '', rtl: false, completion: 0 });

    const toggleLangActive = (code: string) => {
        setLanguages(prev => prev.map(l => l.code === code ? { ...l, active: !l.active } : l));
    };

    const makeDefault = (code: string) => {
        setDefaultLang(code);
        setLanguages(prev => prev.map(l => ({ ...l, isDefault: l.code === code })));
    };

    const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

    const handleAddLanguage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLang.code || !newLang.name) return;
        if (languages.some(l => l.code.toLowerCase() === newLang.code.toLowerCase())) return;
        setLanguages(prev => [...prev, {
            code: newLang.code.toLowerCase(), name: newLang.name, native: newLang.native || newLang.name,
            rtl: newLang.rtl, active: false, completion: Math.max(0, Math.min(100, Number(newLang.completion) || 0)),
            isDefault: false,
        }]);
        setShowAdd(false);
        setNewLang({ code: '', name: '', native: '', rtl: false, completion: 0 });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}>
            <div className={shared.pageHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Globe size={24} />
                    <h1 className={shared.pageTitle}>{t('settings.localization.title')}</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {saved && <span style={{ color: 'var(--color-success)', fontSize: '0.875rem', fontWeight: 500 }}>{t('settings.localization.saved')}</span>}
                    <button onClick={handleSave} className={shared.addBtn}><Save size={16} /> {t('common.save')}</button>
                </div>
            </div>

            {/* Languages */}
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{t('settings.localization.supportedLanguages')}</h3>
                    <button onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}><Plus size={14} /> {t('settings.localization.addLanguage')}</button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead><tr style={{ background: 'var(--bg-secondary)' }}>
                        {[t('settings.localization.language'), t('settings.localization.native'), t('settings.localization.rtl'), t('settings.localization.completion'), t('common.status'), t('settings.localization.default'), ''].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>{h}</th>)}
                    </tr></thead>
                    <tbody>{languages.map(lang => (
                        <tr key={lang.code} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '10px 12px' }}><strong>{lang.name}</strong> <code style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>({lang.code})</code></td>
                            <td style={{ padding: '10px 12px' }} dir={lang.rtl ? 'rtl' : 'ltr'}>{lang.native}</td>
                            <td style={{ padding: '10px 12px' }}>{lang.rtl ? t('common.yes') : t('common.no')}</td>
                            <td style={{ padding: '10px 12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 80, height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{ width: `${lang.completion}%`, height: '100%', background: lang.completion === 100 ? 'var(--color-success)' : lang.completion > 50 ? 'var(--color-info)' : 'var(--color-warning)' }} />
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{lang.completion}%</span>
                                </div>
                            </td>
                            <td style={{ padding: '10px 12px' }}><StatusBadge status={lang.active ? 'active' : 'deactivated'} /></td>
                            <td style={{ padding: '10px 12px' }}>
                                {defaultLang === lang.code ? <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', borderRadius: 4, fontWeight: 600 }}>{t('settings.localization.default')}</span> : <button onClick={() => makeDefault(lang.code)} style={{ fontSize: '0.75rem', padding: '2px 8px', border: '1px solid var(--border-color)', borderRadius: 4, background: 'var(--bg-primary)', cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>{t('settings.localization.setAsDefault')}</button>}
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                                <button onClick={() => toggleLangActive(lang.code)} disabled={defaultLang === lang.code} style={{ fontSize: '0.75rem', padding: '4px 10px', border: '1px solid var(--border-color)', borderRadius: 4, background: 'var(--bg-primary)', cursor: defaultLang === lang.code ? 'not-allowed' : 'pointer', color: defaultLang === lang.code ? 'var(--text-tertiary)' : 'var(--text-primary)', fontFamily: 'var(--font-sans)', opacity: defaultLang === lang.code ? 0.5 : 1 }}>
                                    {lang.active ? t('common.disable') : t('common.enable')}
                                </button>
                            </td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>

            {/* Regional */}
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>{t('settings.localization.regionalDefaults')}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Field label={t('settings.localization.defaultCurrency')}>
                        <select value={defaultCurrency} onChange={e => setDefaultCurrency(e.target.value)} style={selectStyle}>
                            {currencies.map(c => <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>)}
                        </select>
                    </Field>
                    <Field label={t('settings.localization.defaultTimezone')}>
                        <select value={timezone} onChange={e => setTimezone(e.target.value)} style={selectStyle}>
                            <option value="Africa/Cairo">Africa/Cairo (GMT+2)</option>
                            <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                            <option value="Asia/Riyadh">Asia/Riyadh (GMT+3)</option>
                            <option value="Europe/London">Europe/London (GMT+0)</option>
                            <option value="UTC">UTC</option>
                        </select>
                    </Field>
                    <Field label={t('settings.localization.dateFormat')}>
                        <select value={dateFormat} onChange={e => setDateFormat(e.target.value)} style={selectStyle}>
                            <option value="DD/MM/YYYY">DD/MM/YYYY (13/04/2026)</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY (04/13/2026)</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD (2026-04-13)</option>
                        </select>
                    </Field>
                    <Field label={t('settings.localization.firstDayOfWeek')}>
                        <select value={firstDayOfWeek} onChange={e => setFirstDayOfWeek(e.target.value)} style={selectStyle}>
                            <option value="sunday">Sunday</option>
                            <option value="monday">Monday</option>
                            <option value="saturday">Saturday</option>
                        </select>
                    </Field>
                </div>
            </div>

            {/* Supported Currencies */}
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>{t('settings.localization.supportedCurrencies')}</h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {currencies.map(c => (
                        <div key={c.code} style={{ padding: '8px 14px', border: `1px solid ${defaultCurrency === c.code ? 'var(--color-primary-500)' : 'var(--border-color)'}`, borderRadius: 8, background: defaultCurrency === c.code ? 'var(--color-primary-50)' : 'var(--bg-primary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <strong>{c.code}</strong>
                            <span style={{ color: 'var(--text-secondary)' }}>{c.name}</span>
                            {defaultCurrency === c.code && <span style={{ fontSize: '0.6875rem', padding: '1px 6px', background: 'var(--color-primary-500)', color: 'white', borderRadius: 3 }}>DEFAULT</span>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Language Modal */}
            <FormModal open={showAdd} onClose={() => setShowAdd(false)} title={t('settings.localization.addLanguage')} submitLabel={t('settings.localization.addLanguage')} onSubmit={handleAddLanguage}>
                <div className={shared.formGrid2}>
                    <FormField label={t('settings.localization.code')} required>
                        <input type="text" required maxLength={5} value={newLang.code} onChange={e => setNewLang(l => ({ ...l, code: e.target.value }))} placeholder="e.g. de" style={selectStyle} />
                    </FormField>
                    <FormField label={t('settings.localization.nameEn')} required>
                        <input type="text" required value={newLang.name} onChange={e => setNewLang(l => ({ ...l, name: e.target.value }))} placeholder="e.g. German" style={selectStyle} />
                    </FormField>
                </div>
                <FormField label={t('settings.localization.nativeName')}>
                    <input type="text" value={newLang.native} onChange={e => setNewLang(l => ({ ...l, native: e.target.value }))} placeholder="e.g. Deutsch" style={selectStyle} dir={newLang.rtl ? 'rtl' : 'ltr'} />
                </FormField>
                <div className={shared.formGrid2}>
                    <FormField label={t('settings.localization.translationCompletion')}>
                        <input type="number" min={0} max={100} value={newLang.completion} onChange={e => setNewLang(l => ({ ...l, completion: Number(e.target.value) }))} style={selectStyle} />
                    </FormField>
                    <FormField label={t('settings.localization.rightToLeft')}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', padding: '8px 12px' }}>
                            <input type="checkbox" checked={newLang.rtl} onChange={e => setNewLang(l => ({ ...l, rtl: e.target.checked }))} />
                            {t('settings.localization.rtlLanguage')}
                        </label>
                    </FormField>
                </div>
            </FormModal>
        </div>
    );
}

const selectStyle = { padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'var(--font-sans)', width: '100%', cursor: 'pointer', outline: 'none' };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 500 }}>{label}</label>
            {children}
        </div>
    );
}
