'use client';

import { useEffect } from 'react';

export function ThemeScript() {
  useEffect(() => {
    function setTheme(theme: string) {
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
  }, []);

  return null;
}