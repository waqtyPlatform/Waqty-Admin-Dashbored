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
import { PermissionGate } from '@/components/admin/PermissionGate';
import { ConfirmModal } from '@/components/admin/FormModal';
import { Plus, MoreHorizontal, Pencil, Trash2, RotateCcw, ToggleLeft, ToggleRight, Tag, Layers } from 'lucide-react';
import shared from '@/components/admin/shared.module.css';
import { CategoryFormModal } from './_components/CategoryFormModal';

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
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [showCreate, setShowCreate]     = useState(false);
    const [editTarget, setEditTarget]     = useState<AdminCategoryObject | AdminSubcategoryObject | null>(null);
    const [formError,  setFormError]      = useState<string | null>(null);

    const isSaving = tab === 'categories' ? (creatingCat || updatingCat) : (creatingSub || updatingSub);

    const resetForm = () => { setShowCreate(false); setEditTarget(null); setFormError(null); };

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
            else setFormError(t('content.categories.failedCreate'));
        } else {
            const catUuid = (el.elements.namedItem('category_uuid') as HTMLSelectElement)?.value ?? '';
            const fd = buildFormData(el, catUuid);
            const result = await createSub(fd);
            if (result) { resetForm(); refetchSubs(); }
            else setFormError(t('content.categories.failedCreateSub'));
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
            else setFormError(t('content.categories.failedUpdate'));
        } else {
            const sub = editTarget as AdminSubcategoryObject;
            const catUuid = (el.elements.namedItem('category_uuid') as HTMLSelectElement)?.value ?? sub.category_uuid;
            const fd = buildFormData(el, catUuid);
            const result = await updateSub({ uuid: editTarget.uuid, fd });
            if (result) { resetForm(); refetchSubs(); }
            else setFormError(t('content.categories.failedUpdateSub'));
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
                <div style={{ position: 'absolute', insetInlineEnd: 0, top: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 50, minWidth: 160, padding: 'var(--space-1)' }} onClick={e => e.stopPropagation()}>
                    <PermissionGate module="content" action="edit">
                        <button onClick={() => { setEditTarget(row); setActionMenuId(null); }}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: 6 }}>
                            <Pencil size={14} /> {t('common.edit')}
                        </button>
                        <button onClick={() => handleToggle(row.uuid, !row.active)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: 6 }}>
                            {row.active ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                            {row.active ? t('common.deactivate') : t('common.activate')}
                        </button>
                    </PermissionGate>
                    {row.deleted_at
                        ? <PermissionGate module="content" action="edit">
                            <button onClick={() => handleRestore(row.uuid)}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: 6 }}>
                                <RotateCcw size={14} /> {t('common.restore')}
                            </button>
                          </PermissionGate>
                        : <PermissionGate module="content" action="delete">
                            <button onClick={() => { setActionMenuId(null); setConfirmDelete(row.uuid); }}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-error)', borderRadius: 6 }}>
                                <Trash2 size={14} /> {t('common.delete')}
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
            label: t('common.name'),
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
        { key: 'sort_order', label: t('content.categories.order'), render: r => <span style={{ color: 'var(--text-secondary)' }}>{r.sort_order ?? '—'}</span> },
        { key: 'subcategories_count', label: t('content.categories.subcategories'), render: r => <span style={{ color: 'var(--text-secondary)' }}>{r.subcategories_count ?? '—'}</span> },
        {
            key: 'active',
            label: t('common.status'),
            render: r => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusBadge status={r.active ? 'active' : 'inactive'} />
                    <PermissionGate module="content" action="edit">
                        <button
                            onClick={e => { e.stopPropagation(); handleToggle(r.uuid, !r.active); }}
                            title={r.active ? t('common.deactivate') : t('common.activate')}
                            style={{ padding: '3px 8px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: '0.75rem', color: r.active ? 'var(--color-error)' : 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {r.active ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                            {r.active ? t('common.disable') : t('common.enable')}
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
            label: t('common.name'),
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
            label: t('content.categories.category'),
            render: r => r.category
                ? <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{r.category.name.en}</span>
                : <span style={{ color: 'var(--text-tertiary)' }}>—</span>,
        },
        { key: 'sort_order', label: t('content.categories.order'), render: r => <span style={{ color: 'var(--text-secondary)' }}>{r.sort_order ?? '—'}</span> },
        {
            key: 'active',
            label: t('common.status'),
            render: r => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusBadge status={r.active ? 'active' : 'inactive'} />
                    <PermissionGate module="content" action="edit">
                        <button
                            onClick={e => { e.stopPropagation(); handleToggle(r.uuid, !r.active); }}
                            title={r.active ? t('common.deactivate') : t('common.activate')}
                            style={{ padding: '3px 8px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: '0.75rem', color: r.active ? 'var(--color-error)' : 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {r.active ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                            {r.active ? t('common.disable') : t('common.enable')}
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
            <option value="true">{t('common.active')}</option>
            <option value="false">{t('common.inactive')}</option>
        </select>
    );

    return (
        <div className={shared.page}>
            <div className={shared.pageHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {tab === 'categories' ? <Tag size={24} /> : <Layers size={24} />}
                    <h1 className={shared.pageTitle}>{tab === 'categories' ? t('content.categories.title') : t('content.categories.subcategoriesTitle')}</h1>
                </div>
                <PermissionGate module="content" action="create">
                    <button onClick={() => setShowCreate(true)} className={shared.addBtn}>
                        <Plus size={16} /> {tab === 'categories' ? t('content.categories.add') : t('content.categories.addSubcategory')}
                    </button>
                </PermissionGate>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border-color)' }}>
                {(['categories', 'subcategories'] as Tab[]).map(tabKey => (
                    <button key={tabKey} onClick={() => handleTabChange(tabKey)} style={{ padding: '8px 20px', border: 'none', borderBottom: tab === tabKey ? '2px solid var(--color-primary-500)' : '2px solid transparent', background: 'transparent', color: tab === tabKey ? 'var(--color-primary-500)' : 'var(--text-secondary)', fontWeight: tab === tabKey ? 600 : 400, cursor: 'pointer', fontSize: '0.875rem', marginBottom: -1, transition: 'color 0.15s' }}>
                        {tabKey === 'categories' ? t('content.categories.tabCategories') : t('content.categories.tabSubcategories')}
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
                    searchKeys={['name']} searchPlaceholder={t('content.categories.searchSubPlaceholder')}
                    getRowKey={r => r.uuid} filters={statusFilter}
                    serverPagination currentPage={page} totalPages={activeMeta?.pagination?.last_page ?? 1}
                    totalCount={activeMeta?.pagination?.total} onPageChange={setPage}
                />
            )}

            {/* Create */}
            <CategoryFormModal
                open={showCreate}
                onClose={resetForm}
                mode="create"
                tab={tab}
                allCategories={allCategories ?? []}
                formError={formError}
                saving={isSaving}
                onSubmit={handleCreate}
            />

            {/* Edit */}
            {editTarget && (
                <CategoryFormModal
                    open={!!editTarget}
                    onClose={resetForm}
                    mode="edit"
                    tab={tab}
                    editTarget={editTarget}
                    allCategories={allCategories ?? []}
                    formError={formError}
                    saving={isSaving}
                    onSubmit={handleEdit}
                />
            )}

            <ConfirmModal
                open={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={() => { const uuid = confirmDelete; setConfirmDelete(null); if (uuid) handleDelete(uuid); }}
                title={t('common.delete')}
                message={t('common.confirmDeleteItem')}
                confirmLabel={t('common.delete')}
                variant="danger"
            />
        </div>
    );
}
