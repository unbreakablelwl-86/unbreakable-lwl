import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect, useCallback } from 'react';

// Local-only theme toggle for unauthenticated users
function useLocalTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return (localStorage.getItem('unbreakable_theme') as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    try { localStorage.setItem('unbreakable_theme', theme); } catch {}
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  return { theme, toggle };
}

export function ThemeToggle() {
  const { user } = useAuth();
  const { settings, toggleTheme, loading } = useUserSettings();
  const local = useLocalTheme();

  // Use user settings when logged in, local otherwise
  const isDark = user ? (settings?.theme ?? 'dark') === 'dark' : local.theme === 'dark';
  const handleToggle = user ? toggleTheme : local.toggle;

  if (user && loading) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className="relative overflow-hidden"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Sun
        className={`w-5 h-5 transition-all duration-300 ${
          isDark 
            ? 'rotate-90 scale-0 opacity-0' 
            : 'rotate-0 scale-100 opacity-100'
        }`}
      />
      <Moon
        className={`absolute w-5 h-5 transition-all duration-300 ${
          isDark 
            ? 'rotate-0 scale-100 opacity-100' 
            : '-rotate-90 scale-0 opacity-0'
        }`}
      />
    </Button>
  );
}
