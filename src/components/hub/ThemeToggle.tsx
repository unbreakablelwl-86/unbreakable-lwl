import { Moon, Sun } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect, useCallback } from 'react';

/**
 * Theme toggle that works for both authenticated and unauthenticated users.
 * Uses localStorage as the primary source of truth (instant response),
 * and syncs to Supabase user_settings in the background when logged in.
 */
export function ThemeToggle() {
  const { user } = useAuth();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return (localStorage.getItem('unbreakable_theme') as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Apply theme to DOM immediately
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
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      // Sync to Supabase in background (fire and forget)
      if (user) {
        import('@/integrations/supabase/client').then(({ supabase }) => {
          supabase
            .from('user_settings')
            .update({ theme: next })
            .eq('user_id', user.id)
            .then(() => {});
        });
      }
      return next;
    });
  }, [user]);

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-9 h-9 flex items-center justify-center rounded-full 
        border border-primary/20 bg-card/80 backdrop-blur-md
        hover:border-primary/40 hover:bg-primary/10
        active:scale-90 transition-all duration-200"
      style={{ boxShadow: isDark ? '0 0 10px rgba(0,0,0,0.5)' : '0 0 10px rgba(0,0,0,0.1)' }}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-primary" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.4))' }} />
      ) : (
        <Moon className="w-4 h-4 text-primary" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.4))' }} />
      )}
    </button>
  );
}
