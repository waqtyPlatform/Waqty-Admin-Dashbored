'use client';

import React, { useState } from 'react';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { FormModal, FormField } from '@/components/admin/FormModal';
import type { ContentPage } from '@/types/content';
import { Plus, Edit, FileText } from 'lucide-react';

const initialPages: ContentPage[] = [
    { id: '1', slug: 'terms', title: 'Terms & Conditions', title_ar: 'الشروط والأحكام', content: 'Full terms content...', content_ar: 'محتوى الشروط الكامل...', type: 'terms', published: true, last_updated_by: 'Platform Admin', created_at: '2023-01-01T00:00:00Z', updated_at: '2026-04-01T10:00:00Z' },
    { id: '2', slug: 'privacy', title: 'Privacy Policy', title_ar: 'سياسة الخصوصية', content: 'Full privacy policy...', content_ar: 'سياسة الخصوصية الكاملة...', type: 'privacy', published: true, last_updated_by: 'Platform Admin', created_at: '2023-01-01T00:00:00Z', updated_at: '2026-03-15T10:00:00Z' },
    { id: '3', slug: 'faq', title: 'FAQ', title_ar: 'الأسئلة الشائعة', content: 'Frequently asked questions...', content_ar: 'الأسئلة الشائعة...', type: 'faq', published: true, last_updated_by: 'Content Moderator', created_at: '2023-06-01T00:00:00Z', updated_at: '2026-04-10T10:00:00Z' },
    { id: '4', slug: 'about', title: 'About Hagzy', title_ar: 'عن هاقزي', content: 'About the platform...', content_ar: 'عن المنصة...', type: 'about', published: true, last_updated_by: 'Platform Admin', created_at: '2023-01-01T00:00:00Z', updated_at: '2025-12-01T10:00:00Z' },
];

const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-primary)', background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', outline: 'none' };

export default function ContentPagesPage() {
    const [pages, setPages] = useState(initialPages);
    const [editPage, setEditPage] = useState<ContentPage | null>(null);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FileText size={24} />
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Content Pages</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {pages.map(page => (
                    <div key={page.id} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{page.title}</h3>
                            <StatusBadge status={page.published ? 'published' : 'draft'} />
                        </div>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: '0 0 4px' }}>{page.title_ar}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '0 0 12px' }}>
                            Last updated by {page.last_updated_by} on {new Date(page.updated_at).toLocaleDateString()}
                        </p>
                        <PermissionGate module="content" action="edit">
                            <button onClick={() => setEditPage(page)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                                <Edit size={14} /> Edit
                            </button>
                        </PermissionGate>
                    </div>
                ))}
            </div>

            <FormModal open={!!editPage} onClose={() => setEditPage(null)} title={editPage ? `Edit: ${editPage.title}` : ''} submitLabel="Save Changes" onSubmit={e => {
                e.preventDefault();
                if (!editPage) return;
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                setPages(prev => prev.map(p => p.id === editPage.id ? {
                    ...p,
                    title: String(fd.get('title') || p.title),
                    title_ar: String(fd.get('title_ar') || p.title_ar),
                    content: String(fd.get('content') || p.content),
                    content_ar: String(fd.get('content_ar') || p.content_ar),
                    updated_at: new Date().toISOString(),
                    last_updated_by: 'Platform Admin',
                } : p));
                setEditPage(null);
            }}>
                {editPage && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <FormField label="Title (English)"><input name="title" type="text" defaultValue={editPage.title} style={inputStyle} /></FormField>
                            <FormField label="Title (Arabic)"><input name="title_ar" type="text" defaultValue={editPage.title_ar} style={inputStyle} dir="rtl" /></FormField>
                        </div>
                        <FormField label="Content (English)"><textarea name="content" defaultValue={editPage.content} style={{ ...inputStyle, minHeight: 150, resize: 'vertical' }} /></FormField>
                        <FormField label="Content (Arabic)"><textarea name="content_ar" defaultValue={editPage.content_ar} style={{ ...inputStyle, minHeight: 150, resize: 'vertical' }} dir="rtl" /></FormField>
                    </>
                )}
            </FormModal>
        </div>
    );
}
