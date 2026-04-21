'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { FormModal, FormField, ConfirmModal } from '@/components/admin/FormModal';
import { mockUsers, mockWalletTransactions } from '@/mocks/users';
import { mockReviews } from '@/mocks/reviews';
import {
    ArrowLeft, Mail, Phone, MapPin, Calendar, DollarSign, CalendarDays,
    Star, Wallet, Ban, ShieldCheck, Trash2, RotateCcw, Pause, Plus, Minus,
    Send, CreditCard,
} from 'lucide-react';
import shared from '@/components/admin/shared.module.css';

export default function UserDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview');
    const [walletModal, setWalletModal] = useState<'add' | 'deduct' | null>(null);
    const [confirmAction, setConfirmAction] = useState<string | null>(null);
    const [showNotify, setShowNotify] = useState(false);
    const [notifyForm, setNotifyForm] = useState({ title: '', body: '', platform: 'both' as 'user_app' | 'email' | 'both' });
    const [sentNotifications, setSentNotifications] = useState<{ id: string; title: string; body: string; platform: string; sent_at: string }[]>([]);

    const user = mockUsers.find(u => u.id === id);
    const userReviews = mockReviews.filter(r => r.user_id === id);
    const userWalletTxns = mockWalletTransactions.filter(t => t.wallet_id === `wal-${id}`);
    const userBookings = [
        { id: `BK-${id}-01`, provider: 'Elite Beauty Salon', service: 'Hair Color', date: '2026-04-15', status: 'completed', amount: 350 },
        { id: `BK-${id}-02`, provider: 'Royal Spa & Wellness', service: 'Massage Therapy', date: '2026-04-10', status: 'completed', amount: 600 },
        { id: `BK-${id}-03`, provider: 'Glamour Nails', service: 'Gel Manicure', date: '2026-04-05', status: 'confirmed', amount: 180 },
        { id: `BK-${id}-04`, provider: 'Elite Beauty Salon', service: 'Haircut', date: '2026-03-28', status: 'completed', amount: 150 },
        { id: `BK-${id}-05`, provider: 'Modern Barbershop', service: 'Beard Trim', date: '2026-03-20', status: 'cancelled', amount: 80 },
    ];

    if (!user) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>User not found</div>;

    const stats = [
        { label: 'Total Bookings', value: user.total_bookings, icon: <CalendarDays size={18} /> },
        { label: 'Total Spent', value: `EGP ${user.total_spent.toLocaleString()}`, icon: <DollarSign size={18} /> },
        { label: 'Wallet Balance', value: `EGP ${user.wallet_balance}`, icon: <Wallet size={18} /> },
        { label: 'Reviews', value: userReviews.length, icon: <Star size={18} /> },
    ];

    const tabs = ['overview', 'bookings', 'reviews', 'wallet'];

    return (
        <div className={shared.page}>
            <button onClick={() => router.push('/users')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 'none', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', width: 'fit-content', padding: '4px 0' }}>
                <ArrowLeft size={16} /> {t('users.title')}
            </button>

            {/* Header */}
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700, flexShrink: 0 }}>{user.name.charAt(0)}</div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <h1 className={shared.pageTitle} style={{ fontSize: '1.25rem' }}>{user.name}</h1>
                            <StatusBadge status={user.status} />
                        </div>
                        <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={14} /> {user.email}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={14} /> {user.phone}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {user.city}, {user.country}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={14} /> Joined {new Date(user.registered_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                    <PermissionGate module="users" action="edit">
                        {user.status === 'active' && <>
                            <ActionBtn icon={<Pause size={14} />} label="Suspend" onClick={() => setConfirmAction('suspend')} />
                            <ActionBtn icon={<Ban size={14} />} label="Block" onClick={() => setConfirmAction('block')} danger />
                        </>}
                        {user.status === 'blocked' && <ActionBtn icon={<ShieldCheck size={14} />} label="Unblock" onClick={() => setConfirmAction('unblock')} />}
                        {user.status === 'suspended' && <ActionBtn icon={<ShieldCheck size={14} />} label="Activate" onClick={() => setConfirmAction('activate')} />}
                    </PermissionGate>
                    <PermissionGate module="wallets" action="edit">
                        <ActionBtn icon={<Plus size={14} />} label="Add Funds" onClick={() => setWalletModal('add')} color="var(--color-success)" />
                    </PermissionGate>
                    <PermissionGate module="users" action="delete">
                        {user.status !== 'soft_deleted' && <ActionBtn icon={<Trash2 size={14} />} label="Delete" onClick={() => setConfirmAction('soft_delete')} danger />}
                    </PermissionGate>
                    <PermissionGate module="marketing" action="create">
                        <ActionBtn icon={<Send size={14} />} label="Notify" onClick={() => setShowNotify(true)} color="var(--color-info)" />
                    </PermissionGate>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {stats.map(s => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--color-primary-50)', color: 'var(--color-primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
                        <div><div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.label}</div></div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 4, overflowX: 'auto' }}>
                {tabs.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 16px', border: 'none', borderRadius: 8, background: activeTab === tab ? 'var(--color-primary-500)' : 'transparent', color: activeTab === tab ? 'white' : 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>{tab}</button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className={shared.formGrid2}>
                    <div className={shared.infoCard}>
                        <h3 className={shared.infoCardHeader}>Personal Information</h3>
                        <div className={shared.infoRows}>
                            {[
                                ['Gender', user.gender || 'Not set'],
                                ['Date of Birth', user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'Not set'],
                                ['Last Active', new Date(user.last_active_at).toLocaleDateString()],
                                ['Last Booking', user.last_booking_at ? new Date(user.last_booking_at).toLocaleDateString() : 'Never'],
                            ].map(([k, v]) => (
                                <div key={k} className={shared.infoRow}>
                                    <span>{k}</span>
                                    <span style={{ textTransform: 'capitalize' }}>{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={shared.infoCard}>
                        <h3 className={shared.infoCardHeader}>Account Details</h3>
                        <div className={shared.infoRows}>
                            {[
                                ['Status', user.status],
                                ['Registered', new Date(user.registered_at).toLocaleDateString()],
                                ['Total Spent', `EGP ${user.total_spent.toLocaleString()}`],
                                ['Wallet Balance', `EGP ${user.wallet_balance}`],
                            ].map(([k, v]) => (
                                <div key={k} className={shared.infoRow}>
                                    <span>{k}</span>
                                    <span style={{ textTransform: 'capitalize' }}>{String(v)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'reviews' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {userReviews.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12 }}>No reviews from this user</div>
                    ) : userReviews.map(r => (
                        <div key={r.id} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontWeight: 500 }}>{r.provider_name}</span>
                                    <div style={{ display: 'flex', gap: 1 }}>{Array.from({ length: 5 }, (_, i) => <Star key={i} size={12} fill={i < r.rating ? '#f59e0b' : 'none'} stroke={i < r.rating ? '#f59e0b' : 'var(--text-tertiary)'} />)}</div>
                                    <StatusBadge status={r.status} />
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{new Date(r.created_at).toLocaleDateString()}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{r.comment}</p>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'wallet' && (
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Wallet Transactions</h3>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => setWalletModal('add')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: 'var(--color-success)', cursor: 'pointer', fontSize: '0.8125rem', fontFamily: 'var(--font-sans)' }}><Plus size={14} /> Add</button>
                            <button onClick={() => setWalletModal('deduct')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-primary)', color: 'var(--color-error)', cursor: 'pointer', fontSize: '0.8125rem', fontFamily: 'var(--font-sans)' }}><Minus size={14} /> Deduct</button>
                        </div>
                    </div>
                    {userWalletTxns.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>No wallet transactions</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead><tr style={{ background: 'var(--bg-secondary)' }}>
                                {['Date', 'Type', 'Action', 'Amount', 'Balance After', 'Description'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>{h}</th>)}
                            </tr></thead>
                            <tbody>{userWalletTxns.map(txn => (
                                <tr key={txn.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '10px 12px' }}>{new Date(txn.created_at).toLocaleDateString()}</td>
                                    <td style={{ padding: '10px 12px' }}><span style={{ color: txn.type === 'credit' ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>{txn.type}</span></td>
                                    <td style={{ padding: '10px 12px', textTransform: 'capitalize' }}>{txn.action.replace('_', ' ')}</td>
                                    <td style={{ padding: '10px 12px', fontWeight: 600, color: txn.type === 'credit' ? 'var(--color-success)' : 'var(--color-error)' }}>{txn.type === 'credit' ? '+' : '-'}EGP {txn.amount}</td>
                                    <td style={{ padding: '10px 12px' }}>EGP {txn.balance_after}</td>
                                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{txn.description}</td>
                                </tr>
                            ))}</tbody>
                        </table>
                    )}
                </div>
            )}

            {activeTab === 'bookings' && (
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>Booking History</h3>
                    {userBookings.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-tertiary)' }}>
                            <CreditCard size={36} strokeWidth={1} />
                            <p style={{ marginTop: 8 }}>No bookings yet.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-secondary)' }}>
                                        {['ID', 'Provider', 'Service', 'Date', 'Status', 'Amount'].map(h => (
                                            <th key={h} style={{ textAlign: 'start', padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {userBookings.map(b => (
                                        <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem' }}>{b.id}</td>
                                            <td style={{ padding: '10px 12px', fontWeight: 500 }}>{b.provider}</td>
                                            <td style={{ padding: '10px 12px' }}>{b.service}</td>
                                            <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{new Date(b.date).toLocaleDateString()}</td>
                                            <td style={{ padding: '10px 12px' }}><StatusBadge status={b.status} /></td>
                                            <td style={{ padding: '10px 12px', fontWeight: 500 }}>EGP {b.amount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Wallet Modal */}
            <FormModal open={!!walletModal} onClose={() => setWalletModal(null)} title={walletModal === 'add' ? `Add Funds to ${user.name}'s Wallet` : `Deduct from ${user.name}'s Wallet`} submitLabel={walletModal === 'add' ? 'Add Funds' : 'Deduct'} submitVariant={walletModal === 'deduct' ? 'danger' : 'primary'} onSubmit={e => { e.preventDefault(); setWalletModal(null); }}>
                <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: '0.875rem' }}><strong>Current Balance:</strong> EGP {user.wallet_balance}</div>
                <FormField label="Amount (EGP)" required><input type="number" required min={1} className={shared.formInput} placeholder="Enter amount" /></FormField>
                <FormField label="Reason" required><input type="text" required className={shared.formInput} placeholder={walletModal === 'add' ? 'e.g. Loyalty reward' : 'e.g. Correction'} /></FormField>
            </FormModal>

            {/* Confirm Modal */}
            <ConfirmModal open={!!confirmAction} onClose={() => setConfirmAction(null)} onConfirm={() => setConfirmAction(null)} title={`${(confirmAction || '').replace('_', ' ')} User`} message={`Are you sure you want to ${(confirmAction || '').replace('_', ' ')} "${user.name}"?`} confirmLabel={confirmAction === 'soft_delete' ? 'Delete' : 'Confirm'} variant={confirmAction === 'soft_delete' || confirmAction === 'block' ? 'danger' : 'warning'} />

            {/* Notify Modal */}
            <FormModal
                open={showNotify}
                onClose={() => setShowNotify(false)}
                title={`Send Notification — ${user.name}`}
                submitLabel="Send"
                onSubmit={e => {
                    e.preventDefault();
                    if (!notifyForm.title.trim() || !notifyForm.body.trim()) return;
                    setSentNotifications(prev => [{
                        id: `notif-${Date.now()}`,
                        title: notifyForm.title,
                        body: notifyForm.body,
                        platform: notifyForm.platform,
                        sent_at: new Date().toISOString(),
                    }, ...prev]);
                    setNotifyForm({ title: '', body: '', platform: 'both' });
                    setShowNotify(false);
                }}
            >
                <FormField label="Title" required>
                    <input type="text" required value={notifyForm.title} onChange={e => setNotifyForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Your appointment reminder" className={shared.formInput} />
                </FormField>
                <FormField label="Message" required>
                    <textarea required rows={3} value={notifyForm.body} onChange={e => setNotifyForm(f => ({ ...f, body: e.target.value }))} placeholder="Notification body" className={shared.formInput} style={{ resize: 'vertical' }} />
                </FormField>
                <FormField label="Send via" required>
                    <select value={notifyForm.platform} onChange={e => setNotifyForm(f => ({ ...f, platform: e.target.value as 'user_app' | 'email' | 'both' }))} className={shared.formInput}>
                        <option value="user_app">Push to User App</option>
                        <option value="email">Email</option>
                        <option value="both">Both</option>
                    </select>
                </FormField>
                {sentNotifications.length > 0 && (
                    <div style={{ padding: 10, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {sentNotifications.length} notification{sentNotifications.length === 1 ? '' : 's'} sent to this user during this session.
                    </div>
                )}
            </FormModal>
        </div>
    );
}

function ActionBtn({ icon, label, onClick, danger, color }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean; color?: string }) {
    return (
        <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: danger ? 'var(--color-error)' : color || 'var(--text-primary)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>{icon} {label}</button>
    );
}
