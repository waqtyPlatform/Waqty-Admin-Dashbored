'use client';

import React, { useState } from 'react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { PermissionGate } from '@/components/admin/PermissionGate';
import type { PushNotification } from '@/types/marketing';
import { Plus, Send, Bell } from 'lucide-react';

const initialNotifs: PushNotification[] = [
    { id: '1', title: 'Summer Sale is here!', title_ar: 'تخفيضات الصيف هنا!', body: 'Get 50% off all salon services this week', body_ar: 'احصل على خصم 50% على جميع خدمات الصالون هذا الأسبوع', target_app: 'user', target_segment: 'active', scheduled_at: null, sent_at: '2026-04-12T10:00:00Z', status: 'sent', recipients_count: 32000, opened_count: 8500, created_at: '2026-04-12T09:00:00Z' },
    { id: '2', title: 'New feature: Wallet Top-up', title_ar: 'ميزة جديدة: شحن المحفظة', body: 'Now you can top-up your wallet and pay faster', body_ar: 'الآن يمكنك شحن محفظتك والدفع بشكل أسرع', target_app: 'user', target_segment: 'all', scheduled_at: '2026-04-15T09:00:00Z', sent_at: null, status: 'scheduled', recipients_count: 48000, opened_count: 0, created_at: '2026-04-13T10:00:00Z' },
    { id: '3', title: 'Payslips ready', title_ar: 'كشوف الرواتب جاهزة', body: 'Your March payslip is now available', body_ar: 'كشف راتب مارس متاح الآن', target_app: 'employee', target_segment: 'all', scheduled_at: null, sent_at: '2026-04-05T08:00:00Z', status: 'sent', recipients_count: 1200, opened_count: 950, created_at: '2026-04-05T07:00:00Z' },
    { id: '4', title: 'Rate your last visit', title_ar: 'قيم زيارتك الأخيرة', body: 'Help us improve by rating your experience', body_ar: 'ساعدنا في التحسين بتقييم تجربتك', target_app: 'user', target_segment: 'active', scheduled_at: null, sent_at: null, status: 'draft', recipients_count: 0, opened_count: 0, created_at: '2026-04-13T11:00:00Z' },
];

const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-primary)', background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', outline: 'none' };

export default function PushNotificationsPage() {
    const [notifs, setNotifs] = useState(initialNotifs);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ title: '', title_ar: '', body: '', body_ar: '', target_app: 'user', target_segment: 'all' });

    const columns: Column<PushNotification>[] = [
        { key: 'title', label: 'Title', sortable: true, render: r => <div><div style={{ fontWeight: 500 }}>{r.title}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{r.body.slice(0, 50)}...</div></div> },
        { key: 'target_app', label: 'App', render: r => <span style={{ textTransform: 'capitalize', fontSize: '0.8125rem' }}>{r.target_app}</span> },
        { key: 'target_segment', label: 'Segment', render: r => <span style={{ textTransform: 'capitalize', fontSize: '0.8125rem' }}>{r.target_segment}</span> },
        { key: 'status', label: 'Status', sortable: true, render: r => <StatusBadge status={r.status === 'sent' ? 'completed' : r.status} /> },
        { key: 'recipients_count', label: 'Recipients', sortable: true, render: r => r.recipients_count.toLocaleString() },
        { key: 'opened_count', label: 'Opened', sortable: true, render: r => r.sent_at ? `${r.opened_count.toLocaleString()} (${r.recipients_count ? Math.round(r.opened_count / r.recipients_count * 100) : 0}%)` : '-' },
        { key: 'sent_at', label: 'Sent', render: r => r.sent_at ? new Date(r.sent_at).toLocaleDateString() : r.scheduled_at ? `Scheduled: ${new Date(r.scheduled_at).toLocaleDateString()}` : 'Draft' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Bell size={24} />
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Push Notifications</h1>
                </div>
                <PermissionGate module="marketing" action="create">
                    <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--color-primary-500)', color: 'white', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                        <Plus size={16} /> Create Notification
                    </button>
                </PermissionGate>
            </div>
            <DataTable<PushNotification> columns={columns} data={notifs} searchKeys={['title', 'body']} searchPlaceholder="Search notifications..." getRowKey={r => r.id} />

            <FormModal open={showCreate} onClose={() => setShowCreate(false)} title="Create Push Notification" submitLabel="Send / Schedule" onSubmit={e => {
                e.preventDefault();
                const now = new Date().toISOString();
                setNotifs(prev => [{
                    id: String(Date.now()), title: form.title, title_ar: form.title_ar, body: form.body, body_ar: form.body_ar,
                    target_app: form.target_app as PushNotification['target_app'], target_segment: form.target_segment as PushNotification['target_segment'],
                    scheduled_at: null, sent_at: now, status: 'sent' as const, recipients_count: 0, opened_count: 0, created_at: now,
                }, ...prev]);
                setForm({ title: '', title_ar: '', body: '', body_ar: '', target_app: 'user', target_segment: 'all' });
                setShowCreate(false);
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <FormField label="Title (English)" required><input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required style={inputStyle} placeholder="Notification title" /></FormField>
                    <FormField label="Title (Arabic)" required><input type="text" value={form.title_ar} onChange={e => setForm(f => ({ ...f, title_ar: e.target.value }))} required style={inputStyle} placeholder="عنوان الإشعار" dir="rtl" /></FormField>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <FormField label="Body (English)" required><textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} required style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Notification body" /></FormField>
                    <FormField label="Body (Arabic)" required><textarea value={form.body_ar} onChange={e => setForm(f => ({ ...f, body_ar: e.target.value }))} required style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="نص الإشعار" dir="rtl" /></FormField>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <FormField label="Target App"><select value={form.target_app} onChange={e => setForm(f => ({ ...f, target_app: e.target.value }))} style={inputStyle}><option value="user">User App</option><option value="employee">Employee App</option><option value="all">All Apps</option></select></FormField>
                    <FormField label="Target Segment"><select value={form.target_segment} onChange={e => setForm(f => ({ ...f, target_segment: e.target.value }))} style={inputStyle}><option value="all">All Users</option><option value="active">Active Users</option><option value="inactive">Inactive Users</option><option value="new">New Users</option></select></FormField>
                </div>
            </FormModal>
        </div>
    );
}
