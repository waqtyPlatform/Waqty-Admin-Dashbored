'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
    LayoutDashboard, Building2, Users, CreditCard, Star, BarChart3, Wallet,
    Megaphone, Headphones, FileText, Settings, Smartphone, Activity,
    ScrollText, Globe, Plus, UserCheck, Send,
} from 'lucide-react';
import styles from './CommandPalette.module.css';

interface PaletteContextValue {
    open: boolean;
    setOpen: (v: boolean) => void;
}

const PaletteContext = createContext<PaletteContextValue | null>(null);

export function useCommandPalette() {
    const ctx = useContext(PaletteContext);
    if (!ctx) throw new Error('useCommandPalette must be used within CommandPaletteProvider');
    return ctx;
}

interface CmdItem {
    label: string;
    hint?: string;
    href?: string;
    action?: () => void;
    keywords?: string;
    icon: React.ReactNode;
    group: string;
}

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen(prev => !prev);
            }
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    const items: CmdItem[] = [
        { group: 'Navigation', label: 'Dashboard', href: '/', icon: <LayoutDashboard size={16} /> },
        { group: 'Navigation', label: 'All Providers', href: '/providers', icon: <Building2 size={16} /> },
        { group: 'Navigation', label: 'Provider Registrations', href: '/providers/registrations', icon: <Building2 size={16} /> },
        { group: 'Navigation', label: 'All Users', href: '/users', icon: <Users size={16} /> },
        { group: 'Navigation', label: 'User Wallets', href: '/users/wallets', icon: <Wallet size={16} /> },
        { group: 'Navigation', label: 'Subscriptions', href: '/subscriptions', icon: <CreditCard size={16} /> },
        { group: 'Navigation', label: 'Subscription Plans', href: '/subscriptions/plans', icon: <CreditCard size={16} /> },
        { group: 'Navigation', label: 'Subscription Invoices', href: '/subscriptions/invoices', icon: <FileText size={16} /> },
        { group: 'Navigation', label: 'Reviews', href: '/reviews', icon: <Star size={16} /> },
        { group: 'Navigation', label: 'Review Analytics', href: '/reviews/analytics', icon: <Star size={16} /> },
        { group: 'Navigation', label: 'Reports', href: '/reports', icon: <BarChart3 size={16} /> },
        { group: 'Navigation', label: 'Revenue Report', href: '/reports/revenue', icon: <BarChart3 size={16} /> },
        { group: 'Navigation', label: 'Bookings Report', href: '/reports/bookings', icon: <BarChart3 size={16} /> },
        { group: 'Navigation', label: 'Geographic Report', href: '/reports/geographic', icon: <BarChart3 size={16} /> },
        { group: 'Navigation', label: 'Finance Overview', href: '/finance', icon: <Wallet size={16} /> },
        { group: 'Navigation', label: 'Commissions', href: '/finance/commissions', icon: <Wallet size={16} /> },
        { group: 'Navigation', label: 'Payouts', href: '/finance/payouts', icon: <Wallet size={16} /> },
        { group: 'Navigation', label: 'Invoices', href: '/finance/invoices', icon: <FileText size={16} /> },
        { group: 'Navigation', label: 'Tax Reports', href: '/finance/tax-reports', icon: <FileText size={16} /> },
        { group: 'Navigation', label: 'Ads', href: '/marketing/ads', icon: <Megaphone size={16} /> },
        { group: 'Navigation', label: 'Push Notifications', href: '/marketing/push-notifications', icon: <Megaphone size={16} /> },
        { group: 'Navigation', label: 'Promo Codes', href: '/marketing/promo-codes', icon: <Megaphone size={16} /> },
        { group: 'Navigation', label: 'Campaigns', href: '/marketing/campaigns', icon: <Megaphone size={16} /> },
        { group: 'Navigation', label: 'Featured Listings', href: '/marketing/featured', icon: <Megaphone size={16} /> },
        { group: 'Navigation', label: 'Banners', href: '/marketing/banners', icon: <Megaphone size={16} /> },
        { group: 'Navigation', label: 'Support Tickets', href: '/support', icon: <Headphones size={16} /> },
        { group: 'Navigation', label: 'Content Pages', href: '/content/pages', icon: <FileText size={16} /> },
        { group: 'Navigation', label: 'Content Templates', href: '/content/templates', icon: <FileText size={16} /> },
        { group: 'Navigation', label: 'Announcements', href: '/content/announcements', icon: <FileText size={16} /> },
        { group: 'Navigation', label: 'Categories', href: '/content/categories', icon: <FileText size={16} /> },
        { group: 'Navigation', label: 'Platform Settings', href: '/settings/platform', icon: <Settings size={16} /> },
        { group: 'Navigation', label: 'Countries', href: '/settings/countries', icon: <Settings size={16} /> },
        { group: 'Navigation', label: 'Payment Gateways', href: '/settings/payments', icon: <Settings size={16} /> },
        { group: 'Navigation', label: 'Roles', href: '/settings/roles', icon: <Settings size={16} /> },
        { group: 'Navigation', label: 'Admins', href: '/settings/admins', icon: <Settings size={16} /> },
        { group: 'Navigation', label: 'Appearance', href: '/settings/appearance', icon: <Settings size={16} /> },
        { group: 'Navigation', label: 'Localization Settings', href: '/settings/localization', icon: <Settings size={16} /> },
        { group: 'Navigation', label: 'Security', href: '/settings/security', icon: <Settings size={16} /> },
        { group: 'Navigation', label: 'App Versions', href: '/app-versions', icon: <Smartphone size={16} /> },
        { group: 'Navigation', label: 'System Health', href: '/system-health', icon: <Activity size={16} /> },
        { group: 'Navigation', label: 'Audit Logs', href: '/audit-logs', icon: <ScrollText size={16} /> },
        { group: 'Navigation', label: 'Localization', href: '/localization', icon: <Globe size={16} /> },

        { group: 'Quick Actions', label: 'Create Provider', href: '/providers', hint: 'Go to providers to add', icon: <Plus size={16} /> },
        { group: 'Quick Actions', label: 'Approve Registrations', href: '/providers/registrations', icon: <UserCheck size={16} /> },
        { group: 'Quick Actions', label: 'Send Announcement', href: '/content/announcements', icon: <Send size={16} /> },
        { group: 'Quick Actions', label: 'Send Push Notification', href: '/marketing/push-notifications', icon: <Send size={16} /> },
        { group: 'Quick Actions', label: 'Create Promo Code', href: '/marketing/promo-codes', icon: <Plus size={16} /> },
    ];

    const onSelect = (item: CmdItem) => {
        setOpen(false);
        if (item.action) item.action();
        else if (item.href) router.push(item.href);
    };

    const groups = Array.from(new Set(items.map(i => i.group)));

    return (
        <PaletteContext.Provider value={{ open, setOpen }}>
            {children}
            {open && (
                <div className={styles.overlay} onClick={() => setOpen(false)}>
                    <div className={styles.dialog} onClick={e => e.stopPropagation()}>
                        <Command label="Command Palette" className={styles.command}>
                            <Command.Input placeholder="Type a command or search..." className={styles.input} autoFocus />
                            <Command.List className={styles.list}>
                                <Command.Empty className={styles.empty}>No results found.</Command.Empty>
                                {groups.map(group => (
                                    <Command.Group key={group} heading={group} className={styles.group}>
                                        {items.filter(i => i.group === group).map(item => (
                                            <Command.Item
                                                key={`${group}-${item.label}`}
                                                value={`${item.label} ${item.keywords || ''}`}
                                                onSelect={() => onSelect(item)}
                                                className={styles.item}
                                            >
                                                <span className={styles.itemIcon}>{item.icon}</span>
                                                <span className={styles.itemLabel}>{item.label}</span>
                                                {item.hint && <span className={styles.itemHint}>{item.hint}</span>}
                                            </Command.Item>
                                        ))}
                                    </Command.Group>
                                ))}
                            </Command.List>
                        </Command>
                    </div>
                </div>
            )}
        </PaletteContext.Provider>
    );
}
