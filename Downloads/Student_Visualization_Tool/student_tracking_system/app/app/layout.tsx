
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Student Tracking System - HCT Al Ain',
  description: 'Student management system for HCT Al Ain EMS Program',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function setTheme(theme) {
                  const root = document.documentElement;
                  root.classList.remove('light', 'dark');
                  if (theme === 'dark') {
                    root.classList.add('dark');
                  } else {
                    root.classList.add('light');
                  }
                }

                try {
                  const stored = localStorage.getItem('student-tracker-theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                  if (stored === 'dark' || (stored === 'system' && prefersDark) || (!stored && prefersDark)) {
                    setTheme('dark');
                  } else {
                    setTheme('light');
                  }
                } catch (e) {
                  setTheme('light');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
