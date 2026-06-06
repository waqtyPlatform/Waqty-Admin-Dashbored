'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Download, Inbox } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useTranslation } from '@/hooks/useTranslation';
import { EmptyState } from '@/components/admin/EmptyState';
import styles from './DataTable.module.css';

export interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    searchPlaceholder?: string;
    searchKeys?: string[];
    filters?: React.ReactNode;
    actions?: React.ReactNode;
    onRowClick?: (row: T) => void;
    getRowKey: (row: T) => string;
    pageSize?: number;
    exportFilename?: string;
    emptyMessage?: string;
    loading?: boolean;
    // Server-side pagination
    serverPagination?: boolean;
    currentPage?: number;
    totalPages?: number;
    totalCount?: number;
    onPageChange?: (page: number) => void;
    // Row selection + bulk actions
    selectable?: boolean;
    selectedKeys?: string[];
    onSelectionChange?: (keys: string[]) => void;
    bulkActions?: React.ReactNode;
}

type SortDir = 'asc' | 'desc' | null;

export function DataTable<T extends object>({
    columns,
    data,
    searchPlaceholder,
    searchKeys = [],
    filters,
    actions,
    onRowClick,
    getRowKey,
    pageSize = 15,
    emptyMessage,
    loading,
    serverPagination = false,
    currentPage: serverPage = 1,
    totalPages: serverTotalPages = 1,
    totalCount: serverTotalCount,
    onPageChange,
    selectable = false,
    selectedKeys = [],
    onSelectionChange,
    bulkActions,
}: DataTableProps<T>) {
    const { t, lang } = useTranslation();
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>(null);
    const [page, setPage] = useState(1);
    const debouncedSearch = useDebounce(search, 300);

    // Filter. Depend on a STABLE primitive key for searchKeys (call-sites pass a
    // fresh array literal each render, which would otherwise invalidate this memo
    // every render and re-run the filter pass).
    const searchKeysKey = searchKeys.join('|');
    const filtered = useMemo(() => {
        if (!debouncedSearch || searchKeys.length === 0) return data;
        const q = debouncedSearch.toLowerCase();
        return data.filter(row => searchKeys.some(key => String((row as Record<string, unknown>)[key] ?? '').toLowerCase().includes(q)));
        // eslint-disable-next-line react-hooks/exhaustive-deps -- searchKeysKey is the stable form of searchKeys
    }, [data, debouncedSearch, searchKeysKey]);

    // Sort
    const sorted = useMemo(() => {
        if (!sortKey || !sortDir) return filtered;
        return [...filtered].sort((a, b) => {
            const aVal = (a as Record<string, unknown>)[sortKey];
            const bVal = (b as Record<string, unknown>)[sortKey];
            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return 1;
            if (bVal == null) return -1;
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
            }
            const cmp = String(aVal).localeCompare(String(bVal));
            return sortDir === 'asc' ? cmp : -cmp;
        });
    }, [filtered, sortKey, sortDir]);

    // Paginate (client-side only when not using server pagination)
    const totalPages = serverPagination ? serverTotalPages : Math.ceil(sorted.length / pageSize);
    const activePage = serverPagination ? serverPage : page;
    const paginated = useMemo(() => {
        if (serverPagination) return sorted; // already paginated by server
        const start = (page - 1) * pageSize;
        return sorted.slice(start, start + pageSize);
    }, [sorted, page, pageSize, serverPagination]);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            if (sortDir === 'asc') setSortDir('desc');
            else if (sortDir === 'desc') { setSortKey(null); setSortDir(null); }
            else setSortDir('asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
        setPage(1);
    };

    const handleSearch = (val: string) => {
        setSearch(val);
        setPage(1);
    };

    // ── Row selection ──
    const pageKeys = paginated.map(getRowKey);
    const allSelected = selectable && pageKeys.length > 0 && pageKeys.every(k => selectedKeys.includes(k));
    const someSelected = selectable && selectedKeys.length > 0 && !allSelected;
    const headerCbRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (headerCbRef.current) headerCbRef.current.indeterminate = someSelected;
    }, [someSelected]);
    const toggleAll = () => {
        if (!onSelectionChange) return;
        if (allSelected) onSelectionChange(selectedKeys.filter(k => !pageKeys.includes(k)));
        else onSelectionChange([...new Set([...selectedKeys, ...pageKeys])]);
    };
    const toggleRow = (k: string) => {
        onSelectionChange?.(selectedKeys.includes(k) ? selectedKeys.filter(x => x !== k) : [...selectedKeys, k]);
    };
    const colCount = columns.length + (selectable ? 1 : 0);

    const SortIcon = ({ col }: { col: string }) => {
        if (sortKey !== col) return <ChevronsUpDown size={14} className={styles.sortIconInactive} />;
        if (sortDir === 'asc') return <ChevronUp size={14} />;
        return <ChevronDown size={14} />;
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                    {searchKeys.length > 0 && (
                        <div className={styles.searchBox}>
                            <Search size={16} className={styles.searchIcon} />
                            <input
                                type="text"
                                value={search}
                                onChange={e => handleSearch(e.target.value)}
                                placeholder={searchPlaceholder || t('common.search')}
                                className={styles.searchInput}
                            />
                        </div>
                    )}
                    {filters}
                </div>
                <div className={styles.toolbarRight}>{actions}</div>
            </div>

            {selectable && selectedKeys.length > 0 && (
                <div className={styles.bulkBar}>
                    <span className={styles.bulkCount}>{selectedKeys.length} {t('common.selected') || 'selected'}</span>
                    <div className={styles.bulkActions}>
                        {bulkActions}
                        <button className={styles.bulkClear} onClick={() => onSelectionChange?.([])}>
                            {t('common.clear') || 'Clear'}
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {selectable && (
                                <th className={styles.checkCell}>
                                    <input
                                        ref={headerCbRef}
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleAll}
                                        aria-label="Select all rows"
                                    />
                                </th>
                            )}
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    style={col.width ? { width: col.width } : undefined}
                                    className={col.sortable ? styles.sortable : ''}
                                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                                >
                                    <span className={styles.thContent}>
                                        {col.label}
                                        {col.sortable && <SortIcon col={col.key} />}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    {selectable && <td className={styles.checkCell} />}
                                    {columns.map(col => (
                                        <td key={col.key}><div className={styles.skeleton} /></td>
                                    ))}
                                </tr>
                            ))
                        ) : paginated.length === 0 ? (
                            <tr>
                                <td colSpan={colCount} className={styles.empty}>
                                    <EmptyState
                                        icon={<Inbox size={36} strokeWidth={1.5} />}
                                        title={emptyMessage || t('common.noData')}
                                        description={debouncedSearch ? 'Try adjusting your search or filters.' : undefined}
                                    />
                                </td>
                            </tr>
                        ) : (
                            paginated.map(row => {
                                const rk = getRowKey(row);
                                const selected = selectable && selectedKeys.includes(rk);
                                return (
                                    <tr
                                        key={rk}
                                        onClick={onRowClick ? () => onRowClick(row) : undefined}
                                        className={`${onRowClick ? styles.clickable : ''} ${selected ? styles.selectedRow : ''}`}
                                    >
                                        {selectable && (
                                            <td className={styles.checkCell} onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selected}
                                                    onChange={() => toggleRow(rk)}
                                                    aria-label="Select row"
                                                />
                                            </td>
                                        )}
                                        {columns.map(col => (
                                            <td key={col.key}>
                                                {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <span className={styles.pageInfo}>
                        {serverPagination && serverTotalCount != null
                            ? <>{t('common.showing')} {(activePage - 1) * pageSize + 1}-{Math.min(activePage * pageSize, serverTotalCount)} {t('common.of')} {serverTotalCount} {t('common.results')}</>
                            : <>{t('common.showing')} {(activePage - 1) * pageSize + 1}-{Math.min(activePage * pageSize, sorted.length)} {t('common.of')} {sorted.length} {t('common.results')}</>
                        }
                    </span>
                    <div className={styles.pageButtons}>
                        <button
                            disabled={activePage === 1}
                            onClick={() => serverPagination ? onPageChange?.(activePage - 1) : setPage(activePage - 1)}
                            className={styles.pageBtn}
                            aria-label={t('common.previousPage')}
                        >
                            {lang === 'ar' ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            let pageNum: number;
                            if (totalPages <= 5) pageNum = i + 1;
                            else if (activePage <= 3) pageNum = i + 1;
                            else if (activePage >= totalPages - 2) pageNum = totalPages - 4 + i;
                            else pageNum = activePage - 2 + i;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => serverPagination ? onPageChange?.(pageNum) : setPage(pageNum)}
                                    className={`${styles.pageBtn} ${activePage === pageNum ? styles.active : ''}`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button
                            disabled={activePage === totalPages}
                            onClick={() => serverPagination ? onPageChange?.(activePage + 1) : setPage(activePage + 1)}
                            className={styles.pageBtn}
                            aria-label={t('common.nextPage')}
                        >
                            {lang === 'ar' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
