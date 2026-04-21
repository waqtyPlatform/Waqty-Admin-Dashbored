'use client';

import React, { useState } from 'react';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { Plus, Megaphone } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-primary)', background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', outline: 'none' };

interface Announcement { id: string; title: string; title_ar: string; message: string; message_ar: string; target: 'all' | 'users' | 'providers' | 'employees'; priority: 'low' | 'normal' | 'high'; active: boolean; start_date: string; end_date: string; created_at: string; }

const initialAnnouncements: Announcement[] = [
    { id: '1', title: 'Scheduled Maintenance', title_ar: 'صيانة مجدولة', message: 'We will be performing maintenance on April 20 from 2-4 AM.', message_ar: 'سنقوم بإجراء صيانة يوم 20 أبريل من 2-4 صباحاً.', target: 'all', priority: 'high', active: true, start_date: '2026-04-18', end_date: '2026-04-21', created_at: '2026-04-13T10:00:00Z' },
    { id: '2', title: 'New Features Available', title_ar: 'ميزات جديدة متاحة', message: 'Wallet top-up and recurring bookings are now live!', message_ar: 'شحن المحفظة والحجوزات المتكررة متاحة الآن!', target: 'users', priority: 'normal', active: true, start_date: '2026-04-10', end_date: '2026-04-30', created_at: '2026-04-10T10:00:00Z' },
    { id: '3', title: 'Commission Rate Update', title_ar: 'تحديث نسبة العمولة', message: 'Effective May 1, commission rates will be adjusted.', message_ar: 'اعتباراً من 1 مايو، سيتم تعديل نسب العمولة.', target: 'providers', priority: 'high', active: false, start_date: '2026-05-01', end_date: '2026-05-15', created_at: '2026-04-12T10:00:00Z' },
];

const priorityColors: Record<string, string> = { low: 'var(--text-tertiary)', normal: 'var(--color-info)', high: 'var(--color-error)' };

export default function AnnouncementsPage() {
    const { t } = useTranslation();
    const [announcements, setAnnouncements] = useState(initialAnnouncements);
    const [showCreate, setShowCreate] = useState(false);

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Megaphone size={24} /><h1 className={shared.pageTitle}>{t('content.announcements.title')}</h1></div>
                <PermissionGate module="content" action="create">
                    <button onClick={() => setShowCreate(true)} className={shared.addBtn}><Plus size={16} /> {t('content.announcements.new')}</button>
                </PermissionGate>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {announcements.map(a => (
                    <div key={a.id} style={{ background: 'var(--bg-primary)', border: `1px solid ${a.priority === 'high' ? 'var(--color-warning)' : 'var(--border-color)'}`, borderRadius: 12, padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontWeight: 600 }}>{a.title}</span>
                                <StatusBadge status={a.active ? 'active' : 'draft'} />
                                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: priorityColors[a.priority], textTransform: 'uppercase' }}>{a.priority}</span>
                                <span style={{ fontSize: '0.6875rem', padding: '2px 6px', background: 'var(--bg-tertiary)', borderRadius: 4, textTransform: 'capitalize' }}>{a.target}</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{a.start_date} → {a.end_date}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{a.message}</p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }} dir="rtl">{a.message_ar}</p>
                    </div>
                ))}
            </div>

            <FormModal open={showCreate} onClose={() => setShowCreate(false)} title={t('content.announcements.new')} submitLabel={t('content.announcements.publish')} onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const now = new Date().toISOString();
                setAnnouncements(prev => [{
                    id: String(Date.now()), title: String(fd.get('title_en') || ''), title_ar: String(fd.get('title_ar') || ''),
                    message: String(fd.get('message_en') || ''), message_ar: String(fd.get('message_ar') || ''),
                    target: (fd.get('target') || 'all') as Announcement['target'],
                    priority: (fd.get('priority') || 'normal') as Announcement['priority'],
                    active: true, start_date: now.slice(0, 10), end_date: String(fd.get('end_date') || ''), created_at: now,
                }, ...prev]);
                setShowCreate(false);
            }}>
                <div className={shared.formGrid2}>
                    <FormField label={t('content.announcements.titleEn')} required><input name="title_en" type="text" required className={shared.formInput} /></FormField>
                    <FormField label={t('content.announcements.titleAr')} required><input name="title_ar" type="text" required className={shared.formInput} dir="rtl" /></FormField>
                </div>
                <div className={shared.formGrid2}>
                    <FormField label={t('content.announcements.messageEn')} required><textarea name="message_en" required style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} /></FormField>
                    <FormField label={t('content.announcements.messageAr')} required><textarea name="message_ar" required style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} dir="rtl" /></FormField>
                </div>
                <div className={shared.formGrid3}>
                    <FormField label={t('content.announcements.target')}><select name="target" className={shared.formInput}><option value="all">All</option><option value="users">Users</option><option value="providers">Providers</option><option value="employees">Employees</option></select></FormField>
                    <FormField label={t('content.announcements.priority')}><select name="priority" className={shared.formInput}><option value="normal">Normal</option><option value="low">Low</option><option value="high">High</option></select></FormField>
                    <FormField label={t('content.announcements.endDate')}><input name="end_date" type="date" className={shared.formInput} /></FormField>
                </div>
            </FormModal>
        </div>
    );
}
