'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

const labelize = (segment: string) =>
    segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

export function Breadcrumbs() {
    const pathname = usePathname();
    if (!pathname || pathname === '/') return null;

    const parts = pathname.split('/').filter(Boolean);
    const crumbs = parts.map((part, i) => {
        const href = '/' + parts.slice(0, i + 1).join('/');
        const isId = /^\d+$|^[0-9a-f-]{10,}$/i.test(part);
        return { href, label: isId ? `#${part.slice(0, 6)}` : labelize(part), isLast: i === parts.length - 1 };
    });

    return (
        <nav
            aria-label="Breadcrumb"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.8125rem',
                color: 'var(--text-tertiary)',
                marginBottom: 12,
                flexWrap: 'wrap',
            }}
        >
            <Link href="/" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>Home</Link>
            {crumbs.map(c => (
                <React.Fragment key={c.href}>
                    <ChevronRight size={14} />
                    {c.isLast ? (
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.label}</span>
                    ) : (
                        <Link href={c.href} style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>{c.label}</Link>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
}
