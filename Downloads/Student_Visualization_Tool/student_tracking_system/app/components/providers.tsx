
'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeBackground } from '@/components/theme-background';
import { Toaster } from '@/components/ui/toaster';
import { ReactNode, useState, useEffect } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <SessionProvider
        basePath="/api/auth"
        refetchInterval={0}
        refetchOnWindowFocus={false}
      >
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider
      basePath="/api/auth"
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
        storageKey="student-tracker-theme"
        themes={['light', 'dark', 'system']}
      >
        <ThemeBackground />
        <div className="relative min-h-screen bg-transparent">
          {children}
        </div>
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  );
}
