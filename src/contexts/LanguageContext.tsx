'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
        const stored = localStorage.getItem('hagzy_settings');
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

    // Sync with HTML document
    useEffect(() => {
        document.documentElement.lang = language === 'ar' ? 'ar-EG' : 'en';
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }, [language]);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        // Also persist in settings
        try {
            const stored = localStorage.getItem('hagzy_settings');
            const current = stored ? JSON.parse(stored) : {};
            localStorage.setItem('hagzy_settings', JSON.stringify({ ...current, language: lang }));
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
