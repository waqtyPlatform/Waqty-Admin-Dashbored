import React from 'react';
import {
    LayoutDashboard,
    Building2,
    Users,
    Wallet,
    TrendingUp,
    BarChart3,
    Settings2,
} from 'lucide-react';
import type { PermissionModule, PermissionAction } from '@/types/admin';

// ─────────────────────────────────────────────────────────────────────
// Single source of truth for the Super Admin navigation, consumed by the
// Sidebar (and, later, the mobile "More" sheet + command palette) so the
// two can't drift. The 11 legacy top-level groups collapse to **7** primary
// destinations, and every previously-orphaned route (system-health,
// app-versions, audit-logs, most of settings/*, content/templates) is pulled
// back into discoverable nav:
//
//   Overview · Providers · Customers · Revenue (Finance + Subscriptions)
//   · Growth (Reviews + Marketing + Content) · Insights (Reports)
//   · Operations (Support + System Health + App Versions + Audit Logs + Settings)
//
// No routes move — every sub-page stays reachable via its group's children.
// Visibility derives from the existing permission model: each leaf carries the
// PermissionModule that governs it, and a group renders when the viewer can see
// at least one of its leaves (or its own direct href).
// ─────────────────────────────────────────────────────────────────────

export interface NavChild {
    label: string;
    href: string;
    /** Permission module that gates this leaf. Defaults to the group's module. */
    module?: PermissionModule;
}

export interface NavGroup {
    id: string;
    label: string;
    icon: React.ReactNode;
    href?: string;
    /** Module for a direct-link group, or the default for its children. */
    module?: PermissionModule;
    children?: NavChild[];
}

export interface Navigation {
    primary: NavGroup[];
}

type TFn = (key: string) => string;
type CanFn = (module: PermissionModule, action: PermissionAction) => boolean;

export function buildNavigation(t: TFn, can: CanFn): Navigation {
    const groups: NavGroup[] = [
        {
            id: 'overview',
            label: t('sidebar.overview'),
            icon: <LayoutDashboard size={20} />,
            href: '/',
            module: 'dashboard',
        },
        {
            id: 'providers',
            label: t('sidebar.providers'),
            icon: <Building2 size={20} />,
            module: 'providers',
            children: [
                { label: t('sidebar.allProviders'), href: '/providers' },
                { label: t('sidebar.registrations'), href: '/providers/registrations' },
            ],
        },
        {
            id: 'customers',
            label: t('sidebar.customers'),
            icon: <Users size={20} />,
            children: [
                { label: t('sidebar.allUsers'), href: '/users', module: 'users' },
                { label: t('sidebar.wallets'), href: '/users/wallets', module: 'wallets' },
            ],
        },
        {
            id: 'revenue',
            label: t('sidebar.revenue'),
            icon: <Wallet size={20} />,
            children: [
                { label: t('sidebar.finance'), href: '/finance', module: 'finance' },
                { label: t('sidebar.payouts'), href: '/finance/payouts', module: 'finance' },
                { label: t('sidebar.commissions'), href: '/finance/commissions', module: 'finance' },
                { label: t('sidebar.invoices'), href: '/finance/invoices', module: 'finance' },
                { label: t('sidebar.taxReports'), href: '/finance/tax-reports', module: 'finance' },
                { label: t('sidebar.subscriptions'), href: '/subscriptions', module: 'subscriptions' },
                { label: t('sidebar.plans'), href: '/subscriptions/plans', module: 'subscriptions' },
                { label: t('sidebar.subscriptionInvoices'), href: '/subscriptions/invoices', module: 'subscriptions' },
            ],
        },
        {
            id: 'growth',
            label: t('sidebar.growth'),
            icon: <TrendingUp size={20} />,
            children: [
                { label: t('sidebar.moderation'), href: '/reviews', module: 'reviews' },
                { label: t('sidebar.analytics'), href: '/reviews/analytics', module: 'reviews' },
                { label: t('sidebar.marketing'), href: '/marketing', module: 'marketing' },
                { label: t('sidebar.ads'), href: '/marketing/ads', module: 'ads' },
                { label: t('sidebar.experiments'), href: '/marketing/ads/experiments', module: 'ads' },
                { label: t('sidebar.promoCodes'), href: '/marketing/promo-codes', module: 'marketing' },
                { label: t('sidebar.campaigns'), href: '/marketing/campaigns', module: 'marketing' },
                { label: t('sidebar.pushNotifications'), href: '/marketing/push-notifications', module: 'marketing' },
                { label: t('sidebar.featured'), href: '/marketing/featured', module: 'marketing' },
                { label: t('sidebar.banners'), href: '/marketing/banners', module: 'marketing' },
                { label: t('sidebar.pages'), href: '/content/pages', module: 'content' },
                { label: t('sidebar.announcements'), href: '/content/announcements', module: 'content' },
                { label: t('sidebar.categories'), href: '/content/categories', module: 'content' },
                { label: t('sidebar.templates'), href: '/content/templates', module: 'content' },
            ],
        },
        {
            id: 'insights',
            label: t('sidebar.insights'),
            icon: <BarChart3 size={20} />,
            module: 'reports',
            children: [
                { label: t('sidebar.overview'), href: '/reports' },
                { label: t('sidebar.revenue'), href: '/reports/revenue' },
                { label: t('sidebar.bookings'), href: '/reports/bookings' },
                { label: t('sidebar.usersReport'), href: '/reports/users' },
                { label: t('sidebar.providersReport'), href: '/reports/providers' },
                { label: t('sidebar.geographic'), href: '/reports/geographic' },
                { label: t('sidebar.tips'), href: '/reports/tips' },
                { label: t('sidebar.loyalty'), href: '/reports/loyalty' },
                { label: t('sidebar.waitlist'), href: '/reports/waitlist' },
            ],
        },
        {
            id: 'operations',
            label: t('sidebar.operations'),
            icon: <Settings2 size={20} />,
            children: [
                { label: t('sidebar.support'), href: '/support', module: 'support' },
                { label: t('sidebar.systemHealth'), href: '/system-health', module: 'system_health' },
                { label: t('sidebar.appVersions'), href: '/app-versions', module: 'app_versions' },
                { label: t('sidebar.auditLogs'), href: '/audit-logs', module: 'audit_logs' },
                { label: t('sidebar.platform'), href: '/settings/platform', module: 'settings' },
                { label: t('sidebar.admins'), href: '/settings/admins', module: 'settings' },
                { label: t('sidebar.roles'), href: '/settings/roles', module: 'settings' },
                { label: t('sidebar.countries'), href: '/settings/countries', module: 'settings' },
                { label: t('sidebar.payments'), href: '/settings/payments', module: 'settings' },
                { label: t('sidebar.localizationSettings'), href: '/settings/localization', module: 'localization' },
                { label: t('sidebar.security'), href: '/settings/security', module: 'settings' },
                { label: t('sidebar.appearance'), href: '/settings/appearance', module: 'settings' },
            ],
        },
    ];

    const childVisible = (group: NavGroup, child: NavChild) =>
        can(child.module ?? group.module ?? 'dashboard', 'view');

    const groupVisible = (group: NavGroup) => {
        if (group.href) return can(group.module ?? 'dashboard', 'view');
        return (group.children ?? []).some(c => childVisible(group, c));
    };

    const primary = groups
        .map(g => ({ ...g, children: g.children?.filter(c => childVisible(g, c)) }))
        .filter(groupVisible);

    return { primary };
}
