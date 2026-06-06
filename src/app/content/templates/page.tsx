'use client';

import React, { useState } from 'react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { PermissionGate } from '@/components/admin/PermissionGate';
import type { EmailTemplate } from '@/types/content';
import { Plus, Edit, Mail, MessageSquare } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-primary)', background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', outline: 'none' };

const initialTemplates: EmailTemplate[] = [
    { id: '1', name: 'Welcome Email', slug: 'welcome', subject: 'Welcome to Hagzy!', subject_ar: 'مرحباً في هاقزي!', body_html: '<h1>Welcome {{name}}!</h1><p>Your account is ready.</p>', body_html_ar: '<h1>مرحباً {{name}}!</h1><p>حسابك جاهز.</p>', variables: ['name', 'email'], type: 'email', active: true, created_at: '2023-01-01T00:00:00Z', updated_at: '2026-04-01T10:00:00Z' },
    { id: '2', name: 'Booking Confirmation', slug: 'booking_confirmed', subject: 'Booking Confirmed - {{provider}}', subject_ar: 'تم تأكيد الحجز - {{provider}}', body_html: '<p>Your booking with {{provider}} on {{date}} at {{time}} is confirmed.</p>', body_html_ar: '<p>تم تأكيد حجزك مع {{provider}} في {{date}} الساعة {{time}}.</p>', variables: ['name', 'provider', 'date', 'time', 'service'], type: 'email', active: true, created_at: '2023-01-01T00:00:00Z', updated_at: '2026-03-20T10:00:00Z' },
    { id: '3', name: 'Password Reset', slug: 'password_reset', subject: 'Reset Your Password', subject_ar: 'إعادة تعيين كلمة المرور', body_html: '<p>Use code {{otp}} to reset your password.</p>', body_html_ar: '<p>استخدم الرمز {{otp}} لإعادة تعيين كلمة المرور.</p>', variables: ['name', 'otp'], type: 'email', active: true, created_at: '2023-01-01T00:00:00Z', updated_at: '2026-02-15T10:00:00Z' },
    { id: '4', name: 'Booking Reminder SMS', slug: 'booking_reminder_sms', subject: 'Reminder: {{service}} tomorrow', subject_ar: 'تذكير: {{service}} غداً', body_html: 'Hi {{name}}, reminder: {{service}} at {{provider}} tomorrow {{time}}.', body_html_ar: 'مرحباً {{name}}، تذكير: {{service}} في {{provider}} غداً {{time}}.', variables: ['name', 'provider', 'service', 'time'], type: 'sms', active: true, created_at: '2023-06-01T00:00:00Z', updated_at: '2026-04-05T10:00:00Z' },
    { id: '5', name: 'Review Request', slug: 'review_request', subject: 'How was your visit?', subject_ar: 'كيف كانت زيارتك؟', body_html: '<p>Hi {{name}}, please rate your experience at {{provider}}.</p>', body_html_ar: '<p>مرحباً {{name}}، يرجى تقييم تجربتك في {{provider}}.</p>', variables: ['name', 'provider', 'booking_id'], type: 'email', active: false, created_at: '2024-01-01T00:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
];


export default function TemplatesPage() {
    const { t } = useTranslation();
    const [templates, setTemplates] = useState(initialTemplates);
    const [editTpl, setEditTpl] = useState<EmailTemplate | null>(null);
    const [creating, setCreating] = useState(false);

    const columns: Column<EmailTemplate>[] = [
        { key: 'name', label: t('content.templates.template'), sortable: true, render: r => <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{r.type === 'sms' ? <MessageSquare size={16} color="var(--color-warning)" /> : <Mail size={16} color="var(--color-info)" />}<div><div style={{ fontWeight: 500 }}>{r.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{r.slug}</div></div></div> },
        { key: 'type', label: t('content.templates.type'), render: r => <span style={{ textTransform: 'uppercase', fontSize: '0.6875rem', fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: r.type === 'sms' ? 'var(--color-warning-light)' : 'var(--color-info-light)', color: r.type === 'sms' ? '#92400e' : '#1e40af' }}>{r.type}</span> },
        { key: 'subject', label: t('content.templates.subject'), render: r => <span style={{ fontSize: '0.8125rem' }}>{r.subject}</span> },
        { key: 'variables', label: t('content.templates.variables'), render: r => <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{r.variables.map(v => <code key={v} style={{ fontSize: '0.6875rem', padding: '1px 4px', background: 'var(--bg-tertiary)', borderRadius: 3 }}>{'{{' + v + '}}'}</code>)}</div> },
        { key: 'active', label: t('common.status'), render: r => <StatusBadge status={r.active ? 'active' : 'deactivated'} /> },
        { key: 'actions', label: '', width: '48px', render: r => <button onClick={e => { e.stopPropagation(); setEditTpl(r); }} style={{ border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px 8px', display: 'flex' }}><Edit size={14} /></button> },
    ];

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <h1 className={shared.pageTitle}>{t('content.templates.title')}</h1>
                <PermissionGate module="content" action="create">
                    <button className={shared.addBtn} onClick={() => setCreating(true)}><Plus size={16} /> {t('content.templates.add')}</button>
                </PermissionGate>
            </div>
            <DataTable<EmailTemplate> columns={columns} data={templates} searchKeys={['name', 'slug', 'subject']} searchPlaceholder={t('content.templates.searchPlaceholder')} getRowKey={r => r.id} />

            <FormModal open={!!editTpl || creating} onClose={() => { setEditTpl(null); setCreating(false); }} title={editTpl ? `${t('common.edit')}: ${editTpl.name}` : t('content.templates.add')} submitLabel={t('common.save')} onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                if (editTpl) {
                    setTemplates(prev => prev.map(t => t.id === editTpl.id ? {
                        ...t,
                        name: String(fd.get('name') || t.name),
                        subject: String(fd.get('subject') || t.subject),
                        subject_ar: String(fd.get('subject_ar') || t.subject_ar),
                        body_html: String(fd.get('body_html') || t.body_html),
                        body_html_ar: String(fd.get('body_html_ar') || t.body_html_ar),
                        updated_at: new Date().toISOString(),
                    } : t));
                    setEditTpl(null);
                } else {
                    const name = String(fd.get('name') || '').trim();
                    if (!name) return;
                    const now = new Date().toISOString();
                    const newTpl: EmailTemplate = {
                        id: `tpl-${Date.now()}`,
                        name,
                        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''),
                        subject: String(fd.get('subject') || ''),
                        subject_ar: String(fd.get('subject_ar') || ''),
                        body_html: String(fd.get('body_html') || ''),
                        body_html_ar: String(fd.get('body_html_ar') || ''),
                        variables: [],
                        type: (String(fd.get('type') || 'email') as EmailTemplate['type']),
                        active: true,
                        created_at: now,
                        updated_at: now,
                    };
                    setTemplates(prev => [newTpl, ...prev]);
                    setCreating(false);
                }
            }}>
                {(editTpl || creating) && <>
                    <FormField label={t('content.templates.templateName')}><input name="name" type="text" defaultValue={editTpl?.name ?? ''} className={shared.formInput} /></FormField>
                    {creating && !editTpl && (
                        <FormField label={t('content.templates.type')}>
                            <select name="type" defaultValue="email" className={shared.formInput}>
                                <option value="email">EMAIL</option>
                                <option value="sms">SMS</option>
                            </select>
                        </FormField>
                    )}
                    <div className={shared.formGrid2}>
                        <FormField label={t('content.templates.subjectEn')}><input name="subject" type="text" defaultValue={editTpl?.subject ?? ''} className={shared.formInput} /></FormField>
                        <FormField label={t('content.templates.subjectAr')}><input name="subject_ar" type="text" defaultValue={editTpl?.subject_ar ?? ''} className={shared.formInput} dir="rtl" /></FormField>
                    </div>
                    <FormField label={t('content.templates.bodyEn')}><textarea name="body_html" defaultValue={editTpl?.body_html ?? ''} style={{ ...inputStyle, minHeight: 120, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }} /></FormField>
                    <FormField label={t('content.templates.bodyAr')}><textarea name="body_html_ar" defaultValue={editTpl?.body_html_ar ?? ''} style={{ ...inputStyle, minHeight: 120, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }} dir="rtl" /></FormField>
                    {editTpl && (
                        <div style={{ padding: 8, background: 'var(--bg-tertiary)', borderRadius: 6, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                            Variables: {editTpl.variables.map(v => `{{${v}}}`).join(', ')}
                        </div>
                    )}
                </>}
            </FormModal>
        </div>
    );
}
