'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, Users, Headphones, MoreHorizontal } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './MobileBottomNav.module.css';

export default function MobileBottomNav() {
    const pathname = usePathname();
    const { t } = useTranslation();
    const isActive = (href: string) => href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

    const items = [
        { href: '/', label: t('sidebar.dashboard'), icon: LayoutDashboard },
        { href: '/providers', label: t('sidebar.providers'), icon: Building2 },
        { href: '/users', label: t('sidebar.users'), icon: Users },
        { href: '/support', label: t('sidebar.support'), icon: Headphones },
        { href: '/settings', label: t('mobileNav.more'), icon: MoreHorizontal },
    ];

    return (
        <nav className={styles.nav} aria-label={t('mobileNav.ariaLabel')}>
            {items.map(({ href, label, icon: Icon }) => (
                <Link
                    key={href}
                    href={href}
                    className={`${styles.item} ${isActive(href) ? styles.active : ''}`}
                >
                    <Icon size={20} />
                    <span>{label}</span>
                </Link>
            ))}
        </nav>
    );
}
