import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useCallback, useEffect } from 'react';

const THEME_KEY = 'paramedic-theme';

/**
 * Resolve the effective theme: saved preference > system preference > light.
 */
function getEffectiveTheme(): 'dark' | 'light' {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Apply the theme class to the document root so Tailwind picks it up.
 */
function applyTheme(theme: 'dark' | 'light') {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    const theme = getEffectiveTheme();
    // Ensure DOM matches on initial render
    applyTheme(theme);
    return theme === 'dark';
  });

  // Listen for system preference changes when no manual override is saved
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      // Only follow system when user hasn't set a manual preference
      if (!localStorage.getItem(THEME_KEY)) {
        const newDark = e.matches;
        applyTheme(newDark ? 'dark' : 'light');
        setIsDark(newDark);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const newIsDark = !prev;
      const theme = newIsDark ? 'dark' : 'light';
      applyTheme(theme);
      localStorage.setItem(THEME_KEY, theme);
      return newIsDark;
    });
  }, []);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative"
      aria-label="Toggle theme"
    >
      <Sun className={`h-4 w-4 transition-all ${isDark ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
      <Moon className={`absolute h-4 w-4 transition-all ${isDark ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`} />
    </Button>
  );
}
