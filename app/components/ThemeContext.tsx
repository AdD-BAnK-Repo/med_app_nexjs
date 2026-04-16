'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Get initial theme from localStorage or system preference
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  
  const savedTheme = localStorage.getItem('theme') as Theme;
  if (savedTheme && ['dark', 'light', 'system'].includes(savedTheme)) {
    return savedTheme;
  }
  
  return 'system';
}

// Get resolved theme (dark or light) based on system preference if needed
function getResolvedTheme(theme: Theme): 'dark' | 'light' {
  if (theme === 'system') {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const initialTheme = getInitialTheme();
    setThemeState(initialTheme);
    setResolvedTheme(getResolvedTheme(initialTheme));
    setMounted(true);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const newResolvedTheme = getResolvedTheme(theme);
    setResolvedTheme(newResolvedTheme);

    // Set data-theme attribute
    document.documentElement.setAttribute('data-theme', newResolvedTheme);
    
    // Store preference
    localStorage.setItem('theme', theme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', newResolvedTheme === 'dark' ? '#0a0a0f' : '#f8fafc');
    }
  }, [theme, mounted]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'dark';
      // If system, check current resolved theme
      const isDark = resolvedTheme === 'dark';
      return isDark ? 'light' : 'dark';
    });
  }, [resolvedTheme]);

  // Prevent hydration mismatch — show content immediately, theme will resolve on client
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return default value if not in provider
    return { 
      theme: 'dark' as Theme, 
      resolvedTheme: 'dark' as 'dark' | 'light',
      toggleTheme: () => {},
      setTheme: () => {}
    };
  }
  return context;
}
