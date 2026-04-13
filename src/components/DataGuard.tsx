'use client';

import React, { ReactNode } from 'react';
import { EmptyState, Skeleton } from '@/components/ui';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface DataGuardProps {
    loading: boolean;
    error: string | null;
    data: unknown[] | null | undefined;
    children: ReactNode;
    emptyIcon: ReactNode;
    emptyTitle: string;
    emptyDescription: string;
    emptyAction?: ReactNode;
    onRetry?: () => void;
    skeletonCount?: number;
    skeletonVariant?: 'text' | 'card';
}

export function DataGuard({
    loading,
    error,
    data,
    children,
    emptyIcon,
    emptyTitle,
    emptyDescription,
    emptyAction,
    onRetry,
    skeletonCount = 3,
    skeletonVariant = 'card',
}: DataGuardProps) {
    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
                {Array.from({ length: skeletonCount }).map((_, i) => (
                    <Skeleton key={i} variant={skeletonVariant} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <EmptyState
                icon={<AlertTriangle size={48} />}
                title="Something went wrong"
                description={error}
                action={
                    onRetry ? (
                        <button
                            onClick={onRetry}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-surface)',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                            }}
                        >
                            <RefreshCw size={16} /> Retry
                        </button>
                    ) : undefined
                }
            />
        );
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
        return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} action={emptyAction} />;
    }

    return <>{children}</>;
}
