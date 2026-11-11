import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// index.html applies the same choice before first paint; keep the key and logic in sync with it.
const storageKey = 'theme';
const darkQuery = '(prefers-color-scheme: dark)';

const savedTheme = (): Theme | null => {
  const value = localStorage.getItem(storageKey);
  return value === 'light' || value === 'dark' ? value : null;
};
const systemTheme = (): Theme => (window.matchMedia(darkQuery).matches ? 'dark' : 'light');

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => savedTheme() ?? systemTheme());

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Follow the OS setting until the user picks a theme explicitly.
  useEffect(() => {
    const media = window.matchMedia(darkQuery);
    const onChange = () => { if (!savedTheme()) setTheme(systemTheme()); };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem(storageKey, next);
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
