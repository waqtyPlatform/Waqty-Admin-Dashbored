'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { setMoneyLocale } from '@/lib/market';
import { loadMessages, type Messages } from '@/i18n';
import { Logo } from '@/components/Logo';

type Language = 'en' | 'ar';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
    isRTL: boolean;
    messages: Messages;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getInitialLanguage(): Language {
    if (typeof window === 'undefined') return 'en';
    try {
        const stored = localStorage.getItem('waqty_settings');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.language === 'ar' || parsed.language === 'en') {
                return parsed.language;
            }
        }
    } catch {
        // ignore
    }
    return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>(getInitialLanguage);
    const [messages, setMessages] = useState<Messages | null>(null);

    // Load ONLY the active locale's strings (its own chunk); swap when the language
    // changes. The previous strings stay until the new ones resolve.
    useEffect(() => {
        let cancelled = false;
        loadMessages(language).then(m => {
            if (!cancelled) setMessages(m);
        });
        return () => {
            cancelled = true;
        };
    }, [language]);

    // Keep money formatting (formatMoney/formatCompactMoney) in sync with the UI
    // language. Set during render so the first paint of any money value already uses
    // the right currency word ("جنيه" vs "EGP").
    setMoneyLocale(language);

    // Sync with HTML document
    useEffect(() => {
        document.documentElement.lang = language === 'ar' ? 'ar-EG' : 'en';
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        // Mirror the locale into a cookie so the server (root layout) renders the
        // correct lang/dir on the next request's first paint.
        document.cookie = `waqty_lang=${language};path=/;max-age=31536000;SameSite=Lax`;
    }, [language]);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        // Also persist in settings
        try {
            const stored = localStorage.getItem('waqty_settings');
            const current = stored ? JSON.parse(stored) : {};
            localStorage.setItem('waqty_settings', JSON.stringify({ ...current, language: lang }));
        } catch {
            // ignore
        }
    }, []);

    const toggleLanguage = useCallback(() => {
        setLanguage(language === 'en' ? 'ar' : 'en');
    }, [language, setLanguage]);

    const isRTL = language === 'ar';

    const value = useMemo(
        () => ({ language, setLanguage, toggleLanguage, isRTL, messages: messages ?? {} }),
        [language, setLanguage, toggleLanguage, isRTL, messages]
    );

    // Gate first paint until the active locale resolves. Server + initial client
    // both render this splash (messages === null), so there is NO hydration
    // mismatch; the app reveals once the locale chunk loads on the client.
    if (!messages) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-secondary)',
                }}
            >
                <Logo height={36} />
            </div>
        );
    }

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
