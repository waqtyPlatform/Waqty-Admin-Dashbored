'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSidebar } from './SidebarContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import {
    Search, Bell, Moon, Sun, Menu, ChevronDown, User, LogOut, Settings, Languages, AlertTriangle,
    Briefcase, CreditCard, Star, LifeBuoy, Activity, DollarSign,
} from 'lucide-react';
import styles from './TopBar.module.css';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/contexts/ThemeContext';
import { useCommandPalette } from '@/components/CommandPalette';
import type { NotificationCategory } from '@/mocks/notifications';

const categoryIcon: Record<NotificationCategory, React.ReactNode> = {
    provider: <Briefcase size={16} />,
    subscription: <CreditCard size={16} />,
    review: <Star size={16} />,
    support: <LifeBuoy size={16} />,
    system: <Activity size={16} />,
    finance: <DollarSign size={16} />,
};

const categoryColor: Record<NotificationCategory, string> = {
    provider: 'var(--color-primary-500)',
    subscription: 'var(--color-warning)',
    review: 'var(--color-info)',
    support: 'var(--color-error)',
    system: 'var(--text-tertiary)',
    finance: 'var(--color-success)',
};

function timeAgo(iso: string, lang: 'en' | 'ar'): string {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (lang === 'ar') {
        if (diff < 60) return 'الآن';
        if (diff < 3600) return `منذ ${Math.round(diff / 60)} د`;
        if (diff < 86400) return `منذ ${Math.round(diff / 3600)} س`;
        return `منذ ${Math.round(diff / 86400)} يوم`;
    }
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
    return `${Math.round(diff / 86400)}d ago`;
}

export default function TopBar() {
    const router = useRouter();
    const { setMobileOpen } = useSidebar();
    const { user, logout, impersonating, stopImpersonating } = useAuth();
    const { language, toggleLanguage } = useLanguage();
    const { resolvedTheme, toggleTheme } = useTheme();
    const { setOpen: setPaletteOpen } = useCommandPalette();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotifClick = (id: string, href?: string) => {
        markAsRead(id);
        setNotifOpen(false);
        if (href) router.push(href);
    };

    return (
        <>
            {impersonating && (
                <div className={styles.impersonationBanner}>
                    <AlertTriangle size={16} />
                    <span>
                        {t('topbar.impersonating')} <strong>{impersonating.providerName}</strong> — {t('topbar.impersonatingNote')}
                    </span>
                    <button className={styles.impersonationExit} onClick={stopImpersonating}>
                        {t('common.exit')}
                    </button>
                </div>
            )}
        <header className={`${styles.topbar} ${impersonating ? styles.topbarWithBanner : ''}`}>
            <button className={styles.mobileMenuBtn} onClick={() => setMobileOpen(true)} aria-label={t('topbar.openMenu')}>
                <Menu size={20} />
            </button>

            <button
                type="button"
                className={`${styles.searchWrapper} ${searchFocused ? styles.searchActive : ''}`}
                onClick={() => setPaletteOpen(true)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                aria-label={t('topbar.openCommandPalette')}
            >
                <Search size={18} className={styles.searchIcon} />
                <span className={styles.searchInput} style={{ textAlign: 'start', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}>
                    {t('topbar.search')}
                </span>
                <kbd className={styles.searchKbd}>⌘K</kbd>
            </button>

            <div className={styles.actions}>
                <button className={styles.iconBtn} onClick={toggleLanguage} title={language === 'en' ? 'العربية' : 'English'}>
                    <Languages size={20} />
                </button>
                <button className={styles.iconBtn} onClick={toggleTheme} title={t('topbar.toggleTheme')}>
                    {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className={styles.notifWrapper} ref={notifRef}>
                    <button className={styles.iconBtn} onClick={() => setNotifOpen(o => !o)} title={t('topbar.notifications')} aria-label={t('topbar.notifications')}>
                        <Bell size={20} />
                        {unreadCount > 0 && <span className={styles.notifBadge}>{unreadCount}</span>}
                    </button>
                    {notifOpen && (
                        <div className={styles.notifDropdown} role="dialog" aria-label={t('topbar.notifications')}>
                            <div className={styles.notifHeader}>
                                <span className={styles.notifTitle}>{t('topbar.notifications')}</span>
                                {unreadCount > 0 && (
                                    <button className={styles.notifMarkAll} onClick={markAllAsRead}>
                                        {t('topbar.markAllRead')}
                                    </button>
                                )}
                            </div>
                            <div className={styles.notifList}>
                                {notifications.length === 0 ? (
                                    <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                                        {t('topbar.noNotifications')}
                                    </div>
                                ) : (
                                    notifications.map(n => {
                                        const color = categoryColor[n.category];
                                        return (
                                            <div
                                                key={n.id}
                                                className={`${styles.notifItem} ${!n.read ? styles.notifUnread : ''}`}
                                                onClick={() => handleNotifClick(n.id, n.href)}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleNotifClick(n.id, n.href)}
                                            >
                                                <div className={styles.notifIcon} style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}>
                                                    {categoryIcon[n.category]}
                                                </div>
                                                <div className={styles.notifContent}>
                                                    <span className={styles.notifItemTitle}>{language === 'ar' ? n.title_ar : n.title}</span>
                                                    <span className={styles.notifDesc}>{language === 'ar' ? n.description_ar : n.description}</span>
                                                    <span className={styles.notifTime}>{timeAgo(n.created_at, language)}</span>
                                                </div>
                                                {!n.read && <span className={styles.notifDot} />}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            <div className={styles.notifFooter}>
                                <button className={styles.notifViewAll} onClick={() => { setNotifOpen(false); router.push('/notifications'); }}>
                                    {t('topbar.viewAllNotifications')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.userMenu} ref={userMenuRef}>
                    <button className={styles.userBtn} onClick={() => setUserMenuOpen(!userMenuOpen)}>
                        <div className={styles.userAvatar}>{user?.name?.charAt(0) || 'A'}</div>
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>{user?.name || t('topbar.admin')}</span>
                            <span className={styles.userRole}>{user?.role?.replace('_', ' ') || t('topbar.superAdminRole')}</span>
                        </div>
                        <ChevronDown size={16} />
                    </button>
                    {userMenuOpen && (
                        <div className={styles.userDropdown}>
                            <button className={styles.dropdownItem} onClick={() => { setUserMenuOpen(false); router.push('/settings'); }}>
                                <Settings size={16} /> {t('topbar.settings')}
                            </button>
                            <button className={styles.dropdownItem} onClick={() => { setUserMenuOpen(false); router.push('/settings/admins'); }}>
                                <User size={16} /> {t('topbar.profile')}
                            </button>
                            <div className={styles.dropdownDivider} />
                            <button className={`${styles.dropdownItem} ${styles.dropdownDanger}`} onClick={() => { setUserMenuOpen(false); logout(); }}>
                                <LogOut size={16} /> {t('topbar.logout')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
        </>
    );
}
