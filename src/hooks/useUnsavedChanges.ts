'use client';

import { useEffect, useCallback, useState } from 'react';

/**
 * Hook to warn users about unsaved changes when navigating away.
 *
 * Usage:
 *   const { setHasChanges, confirmNavigation } = useUnsavedChanges();
 *
 *   // Call when form data changes
 *   setHasChanges(true);
 *
 *   // Call after successful save
 *   setHasChanges(false);
 */
export function useUnsavedChanges(enabled = true) {
    const [hasChanges, setHasChanges] = useState(false);

    // Warn on browser close / tab close / refresh
    useEffect(() => {
        if (!enabled || !hasChanges) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            // Modern browsers show a generic message regardless of returnValue
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            return e.returnValue;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [enabled, hasChanges]);

    // Helper to confirm navigation programmatically
    const confirmNavigation = useCallback(
        (onConfirm: () => void) => {
            if (!hasChanges) {
                onConfirm();
                return;
            }
            const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave this page?');
            if (confirmed) {
                setHasChanges(false);
                onConfirm();
            }
        },
        [hasChanges]
    );

    // Mark changes as saved
    const markSaved = useCallback(() => {
        setHasChanges(false);
    }, []);

    return { hasChanges, setHasChanges, confirmNavigation, markSaved };
}
