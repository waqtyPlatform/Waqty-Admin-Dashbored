'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { ConfirmModal, FormModal, FormField } from '@/components/admin/FormModal';
import { useToast } from '@/components/ui';
import { useApiQuery, useApiMutation } from '@/hooks/useApiQuery';
import {
    adminProvidersApi, adminBranchesApi, adminEmployeesApi,
    type AdminProviderObject, type BranchObject, type EmployeeObject,
} from '@/lib/api';
import { mockPlans } from '@/mocks/subscriptions';
import { formatMoney, toMajor } from '@/lib/market';
import type { Provider, ProviderStatus } from '@/types/provider';
import { scoreProvider, assessChurnRisk } from '@/lib/analytics';
import {
    ArrowLeft, Building2, Users, CalendarDays, DollarSign, MapPin, Mail, Phone,
    Ban, ShieldCheck, Trash2, RotateCcw, LogIn, Pause, Play, ExternalLink,
    Clock, Star, CreditCard, Scissors, Percent, Download, ChevronDown,
    MoreHorizontal, CheckCircle2, XCircle, Loader2,
} from 'lucide-react';
import { exportToCSV } from '@/lib/utils';
import styles from './page.module.css';
import shared from '@/components/admin/shared.module.css';

// Mock data kept only for services / bookings (no API endpoint implemented yet)
const mockServices = [
    { id: '1', name: 'Haircut', category: 'Hair', price: 150, duration: 30, active: true, bookings: 520 },
    { id: '2', name: 'Hair Color', category: 'Hair', price: 350, duration: 60, active: true, bookings: 280 },
    { id: '3', name: 'Beard Trim', category: 'Beard', price: 80, duration: 15, active: true, bookings: 410 },
    { id: '4', name: 'Keratin Treatment', category: 'Hair', price: 500, duration: 90, active: true, bookings: 120 },
    { id: '5', name: 'Scalp Treatment', category: 'Hair', price: 200, duration: 30, active: false, bookings: 65 },
];
const mockBookings = [
    { id: 'BK-1001', customer: 'Fatima Al-Rashid', service: 'Hair Color', date: '2026-04-13', time: '10:00 AM', status: 'confirmed' },
    { id: 'BK-1002', customer: 'Mohamed Ahmed', service: 'Haircut', date: '2026-04-13', time: '11:00 AM', status: 'completed' },
    { id: 'BK-1003', customer: 'Layla Mahmoud', service: 'Keratin Treatment', date: '2026-04-13', time: '2:00 PM', status: 'in_progress' },
    { id: 'BK-1004', customer: 'Khaled Samir', service: 'Beard Trim', date: '2026-04-12', time: '3:00 PM', status: 'completed' },
    { id: 'BK-1005', customer: 'Reem Adel', service: 'Haircut', date: '2026-04-12', time: '4:00 PM', status: 'cancelled' },
    { id: 'BK-1006', customer: 'Youssef Nabil', service: 'Hair Color', date: '2026-04-11', time: '10:00 AM', status: 'no_show' },
];

export default function ProviderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { startImpersonating } = useAuth();
    const { addToast } = useToast();
    const { t, tn } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview');
    const [provider, setProvider] = useState<Provider | undefined>(undefined);
    const [confirmAction, setConfirmAction] = useState<{ action: string; label: string } | null>(null);
    const [showRenew, setShowRenew] = useState(false);
    const [showChangePlan, setShowChangePlan] = useState(false);
    const [showCancelSub, setShowCancelSub] = useState(false);
    const [renewCycle, setRenewCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');
    const [showCommission, setShowCommission] = useState(false);
    const [commissionRate, setCommissionRate] = useState('');
    const [commissionDate, setCommissionDate] = useState('');
    const [commissionReason, setCommissionReason] = useState('');
    const [exportOpen, setExportOpen] = useState(false);

    // ── Real API: provider detail ─────────────────────────
    const providerUuid = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
    const { data: apiProvider, loading: providerLoading } = useApiQuery(
        () => adminProvidersApi.get(providerUuid),
        [providerUuid],
        { enabled: !!providerUuid }
    );

    // ── Real API: branches ────────────────────────────────
    const { data: branches, loading: branchesLoading, refetch: refetchBranches } = useApiQuery(
        () => adminBranchesApi.list({ provider_uuid: providerUuid, per_page: 50 }),
        [providerUuid],
        { enabled: !!providerUuid && activeTab === 'branches' }
    );

    // ── Real API: employees ───────────────────────────────
    const { data: employees, loading: employeesLoading, refetch: refetchEmployees } = useApiQuery(
        () => adminEmployeesApi.list({ provider_uuid: providerUuid, per_page: 50 }),
        [providerUuid],
        { enabled: !!providerUuid && activeTab === 'employees' }
    );

    // ── Branch mutations ──────────────────────────────────
    const { mutate: updateBranchStatus } = useApiMutation(
        ({ uuid, body }: { uuid: string; body: { active?: boolean; blocked?: boolean; banned?: boolean } }) =>
            adminBranchesApi.updateStatus(uuid, body)
    );
    const { mutate: deleteBranch } = useApiMutation((uuid: string) => adminBranchesApi.delete(uuid));
    const { mutate: restoreBranch } = useApiMutation((uuid: string) => adminBranchesApi.restore(uuid));

    // ── Employee mutations ────────────────────────────────
    const { mutate: updateEmployeeStatus } = useApiMutation(
        ({ uuid, body }: { uuid: string; body: { active?: boolean; blocked?: boolean } }) =>
            adminEmployeesApi.updateStatus(uuid, body)
    );
    const { mutate: deleteEmployee } = useApiMutation((uuid: string) => adminEmployeesApi.delete(uuid));
    const { mutate: restoreEmployee } = useApiMutation((uuid: string) => adminEmployeesApi.restore(uuid));

    // ── Branch / Employee action menus ────────────────────
    const [branchMenuId, setBranchMenuId] = useState<string | null>(null);
    const [employeeMenuId, setEmployeeMenuId] = useState<string | null>(null);
    const [actionBusy, setActionBusy] = useState<string | null>(null);

    const handleBranchAction = async (branch: BranchObject, action: 'activate' | 'deactivate' | 'block' | 'unblock' | 'delete' | 'restore') => {
        setBranchMenuId(null);
        setActionBusy(branch.uuid);
        if (action === 'activate')    await updateBranchStatus({ uuid: branch.uuid, body: { active: true } });
        else if (action === 'deactivate') await updateBranchStatus({ uuid: branch.uuid, body: { active: false } });
        else if (action === 'block')      await updateBranchStatus({ uuid: branch.uuid, body: { blocked: true } });
        else if (action === 'unblock')    await updateBranchStatus({ uuid: branch.uuid, body: { blocked: false } });
        else if (action === 'delete')     await deleteBranch(branch.uuid);
        else if (action === 'restore')    await restoreBranch(branch.uuid);
        setActionBusy(null);
        refetchBranches();
    };

    const handleEmployeeAction = async (emp: EmployeeObject, action: 'activate' | 'deactivate' | 'block' | 'unblock' | 'delete' | 'restore') => {
        setEmployeeMenuId(null);
        setActionBusy(emp.uuid);
        if (action === 'activate')    await updateEmployeeStatus({ uuid: emp.uuid, body: { active: true } });
        else if (action === 'deactivate') await updateEmployeeStatus({ uuid: emp.uuid, body: { active: false } });
        else if (action === 'block')      await updateEmployeeStatus({ uuid: emp.uuid, body: { blocked: true } });
        else if (action === 'unblock')    await updateEmployeeStatus({ uuid: emp.uuid, body: { blocked: false } });
        else if (action === 'delete')     await deleteEmployee(emp.uuid);
        else if (action === 'restore')    await restoreEmployee(emp.uuid);
        setActionBusy(null);
        refetchEmployees();
    };

    if (providerLoading) {
        return (
            <div className={styles.page}>
                <button className={styles.backBtn} onClick={() => router.push('/providers')}><ArrowLeft size={16} /> {t('providers.title')}</button>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, color: 'var(--text-tertiary)' }}>
                    <Loader2 size={32} strokeWidth={1.5} style={{ animation: 'spin 1s linear infinite' }} />
                </div>
            </div>
        );
    }

    if (!apiProvider) {
        return (
            <div className={styles.page}>
                <button className={styles.backBtn} onClick={() => router.push('/providers')}><ArrowLeft size={16} /> {t('common.back')}</button>
                <div className={styles.notFound}>{t('providers.notFound')}</div>
            </div>
        );
    }

    const handleStatusChange = (newStatus: ProviderStatus) => {
        setProvider(prev => prev ? { ...prev, status: newStatus, deleted_at: newStatus === 'soft_deleted' ? new Date().toISOString() : null } : prev);
        setConfirmAction(null);
    };

    const handleImpersonate = () => {
        startImpersonating(apiProvider.uuid, apiProvider.name);
        addToast('info', `Now impersonating ${apiProvider.name}`);
    };

    const handleRenewSubscription = () => {
        setProvider(prev => prev ? { ...prev, subscription_status: 'active' } : prev);
        setShowRenew(false);
        addToast('success', 'Subscription renewed');
    };

    const handleChangePlan = () => {
        if (!selectedPlanId) return;
        const plan = mockPlans.find(p => p.uuid === selectedPlanId);
        if (!plan) return;
        setProvider(prev => prev ? { ...prev, subscription_plan_uuid: plan.uuid, subscription_status: 'active' } : prev);
        setShowChangePlan(false);
        setSelectedPlanId('');
        addToast('success', `Plan changed to ${plan.name}`);
    };

    const handleCancelSubscription = () => {
        setProvider(prev => prev ? { ...prev, subscription_status: 'cancelled' } : prev);
        setShowCancelSub(false);
        addToast('warning', 'Subscription cancelled');
    };

    const openCommission = () => {
        // Model stores a 0..1 fraction; the admin edits in percent (X4a).
        setCommissionRate(
            provider ? String(Math.round((provider.commission_rate ?? 0) * 1000) / 10) : '',
        );
        setCommissionDate(new Date().toISOString().slice(0, 10));
        setCommissionReason('');
        setShowCommission(true);
    };

    const handleCommission = () => {
        const pct = Number(commissionRate);
        if (!Number.isFinite(pct) || pct < 0 || pct > 50) {
            addToast('error', 'Commission must be between 0 and 50%');
            return;
        }
        // Admin edits in percent; the model stores a 0..1 fraction (X4a).
        setProvider(prev => prev ? { ...prev, commission_rate: pct / 100, updated_at: new Date().toISOString() } : prev);
        setShowCommission(false);
        addToast('success', `Commission set to ${pct}%`);
    };

    const handleExport = (type: 'bookings' | 'employees' | 'financial') => {
        if (!provider) return;
        setExportOpen(false);
        if (type === 'bookings') {
            exportToCSV(mockBookings, `provider-${provider.id}-bookings`);
        } else if (type === 'employees') {
            exportToCSV(employees ?? [], `provider-${provider.id}-employees`);
        } else {
            const summary = [{
                provider: provider.business_name,
                total_bookings: provider.total_bookings,
                total_revenue: toMajor(provider.total_revenue), // store is minor units (X4b)
                commission_rate: provider.commission_rate,
                commission_earned: toMajor(Math.round(provider.total_revenue * provider.commission_rate)),
                subscription_status: provider.subscription_status,
                generated_at: new Date().toISOString(),
            }];
            exportToCSV(summary, `provider-${provider.id}-financial-summary`);
        }
    };

    const stats = [
        { label: t('providers.branches'), value: (branches ?? []).length, icon: <Building2 size={18} /> },
        { label: t('providers.employees'), value: (employees ?? []).length, icon: <Users size={18} /> },
        { label: 'Joined', value: new Date(apiProvider.created_at).toLocaleDateString(), icon: <CalendarDays size={18} /> },
        { label: 'Category', value: apiProvider.category?.name ?? '—', icon: <DollarSign size={18} /> },
    ];

    const tabs: { key: string; label: string }[] = [
        { key: 'overview', label: t('providers.tabOverview') },
        { key: 'branches', label: t('providers.tabBranches') },
        { key: 'employees', label: t('providers.tabEmployees') },
        { key: 'services', label: t('providers.tabServices') },
        { key: 'bookings', label: t('providers.tabBookings') },
        { key: 'subscription', label: t('providers.tabSubscription') },
    ];

    return (
        <div className={styles.page}>
            <button className={styles.backBtn} onClick={() => router.push('/providers')}><ArrowLeft size={16} /> {t('providers.title')}</button>

            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.avatar}>{apiProvider.name.charAt(0)}</div>
                    <div>
                        <div className={styles.headerName}>
                            <h1>{tn(apiProvider.name, apiProvider.name_ar)}</h1>
                            <StatusBadge status={apiProvider.active ? 'active' : 'inactive'} />
                            {apiProvider.blocked && <StatusBadge status="blocked" />}
                            {apiProvider.banned && <StatusBadge status="banned" />}
                            {apiProvider.deleted_at && <StatusBadge status="deleted" />}
                        </div>
                        <div className={styles.headerMeta}>
                            <span><Mail size={14} /> {apiProvider.email}</span>
                            <span><Phone size={14} /> {apiProvider.phone}</span>
                            {apiProvider.category && <span><MapPin size={14} /> {apiProvider.category.name}</span>}
                        </div>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <PermissionGate module="providers" action="edit">
                        {!apiProvider.deleted_at && (apiProvider.active
                            ? <button className={styles.actionBtn} onClick={() => setConfirmAction({ action: 'suspended', label: 'Deactivate' })}><Pause size={14} /> Deactivate</button>
                            : <button className={styles.actionBtn} onClick={() => setConfirmAction({ action: 'active', label: 'Activate' })}><Play size={14} /> Activate</button>
                        )}
                        {!apiProvider.deleted_at && (apiProvider.blocked
                            ? <button className={styles.actionBtn} onClick={() => setConfirmAction({ action: 'unblock', label: 'Unblock' })}><ShieldCheck size={14} /> Unblock</button>
                            : <button className={`${styles.actionBtn} ${styles.dangerBtn}`} onClick={() => setConfirmAction({ action: 'block', label: 'Block' })}><Ban size={14} /> Block</button>
                        )}
                        {apiProvider.deleted_at && <button className={styles.actionBtn} onClick={() => setConfirmAction({ action: 'restore', label: 'Restore' })}><RotateCcw size={14} /> Restore</button>}
                    </PermissionGate>
                    <PermissionGate module="providers" action="impersonate">
                        {apiProvider.active && !apiProvider.deleted_at && <button className={`${styles.actionBtn} ${styles.impersonateBtn}`} onClick={handleImpersonate}><LogIn size={14} /> {t('providers.impersonate')}</button>}
                    </PermissionGate>
                    <PermissionGate module="providers" action="delete">
                        {!apiProvider.deleted_at && <button className={`${styles.actionBtn} ${styles.dangerBtn}`} onClick={() => setConfirmAction({ action: 'soft_deleted', label: 'Delete' })}><Trash2 size={14} /> Delete</button>}
                    </PermissionGate>
                </div>
            </div>

            {/* Stats */}
            <div className={styles.statsGrid}>
                {stats.map(s => (
                    <div key={s.label} className={styles.statCard}><div className={styles.statIcon}>{s.icon}</div><div><div className={styles.statValue}>{s.value}</div><div className={styles.statLabel}>{s.label}</div></div></div>
                ))}
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                {tabs.map(tab => (
                    <button key={tab.key} className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`} onClick={() => setActiveTab(tab.key)}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
                {activeTab === 'overview' && (
                    <div className={styles.overviewGrid}>
                        <div className={styles.infoCard}>
                            <h3>{t('providers.businessInfo')}</h3>
                            <div className={styles.infoRows}>
                                <InfoRow label="Name" value={tn(apiProvider.name, apiProvider.name_ar)} />
                                <InfoRow label="Email" value={apiProvider.email} />
                                <InfoRow label="Phone" value={apiProvider.phone} />
                                <InfoRow label={t('providers.category')} value={apiProvider.category?.name ?? '—'} />
                                <InfoRow label="Registered" value={new Date(apiProvider.created_at).toLocaleDateString()} />
                                {apiProvider.deleted_at && <InfoRow label="Deleted" value={new Date(apiProvider.deleted_at).toLocaleDateString()} />}
                            </div>
                        </div>
                        <div className={styles.infoCard}>
                            <h3>Account Status</h3>
                            <div className={styles.infoRows}>
                                <div className={styles.infoRow}><span>Active</span><span><StatusBadge status={apiProvider.active ? 'active' : 'inactive'} /></span></div>
                                <div className={styles.infoRow}><span>Blocked</span><span><StatusBadge status={apiProvider.blocked ? 'blocked' : 'active'} /></span></div>
                                <div className={styles.infoRow}><span>Banned</span><span><StatusBadge status={apiProvider.banned ? 'banned' : 'active'} /></span></div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'branches' && (
                    <div className={styles.infoCard}>
                        <h3>{t('providers.branches')} {!branchesLoading && `(${(branches ?? []).length})`}</h3>
                        {branchesLoading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, color: 'var(--text-tertiary)' }}>
                                <Loader2 size={24} strokeWidth={1.5} style={{ animation: 'spin 1s linear infinite' }} />
                            </div>
                        ) : (branches ?? []).length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>No branches found</div>
                        ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginTop: 16 }}>
                            <thead><tr style={{ background: 'var(--bg-secondary)' }}>
                                {['Branch', 'Phone', 'Main', 'Status', 'Actions'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>{h}</th>
                                ))}
                            </tr></thead>
                            <tbody>{(branches ?? []).map(b => (
                                <tr key={b.uuid} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '10px 12px', fontWeight: 500 }}>
                                        {b.name}
                                        {b.is_main && <span style={{ fontSize: '0.6875rem', padding: '1px 6px', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', borderRadius: 4, marginLeft: 8 }}>Main</span>}
                                        {b.deleted_at && <span style={{ fontSize: '0.6875rem', padding: '1px 6px', background: 'var(--color-error-light)', color: 'var(--color-error)', borderRadius: 4, marginLeft: 8 }}>Deleted</span>}
                                    </td>
                                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{b.phone ?? '—'}</td>
                                    <td style={{ padding: '10px 12px' }}>
                                        {b.is_main ? <CheckCircle2 size={16} color="var(--color-success)" /> : <XCircle size={16} color="var(--text-tertiary)" />}
                                    </td>
                                    <td style={{ padding: '10px 12px' }}>
                                        <StatusBadge status={b.deleted_at ? 'deleted' : b.blocked ? 'blocked' : b.active ? 'active' : 'inactive'} />
                                    </td>
                                    <td style={{ padding: '10px 12px' }}>
                                        {actionBusy === b.uuid ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : (
                                        <div style={{ position: 'relative' }}>
                                            <button onClick={e => { e.stopPropagation(); setBranchMenuId(branchMenuId === b.uuid ? null : b.uuid); }}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-secondary)', borderRadius: 6 }}>
                                                <MoreHorizontal size={16} />
                                            </button>
                                            {branchMenuId === b.uuid && (
                                                <div style={{ position: 'absolute', right: 0, top: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 50, minWidth: 150, padding: 4 }} onClick={e => e.stopPropagation()}>
                                                    {!b.deleted_at && (b.active
                                                        ? <button onClick={() => handleBranchAction(b, 'deactivate')} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: 6 }}><Pause size={14} /> Deactivate</button>
                                                        : <button onClick={() => handleBranchAction(b, 'activate')} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: 6 }}><Play size={14} /> Activate</button>
                                                    )}
                                                    {!b.deleted_at && (b.blocked
                                                        ? <button onClick={() => handleBranchAction(b, 'unblock')} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: 6 }}><ShieldCheck size={14} /> Unblock</button>
                                                        : <button onClick={() => handleBranchAction(b, 'block')} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-warning)', borderRadius: 6 }}><Ban size={14} /> Block</button>
                                                    )}
                                                    {b.deleted_at
                                                        ? <button onClick={() => handleBranchAction(b, 'restore')} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: 6 }}><RotateCcw size={14} /> Restore</button>
                                                        : <button onClick={() => handleBranchAction(b, 'delete')} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-error)', borderRadius: 6 }}><Trash2 size={14} /> Delete</button>
                                                    }
                                                </div>
                                            )}
                                        </div>
                                        )}
                                    </td>
                                </tr>
                            ))}</tbody>
                        </table>
                        )}
                    </div>
                )}

                {activeTab === 'employees' && (
                    <div className={styles.infoCard}>
                        <h3>{t('providers.employees')} {!employeesLoading && `(${(employees ?? []).length})`}</h3>
                        {employeesLoading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, color: 'var(--text-tertiary)' }}>
                                <Loader2 size={24} strokeWidth={1.5} style={{ animation: 'spin 1s linear infinite' }} />
                            </div>
                        ) : (employees ?? []).length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>No employees found</div>
                        ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginTop: 16 }}>
                            <thead><tr style={{ background: 'var(--bg-secondary)' }}>
                                {['Employee', 'Branch', 'Status', 'Blocked', 'Actions'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>{h}</th>
                                ))}
                            </tr></thead>
                            <tbody>{(employees ?? []).map(e => (
                                <tr key={e.uuid} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '10px 12px' }}>
                                        <div style={{ fontWeight: 600 }}>{e.name}</div>
                                        {e.email && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{e.email}</div>}
                                        {e.deleted_at && <span style={{ fontSize: '0.6875rem', padding: '1px 6px', background: 'var(--color-error-light)', color: 'var(--color-error)', borderRadius: 4 }}>Deleted</span>}
                                    </td>
                                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{e.branch?.name ?? '—'}</td>
                                    <td style={{ padding: '10px 12px' }}><StatusBadge status={e.active ? 'active' : 'inactive'} /></td>
                                    <td style={{ padding: '10px 12px' }}>
                                        {e.blocked ? <CheckCircle2 size={16} color="var(--color-error)" /> : <XCircle size={16} color="var(--text-tertiary)" />}
                                    </td>
                                    <td style={{ padding: '10px 12px' }}>
                                        {actionBusy === e.uuid ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : (
                                        <div style={{ position: 'relative' }}>
                                            <button onClick={ev => { ev.stopPropagation(); setEmployeeMenuId(employeeMenuId === e.uuid ? null : e.uuid); }}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-secondary)', borderRadius: 6 }}>
                                                <MoreHorizontal size={16} />
                                            </button>
                                            {employeeMenuId === e.uuid && (
                                                <div style={{ position: 'absolute', right: 0, top: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 50, minWidth: 150, padding: 4 }} onClick={ev => ev.stopPropagation()}>
                                                    {!e.deleted_at && (e.active
                                                        ? <button onClick={() => handleEmployeeAction(e, 'deactivate')} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: 6 }}><Pause size={14} /> Deactivate</button>
                                                        : <button onClick={() => handleEmployeeAction(e, 'activate')} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: 6 }}><Play size={14} /> Activate</button>
                                                    )}
                                                    {!e.deleted_at && (e.blocked
                                                        ? <button onClick={() => handleEmployeeAction(e, 'unblock')} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: 6 }}><ShieldCheck size={14} /> Unblock</button>
                                                        : <button onClick={() => handleEmployeeAction(e, 'block')} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-warning)', borderRadius: 6 }}><Ban size={14} /> Block</button>
                                                    )}
                                                    {e.deleted_at
                                                        ? <button onClick={() => handleEmployeeAction(e, 'restore')} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: 6 }}><RotateCcw size={14} /> Restore</button>
                                                        : <button onClick={() => handleEmployeeAction(e, 'delete')} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-error)', borderRadius: 6 }}><Trash2 size={14} /> Delete</button>
                                                    }
                                                </div>
                                            )}
                                        </div>
                                        )}
                                    </td>
                                </tr>
                            ))}</tbody>
                        </table>
                        )}
                    </div>
                )}

                {activeTab === 'services' && (
                    <div className={styles.infoCard}>
                        <h3>{t('providers.tabServices')} ({mockServices.length})</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginTop: 16 }}>
                            <thead><tr style={{ background: 'var(--bg-secondary)' }}>
                                {[t('common.service'), t('providers.category'), t('common.price'), t('common.duration'), t('providers.bookings'), t('common.status')].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>{h}</th>)}
                            </tr></thead>
                            <tbody>{mockServices.map(s => (
                                <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '10px 12px', fontWeight: 500 }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Scissors size={14} /> {s.name}</span></td>
                                    <td style={{ padding: '10px 12px' }}>{s.category}</td>
                                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>EGP {s.price}</td>
                                    <td style={{ padding: '10px 12px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)' }}><Clock size={14} /> {s.duration}m</span></td>
                                    <td style={{ padding: '10px 12px' }}>{s.bookings}</td>
                                    <td style={{ padding: '10px 12px' }}><StatusBadge status={s.active ? 'active' : 'deactivated'} /></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'bookings' && (
                    <div className={styles.infoCard}>
                        <h3>{t('providers.tabBookings')}</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginTop: 16 }}>
                            <thead><tr style={{ background: 'var(--bg-secondary)' }}>
                                {[t('common.bookingId'), t('common.customer'), t('common.service'), t('common.date'), t('common.time'), t('common.status')].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>{h}</th>)}
                            </tr></thead>
                            <tbody>{mockBookings.map(b => (
                                <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 500 }}>{b.id}</td>
                                    <td style={{ padding: '10px 12px', fontWeight: 500 }}>{b.customer}</td>
                                    <td style={{ padding: '10px 12px' }}>{b.service}</td>
                                    <td style={{ padding: '10px 12px' }}>{new Date(b.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '10px 12px' }}>{b.time}</td>
                                    <td style={{ padding: '10px 12px' }}><StatusBadge status={b.status} /></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'subscription' && (
                    <div className={styles.overviewGrid}>
                        <div className={styles.infoCard}>
                            <h3>{t('providers.currentPlan')}</h3>
                            <div className={styles.infoRows}>
                                <InfoRow label={t('providers.plan')} value={t('providers.noPlan')} />
                                <InfoRow label={t('providers.billingCycle')} value={t('providers.monthly')} />
                                <InfoRow label={t('common.amount')} value="—" />
                            </div>
                        </div>
                        <div className={styles.infoCard}>
                            <h3>{t('providers.subscriptionActions')}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                                <button style={{ padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setShowRenew(true)}><CreditCard size={16} /> {t('providers.renewSubscription')}</button>
                                <button style={{ padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--color-info)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setShowChangePlan(true)}><ExternalLink size={16} /> {t('providers.changePlan')}</button>
                                <button style={{ padding: '10px 16px', border: '1px solid var(--color-error-light)', borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--color-error)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setShowCancelSub(true)}><Trash2 size={16} /> {t('providers.cancelSubscription')}</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirm Action Modal */}
            <ConfirmModal
                open={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={() => handleStatusChange(confirmAction?.action as ProviderStatus)}
                title={`${confirmAction?.label} Provider`}
                message={`Are you sure you want to ${confirmAction?.label?.toLowerCase()} "${apiProvider.name}"?`}
                confirmLabel={confirmAction?.label || 'Confirm'}
                variant={confirmAction?.action === 'soft_deleted' || confirmAction?.action === 'blocked' ? 'danger' : 'warning'}
            />

            {/* Renew Subscription Modal */}
            <FormModal
                open={showRenew}
                onClose={() => setShowRenew(false)}
                title={`Renew Subscription — ${apiProvider.name}`}
                submitLabel={t('providers.renew')}
                onSubmit={e => { e.preventDefault(); handleRenewSubscription(); }}
            >
                <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: '0.875rem' }}>
                    <strong>{t('providers.currentStatus')}:</strong> Active
                </div>
                <FormField label={t('providers.billingCycle')} required>
                    <select value={renewCycle} onChange={e => setRenewCycle(e.target.value as 'monthly' | 'yearly')} className={shared.formInput}>
                        <option value="monthly">{t('providers.monthlyDays')}</option>
                        <option value="yearly">{t('providers.yearlyDays')}</option>
                    </select>
                </FormField>
                <div style={{ padding: 8, background: 'var(--color-success-light)', borderRadius: 6, fontSize: '0.8125rem', color: '#065f46' }}>
                    {t('providers.newPeriodEnds')}: <strong>{new Date(Date.now() + (renewCycle === 'yearly' ? 365 : 30) * 86400000).toLocaleDateString()}</strong>
                </div>
            </FormModal>

            {/* Change Plan Modal */}
            <FormModal
                open={showChangePlan}
                onClose={() => { setShowChangePlan(false); setSelectedPlanId(''); }}
                title={`Change Plan — ${apiProvider.name}`}
                submitLabel={t('providers.applyChange')}
                onSubmit={e => { e.preventDefault(); handleChangePlan(); }}
            >
                <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: '0.875rem' }}>
                    <strong>{t('providers.currentPlan')}:</strong> {t('providers.noPlan')}
                </div>
                <FormField label={t('providers.newPlan')} required>
                    <select value={selectedPlanId} onChange={e => setSelectedPlanId(e.target.value)} required className={shared.formInput}>
                        <option value="">{t('providers.selectPlan')}</option>
                        {mockPlans.filter(p => p.active).map(p => (
                            <option key={p.uuid} value={p.uuid}>{p.name} — {formatMoney(p.price_monthly)}/mo ({formatMoney(p.price_yearly)}/yr)</option>
                        ))}
                    </select>
                </FormField>
            </FormModal>

            {/* Cancel Subscription Confirm */}
            <ConfirmModal
                open={showCancelSub}
                onClose={() => setShowCancelSub(false)}
                onConfirm={handleCancelSubscription}
                title={`Cancel Subscription — ${apiProvider.name}`}
                message={`Are you sure you want to cancel the subscription for "${apiProvider.name}"? They will lose access at the end of the current billing period.`}
                confirmLabel={t('providers.cancelSubscription')}
                variant="danger"
            />

            {/* Adjust Commission */}
            <FormModal
                open={showCommission}
                onClose={() => setShowCommission(false)}
                title={`Adjust Commission — ${apiProvider.name}`}
                submitLabel={t('providers.saveCommission')}
                onSubmit={e => { e.preventDefault(); handleCommission(); }}
            >
                <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: '0.875rem' }}>
                    <strong>{t('providers.currentRate')}:</strong> {commissionRate}%
                </div>
                <FormField label={t('providers.newRate')} required>
                    <input type="number" min={0} max={50} step="0.5" value={commissionRate} onChange={e => setCommissionRate(e.target.value)} required className={shared.formInput} />
                </FormField>
                <FormField label={t('providers.effectiveDate')} required>
                    <input type="date" value={commissionDate} onChange={e => setCommissionDate(e.target.value)} required className={shared.formInput} />
                </FormField>
                <FormField label={t('common.reason')} required>
                    <textarea value={commissionReason} onChange={e => setCommissionReason(e.target.value)} required rows={3} className={shared.formInput} style={{ resize: 'vertical' }} placeholder={t('providers.commissionPlaceholder')} />
                </FormField>
            </FormModal>
        </div>
    );
}

function InfoRow({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
    return (
        <div className={styles.infoRow}>
            <span>{label}</span>
            <span style={capitalize ? { textTransform: 'capitalize' } : undefined}>{value}</span>
        </div>
    );
}
