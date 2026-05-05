'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ApiResponse, ApiMeta } from '@/lib/api';
import { ApiError } from '@/lib/api';

interface UseApiQueryOptions {
    enabled?: boolean;
    fallbackData?: unknown;
}

interface UseApiQueryResult<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    /** ApiError instance when available — includes `.status`, `.errors`, helper booleans */
    apiError: ApiError | null;
    /** Pagination meta from the response envelope */
    meta: ApiMeta | null;
    refetch: () => Promise<void>;
    setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function useApiQuery<T = any>(
    fetcher: () => Promise<ApiResponse<T>> | Promise<ApiResponse<any>>,
    /* eslint-enable @typescript-eslint/no-explicit-any */
    deps: unknown[] = [],
    options: UseApiQueryOptions = {}
): UseApiQueryResult<T> {
    const { enabled = true, fallbackData } = options;
    const [data, setData] = useState<T | null>((fallbackData as T) ?? null);
    const [loading, setLoading] = useState(enabled);
    const [error, setError] = useState<string | null>(null);
    const [apiError, setApiError] = useState<ApiError | null>(null);
    const [meta, setMeta] = useState<ApiMeta | null>(null);
    const mountedRef = useRef(true);
    const fetcherRef = useRef(fetcher);
    fetcherRef.current = fetcher;

    const fetchData = useCallback(async () => {
        if (!enabled) return;
        setLoading(true);
        setError(null);
        setApiError(null);
        try {
            const response = await fetcherRef.current();
            if (mountedRef.current) {
                setData(response.data ?? null);
                setMeta(response.meta ?? null);
            }
        } catch (err: unknown) {
            if (mountedRef.current) {
                if (fallbackData !== undefined) {
                    setData(fallbackData as T);
                } else {
                    if (err instanceof ApiError) {
                        setApiError(err);
                        setError(err.message);
                    } else {
                        const message =
                            err && typeof err === 'object' && 'message' in err
                                ? (err as { message: string }).message
                                : 'An error occurred';
                        setError(message);
                    }
                }
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, ...deps]);

    useEffect(() => {
        mountedRef.current = true;
        fetchData();
        return () => {
            mountedRef.current = false;
        };
    }, [fetchData]);

    return { data, loading, error, apiError, meta, refetch: fetchData, setData };
}

interface UseApiMutationResult<T, V = Record<string, unknown>> {
    mutate: (variables: V) => Promise<T | null>;
    data: T | null;
    loading: boolean;
    error: string | null;
    /** ApiError instance — gives access to `.status`, `.errors` (422 fields), helper booleans */
    apiError: ApiError | null;
}

export function useApiMutation<T, V = Record<string, unknown>>(
    mutator: (variables: V) => Promise<ApiResponse<T>>
): UseApiMutationResult<T, V> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [apiError, setApiError] = useState<ApiError | null>(null);

    const mutate = useCallback(
        async (variables: V): Promise<T | null> => {
            setLoading(true);
            setError(null);
            setApiError(null);
            try {
                const response = await mutator(variables);
                setData(response.data ?? null);
                return response.data ?? null;
            } catch (err: unknown) {
                if (err instanceof ApiError) {
                    setApiError(err);
                    setError(err.message);
                } else {
                    const message =
                        err && typeof err === 'object' && 'message' in err
                            ? (err as { message: string }).message
                            : 'An error occurred';
                    setError(message);
                }
                return null;
            } finally {
                setLoading(false);
            }
        },
        [mutator]
    );

    return { mutate, data, loading, error, apiError };
}
