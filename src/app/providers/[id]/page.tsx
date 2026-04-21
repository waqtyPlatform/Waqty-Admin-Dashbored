'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { ConfirmModal, FormModal, FormField } from '@/components/admin/FormModal';
import { useToast } from '@/components/ui';
import { mockProviders } from '@/mocks/providers';
import { mockPlans } from '@/mocks/subscriptions';
import type { Provider, ProviderStatus } from '@/types/provider';
import {
    ArrowLeft, Building2, Users, CalendarDays, DollarSign, MapPin, Mail, Phone,
    Ban, ShieldCheck, Trash2, RotateCcw, LogIn, Pause, Play, ExternalLink,
    Clock, Star, CreditCard, Scissors, Percent, Download, ChevronDown,
} from 'lucide-react';
import { exportToCSV } from '@/lib/utils';
import styles from './page.module.css';
import shared from '@/components/admin/shared.module.css';

// Mock branch/employee/service/booking data for tabs
const mockBranches = [
    { id: '1', name: 'Main Branch - Downtown', city: 'Cairo', phone: '+20225750000', employees: 8, active: true, is_main: true },
    { id: '2', name: 'Maadi Branch', city: 'Cairo', phone: '+20225750001', employees: 6, active: true, is_main: false },
    { id: '3', name: 'Alexandria Branch', city: 'Alexandria', phone: '+20325750000', employees: 4, active: true, is_main: false },
];
const mockEmployees = [
    { id: '1', name: 'Ahmed Hassan', role: 'Senior Stylist', branch: 'Downtown', active: true, bookings: 142, rating: 4.8 },
    { id: '2', name: 'Sara Ibrahim', role: 'Hair Colorist', branch: 'Downtown', active: true, bookings: 98, rating: 4.9 },
    { id: '3', name: 'Omar Khalil', role: 'Junior Barber', branch: 'Maadi', active: true, bookings: 67, rating: 4.5 },
    { id: '4', name: 'Layla Mahmoud', role: 'Nail Technician', branch: 'Maadi', active: false, bookings: 45, rating: 4.3 },
    { id: '5', name: 'Khaled Nabil', role: 'Massage Therapist', branch: 'Alexandria', active: true, bookings: 89, rating: 4.7 },
];
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
    { id: 'BK-1003', customer: 'Layla Mahmoud', service: 'Keratin Treatment', date: '2026-04-13', time: '2:00 PM', status: 'confirmed' },
    { id: 'BK-1004', customer: 'Khaled Samir', service: 'Beard Trim', date: '2026-04-12', time: '3:00 PM', status: 'completed' },
    { id: 'BK-1005', customer: 'Reem Adel', service: 'Haircut', date: '2026-04-12', time: '4:00 PM', status: 'cancelled' },
    { id: 'BK-1006', customer: 'Youssef Nabil', service: 'Hair Color', date: '2026-04-11', time: '10:00 AM', status: 'no_show' },
];

export default function ProviderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { startImpersonating } = useAuth();
    const { addToast } = useToast();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview');
    const [provider, setProvider] = useState<Provider | undefined>(() => mockProviders.find(p => p.id === id));
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

    if (!provider) {
        return (
            <div className={styles.page}>
                <button className={styles.backBtn} onClick={() => router.push('/providers')}><ArrowLeft size={16} /> Back</button>
                <div className={styles.notFound}>Provider not found</div>
            </div>
        );
    }

    const handleStatusChange = (newStatus: ProviderStatus) => {
        setProvider(prev => prev ? { ...prev, status: newStatus, deleted_at: newStatus === 'soft_deleted' ? new Date().toISOString() : null } : prev);
        setConfirmAction(null);
    };

    const handleImpersonate = () => {
        startImpersonating(provider.id, provider.business_name || provider.name);
        addToast('info', `Now impersonating ${provider.business_name}`);
    };

    const handleRenewSubscription = () => {
        setProvider(prev => prev ? { ...prev, subscription_status: 'active' } : prev);
        setShowRenew(false);
        addToast('success', 'Subscription renewed');
    };

    const handleChangePlan = () => {
        if (!selectedPlanId) return;
        const plan = mockPlans.find(p => p.id === selectedPlanId);
        if (!plan) return;
        setProvider(prev => prev ? { ...prev, subscription_plan_id: plan.id, subscription_status: 'active' } : prev);
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
        setCommissionRate(String(provider?.commission_rate ?? ''));
        setCommissionDate(new Date().toISOString().slice(0, 10));
        setCommissionReason('');
        setShowCommission(true);
    };

    const handleCommission = () => {
        const rate = Number(commissionRate);
        if (!Number.isFinite(rate) || rate < 0 || rate > 50) {
            addToast('error', 'Commission must be between 0 and 50%');
            return;
        }
        setProvider(prev => prev ? { ...prev, commission_rate: rate, updated_at: new Date().toISOString() } : prev);
        setShowCommission(false);
        addToast('success', `Commission set to ${rate}%`);
    };

    const handleExport = (type: 'bookings' | 'employees' | 'financial') => {
        if (!provider) return;
        setExportOpen(false);
        if (type === 'bookings') {
            exportToCSV(mockBookings, `provider-${provider.id}-bookings`);
        } else if (type === 'employees') {
            exportToCSV(mockEmployees, `provider-${provider.id}-employees`);
        } else {
            const summary = [{
                provider: provider.business_name,
                total_bookings: provider.total_bookings,
                total_revenue: provider.total_revenue,
                commission_rate: provider.commission_rate,
                commission_earned: Math.round(provider.total_revenue * provider.commission_rate / 100),
                subscription_status: provider.subscription_status,
                generated_at: new Date().toISOString(),
            }];
            exportToCSV(summary, `provider-${provider.id}-financial-summary`);
        }
    };

    const stats = [
        { label: 'Branches', value: provider.branches_count, icon: <Building2 size={18} /> },
        { label: 'Employees', value: provider.employees_count, icon: <Users size={18} /> },
        { label: 'Total Bookings', value: provider.total_bookings.toLocaleString(), icon: <CalendarDays size={18} /> },
        { label: 'Total Revenue', value: `EGP ${(provider.total_revenue / 1000).toFixed(0)}K`, icon: <DollarSign size={18} /> },
    ];

    const tabs = ['overview', 'branches', 'employees', 'services', 'bookings', 'subscription'];

    return (
        <div className={styles.page}>
            <button className={styles.backBtn} onClick={() => router.push('/providers')}><ArrowLeft size={16} /> {t('providers.title')}</button>

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
                        {provider.status === 'active' && <>
                            <button className={styles.actionBtn} onClick={() => setConfirmAction({ action: 'suspended', label: 'Suspend' })}><Pause size={14} /> {t('providers.suspend')}</button>
                            <button className={`${styles.actionBtn} ${styles.dangerBtn}`} onClick={() => setConfirmAction({ action: 'blocked', label: 'Block' })}><Ban size={14} /> {t('providers.block')}</button>
                        </>}
                        {provider.status === 'suspended' && <button className={styles.actionBtn} onClick={() => handleStatusChange('active')}><Play size={14} /> {t('providers.activate')}</button>}
                        {provider.status === 'blocked' && <button className={styles.actionBtn} onClick={() => handleStatusChange('active')}><ShieldCheck size={14} /> {t('providers.unblock')}</button>}
                        {provider.status === 'soft_deleted' && <button className={styles.actionBtn} onClick={() => handleStatusChange('active')}><RotateCcw size={14} /> {t('providers.restore')}</button>}
                    </PermissionGate>
                    <PermissionGate module="providers" action="impersonate">
                        {provider.status === 'active' && <button className={`${styles.actionBtn} ${styles.impersonateBtn}`} onClick={handleImpersonate}><LogIn size={14} /> {t('providers.impersonate')}</button>}
                    </PermissionGate>
                    <PermissionGate module="providers" action="edit">
                        <button className={styles.actionBtn} onClick={openCommission}><Percent size={14} /> Adjust Commission</button>
                    </PermissionGate>
                    <div style={{ position: 'relative' }}>
                        <button className={styles.actionBtn} onClick={() => setExportOpen(o => !o)}><Download size={14} /> Export <ChevronDown size={14} /></button>
                        {exportOpen && (
                            <>
                                <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setExportOpen(false)} />
                                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', insetInlineEnd: 0, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, boxShadow: '0 10px 30px rgba(0,0,0,0.12)', minWidth: 220, zIndex: 11, padding: 4 }}>
                                    <button onClick={() => handleExport('bookings')} style={{ width: '100%', textAlign: 'start', padding: '8px 12px', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.8125rem', borderRadius: 6 }}>Bookings CSV</button>
                                    <button onClick={() => handleExport('employees')} style={{ width: '100%', textAlign: 'start', padding: '8px 12px', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.8125rem', borderRadius: 6 }}>Employees CSV</button>
                                    <button onClick={() => handleExport('financial')} style={{ width: '100%', textAlign: 'start', padding: '8px 12px', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.8125rem', borderRadius: 6 }}>Financial Summary CSV</button>
                                </div>
                            </>
                        )}
                    </div>
                    <PermissionGate module="providers" action="delete">
                        {provider.status !== 'soft_deleted' && <button className={`${styles.actionBtn} ${styles.dangerBtn}`} onClick={() => setConfirmAction({ action: 'soft_deleted', label: 'Delete' })}><Trash2 size={14} /> {t('providers.softDelete')}</button>}
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
                    <button key={tab} className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`} onClick={() => setActiveTab(tab)}>
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
                                <InfoRow label="Owner" value={provider.name} />
                                <InfoRow label="Category" value={provider.business_category} capitalize />
                                <InfoRow label="Commission Rate" value={`${provider.commission_rate}%`} />
                                <InfoRow label="Registered" value={new Date(provider.registered_at).toLocaleDateString()} />
                                <InfoRow label="Last Active" value={new Date(provider.last_active_at).toLocaleDateString()} />
                                {provider.deleted_at && <InfoRow label="Deleted At" value={new Date(provider.deleted_at).toLocaleDateString()} />}
                            </div>
                        </div>
                        <div className={styles.infoCard}>
                            <h3>Subscription Details</h3>
                            <div className={styles.infoRows}>
                                <InfoRow label="Plan" value={provider.subscription_plan_id ? 'Enterprise' : 'No Plan'} />
                                <div className={styles.infoRow}><span>Status</span><span><StatusBadge status={provider.subscription_status} /></span></div>
                                <InfoRow label="Billing" value="Monthly" />
                                <InfoRow label="Auto-Renew" value="Yes" />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'branches' && (
                    <div className={styles.infoCard}>
                        <h3>Branches ({mockBranches.length})</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginTop: 16 }}>
                            <thead><tr style={{ background: 'var(--bg-secondary)' }}>
                                {['Branch', 'City', 'Phone', 'Employees', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>{h}</th>)}
                            </tr></thead>
                            <tbody>{mockBranches.map(b => (
                                <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '10px 12px', fontWeight: 500 }}>{b.name} {b.is_main && <span style={{ fontSize: '0.6875rem', padding: '1px 6px', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', borderRadius: 4, marginLeft: 8 }}>Main</span>}</td>
                                    <td style={{ padding: '10px 12px' }}>{b.city}</td>
                                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{b.phone}</td>
                                    <td style={{ padding: '10px 12px' }}>{b.employees}</td>
                                    <td style={{ padding: '10px 12px' }}><StatusBadge status={b.active ? 'active' : 'deactivated'} /></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'employees' && (
                    <div className={styles.infoCard}>
                        <h3>Employees ({mockEmployees.length})</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginTop: 16 }}>
                            <thead><tr style={{ background: 'var(--bg-secondary)' }}>
                                {['Employee', 'Role', 'Branch', 'Bookings', 'Rating', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>{h}</th>)}
                            </tr></thead>
                            <tbody>{mockEmployees.map(e => (
                                <tr key={e.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '10px 12px', fontWeight: 500 }}>{e.name}</td>
                                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{e.role}</td>
                                    <td style={{ padding: '10px 12px' }}>{e.branch}</td>
                                    <td style={{ padding: '10px 12px' }}>{e.bookings}</td>
                                    <td style={{ padding: '10px 12px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Star size={14} fill="#f59e0b" stroke="#f59e0b" /> {e.rating}</span></td>
                                    <td style={{ padding: '10px 12px' }}><StatusBadge status={e.active ? 'active' : 'deactivated'} /></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'services' && (
                    <div className={styles.infoCard}>
                        <h3>Services ({mockServices.length})</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginTop: 16 }}>
                            <thead><tr style={{ background: 'var(--bg-secondary)' }}>
                                {['Service', 'Category', 'Price', 'Duration', 'Bookings', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>{h}</th>)}
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
                        <h3>Recent Bookings</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginTop: 16 }}>
                            <thead><tr style={{ background: 'var(--bg-secondary)' }}>
                                {['Booking ID', 'Customer', 'Service', 'Date', 'Time', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>{h}</th>)}
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
                            <h3>Current Plan</h3>
                            <div className={styles.infoRows}>
                                <InfoRow label="Plan" value={provider.subscription_plan_id ? 'Enterprise' : 'No Plan'} />
                                <div className={styles.infoRow}><span>Status</span><span><StatusBadge status={provider.subscription_status} /></span></div>
                                <InfoRow label="Billing Cycle" value="Monthly" />
                                <InfoRow label="Amount" value="EGP 1,299/month" />
                                <InfoRow label="Current Period" value="Apr 1 - Apr 30, 2026" />
                                <InfoRow label="Auto-Renew" value="Yes" />
                            </div>
                        </div>
                        <div className={styles.infoCard}>
                            <h3>Subscription Actions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                                <button style={{ padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setShowRenew(true)}><CreditCard size={16} /> Renew Subscription</button>
                                <button style={{ padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--color-info)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => { setSelectedPlanId(provider.subscription_plan_id || ''); setShowChangePlan(true); }}><ExternalLink size={16} /> Change Plan</button>
                                <button style={{ padding: '10px 16px', border: '1px solid var(--color-error-light)', borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--color-error)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setShowCancelSub(true)}><Trash2 size={16} /> Cancel Subscription</button>
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
                message={`Are you sure you want to ${confirmAction?.label?.toLowerCase()} "${provider.business_name}"? ${confirmAction?.action === 'soft_deleted' ? 'The provider data will be preserved but hidden from the platform.' : confirmAction?.action === 'blocked' ? 'The provider will not be able to log in or receive bookings.' : 'The provider account will be temporarily suspended.'}`}
                confirmLabel={confirmAction?.label || 'Confirm'}
                variant={confirmAction?.action === 'soft_deleted' || confirmAction?.action === 'blocked' ? 'danger' : 'warning'}
            />

            {/* Renew Subscription Modal */}
            <FormModal
                open={showRenew}
                onClose={() => setShowRenew(false)}
                title={`Renew Subscription — ${provider.business_name}`}
                submitLabel="Renew"
                onSubmit={e => { e.preventDefault(); handleRenewSubscription(); }}
            >
                <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: '0.875rem' }}>
                    <strong>Current status:</strong> {provider.subscription_status}
                </div>
                <FormField label="Billing Cycle" required>
                    <select value={renewCycle} onChange={e => setRenewCycle(e.target.value as 'monthly' | 'yearly')} className={shared.formInput}>
                        <option value="monthly">Monthly (30 days)</option>
                        <option value="yearly">Yearly (365 days)</option>
                    </select>
                </FormField>
                <div style={{ padding: 8, background: 'var(--color-success-light)', borderRadius: 6, fontSize: '0.8125rem', color: '#065f46' }}>
                    New period ends: <strong>{new Date(Date.now() + (renewCycle === 'yearly' ? 365 : 30) * 86400000).toLocaleDateString()}</strong>
                </div>
            </FormModal>

            {/* Change Plan Modal */}
            <FormModal
                open={showChangePlan}
                onClose={() => { setShowChangePlan(false); setSelectedPlanId(''); }}
                title={`Change Plan — ${provider.business_name}`}
                submitLabel="Apply Change"
                onSubmit={e => { e.preventDefault(); handleChangePlan(); }}
            >
                <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: '0.875rem' }}>
                    <strong>Current plan:</strong> {mockPlans.find(p => p.id === provider.subscription_plan_id)?.name || 'No plan'}
                </div>
                <FormField label="New Plan" required>
                    <select value={selectedPlanId} onChange={e => setSelectedPlanId(e.target.value)} required className={shared.formInput}>
                        <option value="">Select a plan...</option>
                        {mockPlans.filter(p => p.active).map(p => (
                            <option key={p.id} value={p.id}>{p.name} — EGP {p.price_monthly}/mo (EGP {p.price_yearly}/yr)</option>
                        ))}
                    </select>
                </FormField>
            </FormModal>

            {/* Cancel Subscription Confirm */}
            <ConfirmModal
                open={showCancelSub}
                onClose={() => setShowCancelSub(false)}
                onConfirm={handleCancelSubscription}
                title={`Cancel Subscription — ${provider.business_name}`}
                message={`Are you sure you want to cancel the subscription for "${provider.business_name}"? They will lose access at the end of the current billing period.`}
                confirmLabel="Cancel Subscription"
                variant="danger"
            />

            {/* Adjust Commission */}
            <FormModal
                open={showCommission}
                onClose={() => setShowCommission(false)}
                title={`Adjust Commission — ${provider.business_name}`}
                submitLabel="Save commission"
                onSubmit={e => { e.preventDefault(); handleCommission(); }}
            >
                <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: '0.875rem' }}>
                    <strong>Current rate:</strong> {provider.commission_rate}%
                </div>
                <FormField label="New commission rate (%)" required>
                    <input type="number" min={0} max={50} step="0.5" value={commissionRate} onChange={e => setCommissionRate(e.target.value)} required className={shared.formInput} />
                </FormField>
                <FormField label="Effective date" required>
                    <input type="date" value={commissionDate} onChange={e => setCommissionDate(e.target.value)} required className={shared.formInput} />
                </FormField>
                <FormField label="Reason" required>
                    <textarea value={commissionReason} onChange={e => setCommissionReason(e.target.value)} required rows={3} className={shared.formInput} style={{ resize: 'vertical' }} placeholder="Why is the commission rate changing?" />
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
