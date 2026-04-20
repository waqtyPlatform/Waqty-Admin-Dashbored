'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSidebar } from './SidebarContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, Bell, Moon, Sun, Menu, ChevronDown, User, LogOut, Settings, Languages } from 'lucide-react';
import styles from './TopBar.module.css';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/contexts/ThemeContext';

export default function TopBar() {
    const router = useRouter();
    const { setMobileOpen } = useSidebar();
    const { user, logout } = useAuth();
    const { language, toggleLanguage } = useLanguage();
    const { resolvedTheme, toggleTheme } = useTheme();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className={styles.topbar}>
            {/* Mobile menu button */}
            <button className={styles.mobileMenuBtn} onClick={() => setMobileOpen(true)} aria-label="Open menu">
                <Menu size={20} />
            </button>

            {/* Search */}
            <div className={`${styles.searchWrapper} ${searchFocused ? styles.searchActive : ''}`}>
                <Search size={18} className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder={t('topbar.search')}
                    className={styles.searchInput}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                />
                <kbd className={styles.searchKbd}>⌘K</kbd>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                <button className={styles.iconBtn} onClick={toggleLanguage} title={language === 'en' ? 'العربية' : 'English'}>
                    <Languages size={20} />
                </button>
                <button className={styles.iconBtn} onClick={toggleTheme} title="Toggle theme">
                    {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Notifications */}
                <div className={styles.notifWrapper}>
                    <button className={styles.iconBtn} title="Notifications">
                        <Bell size={20} />
                        <span className={styles.notifBadge}>3</span>
                    </button>
                </div>

                {/* User menu */}
                <div className={styles.userMenu} ref={userMenuRef}>
                    <button className={styles.userBtn} onClick={() => setUserMenuOpen(!userMenuOpen)}>
                        <div className={styles.userAvatar}>{user?.name?.charAt(0) || 'A'}</div>
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>{user?.name || 'Admin'}</span>
                            <span className={styles.userRole}>{user?.role?.replace('_', ' ') || 'super admin'}</span>
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
    );
}
