'use client';

import React, { useState, useCallback } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useApiQuery, useApiMutation } from '@/hooks/useApiQuery';
import {
    adminCategoriesApi, adminSubcategoriesApi,
    type AdminCategoryObject, type AdminSubcategoryObject,
} from '@/lib/api';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { FormModal, FormField } from '@/components/admin/FormModal';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { Plus, MoreHorizontal, Pencil, Trash2, RotateCcw, ToggleLeft, ToggleRight, Tag, Layers, Upload } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';

type Tab = 'categories' | 'subcategories';

export default function CategoriesPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // ── Tab & filters ─────────────────────────────────────
    const [tab, setTab] = useState<Tab>('categories');
    const activeFilter = searchParams.get('active');
    const [page, setPage] = useState(1);

    const setFilter = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (!value || value === 'all') params.delete(key);
        else params.set(key, value);
        setPage(1);
        router.replace(`${pathname}${params.toString() ? `?${params}` : ''}`, { scroll: false });
    }, [searchParams, pathname, router]);

    const handleTabChange = (newTab: Tab) => { setPage(1); setTab(newTab); };

    // ── Categories query ──────────────────────────────────
    const { data: categories, loading: catLoading, meta: catMeta, refetch: refetchCats } = useApiQuery(
        () => adminCategoriesApi.list({
            ...(activeFilter !== null && { active: activeFilter === 'true' }),
            page, per_page: 15,
        }),
        [activeFilter, tab, page],
        { enabled: tab === 'categories' }
    );

    // ── All categories for subcategory create/edit select ─
    const { data: allCategories } = useApiQuery(
        () => adminCategoriesApi.list({ per_page: 200 }),
        [],
        { enabled: tab === 'subcategories' }
    );

    // ── Subcategories query ───────────────────────────────
    const { data: subcategories, loading: subLoading, meta: subMeta, refetch: refetchSubs } = useApiQuery(
        () => adminSubcategoriesApi.list({
            ...(activeFilter !== null && { active: activeFilter === 'true' }),
            page, per_page: 15,
        }),
        [activeFilter, tab, page],
        { enabled: tab === 'subcategories' }
    );

    const activeMeta   = tab === 'categories' ? catMeta : subMeta;
    const currentLoading = tab === 'categories' ? catLoading : subLoading;
    const refetch      = tab === 'categories' ? refetchCats : refetchSubs;

    // ── Mutations ─────────────────────────────────────────
    const { mutate: createCat,   loading: creatingCat }  = useApiMutation((fd: FormData) => adminCategoriesApi.create(fd));
    const { mutate: updateCat,   loading: updatingCat }  = useApiMutation(({ uuid, fd }: { uuid: string; fd: FormData }) => adminCategoriesApi.update(uuid, fd));
    const { mutate: toggleCat }   = useApiMutation(({ uuid, active }: { uuid: string; active: boolean }) => adminCategoriesApi.toggleActive(uuid, active));
    const { mutate: deleteCat }   = useApiMutation((uuid: string) => adminCategoriesApi.delete(uuid));
    const { mutate: restoreCat }  = useApiMutation((uuid: string) => adminCategoriesApi.restore(uuid));

    const { mutate: createSub,   loading: creatingSub }  = useApiMutation((fd: FormData) => adminSubcategoriesApi.create(fd));
    const { mutate: updateSub,   loading: updatingSub }  = useApiMutation(({ uuid, fd }: { uuid: string; fd: FormData }) => adminSubcategoriesApi.update(uuid, fd));
    const { mutate: toggleSub }   = useApiMutation(({ uuid, active }: { uuid: string; active: boolean }) => adminSubcategoriesApi.toggleActive(uuid, active));
    const { mutate: deleteSub }   = useApiMutation((uuid: string) => adminSubcategoriesApi.delete(uuid));
    const { mutate: restoreSub }  = useApiMutation((uuid: string) => adminSubcategoriesApi.restore(uuid));

    // ── Local UI state ────────────────────────────────────
    const [actionMenuId, setActionMenuId] = useState<string | null>(null);
    const [showCreate, setShowCreate]     = useState(false);
    const [editTarget, setEditTarget]     = useState<AdminCategoryObject | AdminSubcategoryObject | null>(null);
    const [formError,  setFormError]      = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const isSaving = tab === 'categories' ? (creatingCat || updatingCat) : (creatingSub || updatingSub);

    const resetForm = () => { setShowCreate(false); setEditTarget(null); setFormError(null); setImagePreview(null); };

    // ── Build FormData from form element ──────────────────
    const buildFormData = (el: HTMLFormElement, categoryUuid?: string): FormData => {
        const fd = new FormData();
        const nameAr = (el.elements.namedItem('name_ar') as HTMLInputElement)?.value ?? '';
        const nameEn = (el.elements.namedItem('name_en') as HTMLInputElement)?.value ?? '';
        fd.append('name[ar]', nameAr);
        fd.append('name[en]', nameEn);
        const active = (el.elements.namedItem('active') as HTMLSelectElement)?.value;
        if (active !== undefined) fd.append('active', active === 'true' ? '1' : '0');
        const sortOrder = (el.elements.namedItem('sort_order') as HTMLInputElement)?.value;
        if (sortOrder) fd.append('sort_order', sortOrder);
        const imageInput = el.elements.namedItem('image') as HTMLInputElement;
        if (imageInput?.files?.[0]) fd.append('image', imageInput.files[0]);
        if (categoryUuid) fd.append('category_uuid', categoryUuid);
        return fd;
    };

    // ── Handlers ──────────────────────────────────────────
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        const el = e.currentTarget as HTMLFormElement;
        if (tab === 'categories') {
            const fd = buildFormData(el);
            const result = await createCat(fd);
            if (result) { resetForm(); refetchCats(); }
            else setFormError('Failed to create category.');
        } else {
            const catUuid = (el.elements.namedItem('category_uuid') as HTMLSelectElement)?.value ?? '';
            const fd = buildFormData(el, catUuid);
            const result = await createSub(fd);
            if (result) { resetForm(); refetchSubs(); }
            else setFormError('Failed to create subcategory.');
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTarget) return;
        setFormError(null);
        const el = e.currentTarget as HTMLFormElement;
        if (tab === 'categories') {
            const fd = buildFormData(el);
            const result = await updateCat({ uuid: editTarget.uuid, fd });
            if (result) { resetForm(); refetchCats(); }
            else setFormError('Failed to update category.');
        } else {
            const sub = editTarget as AdminSubcategoryObject;
            const catUuid = (el.elements.namedItem('category_uuid') as HTMLSelectElement)?.value ?? sub.category_uuid;
            const fd = buildFormData(el, catUuid);
            const result = await updateSub({ uuid: editTarget.uuid, fd });
            if (result) { resetForm(); refetchSubs(); }
            else setFormError('Failed to update subcategory.');
        }
    };

    const handleToggle = async (uuid: string, active: boolean) => {
        setActionMenuId(null);
        if (tab === 'categories') { const r = await toggleCat({ uuid, active }); if (r) refetchCats(); }
        else { const r = await toggleSub({ uuid, active }); if (r) refetchSubs(); }
    };

    const handleDelete = async (uuid: string) => {
        setActionMenuId(null);
        if (tab === 'categories') { const r = await deleteCat(uuid); if (r !== undefined) refetchCats(); }
        else { const r = await deleteSub(uuid); if (r !== undefined) refetchSubs(); }
    };

    const handleRestore = async (uuid: string) => {
        setActionMenuId(null);
        if (tab === 'categories') { const r = await restoreCat(uuid); if (r) refetchCats(); }
        else { const r = await restoreSub(uuid); if (r) refetchSubs(); }
    };

    // ── Action menu ───────────────────────────────────────
    const ActionMenu = ({ row }: { row: AdminCategoryObject | AdminSubcategoryObject }) => (
        <div style={{ position: 'relative' }}>
            <button onClick={e => { e.stopPropagation(); setActionMenuId(actionMenuId === row.uuid ? null : row.uuid); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-secondary)', borderRadius: 6 }}>
                <MoreHorizontal size={16} />
            </button>
            {actionMenuId === row.uuid && (
                <div style={{ position: 'absolute', right: 0, top: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 50, minWidth: 160, padding: 4 }} onClick={e => e.stopPropagation()}>
                    <PermissionGate module="content" action="edit">
                        <button onClick={() => { setEditTarget(row); setActionMenuId(null); }}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: 6 }}>
                            <Pencil size={14} /> Edit
                        </button>
                        <button onClick={() => handleToggle(row.uuid, !row.active)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: 6 }}>
                            {row.active ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                            {row.active ? 'Deactivate' : 'Activate'}
                        </button>
                    </PermissionGate>
                    {row.deleted_at
                        ? <PermissionGate module="content" action="edit">
                            <button onClick={() => handleRestore(row.uuid)}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: 6 }}>
                                <RotateCcw size={14} /> Restore
                            </button>
                          </PermissionGate>
                        : <PermissionGate module="content" action="delete">
                            <button onClick={() => handleDelete(row.uuid)}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-error)', borderRadius: 6 }}>
                                <Trash2 size={14} /> Delete
                            </button>
                          </PermissionGate>
                    }
                </div>
            )}
        </div>
    );

    // ── Columns ───────────────────────────────────────────
    const catColumns: Column<AdminCategoryObject>[] = [
        {
            key: 'name',
            label: 'Name',
            render: r => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {r.image_url
                        ? <img src={r.image_url} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                        : <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexShrink: 0 }}><Tag size={16} /></div>
                    }
                    <div>
                        <div style={{ fontWeight: 600 }}>{r.name.en}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.name.ar}</div>
                    </div>
                </div>
            ),
        },
        { key: 'sort_order', label: 'Order', render: r => <span style={{ color: 'var(--text-secondary)' }}>{r.sort_order ?? '—'}</span> },
        { key: 'subcategories_count', label: 'Subcategories', render: r => <span style={{ color: 'var(--text-secondary)' }}>{r.subcategories_count ?? '—'}</span> },
        {
            key: 'active',
            label: 'Status',
            render: r => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusBadge status={r.active ? 'active' : 'inactive'} />
                    <PermissionGate module="content" action="edit">
                        <button
                            onClick={e => { e.stopPropagation(); handleToggle(r.uuid, !r.active); }}
                            title={r.active ? 'Deactivate' : 'Activate'}
                            style={{ padding: '3px 8px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: '0.75rem', color: r.active ? 'var(--color-error)' : 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {r.active ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                            {r.active ? 'Disable' : 'Enable'}
                        </button>
                    </PermissionGate>
                </div>
            ),
        },
        { key: 'actions', label: '', render: r => <ActionMenu row={r} /> },
    ];

    const subColumns: Column<AdminSubcategoryObject>[] = [
        {
            key: 'name',
            label: 'Name',
            render: r => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {r.image_url
                        ? <img src={r.image_url} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                        : <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexShrink: 0 }}><Tag size={16} /></div>
                    }
                    <div>
                        <div style={{ fontWeight: 600 }}>{r.name.en}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.name.ar}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'category',
            label: 'Category',
            render: r => r.category
                ? <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{r.category.name.en}</span>
                : <span style={{ color: 'var(--text-tertiary)' }}>—</span>,
        },
        { key: 'sort_order', label: 'Order', render: r => <span style={{ color: 'var(--text-secondary)' }}>{r.sort_order ?? '—'}</span> },
        {
            key: 'active',
            label: 'Status',
            render: r => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusBadge status={r.active ? 'active' : 'inactive'} />
                    <PermissionGate module="content" action="edit">
                        <button
                            onClick={e => { e.stopPropagation(); handleToggle(r.uuid, !r.active); }}
                            title={r.active ? 'Deactivate' : 'Activate'}
                            style={{ padding: '3px 8px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: '0.75rem', color: r.active ? 'var(--color-error)' : 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {r.active ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                            {r.active ? 'Disable' : 'Enable'}
                        </button>
                    </PermissionGate>
                </div>
            ),
        },
        { key: 'actions', label: '', render: r => <ActionMenu row={r} /> },
    ];

    // ── Status filter & shared form fields ────────────────
    const statusFilter = (
        <select value={activeFilter ?? 'all'} onChange={e => setFilter('active', e.target.value)} className={shared.filterSelect}>
            <option value="all">{t('common.all')} {t('common.status')}</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
        </select>
    );

    const isEditCat = editTarget && tab === 'categories';
    const isEditSub = editTarget && tab === 'subcategories';

    // ── Modal input helpers ───────────────────────────────
    const fieldStyle: React.CSSProperties = {
        width: '100%', padding: '10px 14px',
        border: '1.5px solid var(--border-color)', borderRadius: 10,
        fontSize: '0.875rem', background: 'var(--bg-secondary)',
        color: 'var(--text-primary)', outline: 'none',
        fontFamily: 'var(--font-sans)', boxSizing: 'border-box' as const,
        transition: 'border-color 0.2s, box-shadow 0.2s',
    };
    const focusField = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        e.target.style.borderColor = 'var(--color-primary-500)';
        e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent)';
    };
    const blurField = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        e.target.style.borderColor = 'var(--border-color)';
        e.target.style.boxShadow = 'none';
    };

    const NameFields = ({ defaultAr = '', defaultEn = '' }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Name (English)" required>
                <input name="name_en" type="text" required defaultValue={defaultEn}
                    placeholder="e.g. Hair Care" style={fieldStyle} onFocus={focusField} onBlur={blurField} />
            </FormField>
            <FormField label="Name (Arabic)" required>
                <input name="name_ar" type="text" required defaultValue={defaultAr}
                    placeholder="مثال: العناية" dir="rtl" style={fieldStyle} onFocus={focusField} onBlur={blurField} />
            </FormField>
        </div>
    );

    const CommonFields = ({ defaultOrder = '', defaultActive = 'true' }) => (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FormField label="Sort Order">
                    <input name="sort_order" type="number" min={0} defaultValue={defaultOrder}
                        placeholder="0" style={fieldStyle} onFocus={focusField} onBlur={blurField} />
                </FormField>
                <FormField label="Status">
                    <select name="active" defaultValue={defaultActive}
                        style={{ ...fieldStyle, cursor: 'pointer' }}
                        onFocus={focusField} onBlur={blurField}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </FormField>
            </div>

            <FormField label="Category Image">
                <label style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 10, padding: imagePreview ? 8 : '22px 16px',
                    border: '2px dashed var(--border-color)', borderRadius: 12,
                    cursor: 'pointer', background: 'var(--bg-secondary)', transition: 'all 0.2s',
                    minHeight: 110, position: 'relative', overflow: 'hidden',
                }}>
                    {imagePreview ? (
                        <>
                            <img src={imagePreview} alt="preview"
                                style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 8 }} />
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-primary-500)', fontWeight: 500 }}>
                                Click to replace image
                            </span>
                        </>
                    ) : (
                        <>
                            <div style={{
                                width: 48, height: 48, borderRadius: 12,
                                background: 'color-mix(in srgb, var(--color-primary-500) 10%, transparent)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--color-primary-500)',
                            }}>
                                <Upload size={22} />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                    Click to upload image
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                                    JPEG, PNG or WebP · max 2 MB
                                </div>
                            </div>
                        </>
                    )}
                    <input type="file" name="image" accept="image/jpeg,image/png,image/webp"
                        onChange={e => { const f = e.target.files?.[0]; setImagePreview(f ? URL.createObjectURL(f) : null); }}
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                </label>
            </FormField>
        </>
    );

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {tab === 'categories' ? <Tag size={24} /> : <Layers size={24} />}
                    <h1 className={shared.pageTitle}>{tab === 'categories' ? t('content.categories.title') : 'Subcategories'}</h1>
                </div>
                <PermissionGate module="content" action="create">
                    <button onClick={() => setShowCreate(true)} className={shared.addBtn}>
                        <Plus size={16} /> {tab === 'categories' ? t('content.categories.add') : 'Add Subcategory'}
                    </button>
                </PermissionGate>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border-color)' }}>
                {(['categories', 'subcategories'] as Tab[]).map(tabKey => (
                    <button key={tabKey} onClick={() => handleTabChange(tabKey)} style={{ padding: '8px 20px', border: 'none', borderBottom: tab === tabKey ? '2px solid var(--color-primary-500)' : '2px solid transparent', background: 'transparent', color: tab === tabKey ? 'var(--color-primary-500)' : 'var(--text-secondary)', fontWeight: tab === tabKey ? 600 : 400, cursor: 'pointer', fontSize: '0.875rem', marginBottom: -1, transition: 'color 0.15s' }}>
                        {tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}
                    </button>
                ))}
            </div>

            {tab === 'categories' && (
                <DataTable<AdminCategoryObject>
                    columns={catColumns} data={categories ?? []} loading={currentLoading}
                    searchKeys={['name']} searchPlaceholder={t('content.categories.searchPlaceholder')}
                    getRowKey={r => r.uuid} filters={statusFilter}
                    serverPagination currentPage={page} totalPages={activeMeta?.pagination?.last_page ?? 1}
                    totalCount={activeMeta?.pagination?.total} onPageChange={setPage}
                />
            )}
            {tab === 'subcategories' && (
                <DataTable<AdminSubcategoryObject>
                    columns={subColumns} data={subcategories ?? []} loading={currentLoading}
                    searchKeys={['name']} searchPlaceholder="Search subcategories…"
                    getRowKey={r => r.uuid} filters={statusFilter}
                    serverPagination currentPage={page} totalPages={activeMeta?.pagination?.last_page ?? 1}
                    totalCount={activeMeta?.pagination?.total} onPageChange={setPage}
                />
            )}

            {/* Create Modal */}
            <FormModal
                open={showCreate}
                onClose={resetForm}
                title={tab === 'categories' ? 'Add Category' : 'Add Subcategory'}
                submitLabel={isSaving ? t('common.saving') : 'Create'}
                onSubmit={handleCreate}
            >
                {formError && <div style={{ padding: '10px 12px', marginBottom: 12, borderRadius: 8, background: 'color-mix(in srgb, var(--color-error) 12%, transparent)', color: 'var(--color-error)', fontSize: '0.875rem' }}>{formError}</div>}
                <NameFields />
                {tab === 'subcategories' && (
                    <FormField label="Category" required>
                        <select name="category_uuid" required
                            style={{ ...fieldStyle, cursor: 'pointer' }}
                            onFocus={focusField} onBlur={blurField}>
                            <option value="">Select category…</option>
                            {(allCategories ?? []).map(c => <option key={c.uuid} value={c.uuid}>{c.name.en}</option>)}
                        </select>
                    </FormField>
                )}
                <CommonFields />
            </FormModal>

            {/* Edit Modal */}
            {editTarget && (
                <FormModal
                    open={!!editTarget}
                    onClose={resetForm}
                    title={tab === 'categories' ? 'Edit Category' : 'Edit Subcategory'}
                    submitLabel={isSaving ? t('common.saving') : 'Save Changes'}
                    onSubmit={handleEdit}
                >
                    {formError && <div style={{ padding: '10px 12px', marginBottom: 12, borderRadius: 8, background: 'color-mix(in srgb, var(--color-error) 12%, transparent)', color: 'var(--color-error)', fontSize: '0.875rem' }}>{formError}</div>}
                    <NameFields defaultEn={editTarget.name.en} defaultAr={editTarget.name.ar} />
                    {isEditSub && (
                        <FormField label="Category" required>
                            <select name="category_uuid" defaultValue={(editTarget as AdminSubcategoryObject).category_uuid}
                                style={{ ...fieldStyle, cursor: 'pointer' }}
                                onFocus={focusField} onBlur={blurField}>
                                {(allCategories ?? []).map(c => <option key={c.uuid} value={c.uuid}>{c.name.en}</option>)}
                            </select>
                        </FormField>
                    )}
                    <CommonFields
                        defaultOrder={String(editTarget.sort_order ?? '')}
                        defaultActive={editTarget.active ? 'true' : 'false'}
                    />
                    {isEditCat && (editTarget as AdminCategoryObject).image_url && !imagePreview && (
                        <div style={{ marginTop: -4 }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Current image:</span>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <img src={(editTarget as AdminCategoryObject).image_url!} alt="current"
                                    style={{ height: 72, borderRadius: 10, objectFit: 'cover', display: 'block' }} />
                            </div>
                        </div>
                    )}
                </FormModal>
            )}
        </div>
    );
}
