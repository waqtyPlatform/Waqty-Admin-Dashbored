'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { useApiQuery, useApiMutation } from '@/hooks/useApiQuery';
import { adminUsersApi, adminBookingsApi, type UserObject, type BookingObject } from '@/lib/api';
import {
    ArrowLeft, Mail, Phone, Calendar, CalendarDays,
    Star, Wallet, Ban, ShieldCheck, Trash2, RotateCcw, AlertTriangle, UserX, Loader2,
} from 'lucide-react';
import shared from '@/components/admin/shared.module.css';

function deriveStatus(u: UserObject): string {
    if (u.deleted_at) return 'deleted';
    if (u.banned) return 'banned';
    if (u.blocked) return 'blocked';
    if (!u.active) return 'inactive';
    return 'active';
}

function fmtDate(iso?: string | null): string {
    if (!iso) return '--';
    return iso.slice(0, 10);
}

export default function UserDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview');

    const userUuid = Array.isArray(id) ? id[0] : id as string;

    const { data: user, loading: userLoading, refetch } = useApiQuery(
        () => adminUsersApi.get(userUuid),
        [userUuid]
    );

    const { data: bookings, loading: bookingsLoading } = useApiQuery(
        () => adminBookingsApi.list({ user_uuid: userUuid, per_page: 50 }),
        [userUuid],
        { enabled: activeTab === 'bookings' }
    );

    const { mutate: toggleActive }  = useApiMutation((args: { uuid: string; active: boolean })   => adminUsersApi.toggleActive(args.uuid, args.active));
    const { mutate: toggleBlock }   = useApiMutation((args: { uuid: string; blocked: boolean })  => adminUsersApi.toggleBlock(args.uuid, args.blocked));
    const { mutate: toggleBan }     = useApiMutation((args: { uuid: string; banned: boolean })   => adminUsersApi.toggleBan(args.uuid, args.banned));
    const { mutate: deleteUser }    = useApiMutation((uuid: string) => adminUsersApi.delete(uuid));
    const { mutate: restoreUser }   = useApiMutation((uuid: string) => adminUsersApi.restore(uuid));

    const handleAction = async (action: string) => {
        if (!user) return;
        switch (action) {
            case 'activate':   await toggleActive({ uuid: user.uuid, active: true });  break;
            case 'deactivate': await toggleActive({ uuid: user.uuid, active: false }); break;
            case 'block':      await toggleBlock({ uuid: user.uuid, blocked: true });  break;
            case 'unblock':    await toggleBlock({ uuid: user.uuid, blocked: false }); break;
            case 'ban':        await toggleBan({ uuid: user.uuid, banned: true });     break;
            case 'unban':      await toggleBan({ uuid: user.uuid, banned: false });    break;
            case 'delete':     await deleteUser(user.uuid);  break;
            case 'restore':    await restoreUser(user.uuid); break;
        }
        refetch();
    };

    if (userLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 12, color: 'var(--text-tertiary)' }}>
                <Loader2 size={24} /> {t('common.loading')}
            </div>
        );
    }

    if (!user) {
        return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>{t('users.notFound')}</div>;
    }

    const status = deriveStatus(user);
    const tabs = ['overview', 'bookings'];
    const genderLabel = user.gender === 'male' ? t('users.genderMale') : user.gender === 'female' ? t('users.genderFemale') : '--';
    const statusLabelMap: Record<string, string> = {
        active: t('common.active'), inactive: t('common.inactive'),
        blocked: t('common.blocked'), banned: t('common.banned'), deleted: t('common.deleted'),
    };

    return (
        <div className={shared.page}>
            <button onClick={() => router.push('/users')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 'none', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', width: 'fit-content', padding: '4px 0' }}>
                <ArrowLeft size={16} /> {t('users.title')}
            </button>

            {/* Header */}
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700, flexShrink: 0 }}>
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <h1 className={shared.pageTitle} style={{ fontSize: '1.25rem' }}>{user.name}</h1>
                            <StatusBadge status={status} />
                        </div>
                        <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={14} /> {user.email}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={14} /> {user.phone}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={14} /> {t('users.joined')} {fmtDate(user.created_at)}</span>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                    <PermissionGate module="users" action="edit">
                        {status === 'deleted'
                            ? <ActionBtn icon={<RotateCcw size={14} />} label={t('common.restore')} onClick={() => handleAction('restore')} />
                            : <>
                                {!user.active
                                    ? <ActionBtn icon={<ShieldCheck size={14} />} label={t('common.activate')} onClick={() => handleAction('activate')} />
                                    : <ActionBtn icon={<UserX size={14} />} label={t('common.deactivate')} onClick={() => handleAction('deactivate')} />
                                }
                                {!user.blocked
                                    ? <ActionBtn icon={<Ban size={14} />} label={t('common.block')} onClick={() => handleAction('block')} danger />
                                    : <ActionBtn icon={<ShieldCheck size={14} />} label={t('common.unblock')} onClick={() => handleAction('unblock')} />
                                }
                                {!user.banned
                                    ? <ActionBtn icon={<AlertTriangle size={14} />} label={t('common.ban')} onClick={() => handleAction('ban')} danger />
                                    : <ActionBtn icon={<ShieldCheck size={14} />} label={t('common.unban')} onClick={() => handleAction('unban')} />
                                }
                            </>
                        }
                    </PermissionGate>
                    <PermissionGate module="users" action="delete">
                        {status !== 'deleted' && (
                            <ActionBtn icon={<Trash2 size={14} />} label={t('common.delete')} onClick={() => handleAction('delete')} danger />
                        )}
                    </PermissionGate>
                </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                {[
                    { label: t('users.gender'), value: genderLabel, icon: <Star size={18} /> },
                    { label: t('users.dateOfBirth'), value: fmtDate(user.date_birth), icon: <CalendarDays size={18} /> },
                    { label: t('users.emailVerified'), value: user.email_verified_at ? t('common.yes') : t('common.no'), icon: <Mail size={18} /> },
                    { label: t('users.wallet'), value: t('users.viewWallets'), icon: <Wallet size={18} /> },
                ].map(s => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--color-primary-50)', color: 'var(--color-primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 4, overflowX: 'auto' }}>
                {tabs.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 16px', border: 'none', borderRadius: 8, background: activeTab === tab ? 'var(--color-primary-500)' : 'transparent', color: activeTab === tab ? 'white' : 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>{tab === 'overview' ? t('users.tabOverview') : t('users.tabBookings')}</button>
                ))}
            </div>

            {/* Overview */}
            {activeTab === 'overview' && (
                <div className={shared.formGrid2}>
                    <div className={shared.infoCard}>
                        <h3 className={shared.infoCardHeader}>{t('users.personalInformation')}</h3>
                        <div className={shared.infoRows}>
                            {([
                                [t('users.gender'), genderLabel],
                                [t('users.dateOfBirth'), fmtDate(user.date_birth)],
                                [t('common.phone'), user.phone],
                                [t('common.email'), user.email],
                            ] as [string, string][]).map(([k, v]) => (
                                <div key={k} className={shared.infoRow}><span>{k}</span><span>{v}</span></div>
                            ))}
                        </div>
                    </div>
                    <div className={shared.infoCard}>
                        <h3 className={shared.infoCardHeader}>{t('users.accountDetails')}</h3>
                        <div className={shared.infoRows}>
                            {([
                                [t('common.status'), statusLabelMap[status] ?? status],
                                [t('users.activeField'), user.active ? t('common.yes') : t('common.no')],
                                [t('users.blockedField'), user.blocked ? t('common.yes') : t('common.no')],
                                [t('users.bannedField'), user.banned ? t('common.yes') : t('common.no')],
                                [t('users.emailVerified'), user.email_verified_at ? fmtDate(user.email_verified_at) : t('common.no')],
                                [t('users.created'), fmtDate(user.created_at)],
                                [t('users.updated'), fmtDate(user.updated_at)],
                            ] as [string, string][]).map(([k, v]) => (
                                <div key={k} className={shared.infoRow}><span>{k}</span><span>{v}</span></div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Bookings */}
            {activeTab === 'bookings' && (
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>{t('users.bookingHistory')}</h3>
                    {bookingsLoading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8, color: 'var(--text-tertiary)' }}>
                            <Loader2 size={18} /> {t('common.loading')}
                        </div>
                    ) : !bookings || bookings.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>{t('users.noBookingsFound')}</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-secondary)' }}>
                                        {[t('subscriptions.provider'), t('common.branch'), t('common.date'), t('common.status')].map(h => (
                                            <th key={h} style={{ textAlign: 'start', padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(bookings as BookingObject[]).map(b => (
                                        <tr key={b.uuid} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '10px 12px', fontWeight: 500 }}>{b.provider?.name ?? b.provider_uuid}</td>
                                            <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{b.branch?.name ?? '--'}</td>
                                            <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{fmtDate(b.booking_date)}</td>
                                            <td style={{ padding: '10px 12px' }}><StatusBadge status={b.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function ActionBtn({ icon, label, onClick, danger, color }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean; color?: string }) {
    return (
        <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: danger ? 'var(--color-error)' : color || 'var(--text-primary)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>{icon} {label}</button>
    );
}
