'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { ConfirmModal } from '@/components/admin/FormModal';
import { useToast } from '@/components/ui';
import { useApiQuery } from '@/hooks/useApiQuery';
import {
    adminProvidersApi,
    adminBookingsApi,
    type AdminProviderObject,
} from '@/lib/api';
import { mockPlans, mockSubscriptions } from '@/mocks/subscriptions';
import { mockProviders } from '@/mocks/providers';
import { toMajor } from '@/lib/market';
import type { Provider, ProviderStatus } from '@/types/provider';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { exportToCSV } from '@/lib/utils';
import styles from './page.module.css';
import { ProviderHeader } from './_components/ProviderHeader';
import { ProviderStatsCards } from './_components/ProviderStatsCards';
import { OverviewTab } from './tabs/OverviewTab';
import { BranchesTab } from './tabs/BranchesTab';
import { EmployeesTab } from './tabs/EmployeesTab';
import { ServicesTab } from './tabs/ServicesTab';
import { BookingsTab, mockBookings, bookingToRow } from './tabs/BookingsTab';
import { FinancialsTab } from './tabs/FinancialsTab';
import { SubscriptionTab } from './tabs/SubscriptionTab';
import { CommissionModal } from './modals/CommissionModal';
import { RenewSubscriptionModal } from './modals/RenewSubscriptionModal';
import { ChangePlanModal } from './modals/ChangePlanModal';

export default function ProviderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { startImpersonating } = useAuth();
    const { addToast } = useToast();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview');
    const [provider, setProvider] = useState<Provider | undefined>(undefined);
    const [confirmAction, setConfirmAction] = useState<{ action: string; label: string } | null>(null);
    const [showRenew, setShowRenew] = useState(false);
    const [showChangePlan, setShowChangePlan] = useState(false);
    const [showCancelSub, setShowCancelSub] = useState(false);
    const [showCommission, setShowCommission] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);

    // ── Real API: provider detail ─────────────────────────
    const providerUuid = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
    // The admin Provider mock holds the financial aggregates the API object lacks
    // (revenue, commission, bookings, subscription) AND doubles as an offline
    // fallback so the page is usable when /admin/providers/{uuid} is unreachable
    // (dev/demo) instead of dead-ending on "Provider not found".
    const mockMatch = mockProviders.find(p => p.uuid === providerUuid || p.id === providerUuid);
    const fallbackProvider: AdminProviderObject | undefined = mockMatch
        ? {
              uuid: mockMatch.uuid,
              name: mockMatch.name,
              name_ar: mockMatch.name_ar,
              email: mockMatch.email,
              phone: mockMatch.phone,
              active: mockMatch.status === 'active',
              blocked: mockMatch.status === 'blocked',
              banned: false,
              category: { uuid: `cat-${mockMatch.business_category}`, name: mockMatch.business_category },
              created_at: mockMatch.created_at,
              updated_at: mockMatch.updated_at,
              deleted_at: mockMatch.deleted_at,
          }
        : undefined;

    const { data: apiProvider, loading: providerLoading, refetch: refetchProvider } = useApiQuery(
        () => adminProvidersApi.get(providerUuid),
        [providerUuid],
        { enabled: !!providerUuid, fallbackData: fallbackProvider }
    );

    // Real bookings for this provider — lifted to the page so the Bookings tab AND the
    // header CSV export render the same wired rows (falls back to mock when unreachable).
    const { data: apiBookings } = useApiQuery(
        () => adminBookingsApi.list({ provider_uuid: providerUuid, per_page: 50 }),
        [providerUuid],
        { enabled: !!providerUuid }
    );
    const bookingRows = apiBookings && apiBookings.length ? apiBookings.map(bookingToRow) : mockBookings;

    // Seed local Provider state (financial aggregates + subscription) from the mock
    // so the Financials tab + commission/subscription actions operate on real numbers
    // instead of an uninitialised `undefined`.
    useEffect(() => {
        setProvider(mockMatch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [providerUuid]);

    if (providerLoading) {
        return (
            <div className={styles.page}>
                <button className={styles.backBtn} onClick={() => router.push('/providers')}><ArrowLeft size={16} /> {t('providers.title')}</button>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-20)', color: 'var(--text-tertiary)' }}>
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

    const handleStatusChange = async (newStatus: ProviderStatus) => {
        const uuid = apiProvider?.uuid ?? providerUuid;
        // Optimistic local update — drives the Financials/Subscription tabs and stands
        // as the offline/dev fallback if the API is unreachable.
        setProvider(prev => prev ? { ...prev, status: newStatus, deleted_at: newStatus === 'soft_deleted' ? new Date().toISOString() : null } : prev);
        setConfirmAction(null);
        if (!uuid) return;
        try {
            switch (newStatus as string) {
                case 'active':       await adminProvidersApi.toggleActive(uuid, true); break;
                case 'suspended':    await adminProvidersApi.toggleActive(uuid, false); break;
                case 'block':        await adminProvidersApi.block(uuid, true); break;
                case 'unblock':      await adminProvidersApi.block(uuid, false); break;
                case 'soft_deleted': await adminProvidersApi.delete(uuid); break;
                case 'restore':      await adminProvidersApi.restore(uuid); break;
                default: return;
            }
            // Re-pull the canonical provider so the header badges reflect server truth.
            await refetchProvider();
        } catch {
            // API unreachable — the optimistic local update already applied (offline/dev).
        }
    };

    const handleImpersonate = () => {
        startImpersonating(apiProvider.uuid, apiProvider.name);
        addToast('info', t('providers.toastNowImpersonating').replace('{name}', apiProvider.name));
    };

    const handleRenewSubscription = () => {
        setProvider(prev => prev ? { ...prev, subscription_status: 'active' } : prev);
        setShowRenew(false);
        addToast('success', t('subscriptions.toastRenewed'));
    };

    const handleChangePlan = (selectedPlanId: string) => {
        if (!selectedPlanId) return;
        const plan = mockPlans.find(p => p.uuid === selectedPlanId);
        if (!plan) return;
        setProvider(prev => prev ? { ...prev, subscription_plan_uuid: plan.uuid, subscription_status: 'active' } : prev);
        setShowChangePlan(false);
        addToast('success', t('providers.toastPlanChanged').replace('{plan}', plan.name));
    };

    const handleCancelSubscription = () => {
        setProvider(prev => prev ? { ...prev, subscription_status: 'cancelled' } : prev);
        setShowCancelSub(false);
        addToast('warning', t('subscriptions.toastCancelled').replace('{name}', apiProvider.name));
    };

    const openCommission = () => {
        setShowCommission(true);
    };

    const handleCommission = (pct: number) => {
        if (!Number.isFinite(pct) || pct < 0 || pct > 50) {
            addToast('error', t('providers.commissionRangeError'));
            return;
        }
        // Admin edits in percent; the model stores a 0..1 fraction (X4a).
        setProvider(prev => prev ? { ...prev, commission_rate: pct / 100, updated_at: new Date().toISOString() } : prev);
        setShowCommission(false);
        addToast('success', t('providers.toastCommissionSet').replace('{rate}', String(pct)));
    };

    const handleExport = (type: 'bookings' | 'employees' | 'financial') => {
        if (!provider) return;
        setExportOpen(false);
        if (type === 'bookings') {
            exportToCSV(bookingRows, `provider-${provider.id}-bookings`);
        } else if (type === 'employees') {
            exportToCSV([], `provider-${provider.id}-employees`);
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

    const branchesCount = mockMatch?.branches_count || 0;
    const employeesCount = mockMatch?.employees_count || 0;

    // Saved commission rate (model stores a 0..1 fraction; admin reads/edits percent).
    const savedCommissionPct = provider != null ? Math.round((provider.commission_rate ?? 0) * 1000) / 10 : null;

    // The provider's live subscription row (flat plan OR commission billing) — binds
    // the Subscription tab to real data instead of the old "No Plan" stub.
    const providerSub = provider ? mockSubscriptions.find(s => s.provider_uuid === provider.uuid) : undefined;

    const tabs: { key: string; label: string }[] = [
        { key: 'overview', label: t('providers.tabOverview') },
        { key: 'branches', label: t('providers.tabBranches') },
        { key: 'employees', label: t('providers.tabEmployees') },
        { key: 'services', label: t('providers.tabServices') },
        { key: 'bookings', label: t('providers.tabBookings') },
        { key: 'financials', label: t('providers.tabFinancials') },
        { key: 'subscription', label: t('providers.tabSubscription') },
    ];

    return (
        <div className={styles.page}>
            <button className={styles.backBtn} onClick={() => router.push('/providers')}><ArrowLeft size={16} /> {t('providers.title')}</button>

            {/* Header */}
            <ProviderHeader
                apiProvider={apiProvider}
                onSetConfirmAction={setConfirmAction}
                onImpersonate={handleImpersonate}
            />

            {/* Stats */}
            <ProviderStatsCards
                apiProvider={apiProvider}
                branchesCount={branchesCount}
                employeesCount={employeesCount}
            />

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
                {activeTab === 'overview' && <OverviewTab apiProvider={apiProvider} />}
                {activeTab === 'branches' && <BranchesTab providerUuid={providerUuid} />}
                {activeTab === 'employees' && <EmployeesTab providerUuid={providerUuid} />}
                {activeTab === 'services' && <ServicesTab providerUuid={providerUuid} />}
                {activeTab === 'bookings' && <BookingsTab rows={bookingRows} />}
                {activeTab === 'financials' && (
                    <FinancialsTab
                        provider={provider}
                        savedCommissionPct={savedCommissionPct}
                        onAdjustCommission={openCommission}
                        onExport={() => handleExport('financial')}
                    />
                )}
                {activeTab === 'subscription' && (
                    <SubscriptionTab
                        providerSub={providerSub}
                        onRenew={() => setShowRenew(true)}
                        onChangePlan={() => setShowChangePlan(true)}
                        onCancel={() => setShowCancelSub(true)}
                    />
                )}
            </div>

            {/* Confirm Action Modal */}
            <ConfirmModal
                open={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={() => handleStatusChange(confirmAction?.action as ProviderStatus)}
                title={(confirmAction?.label ?? '') + ' ' + t('providers.providerWord')}
                message={t('providers.confirmBody').replace('{action}', confirmAction?.label?.toLowerCase() ?? '').replace('{name}', apiProvider.name)}
                confirmLabel={confirmAction?.label || t('common.confirm')}
                variant={confirmAction?.action === 'soft_deleted' || confirmAction?.action === 'blocked' ? 'danger' : 'warning'}
            />

            {/* Renew Subscription Modal */}
            <RenewSubscriptionModal
                open={showRenew}
                onClose={() => setShowRenew(false)}
                providerName={apiProvider.name}
                onSubmit={handleRenewSubscription}
            />

            {/* Change Plan Modal */}
            <ChangePlanModal
                open={showChangePlan}
                onClose={() => setShowChangePlan(false)}
                onSubmit={handleChangePlan}
            />

            {/* Cancel Subscription Confirm */}
            <ConfirmModal
                open={showCancelSub}
                onClose={() => setShowCancelSub(false)}
                onConfirm={handleCancelSubscription}
                title={t('providers.cancelSubscription')}
                message={t('subscriptions.cancelConfirmMessage').replace('{name}', apiProvider.name)}
                confirmLabel={t('providers.cancelSubscription')}
                variant="danger"
            />

            {/* Adjust Commission */}
            <CommissionModal
                open={showCommission}
                onClose={() => setShowCommission(false)}
                savedCommissionPct={savedCommissionPct}
                initialRate={provider ? String(Math.round((provider.commission_rate ?? 0) * 1000) / 10) : ''}
                onSubmit={handleCommission}
            />
        </div>
    );
}
