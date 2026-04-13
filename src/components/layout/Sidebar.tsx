'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from './SidebarContext';
import { usePermission } from '@/hooks/usePermission';
import {
    LayoutDashboard,
    Building2,
    Users,
    CreditCard,
    Star,
    BarChart3,
    Wallet,
    Megaphone,
    Headphones,
    FileText,
    Settings,
    Smartphone,
    Activity,
    ScrollText,
    Globe,
    ChevronLeft,
    ChevronDown,
    X,
} from 'lucide-react';
import styles from './Sidebar.module.css';
import { useTranslation } from '@/hooks/useTranslation';
import type { PermissionModule } from '@/types/admin';

interface NavSubItem {
    label: string;
    href: string;
}

interface NavItem {
    label: string;
    icon: React.ReactNode;
    href?: string;
    children?: NavSubItem[];
    module: PermissionModule;
}

const getNavigation = (t: (key: string) => string): NavItem[] => [
    {
        label: t('sidebar.dashboard'),
        icon: <LayoutDashboard size={20} />,
        href: '/',
        module: 'dashboard',
    },
    {
        label: t('sidebar.providers'),
        icon: <Building2 size={20} />,
        module: 'providers',
        children: [
            { label: t('sidebar.allProviders'), href: '/providers' },
            { label: t('sidebar.registrations'), href: '/providers/registrations' },
        ],
    },
    {
        label: t('sidebar.users'),
        icon: <Users size={20} />,
        module: 'users',
        children: [
            { label: t('sidebar.allUsers'), href: '/users' },
            { label: t('sidebar.wallets'), href: '/users/wallets' },
        ],
    },
    {
        label: t('sidebar.subscriptions'),
        icon: <CreditCard size={20} />,
        module: 'subscriptions',
        children: [
            { label: t('sidebar.overview'), href: '/subscriptions' },
            { label: t('sidebar.plans'), href: '/subscriptions/plans' },
            { label: t('sidebar.invoices'), href: '/subscriptions/invoices' },
        ],
    },
    {
        label: t('sidebar.reviews'),
        icon: <Star size={20} />,
        module: 'reviews',
        children: [
            { label: t('sidebar.moderation'), href: '/reviews' },
            { label: t('sidebar.analytics'), href: '/reviews/analytics' },
        ],
    },
    {
        label: t('sidebar.reports'),
        icon: <BarChart3 size={20} />,
        module: 'reports',
        children: [
            { label: t('sidebar.overview'), href: '/reports' },
            { label: t('sidebar.revenue'), href: '/reports/revenue' },
            { label: t('sidebar.bookings'), href: '/reports/bookings' },
            { label: t('sidebar.usersReport'), href: '/reports/users' },
            { label: t('sidebar.providersReport'), href: '/reports/providers' },
            { label: t('sidebar.geographic'), href: '/reports/geographic' },
        ],
    },
    {
        label: t('sidebar.finance'),
        icon: <Wallet size={20} />,
        module: 'finance',
        children: [
            { label: t('sidebar.overview'), href: '/finance' },
            { label: t('sidebar.commissions'), href: '/finance/commissions' },
            { label: t('sidebar.payouts'), href: '/finance/payouts' },
            { label: t('sidebar.invoices'), href: '/finance/invoices' },
            { label: t('sidebar.taxReports'), href: '/finance/tax-reports' },
        ],
    },
    {
        label: t('sidebar.marketing'),
        icon: <Megaphone size={20} />,
        module: 'marketing',
        children: [
            { label: t('sidebar.ads'), href: '/marketing/ads' },
            { label: t('sidebar.pushNotifications'), href: '/marketing/push-notifications' },
            { label: t('sidebar.promoCodes'), href: '/marketing/promo-codes' },
            { label: t('sidebar.campaigns'), href: '/marketing/campaigns' },
            { label: t('sidebar.featured'), href: '/marketing/featured' },
            { label: t('sidebar.banners'), href: '/marketing/banners' },
        ],
    },
    {
        label: t('sidebar.support'),
        icon: <Headphones size={20} />,
        href: '/support',
        module: 'support',
    },
    {
        label: t('sidebar.content'),
        icon: <FileText size={20} />,
        module: 'content',
        children: [
            { label: t('sidebar.pages'), href: '/content/pages' },
            { label: t('sidebar.templates'), href: '/content/templates' },
            { label: t('sidebar.announcements'), href: '/content/announcements' },
            { label: t('sidebar.categories'), href: '/content/categories' },
        ],
    },
    {
        label: t('sidebar.settings'),
        icon: <Settings size={20} />,
        module: 'settings',
        children: [
            { label: t('sidebar.platform'), href: '/settings/platform' },
            { label: t('sidebar.countries'), href: '/settings/countries' },
            { label: t('sidebar.payments'), href: '/settings/payments' },
            { label: t('sidebar.roles'), href: '/settings/roles' },
            { label: t('sidebar.admins'), href: '/settings/admins' },
            { label: t('sidebar.appearance'), href: '/settings/appearance' },
            { label: t('sidebar.localizationSettings'), href: '/settings/localization' },
            { label: t('sidebar.security'), href: '/settings/security' },
        ],
    },
    {
        label: t('sidebar.appVersions'),
        icon: <Smartphone size={20} />,
        href: '/app-versions',
        module: 'app_versions',
    },
    {
        label: t('sidebar.systemHealth'),
        icon: <Activity size={20} />,
        href: '/system-health',
        module: 'system_health',
    },
    {
        label: t('sidebar.auditLogs'),
        icon: <ScrollText size={20} />,
        href: '/audit-logs',
        module: 'audit_logs',
    },
    {
        label: t('sidebar.localization'),
        icon: <Globe size={20} />,
        href: '/localization',
        module: 'localization',
    },
];

export default function Sidebar() {
    const { collapsed, toggleSidebar, mobileOpen, setMobileOpen } = useSidebar();
    const closeMobile = () => setMobileOpen(false);
    const pathname = usePathname();
    const { t } = useTranslation();
    const { can } = usePermission();
    const [openSections, setOpenSections] = useState<Set<string>>(new Set());

    const navigation = getNavigation(t);

    const toggleSection = (label: string) => {
        setOpenSections(prev => {
            const next = new Set(prev);
            if (next.has(label)) next.delete(label);
            else next.add(label);
            return next;
        });
    };

    const isActive = (href?: string, children?: NavSubItem[]) => {
        if (href) {
            if (href === '/') return pathname === '/';
            return pathname === href || pathname.startsWith(href + '/');
        }
        return children?.some(child => pathname === child.href || pathname.startsWith(child.href + '/'));
    };

    return (
        <>
            {mobileOpen && <div className={styles.overlay} onClick={closeMobile} />}
            <aside
                className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}
            >
                <div className={styles.header}>
                    {!collapsed && (
                        <Link href="/" className={styles.logo}>
                            <span className={styles.logoIcon}>H</span>
                            <span className={styles.logoText}>Hagzy Admin</span>
                        </Link>
                    )}
                    <button
                        className={styles.collapseBtn}
                        onClick={mobileOpen ? closeMobile : toggleSidebar}
                        aria-label={mobileOpen ? 'Close menu' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {mobileOpen ? <X size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                <nav className={styles.nav}>
                    {navigation.map(item => {
                        if (!can(item.module, 'view')) return null;

                        if (item.href && !item.children) {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`${styles.navItem} ${active ? styles.active : ''}`}
                                    onClick={closeMobile}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <span className={styles.navIcon}>{item.icon}</span>
                                    {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                                </Link>
                            );
                        }

                        const sectionActive = isActive(undefined, item.children);
                        const isOpen = openSections.has(item.label) || sectionActive;

                        return (
                            <div key={item.label} className={styles.navSection}>
                                <button
                                    className={`${styles.navItem} ${sectionActive ? styles.active : ''}`}
                                    onClick={() => toggleSection(item.label)}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <span className={styles.navIcon}>{item.icon}</span>
                                    {!collapsed && (
                                        <>
                                            <span className={styles.navLabel}>{item.label}</span>
                                            <ChevronDown
                                                size={16}
                                                className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                                            />
                                        </>
                                    )}
                                </button>
                                {!collapsed && isOpen && (
                                    <div className={styles.subNav}>
                                        {item.children?.map(child => (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                className={`${styles.subNavItem} ${
                                                    pathname === child.href || pathname.startsWith(child.href + '/')
                                                        ? styles.subActive
                                                        : ''
                                                }`}
                                                onClick={closeMobile}
                                            >
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
