'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Eye, EyeOff, Languages, Moon, Sun } from 'lucide-react';
import styles from './page.module.css';

export default function LoginPage() {
    const { login } = useAuth();
    const { t } = useTranslation();
    const { language, toggleLanguage } = useLanguage();
    const { resolvedTheme, toggleTheme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(email, password);
        if (!result.success) {
            setError(result.error || t('auth.loginFailed'));
        }
        setLoading(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.topActions}>
                <button className={styles.iconBtn} onClick={toggleLanguage} title={language === 'en' ? 'العربية' : 'English'}>
                    <Languages size={20} />
                    <span>{language === 'en' ? 'AR' : 'EN'}</span>
                </button>
                <button className={styles.iconBtn} onClick={toggleTheme}>
                    {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            <div className={styles.card}>
                <div className={styles.logoSection}>
                    <div className={styles.logo}>H</div>
                    <h1 className={styles.title}>{t('auth.loginTitle')}</h1>
                    <p className={styles.subtitle}>{t('auth.loginSubtitle')}</p>
                    <span style={{ display: 'inline-block', marginTop: 'var(--space-2)', padding: '2px var(--space-3)', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', background: 'color-mix(in srgb, var(--color-warning) 15%, transparent)', color: 'var(--color-warning)', border: '1px solid color-mix(in srgb, var(--color-warning) 40%, transparent)', borderRadius: 'var(--radius-full)' }}>
                        {t('auth.demoMode')}
                    </span>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.field}>
                        <label className={styles.label}>{t('auth.email')}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="superadmin@hagzy.com"
                            className={styles.input}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>{t('auth.password')}</label>
                        <div className={styles.passwordWrap}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder={t('auth.passwordPlaceholder')}
                                className={styles.input}
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className={styles.eyeBtn}
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className={styles.forgotRow}>
                        <a href="/forgot-password" className={styles.forgotLink}>
                            {t('auth.forgotPassword')}
                        </a>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? t('auth.signingIn') : t('auth.signIn')}
                    </button>
                </form>

                <div className={styles.demoHint}>
                    <p>{t('auth.demoAccounts')}</p>
                    <p>{t('auth.demoHint')}</p>
                </div>
            </div>
        </div>
    );
}
