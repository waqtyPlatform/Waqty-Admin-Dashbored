'use client';

import { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export function useTranslation() {
    const { language: lang, messages } = useLanguage();

    // `messages` is the ACTIVE locale's map (loaded as its own chunk by
    // LanguageContext), so lookups are a single key access.
    const t = useMemo(
        () =>
            (key: string): string => {
                const value = messages[key];
                if (value === undefined) {
                    if (process.env.NODE_ENV === 'development') {
                        console.warn(`Translation key not found: ${key}`);
                    }
                    return key;
                }
                return value;
            },
        [messages]
    );

    // Localize a piece of dynamic, data-driven bilingual text (e.g. a provider's
    // name). Returns the Arabic variant under the AR locale when present, else the
    // base/English value.
    const tn = useMemo(
        () =>
            (base: string, ar?: string | null): string =>
                lang === 'ar' && ar ? ar : base,
        [lang]
    );

    return { t, tn, lang };
}
