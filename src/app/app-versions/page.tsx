'use client';

import React, { useState } from 'react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { FormModal, FormField } from '@/components/admin/FormModal';
import type { AppVersion } from '@/types/system';
import { Smartphone, Plus } from 'lucide-react';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-primary)', background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', outline: 'none' };


const initialVersions: AppVersion[] = [
    { id: '1', app: 'user_ios', version: '2.1.58', build_number: 158, min_required_version: '2.0.0', force_update: false, release_notes: 'Bug fixes and performance improvements', release_notes_ar: 'إصلاح الأخطاء وتحسين الأداء', released_at: '2026-04-10T10:00:00Z', created_at: '2026-04-10T10:00:00Z' },
    { id: '2', app: 'user_android', version: '2.1.58', build_number: 158, min_required_version: '2.0.0', force_update: false, release_notes: 'Bug fixes and performance improvements', release_notes_ar: 'إصلاح الأخطاء وتحسين الأداء', released_at: '2026-04-10T10:00:00Z', created_at: '2026-04-10T10:00:00Z' },
    { id: '3', app: 'employee_ios', version: '1.4.2', build_number: 42, min_required_version: '1.3.0', force_update: false, release_notes: 'Added biometric login and payslip download', release_notes_ar: 'إضافة الدخول البيومتري وتحميل كشف الراتب', released_at: '2026-04-08T10:00:00Z', created_at: '2026-04-08T10:00:00Z' },
    { id: '4', app: 'employee_android', version: '1.4.2', build_number: 42, min_required_version: '1.3.0', force_update: false, release_notes: 'Added biometric login and payslip download', release_notes_ar: 'إضافة الدخول البيومتري وتحميل كشف الراتب', released_at: '2026-04-08T10:00:00Z', created_at: '2026-04-08T10:00:00Z' },
    { id: '5', app: 'user_ios', version: '2.1.55', build_number: 155, min_required_version: '2.0.0', force_update: true, release_notes: 'Critical security patch', release_notes_ar: 'تحديث أمني مهم', released_at: '2026-03-25T10:00:00Z', created_at: '2026-03-25T10:00:00Z' },
];

const appLabels: Record<string, string> = { user_ios: 'User (iOS)', user_android: 'User (Android)', employee_ios: 'Employee (iOS)', employee_android: 'Employee (Android)' };

export default function AppVersionsPage() {
    const { t } = useTranslation();
    const [versions, setVersions] = useState(initialVersions);
    const [showCreate, setShowCreate] = useState(false);

    const columns: Column<AppVersion>[] = [
        { key: 'app', label: t('appVersions.app'), sortable: true, render: r => <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Smartphone size={16} /><span style={{ fontWeight: 500 }}>{appLabels[r.app]}</span></div> },
        { key: 'version', label: t('appVersions.version'), sortable: true, render: r => <code style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.version}</code> },
        { key: 'build_number', label: t('appVersions.build'), sortable: true },
        { key: 'min_required_version', label: t('appVersions.minRequired'), render: r => <code style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{r.min_required_version}</code> },
        { key: 'force_update', label: t('appVersions.forceUpdate'), render: r => r.force_update ? <StatusBadge status="urgent" /> : <span style={{ color: 'var(--text-tertiary)' }}>{t('common.no')}</span> },
        { key: 'release_notes', label: t('appVersions.notes'), render: r => <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{r.release_notes.slice(0, 50)}{r.release_notes.length > 50 ? '...' : ''}</span> },
        { key: 'released_at', label: t('appVersions.released'), sortable: true, render: r => new Date(r.released_at).toLocaleDateString() },
    ];

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <h1 className={shared.pageTitle}>{t('appVersions.title')}</h1>
                <PermissionGate module="app_versions" action="create">
                    <button onClick={() => setShowCreate(true)} className={shared.addBtn}><Plus size={16} /> {t('appVersions.addVersion')}</button>
                </PermissionGate>
            </div>
            <DataTable<AppVersion> columns={columns} data={versions} searchKeys={['app', 'version', 'release_notes']} searchPlaceholder={t('appVersions.searchPlaceholder')} getRowKey={r => r.id} />

            <FormModal open={showCreate} onClose={() => setShowCreate(false)} title={t('appVersions.addAppVersion')} submitLabel={t('appVersions.addVersion')} onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const now = new Date().toISOString();
                setVersions(prev => [{ id: String(Date.now()), app: String(fd.get('app') || 'user_ios') as AppVersion['app'], version: String(fd.get('version') || ''), build_number: Number(fd.get('build_number') || 0), min_required_version: String(fd.get('min_required_version') || '1.0.0'), force_update: fd.get('force_update') === 'true', release_notes: String(fd.get('release_notes') || ''), release_notes_ar: String(fd.get('release_notes_ar') || ''), released_at: now, created_at: now }, ...prev]);
                setShowCreate(false);
            }}>
                <div className={shared.formGrid2}>
                    <FormField label={t('appVersions.app')} required><select name="app" required className={shared.formInput}><option value="user_ios">{t('appVersions.userIos')}</option><option value="user_android">{t('appVersions.userAndroid')}</option><option value="employee_ios">{t('appVersions.employeeIos')}</option><option value="employee_android">{t('appVersions.employeeAndroid')}</option></select></FormField>
                    <FormField label={t('appVersions.version')} required><input name="version" type="text" required className={shared.formInput} placeholder="e.g. 2.1.59" /></FormField>
                </div>
                <div className={shared.formGrid2}>
                    <FormField label={t('appVersions.buildNumber')} required><input name="build_number" type="number" required className={shared.formInput} placeholder="e.g. 159" /></FormField>
                    <FormField label={t('appVersions.minRequiredVersion')}><input name="min_required_version" type="text" className={shared.formInput} placeholder="e.g. 2.0.0" /></FormField>
                </div>
                <FormField label={t('appVersions.forceUpdate')}><select name="force_update" className={shared.formInput}><option value="false">{t('common.no')}</option><option value="true">{t('common.yes')}</option></select></FormField>
                <FormField label={t('appVersions.releaseNotesEn')}><textarea name="release_notes" style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} placeholder={t('appVersions.notesPlaceholderEn')} /></FormField>
                <FormField label={t('appVersions.releaseNotesAr')}><textarea name="release_notes_ar" style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} placeholder={t('appVersions.notesPlaceholderAr')} dir="rtl" /></FormField>
            </FormModal>
        </div>
    );
}
