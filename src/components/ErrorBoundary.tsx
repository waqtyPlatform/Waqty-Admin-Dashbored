'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '400px',
                        padding: 'var(--space-8)',
                        textAlign: 'center',
                        gap: 'var(--space-4)',
                    }}
                >
                    <div
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--color-error-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '28px',
                        }}
                    >
                        !
                    </div>
                    <h2
                        style={{
                            fontSize: 'var(--text-xl)',
                            fontWeight: 'var(--font-semibold)',
                            color: 'var(--text-primary)',
                        }}
                    >
                        Something went wrong
                    </h2>
                    <p
                        style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--text-secondary)',
                            maxWidth: 420,
                        }}
                    >
                        An unexpected error occurred. Please try again or contact support if the problem persists.
                    </p>
                    {this.state.error && (
                        <details
                            style={{
                                fontSize: 'var(--text-xs)',
                                color: 'var(--text-tertiary)',
                                maxWidth: 500,
                                textAlign: 'left',
                                padding: 'var(--space-3)',
                                background: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                            }}
                        >
                            <summary>Error details</summary>
                            <pre
                                style={{
                                    marginTop: 'var(--space-2)',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    fontFamily: 'var(--font-mono)',
                                }}
                            >
                                {this.state.error.message}
                            </pre>
                        </details>
                    )}
                    <button
                        onClick={this.handleReset}
                        style={{
                            marginTop: 'var(--space-2)',
                            padding: 'var(--space-2) var(--space-6)',
                            background: 'var(--color-primary-500)',
                            color: 'var(--text-inverse)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-medium)',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background var(--transition-fast)',
                        }}
                    >
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
