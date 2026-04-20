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

const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-primary)', background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', outline: 'none' };

export default function UserDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview');
    const [walletModal, setWalletModal] = useState<'add' | 'deduct' | null>(null);
    const [confirmAction, setConfirmAction] = useState<string | null>(null);

    const user = mockUsers.find(u => u.id === id);
    const userReviews = mockReviews.filter(r => r.user_id === id);
    const userWalletTxns = mockWalletTransactions.filter(t => t.wallet_id === `wal-${id}`);

    if (!user) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>User not found</div>;

    const stats = [
        { label: 'Total Bookings', value: user.total_bookings, icon: <CalendarDays size={18} /> },
        { label: 'Total Spent', value: `EGP ${user.total_spent.toLocaleString()}`, icon: <DollarSign size={18} /> },
        { label: 'Wallet Balance', value: `EGP ${user.wallet_balance}`, icon: <Wallet size={18} /> },
        { label: 'Reviews', value: userReviews.length, icon: <Star size={18} /> },
    ];

    const tabs = ['overview', 'bookings', 'reviews', 'wallet'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <button onClick={() => router.push('/users')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 'none', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', width: 'fit-content', padding: '4px 0' }}>
                <ArrowLeft size={16} /> {t('users.title')}
            </button>

            {/* Header */}
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700, flexShrink: 0 }}>{user.name.charAt(0)}</div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{user.name}</h1>
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
                        <ActionBtn icon={<Send size={14} />} label="Notify" onClick={() => {}} color="var(--color-info)" />
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>Personal Information</h3>
                        {[
                            ['Gender', user.gender || 'Not set'],
                            ['Date of Birth', user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'Not set'],
                            ['Last Active', new Date(user.last_active_at).toLocaleDateString()],
                            ['Last Booking', user.last_booking_at ? new Date(user.last_booking_at).toLocaleDateString() : 'Never'],
                        ].map(([k, v]) => (
                            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                                <span style={{ color: 'var(--text-primary)', fontWeight: 500, textTransform: 'capitalize' }}>{v}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>Account Details</h3>
                        {[
                            ['Status', user.status],
                            ['Registered', new Date(user.registered_at).toLocaleDateString()],
                            ['Total Spent', `EGP ${user.total_spent.toLocaleString()}`],
                            ['Wallet Balance', `EGP ${user.wallet_balance}`],
                        ].map(([k, v]) => (
                            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                                <span style={{ color: 'var(--text-primary)', fontWeight: 500, textTransform: 'capitalize' }}>{String(v)}</span>
                            </div>
                        ))}
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
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12 }}>
                    <CreditCard size={40} strokeWidth={1} /><p style={{ marginTop: 12 }}>Booking history will load from the API when connected. This user has {user.total_bookings} bookings.</p>
                </div>
            )}

            {/* Wallet Modal */}
            <FormModal open={!!walletModal} onClose={() => setWalletModal(null)} title={walletModal === 'add' ? `Add Funds to ${user.name}'s Wallet` : `Deduct from ${user.name}'s Wallet`} submitLabel={walletModal === 'add' ? 'Add Funds' : 'Deduct'} submitVariant={walletModal === 'deduct' ? 'danger' : 'primary'} onSubmit={e => { e.preventDefault(); setWalletModal(null); }}>
                <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: '0.875rem' }}><strong>Current Balance:</strong> EGP {user.wallet_balance}</div>
                <FormField label="Amount (EGP)" required><input type="number" required min={1} style={inputStyle} placeholder="Enter amount" /></FormField>
                <FormField label="Reason" required><input type="text" required style={inputStyle} placeholder={walletModal === 'add' ? 'e.g. Loyalty reward' : 'e.g. Correction'} /></FormField>
            </FormModal>

            {/* Confirm Modal */}
            <ConfirmModal open={!!confirmAction} onClose={() => setConfirmAction(null)} onConfirm={() => setConfirmAction(null)} title={`${(confirmAction || '').replace('_', ' ')} User`} message={`Are you sure you want to ${(confirmAction || '').replace('_', ' ')} "${user.name}"?`} confirmLabel={confirmAction === 'soft_delete' ? 'Delete' : 'Confirm'} variant={confirmAction === 'soft_delete' || confirmAction === 'block' ? 'danger' : 'warning'} />
        </div>
    );
}

function ActionBtn({ icon, label, onClick, danger, color }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean; color?: string }) {
    return (
        <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: danger ? 'var(--color-error)' : color || 'var(--text-primary)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>{icon} {label}</button>
    );
}
