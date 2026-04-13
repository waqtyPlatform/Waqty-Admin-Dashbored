'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Announce messages to screen readers via aria-live region.
 * Creates a hidden live region and announces text dynamically.
 *
 * Usage:
 *   const announce = useAnnounce();
 *   announce('3 new bookings loaded');
 */
export function useAnnounce(politeness: 'polite' | 'assertive' = 'polite') {
    const regionRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // Create the live region element
        const region = document.createElement('div');
        region.setAttribute('aria-live', politeness);
        region.setAttribute('aria-atomic', 'true');
        region.setAttribute('role', 'status');
        region.style.position = 'absolute';
        region.style.width = '1px';
        region.style.height = '1px';
        region.style.overflow = 'hidden';
        region.style.clip = 'rect(0, 0, 0, 0)';
        region.style.whiteSpace = 'nowrap';
        region.style.border = '0';
        document.body.appendChild(region);
        regionRef.current = region;

        return () => {
            document.body.removeChild(region);
        };
    }, [politeness]);

    const announce = useCallback((message: string) => {
        if (regionRef.current) {
            // Clear and re-set to trigger screen reader announcement
            regionRef.current.textContent = '';
            requestAnimationFrame(() => {
                if (regionRef.current) {
                    regionRef.current.textContent = message;
                }
            });
        }
    }, []);

    return announce;
}
