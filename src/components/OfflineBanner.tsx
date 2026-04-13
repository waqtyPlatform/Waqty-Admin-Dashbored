'use client';

import React from 'react';
import { WifiOff } from 'lucide-react';
import { useServiceWorker } from '@/hooks/useServiceWorker';

function OfflineBannerInner() {
    const { isOffline } = useServiceWorker();

    if (!isOffline) return null;

    return (
        <div
            role="alert"
            aria-live="assertive"
            style={{
                position: 'fixed',
                bottom: 'var(--space-4)',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-5)',
                background: 'var(--color-gray-900)',
                color: 'white',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                boxShadow: 'var(--shadow-xl)',
                animation: 'slideInUp 250ms ease both',
            }}
        >
            <WifiOff size={16} />
            <span>You are offline</span>
        </div>
    );
}

export const OfflineBanner = React.memo(OfflineBannerInner);
