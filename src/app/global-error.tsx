'use client';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <html lang="en" dir="ltr">
            <body
                style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    background: '#F9FAFB',
                    color: '#111827',
                }}
            >
                <div
                    style={{
                        textAlign: 'center',
                        padding: '40px',
                        maxWidth: 480,
                    }}
                >
                    <div
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: '#FEE2E2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            fontSize: '36px',
                            color: '#EF4444',
                            fontWeight: 700,
                        }}
                    >
                        !
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: 12 }}>Application Error</h1>
                    <p style={{ fontSize: '14px', color: '#4B5563', marginBottom: 24, lineHeight: 1.6 }}>
                        A critical error occurred. This has been logged automatically. Please try refreshing the page.
                    </p>
                    {error?.digest && (
                        <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: 16 }}>Error ID: {error.digest}</p>
                    )}
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        <button
                            onClick={reset}
                            style={{
                                padding: '10px 24px',
                                background: '#00B166',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Try again
                        </button>
                        <button
                            onClick={() => (window.location.href = '/')}
                            style={{
                                padding: '10px 24px',
                                background: '#F3F4F6',
                                color: '#374151',
                                border: '1px solid #E5E7EB',
                                borderRadius: 8,
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
