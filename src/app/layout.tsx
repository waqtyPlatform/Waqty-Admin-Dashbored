import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import './responsive.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import AppShell from '@/components/layout/AppShell';

// Design Language v2 — "Refined & premium": IBM Plex Sans (Latin UI), IBM Plex
// Sans Arabic (RTL), IBM Plex Mono (money / tabular figures). Self-hosted via
// next/font (same-origin, no runtime @import round-trip). Plex tops out at 700.
const plexSans = IBM_Plex_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    display: 'swap',
    variable: '--font-plex-sans',
});

const plexArabic = IBM_Plex_Sans_Arabic({
    subsets: ['arabic'],
    weight: ['300', '400', '500', '600', '700'],
    display: 'swap',
    variable: '--font-plex-arabic',
});

const plexMono = IBM_Plex_Mono({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    display: 'swap',
    variable: '--font-plex-mono',
});

export const metadata: Metadata = {
    title: 'Hagzy Admin - Platform Management',
    description: 'Super Admin Dashboard for managing the Hagzy platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html
            lang="en"
            dir="ltr"
            suppressHydrationWarning
            className={`${plexSans.variable} ${plexArabic.variable} ${plexMono.variable}`}
        >
            <body suppressHydrationWarning>
                <ThemeProvider>
                    <LanguageProvider>
                        <AuthProvider>
                            <AppShell>{children}</AppShell>
                        </AuthProvider>
                    </LanguageProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
