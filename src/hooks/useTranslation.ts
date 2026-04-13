'use client';

import { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import translations from '../i18n/translations';

export function useTranslation() {
    const { language: lang } = useLanguage();

    const t = useMemo(
        () =>
            (key: string): string => {
                if (!translations[key]) {
                    if (process.env.NODE_ENV === 'development') {
                        console.warn(`Translation key not found: ${key}`);
                    }
                    return key;
                }
                return translations[key][lang] || translations[key].en;
            },
        [lang]
    );

    return { t, lang };
}
