'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { mockProviders } from '@/mocks/providers';
import {
    ArrowLeft,
    Building2,
    Users,
    CalendarDays,
    DollarSign,
    MapPin,
    Mail,
    Phone,
    Ban,
    ShieldCheck,
    Trash2,
    RotateCcw,
    LogIn,
    Pause,
    Play,
} from 'lucide-react';
import styles from './page.module.css';

export default function ProviderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview');

    const provider = mockProviders.find(p => p.id === id);

    if (!provider) {
        return (
            <div className={styles.page}>
                <button className={styles.backBtn} onClick={() => router.back()}>
                    <ArrowLeft size={16} /> Back
                </button>
                <div className={styles.notFound}>Provider not found</div>
            </div>
        );
    }

    const stats = [
        { label: 'Branches', value: provider.branches_count, icon: <Building2 size={18} /> },
        { label: 'Employees', value: provider.employees_count, icon: <Users size={18} /> },
        { label: 'Total Bookings', value: provider.total_bookings.toLocaleString(), icon: <CalendarDays size={18} /> },
        { label: 'Total Revenue', value: `EGP ${(provider.total_revenue / 1000).toFixed(0)}K`, icon: <DollarSign size={18} /> },
    ];

    const tabs = ['overview', 'branches', 'employees', 'services', 'bookings', 'subscription'];

    return (
        <div className={styles.page}>
            <button className={styles.backBtn} onClick={() => router.push('/providers')}>
                <ArrowLeft size={16} /> {t('providers.title')}
            </button>

            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.avatar}>{provider.business_name.charAt(0)}</div>
                    <div>
                        <div className={styles.headerName}>
                            <h1>{provider.business_name}</h1>
                            <StatusBadge status={provider.status} />
                            <StatusBadge status={provider.subscription_status} />
                        </div>
                        <div className={styles.headerMeta}>
                            <span><Mail size={14} /> {provider.email}</span>
                            <span><Phone size={14} /> {provider.phone}</span>
                            <span><MapPin size={14} /> {provider.city}, {provider.country}</span>
                        </div>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <PermissionGate module="providers" action="edit">
                        {provider.status === 'active' && (
                            <>
                                <button className={styles.actionBtn}><Pause size={14} /> {t('providers.suspend')}</button>
                                <button className={`${styles.actionBtn} ${styles.dangerBtn}`}><Ban size={14} /> {t('providers.block')}</button>
                            </>
                        )}
                        {provider.status === 'suspended' && (
                            <button className={styles.actionBtn}><Play size={14} /> {t('providers.activate')}</button>
                        )}
                        {provider.status === 'blocked' && (
                            <button className={styles.actionBtn}><ShieldCheck size={14} /> {t('providers.unblock')}</button>
                        )}
                        {provider.status === 'soft_deleted' && (
                            <button className={styles.actionBtn}><RotateCcw size={14} /> {t('providers.restore')}</button>
                        )}
                    </PermissionGate>
                    <PermissionGate module="providers" action="impersonate">
                        {provider.status === 'active' && (
                            <button className={`${styles.actionBtn} ${styles.impersonateBtn}`}>
                                <LogIn size={14} /> {t('providers.impersonate')}
                            </button>
                        )}
                    </PermissionGate>
                    <PermissionGate module="providers" action="delete">
                        {provider.status !== 'soft_deleted' && (
                            <button className={`${styles.actionBtn} ${styles.dangerBtn}`}>
                                <Trash2 size={14} /> {t('providers.softDelete')}
                            </button>
                        )}
                    </PermissionGate>
                </div>
            </div>

            {/* Stats */}
            <div className={styles.statsGrid}>
                {stats.map(s => (
                    <div key={s.label} className={styles.statCard}>
                        <div className={styles.statIcon}>{s.icon}</div>
                        <div>
                            <div className={styles.statValue}>{s.value}</div>
                            <div className={styles.statLabel}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                {tabs.map(tab => (
                    <button
                        key={tab}
                        className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
                {activeTab === 'overview' && (
                    <div className={styles.overviewGrid}>
                        <div className={styles.infoCard}>
                            <h3>Business Information</h3>
                            <div className={styles.infoRows}>
                                <div className={styles.infoRow}><span>Owner</span><span>{provider.name}</span></div>
                                <div className={styles.infoRow}><span>Category</span><span className={styles.capitalize}>{provider.business_category}</span></div>
                                <div className={styles.infoRow}><span>Commission Rate</span><span>{provider.commission_rate}%</span></div>
                                <div className={styles.infoRow}><span>Registered</span><span>{new Date(provider.registered_at).toLocaleDateString()}</span></div>
                                <div className={styles.infoRow}><span>Last Active</span><span>{new Date(provider.last_active_at).toLocaleDateString()}</span></div>
                                {provider.deleted_at && (
                                    <div className={styles.infoRow}><span>Deleted At</span><span>{new Date(provider.deleted_at).toLocaleDateString()}</span></div>
                                )}
                            </div>
                        </div>
                        <div className={styles.infoCard}>
                            <h3>Subscription Details</h3>
                            <div className={styles.infoRows}>
                                <div className={styles.infoRow}><span>Plan</span><span>{provider.subscription_plan_id ? 'Pro Plan' : 'No Plan'}</span></div>
                                <div className={styles.infoRow}><span>Status</span><span><StatusBadge status={provider.subscription_status} /></span></div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab !== 'overview' && (
                    <div className={styles.placeholderTab}>
                        <p>The {activeTab} tab content will be built in the next phase.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
