'use client';

import React, { useState } from 'react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { Plus, Globe, MapPin } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';

interface Country { id: string; name: string; name_ar: string; code: string; currency: string; active: boolean; cities_count: number; providers_count: number; }

const initialCountries: Country[] = [
    { id: '1', name: 'Egypt', name_ar: 'مصر', code: 'EG', currency: 'EGP', active: true, cities_count: 27, providers_count: 1107 },
    { id: '2', name: 'Saudi Arabia', name_ar: 'المملكة العربية السعودية', code: 'SA', currency: 'SAR', active: true, cities_count: 13, providers_count: 95 },
    { id: '3', name: 'UAE', name_ar: 'الإمارات', code: 'AE', currency: 'AED', active: false, cities_count: 7, providers_count: 45 },
];


export default function CountriesPage() {
    const [countries, setCountries] = useState(initialCountries);
    const [showCreate, setShowCreate] = useState(false);

    const columns: Column<Country>[] = [
        { key: 'name', label: 'Country', sortable: true, render: r => <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Globe size={18} color="var(--color-primary-500)" /><div><div style={{ fontWeight: 500 }}>{r.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{r.name_ar}</div></div></div> },
        { key: 'code', label: 'Code', render: r => <code style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{r.code}</code> },
        { key: 'currency', label: 'Currency', render: r => r.currency },
        { key: 'cities_count', label: 'Cities', sortable: true },
        { key: 'providers_count', label: 'Providers', sortable: true },
        { key: 'active', label: 'Status', render: r => <StatusBadge status={r.active ? 'active' : 'deactivated'} /> },
    ];

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><MapPin size={24} /><h1 className={shared.pageTitle}>Countries & Cities</h1></div>
                <PermissionGate module="settings" action="create">
                    <button onClick={() => setShowCreate(true)} className={shared.addBtn}>
                        <Plus size={16} /> Add Country
                    </button>
                </PermissionGate>
            </div>
            <DataTable<Country> columns={columns} data={countries} searchKeys={['name', 'name_ar', 'code']} searchPlaceholder="Search countries..." getRowKey={r => r.id} />

            <FormModal open={showCreate} onClose={() => setShowCreate(false)} title="Add Country" submitLabel="Add Country" onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                setCountries(prev => [...prev, {
                    id: String(Date.now()), name: String(fd.get('name') || ''), name_ar: String(fd.get('name_ar') || ''),
                    code: String(fd.get('code') || '').toUpperCase(), currency: String(fd.get('currency') || '').toUpperCase(),
                    active: true, cities_count: 0, providers_count: 0,
                }]);
                setShowCreate(false);
            }}>
                <div className={shared.formGrid2}>
                    <FormField label="Name (English)" required><input name="name" type="text" required className={shared.formInput} placeholder="Egypt" /></FormField>
                    <FormField label="Name (Arabic)" required><input name="name_ar" type="text" required className={shared.formInput} placeholder="مصر" dir="rtl" /></FormField>
                </div>
                <div className={shared.formGrid2}>
                    <FormField label="Country Code" required><input name="code" type="text" required className={shared.formInput} placeholder="EG" maxLength={3} /></FormField>
                    <FormField label="Currency" required><input name="currency" type="text" required className={shared.formInput} placeholder="EGP" maxLength={3} /></FormField>
                </div>
            </FormModal>
        </div>
    );
}
