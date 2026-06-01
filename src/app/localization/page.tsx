'use client';

import React, { useState } from 'react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { Plus, Edit, Globe } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

interface TranslationEntry { id: string; key: string; en: string; ar: string; module: string; updated_at: string; }

const initialTranslations: TranslationEntry[] = [
    { id: '1', key: 'common.save', en: 'Save', ar: 'حفظ', module: 'common', updated_at: '2026-04-01T10:00:00Z' },
    { id: '2', key: 'common.cancel', en: 'Cancel', ar: 'إلغاء', module: 'common', updated_at: '2026-04-01T10:00:00Z' },
    { id: '3', key: 'auth.login', en: 'Sign In', ar: 'تسجيل الدخول', module: 'auth', updated_at: '2026-03-15T10:00:00Z' },
    { id: '4', key: 'booking.confirm', en: 'Confirm Booking', ar: 'تأكيد الحجز', module: 'booking', updated_at: '2026-04-05T10:00:00Z' },
    { id: '5', key: 'booking.cancel', en: 'Cancel Booking', ar: 'إلغاء الحجز', module: 'booking', updated_at: '2026-04-05T10:00:00Z' },
    { id: '6', key: 'review.write', en: 'Write a Review', ar: 'اكتب تقييم', module: 'review', updated_at: '2026-03-20T10:00:00Z' },
    { id: '7', key: 'payment.success', en: 'Payment Successful', ar: 'تم الدفع بنجاح', module: 'payment', updated_at: '2026-04-10T10:00:00Z' },
    { id: '8', key: 'home.welcome', en: 'Welcome back!', ar: 'مرحباً بعودتك!', module: 'home', updated_at: '2026-04-01T10:00:00Z' },
    { id: '9', key: 'home.search', en: 'Search for services...', ar: 'ابحث عن خدمات...', module: 'home', updated_at: '2026-04-01T10:00:00Z' },
    { id: '10', key: 'employee.clockIn', en: 'Clock In', ar: 'تسجيل الحضور', module: 'employee', updated_at: '2026-04-08T10:00:00Z' },
    { id: '11', key: 'employee.clockOut', en: 'Clock Out', ar: 'تسجيل الانصراف', module: 'employee', updated_at: '2026-04-08T10:00:00Z' },
    { id: '12', key: 'notification.newBooking', en: 'New booking received', ar: 'تم استلام حجز جديد', module: 'notification', updated_at: '2026-03-25T10:00:00Z' },
];

export default function LocalizationPage() {
    const { t } = useTranslation();
    const [translations, setTranslations] = useState(initialTranslations);
    const [showCreate, setShowCreate] = useState(false);
    const [editEntry, setEditEntry] = useState<TranslationEntry | null>(null);
    const [moduleFilter, setModuleFilter] = useState('all');
    const modules = Array.from(new Set(translations.map(tr => tr.module)));
    const filtered = translations.filter(tr => moduleFilter === 'all' || tr.module === moduleFilter);

    const columns: Column<TranslationEntry>[] = [
        { key: 'key', label: t('localization.key'), sortable: true, render: r => <code style={{ fontSize: '0.8125rem', fontWeight: 500, background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: 4 }}>{r.key}</code> },
        { key: 'en', label: t('localization.english'), sortable: true, render: r => <span style={{ fontSize: '0.875rem' }}>{r.en}</span> },
        { key: 'ar', label: t('localization.arabic'), sortable: true, render: r => <span style={{ fontSize: '0.875rem' }} dir="rtl">{r.ar}</span> },
        { key: 'module', label: t('localization.module'), sortable: true, render: r => <span style={{ textTransform: 'capitalize', padding: '2px 8px', background: 'var(--bg-tertiary)', borderRadius: 4, fontSize: '0.75rem' }}>{r.module}</span> },
        { key: 'actions', label: '', width: '48px', render: r => <button onClick={e => { e.stopPropagation(); setEditEntry(r); }} style={{ border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px 8px', display: 'flex' }}><Edit size={14} /></button> },
    ];

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Globe size={24} /><h1 className={shared.pageTitle}>{t('localization.title')}</h1></div>
                <PermissionGate module="localization" action="create">
                    <button onClick={() => setShowCreate(true)} className={shared.addBtn}><Plus size={16} /> {t('localization.addKey')}</button>
                </PermissionGate>
            </div>

            <div style={{ display: 'flex', gap: 8, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <span>{t('localization.totalKeys')}: <strong>{translations.length}</strong></span>
                <span>&middot;</span>
                <span>{t('localization.modulesLabel')}: <strong>{modules.length}</strong></span>
            </div>

            <DataTable<TranslationEntry> columns={columns} data={filtered} searchKeys={['key', 'en', 'ar']} searchPlaceholder={t('localization.searchPlaceholder')} getRowKey={r => r.id}
                filters={<select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'var(--font-sans)' }}>
                    <option value="all">{t('localization.allModules')}</option>
                    {modules.map(m => <option key={m} value={m}>{m}</option>)}
                </select>}
            />

            <FormModal open={showCreate || !!editEntry} onClose={() => { setShowCreate(false); setEditEntry(null); }} title={editEntry ? t('localization.editTranslation') : t('localization.addTranslationKey')} submitLabel={editEntry ? t('common.save') : t('localization.addKey')} onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const now = new Date().toISOString();
                if (editEntry) {
                    setTranslations(prev => prev.map(t => t.id === editEntry.id ? {
                        ...t, key: String(fd.get('key') || t.key), module: String(fd.get('module') || t.module),
                        en: String(fd.get('en') || t.en), ar: String(fd.get('ar') || t.ar), updated_at: now,
                    } : t));
                } else {
                    setTranslations(prev => [{ id: String(Date.now()), key: String(fd.get('key') || ''), module: String(fd.get('module') || ''), en: String(fd.get('en') || ''), ar: String(fd.get('ar') || ''), updated_at: now }, ...prev]);
                }
                setShowCreate(false); setEditEntry(null);
            }}>
                <FormField label={t('localization.key')} required><input name="key" type="text" required defaultValue={editEntry?.key || ''} className={shared.formInput} placeholder={t('localization.keyPlaceholder')} /></FormField>
                <FormField label={t('localization.module')}><input name="module" type="text" defaultValue={editEntry?.module || ''} className={shared.formInput} placeholder={t('localization.modulePlaceholder')} /></FormField>
                <FormField label={t('localization.english')} required><input name="en" type="text" required defaultValue={editEntry?.en || ''} className={shared.formInput} placeholder={t('localization.enPlaceholder')} /></FormField>
                <FormField label={t('localization.arabic')} required><input name="ar" type="text" required defaultValue={editEntry?.ar || ''} className={shared.formInput} placeholder={t('localization.arPlaceholder')} dir="rtl" /></FormField>
            </FormModal>
        </div>
    );
}
