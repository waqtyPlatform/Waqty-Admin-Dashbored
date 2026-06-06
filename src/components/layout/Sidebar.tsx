'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from './SidebarContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePermission } from '@/hooks/usePermission';
import { ChevronLeft, ChevronDown, X } from 'lucide-react';
import styles from './Sidebar.module.css';
import { useTranslation } from '@/hooks/useTranslation';
import { buildNavigation, type NavGroup, type NavChild } from '@/config/navigation';
import { Logo } from '@/components/Logo';

export default function Sidebar() {
    const { collapsed, toggleSidebar, mobileOpen, setMobileOpen } = useSidebar();
    const closeMobile = () => setMobileOpen(false);
    const pathname = usePathname();
    const { t } = useTranslation();
    const { user } = useAuth();
    const { can } = usePermission();
    const [openSections, setOpenSections] = useState<Set<string>>(new Set());

    // Single source of truth (src/config/navigation.tsx): 7 permission-filtered
    // groups. Memoized on the viewer's permission set so we don't rebuild on
    // every route change (can() only depends on user.permissions).
    const { primary } = useMemo(
        () => buildNavigation(t, can),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [t, user?.permissions, user?.role]
    );

    const toggleSection = (id: string) => {
        setOpenSections(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const isChildActive = (href: string) =>
        pathname === href || pathname.startsWith(href + '/');

    const isActive = (href?: string, children?: NavChild[]) => {
        if (href) {
            if (href === '/') return pathname === '/';
            return pathname === href || pathname.startsWith(href + '/');
        }
        return children?.some(child => isChildActive(child.href));
    };

    const renderGroup = (item: NavGroup) => {
        // Simple link (no children)
        if (item.href && !item.children) {
            const active = isActive(item.href);
            return (
                <div key={item.id} className={styles.navItem}>
                    <Link href={item.href}
                        className={`${styles.navLink} ${active ? styles.active : ''}`}
                        onClick={closeMobile} title={collapsed ? item.label : undefined}>
                        <span className={styles.navIcon}>{item.icon}</span>
                        {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                    </Link>
                </div>
            );
        }

        // Expandable section
        const sectionActive = isActive(undefined, item.children);
        const isOpen = openSections.has(item.id) || sectionActive;

        return (
            <div key={item.id} className={styles.navItem}>
                <button
                    className={`${styles.navLink} ${sectionActive ? styles.active : ''}`}
                    onClick={() => collapsed ? toggleSidebar() : toggleSection(item.id)}
                    title={collapsed ? item.label : undefined}
                    aria-label={item.label}
                    aria-expanded={!collapsed ? isOpen : undefined}>
                    <span className={styles.navIcon}>{item.icon}</span>
                    {!collapsed && (
                        <>
                            <span className={styles.navLabel}>{item.label}</span>
                            <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
                                <ChevronDown size={16} />
                            </span>
                        </>
                    )}
                </button>
                {/* Sub-navigation */}
                {!collapsed && isOpen && (
                    <div className={styles.subNav}>
                        {item.children?.map(child => (
                            <Link key={child.href} href={child.href}
                                className={`${styles.subNavLink} ${isChildActive(child.href) ? styles.subActive : ''}`}
                                onClick={closeMobile}>
                                <span className={styles.subDot} />
                                {child.label}
                            </Link>
                        ))}
                    </div>
                )}
                {/* Collapsed fly-out */}
                {collapsed && (
                    <div className={styles.tooltip}>
                        <span className={styles.tooltipTitle}>{item.label}</span>
                        <div className={styles.tooltipList}>
                            {item.children?.map(child => (
                                <Link key={child.href} href={child.href}
                                    className={`${styles.tooltipLink} ${isChildActive(child.href) ? styles.tooltipActive : ''}`}
                                    onClick={closeMobile}>
                                    {child.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {mobileOpen && <div className={styles.overlay} onClick={closeMobile} />}
            <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
                <div className={styles.header}>
                    {!collapsed && (
                        <Link href="/" className={styles.logo} onClick={closeMobile}>
                            <Logo height={22} color="white" />
                            <span className={styles.logoText}>Admin</span>
                        </Link>
                    )}
                    {collapsed && (
                        <button className={styles.logoIconBtn} onClick={toggleSidebar}>
                            <span className={styles.logoIcon}>W</span>
                        </button>
                    )}
                    {!collapsed && (
                        <button className={styles.collapseBtn} onClick={mobileOpen ? closeMobile : toggleSidebar}
                            aria-label={mobileOpen ? 'Close menu' : 'Collapse sidebar'}>
                            {mobileOpen ? <X size={20} /> : <ChevronLeft size={20} />}
                        </button>
                    )}
                </div>

                <nav className={styles.nav}>
                    <div className={styles.navList}>
                        {primary.map(renderGroup)}
                    </div>
                </nav>
            </aside>
        </>
    );
}
