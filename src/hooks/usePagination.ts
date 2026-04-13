'use client';

import { useState, useMemo } from 'react';

interface PaginationOptions {
    initialPage?: number;
    initialLimit?: number;
}

export function usePagination({ initialPage = 1, initialLimit = 20 }: PaginationOptions = {}) {
    const [page, setPage] = useState(initialPage);
    const [limit, setLimit] = useState(initialLimit);
    const [total, setTotal] = useState(0);

    const totalPages = useMemo(() => Math.ceil(total / limit), [total, limit]);

    const goToPage = (p: number) => {
        setPage(Math.max(1, Math.min(p, totalPages || 1)));
    };

    const nextPage = () => goToPage(page + 1);
    const prevPage = () => goToPage(page - 1);

    const resetPage = () => setPage(1);

    return {
        page,
        limit,
        total,
        totalPages,
        setPage: goToPage,
        setLimit: (l: number) => {
            setLimit(l);
            setPage(1);
        },
        setTotal,
        nextPage,
        prevPage,
        resetPage,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
}
