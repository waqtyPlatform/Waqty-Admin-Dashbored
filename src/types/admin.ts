export type SuperAdminRole = 'super_admin' | 'admin' | 'moderator' | 'support' | 'finance' | 'viewer';

export type PermissionModule =
    | 'dashboard'
    | 'providers'
    | 'users'
    | 'subscriptions'
    | 'reviews'
    | 'reports'
    | 'finance'
    | 'marketing'
    | 'support'
    | 'content'
    | 'settings'
    | 'app_versions'
    | 'system_health'
    | 'audit_logs'
    | 'localization'
    | 'wallets'
    | 'ads';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'export' | 'impersonate';

export interface Permission {
    module: PermissionModule;
    actions: PermissionAction[];
}

export interface SuperAdminUser {
    id: string;
    uuid: string;
    name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
    role: SuperAdminRole;
    permissions: Permission[];
    active: boolean;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
}
