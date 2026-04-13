'use client';

import React, { useState } from 'react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { Plus, Globe, MapPin } from 'lucide-react';

interface Country { id: string; name: string; name_ar: string; code: string; currency: string; active: boolean; cities_count: number; providers_count: number; }

const initialCountries: Country[] = [
    { id: '1', name: 'Egypt', name_ar: 'مصر', code: 'EG', currency: 'EGP', active: true, cities_count: 27, providers_count: 1107 },
    { id: '2', name: 'Saudi Arabia', name_ar: 'المملكة العربية السعودية', code: 'SA', currency: 'SAR', active: true, cities_count: 13, providers_count: 95 },
    { id: '3', name: 'UAE', name_ar: 'الإمارات', code: 'AE', currency: 'AED', active: false, cities_count: 7, providers_count: 45 },
];

const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-primary)', background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', outline: 'none' };

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><MapPin size={24} /><h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Countries & Cities</h1></div>
                <PermissionGate module="settings" action="create">
                    <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--color-primary-500)', color: 'white', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <FormField label="Name (English)" required><input name="name" type="text" required style={inputStyle} placeholder="Egypt" /></FormField>
                    <FormField label="Name (Arabic)" required><input name="name_ar" type="text" required style={inputStyle} placeholder="مصر" dir="rtl" /></FormField>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <FormField label="Country Code" required><input name="code" type="text" required style={inputStyle} placeholder="EG" maxLength={3} /></FormField>
                    <FormField label="Currency" required><input name="currency" type="text" required style={inputStyle} placeholder="EGP" maxLength={3} /></FormField>
                </div>
            </FormModal>
        </div>
    );
}
