'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    const { t, tn } = useTranslation();
    useEffect(() => {
        console.error('[Page Error]', error);
    }, [error]);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 'calc(100vh - var(--topbar-height, 64px) - 80px)',
                padding: 'var(--space-8)',
                textAlign: 'center',
                gap: 'var(--space-5)',
                animation: 'fadeIn 250ms ease both',
            }}
        >
            <div
                style={{
                    width: 72,
                    height: 72,
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-error-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-error)',
                }}
            >
                <AlertTriangle size={32} />
            </div>

            <h2
                style={{
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 'var(--font-bold)',
                    color: 'var(--text-primary)',
                }}
            >
                {tn('Something went wrong', 'حدث خطأ ما')}
            </h2>

            <p
                style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    maxWidth: 440,
                    lineHeight: 'var(--leading-relaxed)',
                }}
            >
                {tn(
                    'An unexpected error occurred on this page. You can try again or return to the dashboard.',
                    'حدث خطأ غير متوقع في هذه الصفحة. يمكنك المحاولة مرة أخرى أو العودة إلى لوحة التحكم.'
                )}
            </p>

            {error?.digest && (
                <p
                    style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-tertiary)',
                        fontFamily: 'var(--font-mono)',
                    }}
                >
                    Reference: {error.digest}
                </p>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <button
                    onClick={reset}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        padding: 'var(--space-2) var(--space-5)',
                        background: 'var(--color-primary-500)',
                        color: 'var(--text-inverse)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-semibold)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background var(--transition-fast)',
                    }}
                >
                    <RefreshCw size={16} />
                    {tn('Try again', 'حاول مرة أخرى')}
                </button>

                <Link
                    href="/"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        padding: 'var(--space-2) var(--space-5)',
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-medium)',
                        border: '1px solid var(--border-color)',
                        textDecoration: 'none',
                        transition: 'background var(--transition-fast)',
                    }}
                >
                    <Home size={16} />
                    {t('sidebar.dashboard')}
                </Link>
            </div>
        </div>
    );
}
