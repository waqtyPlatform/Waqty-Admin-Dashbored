import type { SuperAdminRole, Permission, PermissionModule, PermissionAction } from '@/types/admin';

export const ALL_MODULES: PermissionModule[] = [
    'dashboard',
    'providers',
    'users',
    'subscriptions',
    'reviews',
    'reports',
    'finance',
    'marketing',
    'support',
    'content',
    'settings',
    'app_versions',
    'system_health',
    'audit_logs',
    'localization',
    'wallets',
    'ads',
];

const ALL_ACTIONS: PermissionAction[] = ['view', 'create', 'edit', 'delete', 'export', 'impersonate'];
const CRUD_ACTIONS: PermissionAction[] = ['view', 'create', 'edit', 'delete', 'export'];
const VIEW_ONLY: PermissionAction[] = ['view'];

function perms(module: PermissionModule, actions: PermissionAction[]): Permission {
    return { module, actions };
}

export const ROLE_PERMISSIONS: Record<SuperAdminRole, Permission[]> = {
    super_admin: ALL_MODULES.map(m => perms(m, ALL_ACTIONS)),

    admin: ALL_MODULES.map(m => perms(m, CRUD_ACTIONS)),

    moderator: [
        perms('dashboard', VIEW_ONLY),
        perms('providers', VIEW_ONLY),
        perms('users', VIEW_ONLY),
        perms('reviews', CRUD_ACTIONS),
        perms('support', ['view', 'create', 'edit']),
        perms('content', CRUD_ACTIONS),
        perms('marketing', ['view', 'create', 'edit']),
        perms('ads', ['view', 'create', 'edit']),
    ],

    support: [
        perms('dashboard', VIEW_ONLY),
        perms('providers', VIEW_ONLY),
        perms('users', VIEW_ONLY),
        perms('support', ['view', 'create', 'edit']),
        perms('reviews', VIEW_ONLY),
        perms('wallets', VIEW_ONLY),
    ],

    finance: [
        perms('dashboard', VIEW_ONLY),
        perms('providers', VIEW_ONLY),
        perms('subscriptions', ['view', 'create', 'edit', 'export']),
        perms('finance', ['view', 'create', 'edit', 'export']),
        perms('reports', ['view', 'export']),
        perms('wallets', ['view', 'create', 'edit', 'export']),
    ],

    viewer: ALL_MODULES.map(m => perms(m, VIEW_ONLY)),
};

export function getPermissionsForRole(role: SuperAdminRole): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
}

export function hasPermission(
    permissions: Permission[],
    module: PermissionModule,
    action: PermissionAction
): boolean {
    const perm = permissions?.find(p => p.module === module);
    return perm?.actions.includes(action) ?? false;
}
