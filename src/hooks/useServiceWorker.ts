'use client';

import { useEffect, useState } from 'react';

/**
 * Registers the service worker and tracks its status.
 * Also provides an `isOffline` flag for showing offline UI.
 */
export function useServiceWorker() {
    const [isOffline, setIsOffline] = useState(() => (typeof navigator !== 'undefined' ? !navigator.onLine : false));
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Track online/offline status
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Holds the periodic-update timer so it can be cleared on unmount (set
        // inside the async register().then below).
        let updateInterval: ReturnType<typeof setInterval> | undefined;

        // Register service worker
        if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
            navigator.serviceWorker
                .register('/sw.js')
                .then(registration => {
                    console.log('[SW] Registered:', registration.scope);
                    setIsReady(true);

                    // Check for updates every 60 seconds
                    updateInterval = setInterval(() => {
                        registration.update();
                    }, 60 * 1000);
                })
                .catch(error => {
                    console.error('[SW] Registration failed:', error);
                });
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (updateInterval) clearInterval(updateInterval);
        };
    }, []);

    return { isOffline, isReady };
}
