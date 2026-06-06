'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setMoneyLocale } from '@/lib/market';

type Language = 'en' | 'ar';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
    isRTL: boolean;
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

    // Keep money formatting (formatMoney/formatCompactMoney) in sync with the UI
    // language. Set during render — before children render — so the very first paint
    // of any money value already uses the right currency word ("جنيه" vs "EGP").
    setMoneyLocale(language);

    // Sync with HTML document
    useEffect(() => {
        document.documentElement.lang = language === 'ar' ? 'ar-EG' : 'en';
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
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

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, isRTL }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
