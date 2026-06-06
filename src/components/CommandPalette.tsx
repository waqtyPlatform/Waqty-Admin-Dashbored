'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { useTranslation } from '@/hooks/useTranslation';
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
    labelKey: string;
    hintKey?: string;
    href?: string;
    action?: () => void;
    keywords?: string;
    icon: React.ReactNode;
    groupKey: string;
}

// Hoisted to module scope: the item shape (groupKey/labelKey/href/icon) is static —
// only the t() label resolution is dynamic (done in render). This avoids re-allocating
// 44 objects + 44 icon elements + the group Set on every provider render.
const NAV = 'cmd.group.navigation';
const QA = 'cmd.group.quickActions';
const CMD_ITEMS: CmdItem[] = [
        { groupKey: NAV, labelKey: 'cmd.nav.dashboard', href: '/', icon: <LayoutDashboard size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.allProviders', href: '/providers', icon: <Building2 size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.providerRegistrations', href: '/providers/registrations', icon: <Building2 size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.allUsers', href: '/users', icon: <Users size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.userWallets', href: '/users/wallets', icon: <Wallet size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.subscriptions', href: '/subscriptions', icon: <CreditCard size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.subscriptionPlans', href: '/subscriptions/plans', icon: <CreditCard size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.subscriptionInvoices', href: '/subscriptions/invoices', icon: <FileText size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.reviews', href: '/reviews', icon: <Star size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.reviewAnalytics', href: '/reviews/analytics', icon: <Star size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.reports', href: '/reports', icon: <BarChart3 size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.revenueReport', href: '/reports/revenue', icon: <BarChart3 size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.bookingsReport', href: '/reports/bookings', icon: <BarChart3 size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.geographicReport', href: '/reports/geographic', icon: <BarChart3 size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.financeOverview', href: '/finance', icon: <Wallet size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.commissions', href: '/finance/commissions', icon: <Wallet size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.payouts', href: '/finance/payouts', icon: <Wallet size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.invoices', href: '/finance/invoices', icon: <FileText size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.taxReports', href: '/finance/tax-reports', icon: <FileText size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.ads', href: '/marketing/ads', icon: <Megaphone size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.pushNotifications', href: '/marketing/push-notifications', icon: <Megaphone size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.promoCodes', href: '/marketing/promo-codes', icon: <Megaphone size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.campaigns', href: '/marketing/campaigns', icon: <Megaphone size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.featuredListings', href: '/marketing/featured', icon: <Megaphone size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.banners', href: '/marketing/banners', icon: <Megaphone size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.supportTickets', href: '/support', icon: <Headphones size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.contentPages', href: '/content/pages', icon: <FileText size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.contentTemplates', href: '/content/templates', icon: <FileText size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.announcements', href: '/content/announcements', icon: <FileText size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.categories', href: '/content/categories', icon: <FileText size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.platformSettings', href: '/settings/platform', icon: <Settings size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.countries', href: '/settings/countries', icon: <Settings size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.paymentGateways', href: '/settings/payments', icon: <Settings size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.roles', href: '/settings/roles', icon: <Settings size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.admins', href: '/settings/admins', icon: <Settings size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.appearance', href: '/settings/appearance', icon: <Settings size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.localizationSettings', href: '/settings/localization', icon: <Settings size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.security', href: '/settings/security', icon: <Settings size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.appVersions', href: '/app-versions', icon: <Smartphone size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.systemHealth', href: '/system-health', icon: <Activity size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.auditLogs', href: '/audit-logs', icon: <ScrollText size={16} /> },
        { groupKey: NAV, labelKey: 'cmd.nav.localization', href: '/localization', icon: <Globe size={16} /> },

        { groupKey: QA, labelKey: 'cmd.qa.createProvider', href: '/providers', hintKey: 'cmd.qa.createProviderHint', icon: <Plus size={16} /> },
        { groupKey: QA, labelKey: 'cmd.qa.approveRegistrations', href: '/providers/registrations', icon: <UserCheck size={16} /> },
        { groupKey: QA, labelKey: 'cmd.qa.sendAnnouncement', href: '/content/announcements', icon: <Send size={16} /> },
        { groupKey: QA, labelKey: 'cmd.qa.sendPush', href: '/marketing/push-notifications', icon: <Send size={16} /> },
        { groupKey: QA, labelKey: 'cmd.qa.createPromoCode', href: '/marketing/promo-codes', icon: <Plus size={16} /> },
    ];
const CMD_GROUPS = Array.from(new Set(CMD_ITEMS.map(i => i.groupKey)));

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { t } = useTranslation();
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

    const onSelect = (item: CmdItem) => {
        setOpen(false);
        if (item.action) item.action();
        else if (item.href) router.push(item.href);
    };

    return (
        <PaletteContext.Provider value={{ open, setOpen }}>
            {children}
            {open && (
                <div className={styles.overlay} onClick={() => setOpen(false)}>
                    <div className={styles.dialog} onClick={e => e.stopPropagation()}>
                        <Command label={t('cmd.label')} className={styles.command}>
                            <Command.Input placeholder={t('cmd.placeholder')} className={styles.input} autoFocus />
                            <Command.List className={styles.list}>
                                <Command.Empty className={styles.empty}>{t('cmd.noResults')}</Command.Empty>
                                {CMD_GROUPS.map(group => (
                                    <Command.Group key={group} heading={t(group)} className={styles.group}>
                                        {CMD_ITEMS.filter(i => i.groupKey === group).map(item => (
                                            <Command.Item
                                                key={`${group}-${item.labelKey}`}
                                                value={`${t(item.labelKey)} ${item.keywords || ''}`}
                                                onSelect={() => onSelect(item)}
                                                className={styles.item}
                                            >
                                                <span className={styles.itemIcon}>{item.icon}</span>
                                                <span className={styles.itemLabel}>{t(item.labelKey)}</span>
                                                {item.hintKey && <span className={styles.itemHint}>{t(item.hintKey)}</span>}
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
