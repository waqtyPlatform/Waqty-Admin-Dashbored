'use client';

import React from 'react';

/* ── Base Skeleton ─────────────────────────────────── */

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string;
    style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 'var(--radius-md)', style }: SkeletonProps) {
    return (
        <div
            style={{
                width,
                height,
                borderRadius,
                background:
                    'linear-gradient(90deg, var(--bg-tertiary) 25%, var(--border-color) 50%, var(--bg-tertiary) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
                ...style,
            }}
        />
    );
}

/* ── KPI Card Skeleton ──────────────────────────────── */

export function KPICardSkeleton() {
    return (
        <div
            style={{
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
            }}
        >
            <Skeleton width={120} height={12} />
            <Skeleton width={80} height={28} />
            <Skeleton width={100} height={12} />
        </div>
    );
}

/* ── Table Skeleton ─────────────────────────────────── */

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
    return (
        <div
            style={{
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gap: 'var(--space-4)',
                    padding: 'var(--space-4)',
                    background: 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border-color)',
                }}
            >
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={`h-${i}`} width={80 + ((i * 17) % 40)} height={12} />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, row) => (
                <div
                    key={`r-${row}`}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${cols}, 1fr)`,
                        gap: 'var(--space-4)',
                        padding: 'var(--space-4)',
                        borderBottom: row < rows - 1 ? '1px solid var(--border-color)' : 'none',
                    }}
                >
                    {Array.from({ length: cols }).map((_, col) => (
                        <Skeleton key={`c-${row}-${col}`} width={60 + ((col * 23) % 60)} height={14} />
                    ))}
                </div>
            ))}
        </div>
    );
}

/* ── Page Header Skeleton ────────────────────────────── */

export function PageHeaderSkeleton() {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-6)',
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <Skeleton width={200} height={24} />
                <Skeleton width={300} height={14} />
            </div>
            <Skeleton width={120} height={36} borderRadius="var(--radius-md)" />
        </div>
    );
}

/* ── Dashboard Skeleton ──────────────────────────────── */

export function DashboardSkeleton() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <PageHeaderSkeleton />
            {/* KPI row */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: 'var(--space-4)',
                }}
            >
                {Array.from({ length: 5 }).map((_, i) => (
                    <KPICardSkeleton key={i} />
                ))}
            </div>
            {/* Chart + table */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 'var(--space-4)',
                }}
            >
                <Skeleton height={300} borderRadius="var(--radius-lg)" />
                <TableSkeleton rows={4} cols={3} />
            </div>
        </div>
    );
}

/* ── List Page Skeleton ──────────────────────────────── */

export function ListPageSkeleton() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <PageHeaderSkeleton />
            {/* Filters */}
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <Skeleton width={200} height={36} borderRadius="var(--radius-md)" />
                <Skeleton width={150} height={36} borderRadius="var(--radius-md)" />
                <Skeleton width={120} height={36} borderRadius="var(--radius-md)" />
            </div>
            <TableSkeleton rows={8} cols={5} />
        </div>
    );
}

/* ── Calendar Skeleton ───────────────────────────────── */

export function CalendarSkeleton() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <PageHeaderSkeleton />
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: 'var(--space-2)',
                }}
            >
                {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={`day-${i}`} width="100%" height={16} />
                ))}
                {Array.from({ length: 35 }).map((_, i) => (
                    <Skeleton key={`cell-${i}`} width="100%" height={80} borderRadius="var(--radius-md)" />
                ))}
            </div>
        </div>
    );
}

/* ── Settings Skeleton ───────────────────────────────── */

export function SettingsSkeleton() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <PageHeaderSkeleton />
            {/* Tabs */}
            <div
                style={{
                    display: 'flex',
                    gap: 'var(--space-2)',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: 'var(--space-3)',
                }}
            >
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} width={100} height={32} borderRadius="var(--radius-md)" />
                ))}
            </div>
            {/* Form fields */}
            <div
                style={{
                    background: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-6)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-5)',
                }}
            >
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        <Skeleton width={120} height={12} />
                        <Skeleton width="100%" height={40} borderRadius="var(--radius-md)" />
                    </div>
                ))}
            </div>
        </div>
    );
}
