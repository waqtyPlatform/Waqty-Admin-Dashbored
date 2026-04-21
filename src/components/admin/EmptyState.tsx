'use client';

import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '48px 24px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
            }}
        >
            <div style={{ color: 'var(--text-tertiary)' }}>{icon ?? <Inbox size={36} strokeWidth={1.5} />}</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
            {description && (
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: 360 }}>{description}</div>
            )}
            {action && <div style={{ marginTop: 8 }}>{action}</div>}
        </div>
    );
}
