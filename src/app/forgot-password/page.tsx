'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
    const { forgotPassword } = useAuth();
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await forgotPassword(email);
        setSent(true);
        setLoading(false);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', padding: 16 }}>
            <div style={{ width: '100%', maxWidth: 420, background: 'var(--bg-primary)', borderRadius: 16, boxShadow: 'var(--shadow-lg)', padding: 40, border: '1px solid var(--border-color)' }}>
                <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 24 }}>
                    <ArrowLeft size={16} /> {t('auth.backToLogin')}
                </Link>

                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--color-primary-50)', color: 'var(--color-primary-500)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Mail size={28} /></div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px' }}>{t('auth.forgotTitle')}</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>{t('auth.forgotSubtitle')}</p>
                </div>

                {sent ? (
                    <div style={{ textAlign: 'center', padding: 20, background: 'var(--color-success-light)', borderRadius: 8, fontSize: '0.875rem', color: '#065f46' }}>
                        Reset code sent to <strong>{email}</strong>. Check your inbox.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 6 }}>{t('auth.email')}</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@hagzy.com" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.875rem', color: 'var(--text-primary)', background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', outline: 'none' }} />
                        </div>
                        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', background: 'var(--color-primary-500)', color: 'white', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                            {loading ? 'Sending...' : t('auth.sendCode')}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
