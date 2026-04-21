'use client';

import React from 'react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import type { ServiceCategory } from '@/types/content';
import { Plus, Edit } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import shared from '@/components/admin/shared.module.css';

const mockCategories: ServiceCategory[] = [
    { id: '1', name: 'Haircuts', name_ar: 'قص الشعر', icon: '✂️', parent_id: null, order: 1, active: true, subcategories_count: 8, services_count: 45 },
    { id: '2', name: 'Hair Coloring', name_ar: 'صبغة الشعر', icon: '🎨', parent_id: null, order: 2, active: true, subcategories_count: 5, services_count: 28 },
    { id: '3', name: 'Beard & Shaving', name_ar: 'اللحية والحلاقة', icon: '🪒', parent_id: null, order: 3, active: true, subcategories_count: 4, services_count: 18 },
    { id: '4', name: 'Hair Treatment', name_ar: 'علاج الشعر', icon: '💆', parent_id: null, order: 4, active: true, subcategories_count: 6, services_count: 32 },
    { id: '5', name: 'Nail Care', name_ar: 'العناية بالأظافر', icon: '💅', parent_id: null, order: 5, active: true, subcategories_count: 4, services_count: 22 },
    { id: '6', name: 'Facial Treatment', name_ar: 'علاج الوجه', icon: '🧖', parent_id: null, order: 6, active: true, subcategories_count: 7, services_count: 35 },
    { id: '7', name: 'Massage', name_ar: 'التدليك', icon: '💆‍♂️', parent_id: null, order: 7, active: true, subcategories_count: 5, services_count: 20 },
    { id: '8', name: 'Waxing', name_ar: 'إزالة الشعر', icon: '🌸', parent_id: null, order: 8, active: false, subcategories_count: 3, services_count: 12 },
];

export default function CategoriesPage() {
    const { t } = useTranslation();
    const columns: Column<ServiceCategory>[] = [
        { key: 'name', label: t('content.categories.category'), sortable: true, render: r => <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: '1.25rem' }}>{r.icon}</span><div><div style={{ fontWeight: 500 }}>{r.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{r.name_ar}</div></div></span> },
        { key: 'subcategories_count', label: t('content.categories.subcategories'), sortable: true },
        { key: 'services_count', label: t('content.categories.services'), sortable: true },
        { key: 'order', label: t('content.categories.order'), sortable: true },
        { key: 'active', label: t('common.status'), render: r => <StatusBadge status={r.active ? 'active' : 'deactivated'} /> },
        { key: 'actions', label: '', width: '48px', render: () => <button style={{ border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px 8px', display: 'flex' }}><Edit size={14} /></button> },
    ];

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <h1 className={shared.pageTitle}>{t('content.categories.title')}</h1>
                <PermissionGate module="content" action="create">
                    <button className={shared.addBtn}><Plus size={16} /> {t('content.categories.add')}</button>
                </PermissionGate>
            </div>
            <DataTable<ServiceCategory> columns={columns} data={mockCategories} searchKeys={['name', 'name_ar']} searchPlaceholder={t('content.categories.searchPlaceholder')} getRowKey={r => r.id} />
        </div>
    );
}
