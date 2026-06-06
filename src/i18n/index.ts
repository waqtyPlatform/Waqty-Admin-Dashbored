export type Locale = 'en' | 'ar';
export type Messages = Record<string, string>;

/**
 * Lazily load ONLY the active locale's strings. Each locale is its own chunk
 * (dynamic import), so a page ships ~half the i18n payload instead of the full
 * bilingual table. `LanguageContext` gates first paint until this resolves.
 */
export function loadMessages(locale: Locale): Promise<Messages> {
    return (locale === 'ar' ? import('./messages/ar.json') : import('./messages/en.json')).then(
        m => (m as unknown as { default: Messages }).default
    );
}
