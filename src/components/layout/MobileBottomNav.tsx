'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, Users, Headphones, MoreHorizontal } from 'lucide-react';
import styles from './MobileBottomNav.module.css';

const items = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/providers', label: 'Providers', icon: Building2 },
    { href: '/users', label: 'Users', icon: Users },
    { href: '/support', label: 'Support', icon: Headphones },
    { href: '/settings', label: 'More', icon: MoreHorizontal },
];

export default function MobileBottomNav() {
    const pathname = usePathname();
    const isActive = (href: string) => href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

    return (
        <nav className={styles.nav} aria-label="Mobile primary navigation">
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
