'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Trap focus within a container element (e.g., modal, dialog, slide-over).
 * Pressing Tab/Shift+Tab cycles focus within the container.
 * Pressing Escape calls the onEscape callback.
 *
 * Usage:
 *   const trapRef = useFocusTrap({ isActive: isOpen, onEscape: closeModal });
 *   return <div ref={trapRef}>...</div>
 */
export function useFocusTrap({
    isActive = true,
    onEscape,
    autoFocus = true,
}: {
    isActive: boolean;
    onEscape?: () => void;
    autoFocus?: boolean;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<Element | null>(null);

    const getFocusableElements = useCallback(() => {
        if (!containerRef.current) return [];
        const selector = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
        ].join(', ');
        return Array.from(containerRef.current.querySelectorAll<HTMLElement>(selector));
    }, []);

    useEffect(() => {
        if (!isActive) return;

        // Store the previously focused element
        previousActiveElement.current = document.activeElement;

        // Auto-focus the first focusable element
        if (autoFocus) {
            requestAnimationFrame(() => {
                const focusable = getFocusableElements();
                if (focusable.length > 0) {
                    focusable[0].focus();
                }
            });
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            // Escape key
            if (e.key === 'Escape' && onEscape) {
                e.preventDefault();
                onEscape();
                return;
            }

            // Tab key — trap focus
            if (e.key === 'Tab') {
                const focusable = getFocusableElements();
                if (focusable.length === 0) return;

                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (e.shiftKey) {
                    // Shift+Tab: if on first, go to last
                    if (document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    // Tab: if on last, go to first
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            // Restore focus to previously focused element
            if (previousActiveElement.current instanceof HTMLElement) {
                previousActiveElement.current.focus();
            }
        };
    }, [isActive, onEscape, autoFocus, getFocusableElements]);

    return containerRef;
}
