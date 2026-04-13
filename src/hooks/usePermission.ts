'use client';

import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/permissions';
import type { PermissionModule, PermissionAction } from '@/types/admin';

export function usePermission() {
    const { user } = useAuth();

    const can = (module: PermissionModule, action: PermissionAction): boolean => {
        if (!user) return false;
        return hasPermission(user.permissions, module, action);
    };

    const canAny = (module: PermissionModule, actions: PermissionAction[]): boolean => {
        return actions.some(action => can(module, action));
    };

    const canAll = (module: PermissionModule, actions: PermissionAction[]): boolean => {
        return actions.every(action => can(module, action));
    };

    return { can, canAny, canAll };
}
