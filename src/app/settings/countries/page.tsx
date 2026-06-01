'use client';

import React, { useState, useCallback } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useApiQuery, useApiMutation } from '@/hooks/useApiQuery';
import {
    countriesApi, citiesApi, governoratesApi,
    type CountryObject, type CountryBody,
    type CityObject, type CityBody,
    type GovernorateObject, type GovernorateBody,
} from '@/lib/api';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { Plus, Globe, MapPin, Building2, MoreHorizontal, Pencil, ShieldOff, ShieldCheck, Trash2 } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';

type Tab = 'countries' | 'cities' | 'governorates';

export default function CountriesPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const tab = (searchParams.get('tab') as Tab) ?? 'countries';
    const activeFilter = searchParams.get('active');

    const setFilter = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (!value || value === 'all') params.delete(key);
        else params.set(key, value);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, pathname, router]);

    const setTab = (newTab: Tab) => {
        const params = new URLSearchParams();
        params.set('tab', newTab);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // ── Modal state ───────────────────────────────────────
    const [showCreate, setShowCreate]     = useState(false);
    const [editTarget, setEditTarget]     = useState<CountryObject | CityObject | GovernorateObject | null>(null);
    const [actionMenuId, setActionMenuId] = useState<string | null>(null);
    const [formError, setFormError]       = useState<string | null>(null);
    const [page, setPage]                 = useState(1);

    // reset page when tab or filter changes
    const handleTabChange = (newTab: Tab) => { setPage(1); setTab(newTab); };
    const handleFilter = (key: string, value: string) => { setPage(1); setFilter(key, value); };

    // ── All countries (for select dropdowns in city/governorate modals) ──
    const { data: allCountries } = useApiQuery(
        () => countriesApi.list({ per_page: 200 }),
        []
    );

    // ── Countries ─────────────────────────────────────────
    const { data: countries, loading: countriesLoading, meta: countriesMeta, refetch: refetchCountries } = useApiQuery(
        () => countriesApi.list({ ...(activeFilter !== null && { active: activeFilter === 'true' }), page, per_page: 15 }),
        [activeFilter, tab, page],
        { enabled: tab === 'countries' }
    );
    const { mutate: createCountry, loading: creatingCountry } = useApiMutation(
        (body: CountryBody) => countriesApi.create(body)
    );
    const { mutate: updateCountry, loading: updatingCountry } = useApiMutation(
        ({ uuid, body }: { uuid: string; body: Partial<CountryBody> }) => countriesApi.update(uuid, body)
    );
    const { mutate: toggleCountry } = useApiMutation(
        ({ uuid, active }: { uuid: string; active: boolean }) => countriesApi.toggleActive(uuid, active)
    );
    const { mutate: deleteCountry } = useApiMutation(
        (uuid: string) => countriesApi.delete(uuid)
    );

    // ── Cities ────────────────────────────────────────────
    const { data: cities, loading: citiesLoading, meta: citiesMeta, refetch: refetchCities } = useApiQuery(
        () => citiesApi.list({ ...(activeFilter !== null && { active: activeFilter === 'true' }), page, per_page: 15 }),
        [activeFilter, tab, page],
        { enabled: tab === 'cities' }
    );
    const { mutate: createCity, loading: creatingCity } = useApiMutation(
        (body: CityBody) => citiesApi.create(body)
    );
    const { mutate: updateCity, loading: updatingCity } = useApiMutation(
        ({ uuid, body }: { uuid: string; body: Partial<CityBody> }) => citiesApi.update(uuid, body)
    );
    const { mutate: toggleCity } = useApiMutation(
        ({ uuid, active }: { uuid: string; active: boolean }) => citiesApi.toggleActive(uuid, active)
    );
    const { mutate: deleteCity } = useApiMutation(
        (uuid: string) => citiesApi.delete(uuid)
    );

    // ── Governorates ──────────────────────────────────────
    const { data: governorates, loading: governoratesLoading, meta: governoratesMeta, refetch: refetchGovernorates } = useApiQuery(
        () => governoratesApi.list({ ...(activeFilter !== null && { active: activeFilter === 'true' }), page, per_page: 15 }),
        [activeFilter, tab, page],
        { enabled: tab === 'governorates' }
    );
    const { mutate: createGovernorate, loading: creatingGovernorate } = useApiMutation(
        (body: GovernorateBody) => governoratesApi.create(body)
    );
    const { mutate: updateGovernorate, loading: updatingGovernorate } = useApiMutation(
        ({ uuid, body }: { uuid: string; body: Partial<GovernorateBody> }) => governoratesApi.update(uuid, body)
    );
    const { mutate: toggleGovernorate } = useApiMutation(
        ({ uuid, active }: { uuid: string; active: boolean }) => governoratesApi.toggleActive(uuid, active)
    );
    const { mutate: deleteGovernorate } = useApiMutation(
        (uuid: string) => governoratesApi.delete(uuid)
    );

    const isCreating = creatingCountry || creatingCity || creatingGovernorate;
    const isUpdating = updatingCountry || updatingCity || updatingGovernorate;

    const activeMeta = tab === 'countries' ? countriesMeta : tab === 'cities' ? citiesMeta : governoratesMeta;

    const getNameEn = (item: CountryObject | CityObject | GovernorateObject) => item.name.en;
    const getNameAr = (item: CountryObject | CityObject | GovernorateObject) => item.name.ar;

    // ── Handlers ─────────────────────────────────────────
    const handleToggle = async (item: CountryObject | CityObject | GovernorateObject) => {
        setActionMenuId(null);
        if (tab === 'countries') { await toggleCountry({ uuid: item.uuid, active: !item.active }); refetchCountries(); }
        else if (tab === 'cities') { await toggleCity({ uuid: item.uuid, active: !item.active }); refetchCities(); }
        else { await toggleGovernorate({ uuid: item.uuid, active: !item.active }); refetchGovernorates(); }
    };

    const handleDelete = async (uuid: string) => {
        if (!confirm(t('settings.countries.confirmDelete'))) return;
        setActionMenuId(null);
        if (tab === 'countries') { await deleteCountry(uuid); refetchCountries(); }
        else if (tab === 'cities') { await deleteCity(uuid); refetchCities(); }
        else { await deleteGovernorate(uuid); refetchGovernorates(); }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        const fd = new FormData(e.currentTarget as HTMLFormElement);
        const nameEn = String(fd.get('name_en') || '');
        const nameAr = String(fd.get('name_ar') || '');
        let result = null;

        if (tab === 'countries') {
            result = await createCountry({
                name: { en: nameEn, ar: nameAr },
                iso2: String(fd.get('iso2') || '') || undefined,
                phone_code: String(fd.get('phone_code') || '') || undefined,
                active: true,
            });
            if (result) refetchCountries();
        } else if (tab === 'cities') {
            result = await createCity({
                name: { en: nameEn, ar: nameAr },
                country_uuid: String(fd.get('country_uuid') || ''),
                active: true,
            });
            if (result) refetchCities();
        } else {
            result = await createGovernorate({
                name: { en: nameEn, ar: nameAr },
                country_uuid: String(fd.get('country_uuid') || ''),
                active: true,
            });
            if (result) refetchGovernorates();
        }

        if (result) { setShowCreate(false); }
        else { setFormError(t('settings.countries.failedCreate')); }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTarget) return;
        setFormError(null);
        const fd = new FormData(e.currentTarget as HTMLFormElement);
        const nameEn = String(fd.get('name_en') || '');
        const nameAr = String(fd.get('name_ar') || '');
        let result = null;

        if (tab === 'countries') {
            result = await updateCountry({
                uuid: editTarget.uuid,
                body: { name: { en: nameEn, ar: nameAr }, iso2: String(fd.get('iso2') || '') || undefined, phone_code: String(fd.get('phone_code') || '') || undefined },
            });
            if (result) refetchCountries();
        } else if (tab === 'cities') {
            result = await updateCity({ uuid: editTarget.uuid, body: { name: { en: nameEn, ar: nameAr } } });
            if (result) refetchCities();
        } else {
            result = await updateGovernorate({ uuid: editTarget.uuid, body: { name: { en: nameEn, ar: nameAr } } });
            if (result) refetchGovernorates();
        }

        if (result) { setEditTarget(null); }
        else { setFormError(t('settings.countries.failedUpdate')); }
    };

    // ── Shared column builders ────────────────────────────
    const nameCol = <T extends CountryObject | CityObject | GovernorateObject>(): Column<T> => ({
        key: 'name', label: t('common.name'), sortable: true,
        render: (row) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.75rem', fontWeight: 600 }}>
                    {getNameEn(row as unknown as CountryObject).charAt(0).toUpperCase()}
                </div>
                <div>
                    <div style={{ fontWeight: 500 }}>{getNameEn(row as unknown as CountryObject)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{getNameAr(row as unknown as CountryObject)}</div>
                </div>
            </div>
        ),
    });

    const statusCol = <T extends CountryObject | CityObject | GovernorateObject>(): Column<T> => ({
        key: 'active', label: t('common.status'),
        render: (row) => <StatusBadge status={(row as unknown as CountryObject).active ? 'active' : 'deactivated'} />,
    });

    const actionsCol = <T extends CountryObject | CityObject | GovernorateObject>(): Column<T> => ({
        key: 'uuid', label: '', width: '48px',
        render: (row) => {
            const item = row as unknown as CountryObject;
            return (
                <div style={{ position: 'relative' }}>
                    <button onClick={e => { e.stopPropagation(); setActionMenuId(actionMenuId === item.uuid ? null : item.uuid); }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, border: 'none', borderRadius: '6px', background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                        <MoreHorizontal size={16} />
                    </button>
                    {actionMenuId === item.uuid && (
                        <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', right: 0, top: '100%', zIndex: 50, minWidth: 170, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'var(--shadow-lg)', padding: '4px' }}>
                            <ActionItem icon={<Pencil size={14} />} label={t('common.edit')} onClick={() => { setActionMenuId(null); setEditTarget(row as unknown as CountryObject); }} />
                            {item.active
                                ? <ActionItem icon={<ShieldOff size={14} />} label={t('common.deactivate')} onClick={() => handleToggle(row as unknown as CountryObject)} danger />
                                : <ActionItem icon={<ShieldCheck size={14} />} label={t('common.activate')} onClick={() => handleToggle(row as unknown as CountryObject)} />
                            }
                            <ActionItem icon={<Trash2 size={14} />} label={t('common.delete')} onClick={() => handleDelete(item.uuid)} danger />
                        </div>
                    )}
                </div>
            );
        },
    });

    const countryColumns: Column<CountryObject>[] = [
        nameCol<CountryObject>(),
        { key: 'iso2', label: t('settings.countries.iso2'), render: r => r.iso2 ? <code style={{ fontWeight: 600 }}>{r.iso2}</code> : '—' },
        { key: 'phone_code', label: t('settings.countries.phoneCode'), render: r => r.phone_code ?? '—' },
        statusCol<CountryObject>(),
        actionsCol<CountryObject>(),
    ];

    const cityColumns: Column<CityObject>[] = [
        nameCol<CityObject>(),
        statusCol<CityObject>(),
        actionsCol<CityObject>(),
    ];

    const governorateColumns: Column<GovernorateObject>[] = [
        nameCol<GovernorateObject>(),
        statusCol<GovernorateObject>(),
        actionsCol<GovernorateObject>(),
    ];

    const currentLoading = tab === 'countries' ? countriesLoading : tab === 'cities' ? citiesLoading : governoratesLoading;
    const tabTitle = tab === 'countries' ? t('settings.countries.title') : tab === 'cities' ? t('settings.countries.citiesTitle') : t('settings.countries.governoratesTitle');
    const tabIcon  = tab === 'countries' ? <Globe size={24} /> : tab === 'cities' ? <Building2 size={24} /> : <MapPin size={24} />;

    const statusFilter = (
        <select value={activeFilter ?? 'all'} onChange={e => handleFilter('active', e.target.value)} className={shared.filterSelect}>
            <option value="all">{t('common.all')} {t('common.status')}</option>
            <option value="true">{t('common.active')}</option>
            <option value="false">{t('common.inactive')}</option>
        </select>
    );

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {tabIcon}
                    <h1 className={shared.pageTitle}>{tabTitle}</h1>
                </div>
                <PermissionGate module="settings" action="create">
                    <button onClick={() => setShowCreate(true)} className={shared.addBtn}>
                        <Plus size={16} /> {t('settings.countries.add')}
                    </button>
                </PermissionGate>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border-color)' }}>
                {(['countries', 'cities', 'governorates'] as Tab[]).map(tabKey => (
                    <button key={tabKey} onClick={() => handleTabChange(tabKey)} style={{ padding: '8px 20px', border: 'none', borderBottom: tab === tabKey ? '2px solid var(--color-primary-500)' : '2px solid transparent', background: 'transparent', color: tab === tabKey ? 'var(--color-primary-500)' : 'var(--text-secondary)', fontWeight: tab === tabKey ? 600 : 400, cursor: 'pointer', fontSize: '0.875rem', marginBottom: -1, transition: 'color 0.15s' }}>
                        {tabKey === 'countries' ? t('settings.countries.tabCountries') : tabKey === 'cities' ? t('settings.countries.tabCities') : t('settings.countries.tabGovernorates')}
                    </button>
                ))}
            </div>

            {tab === 'countries' && (
                <DataTable<CountryObject> columns={countryColumns} data={countries ?? []} loading={currentLoading}
                    searchKeys={['name']} searchPlaceholder={t('settings.countries.searchPlaceholder')}
                    getRowKey={r => r.uuid} filters={statusFilter}
                    serverPagination currentPage={page} totalPages={activeMeta?.pagination?.last_page ?? 1}
                    totalCount={activeMeta?.pagination?.total} onPageChange={setPage} />
            )}
            {tab === 'cities' && (
                <DataTable<CityObject> columns={cityColumns} data={cities ?? []} loading={currentLoading}
                    searchKeys={['name']} searchPlaceholder={t('settings.countries.searchCities')}
                    getRowKey={r => r.uuid} filters={statusFilter}
                    serverPagination currentPage={page} totalPages={activeMeta?.pagination?.last_page ?? 1}
                    totalCount={activeMeta?.pagination?.total} onPageChange={setPage} />
            )}
            {tab === 'governorates' && (
                <DataTable<GovernorateObject> columns={governorateColumns} data={governorates ?? []} loading={currentLoading}
                    searchKeys={['name']} searchPlaceholder={t('settings.countries.searchGovernorates')}
                    getRowKey={r => r.uuid} filters={statusFilter}
                    serverPagination currentPage={page} totalPages={activeMeta?.pagination?.last_page ?? 1}
                    totalCount={activeMeta?.pagination?.total} onPageChange={setPage} />
            )}

            {/* Create Modal */}
            <FormModal
                open={showCreate}
                onClose={() => { setShowCreate(false); setFormError(null); }}
                title={tab === 'countries' ? t('settings.countries.addCountry') : tab === 'cities' ? t('settings.countries.addCity') : t('settings.countries.addGovernorate')}
                submitLabel={isCreating ? t('common.saving') : t('settings.countries.add')}
                onSubmit={handleCreate}
            >
                {formError && <div style={{ padding: '10px 12px', marginBottom: 12, borderRadius: 8, background: 'color-mix(in srgb, var(--color-error) 12%, transparent)', color: 'var(--color-error)', fontSize: '0.875rem' }}>{formError}</div>}
                <div className={shared.formGrid2}>
                    <FormField label={t('settings.countries.nameEn')} required>
                        <input name="name_en" type="text" required className={shared.formInput} placeholder={t('settings.countries.namePlaceholderEn')} />
                    </FormField>
                    <FormField label={t('settings.countries.nameAr')} required>
                        <input name="name_ar" type="text" required className={shared.formInput} placeholder={t('settings.countries.namePlaceholderAr')} dir="rtl" />
                    </FormField>
                </div>
                {tab === 'countries' && (
                    <div className={shared.formGrid2}>
                        <FormField label={t('settings.countries.iso2Code')}>
                            <input name="iso2" type="text" className={shared.formInput} placeholder="EG" maxLength={2} />
                        </FormField>
                        <FormField label={t('settings.countries.phoneCode')}>
                            <input name="phone_code" type="text" className={shared.formInput} placeholder="+20" />
                        </FormField>
                    </div>
                )}
                {(tab === 'cities' || tab === 'governorates') && (
                    <FormField label={t('settings.countries.country')} required>
                        <select name="country_uuid" required className={shared.formInput}>
                            <option value="">{t('settings.countries.selectCountry')}</option>
                            {(allCountries ?? []).map(c => (
                                <option key={c.uuid} value={c.uuid}>{c.name.en}</option>
                            ))}
                        </select>
                    </FormField>
                )}
            </FormModal>

            {/* Edit Modal */}
            <FormModal
                open={!!editTarget}
                onClose={() => { setEditTarget(null); setFormError(null); }}
                title={`${t('common.edit')} ${editTarget ? getNameEn(editTarget) : ''}`}
                submitLabel={isUpdating ? t('common.saving') : t('common.save')}
                onSubmit={handleUpdate}
            >
                {formError && <div style={{ padding: '10px 12px', marginBottom: 12, borderRadius: 8, background: 'color-mix(in srgb, var(--color-error) 12%, transparent)', color: 'var(--color-error)', fontSize: '0.875rem' }}>{formError}</div>}
                <div className={shared.formGrid2}>
                    <FormField label={t('settings.countries.nameEn')} required>
                        <input name="name_en" type="text" required className={shared.formInput} defaultValue={editTarget ? getNameEn(editTarget) : ''} />
                    </FormField>
                    <FormField label={t('settings.countries.nameAr')} required>
                        <input name="name_ar" type="text" required className={shared.formInput} defaultValue={editTarget ? getNameAr(editTarget) : ''} dir="rtl" />
                    </FormField>
                </div>
                {tab === 'countries' && editTarget && (
                    <div className={shared.formGrid2}>
                        <FormField label={t('settings.countries.iso2Code')}>
                            <input name="iso2" type="text" className={shared.formInput} defaultValue={(editTarget as CountryObject).iso2 ?? ''} maxLength={2} />
                        </FormField>
                        <FormField label={t('settings.countries.phoneCode')}>
                            <input name="phone_code" type="text" className={shared.formInput} defaultValue={(editTarget as CountryObject).phone_code ?? ''} />
                        </FormField>
                    </div>
                )}
            </FormModal>
        </div>
    );
}

function ActionItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
    return (
        <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', borderRadius: '4px', background: 'transparent', color: danger ? 'var(--color-error)' : 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', textAlign: 'left' }}>
            {icon} {label}
        </button>
    );
}
