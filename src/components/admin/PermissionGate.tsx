'use client';

import React from 'react';
import { usePermission } from '@/hooks/usePermission';
import type { PermissionModule, PermissionAction } from '@/types/admin';

interface PermissionGateProps {
    module: PermissionModule;
    action: PermissionAction;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function PermissionGate({ module, action, children, fallback = null }: PermissionGateProps) {
    const { can } = usePermission();
    return can(module, action) ? <>{children}</> : <>{fallback}</>;
}
