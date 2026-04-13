import type { Metadata } from 'next';
import './globals.css';
import './responsive.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
    title: 'Hagzy Admin - Platform Management',
    description: 'Super Admin Dashboard for managing the Hagzy platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
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
