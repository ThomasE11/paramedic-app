
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeBackground() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  return (
    <>
      {/* Light Mode Background */}
      {!isDark && (
        <>
          <div 
            className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-50 transition-opacity duration-500"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGFuZHNjYXBlJTIwYmFja2dyb3VuZHxlbnwwfHwwfHx8MA%3D%3D')`
            }}
          />
          {/* Light mode overlay for better glass effect */}
          <div className="fixed inset-0 bg-white/10 backdrop-blur-[1px] -z-40"></div>
        </>
      )}
      
      {/* Dark Mode Background */}
      {isDark && (
        <>
          <div 
            className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-50 transition-opacity duration-500"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1519904981063-b0cf448d479e?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGRhcmslMjBtb3VudGFpbnxlbnwwfHwwfHx8MA%3D%3D')`
            }}
          />
          {/* Dark mode overlay for better glass effect and readability */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] -z-40"></div>
        </>
      )}

      {/* Gradient overlay for consistent text readability */}
      <div className={`fixed inset-0 -z-30 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900/30 via-slate-800/20 to-slate-900/40' 
          : 'bg-gradient-to-br from-blue-50/30 via-white/20 to-blue-100/40'
      }`} />
    </>
  );
}
