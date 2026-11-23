import { useEffect, useState } from 'react';
import * as Switch from '@radix-ui/react-switch';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem('bug-bazaar-theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Storage can be unavailable in private browsing.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('bug-bazaar-theme', theme);
    } catch {
      // The selected theme still works for this session.
    }
  }, [theme]);

  return (
    <Switch.Root
      className="theme-toggle"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      checked={theme === 'dark'}
      onCheckedChange={checked => setTheme(checked ? 'dark' : 'light')}
    >
      {theme === 'light' ? <Moon size={17} aria-hidden="true" /> : <Sun size={17} aria-hidden="true" />}
      <span className="theme-label">{theme === 'light' ? 'Dark' : 'Light'}</span>
    </Switch.Root>
  );
}
