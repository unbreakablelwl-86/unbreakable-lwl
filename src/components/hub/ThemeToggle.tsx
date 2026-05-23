import { Moon, Sun } from 'lucide-react';
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
    <button
      onClick={handleToggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-9 h-9 flex items-center justify-center rounded-full 
        border border-[#FF5500]/20 bg-[#111]/80 backdrop-blur-md
        hover:border-[#FF5500]/40 hover:bg-[#FF5500]/10
        transition-all duration-200"
      style={{ boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}
    >
      {isDark ? (
        <Moon className="w-4 h-4 text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.4))' }} />
      ) : (
        <Sun className="w-4 h-4 text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.4))' }} />
      )}
    </button>
  );
}
