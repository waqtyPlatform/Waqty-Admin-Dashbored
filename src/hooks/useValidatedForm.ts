'use client';

import { useForm, UseFormReturn, DefaultValues, FieldValues, Path, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUnsavedChanges } from './useUnsavedChanges';
import { useEffect } from 'react';

interface UseValidatedFormOptions<T extends FieldValues> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema: any;
    defaultValues?: DefaultValues<T>;
    trackUnsavedChanges?: boolean;
}

interface UseValidatedFormReturn<T extends FieldValues> extends UseFormReturn<T> {
    /** Get the error message for a specific field */
    getError: (field: Path<T>) => string | undefined;
    /** Whether the form has unsaved changes (only if trackUnsavedChanges is true) */
    hasChanges: boolean;
    /** Mark the form as saved */
    markSaved: () => void;
    /** Confirm navigation away from unsaved form */
    confirmNavigation: (onConfirm: () => void) => void;
}

/**
 * A wrapper around react-hook-form with Zod validation and optional unsaved changes tracking.
 *
 * Usage:
 *   const form = useValidatedForm<LoginFormData>({
 *     schema: loginSchema,
 *     defaultValues: { identifier: '', password: '' },
 *     trackUnsavedChanges: true,
 *   });
 *
 *   // In JSX:
 *   <input {...form.register('identifier')} />
 *   {form.getError('identifier') && <span>{form.getError('identifier')}</span>}
 */
export function useValidatedForm<T extends FieldValues>({
    schema,
    defaultValues,
    trackUnsavedChanges = false,
}: UseValidatedFormOptions<T>): UseValidatedFormReturn<T> {
    const form = useForm<T>({
        resolver: zodResolver(schema) as unknown as Resolver<T>,
        defaultValues,
        mode: 'onBlur', // Validate on blur for better UX
    });

    const { hasChanges, setHasChanges, confirmNavigation, markSaved } = useUnsavedChanges(trackUnsavedChanges);

    // Track form dirty state
    useEffect(() => {
        if (trackUnsavedChanges) {
            setHasChanges(form.formState.isDirty);
        }
    }, [form.formState.isDirty, trackUnsavedChanges, setHasChanges]);

    const getError = (field: Path<T>): string | undefined => {
        const error = form.formState.errors[field];
        return error?.message as string | undefined;
    };

    return {
        ...form,
        getError,
        hasChanges,
        markSaved,
        confirmNavigation,
    };
}
