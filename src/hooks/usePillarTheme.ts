import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Pillar accent colors — dynamically overrides `--primary` (HSL) so every
 * existing Tailwind `text-primary`, `bg-primary`, `border-primary` etc.
 * automatically picks up the pillar colour on each tab page.
 *
 * Also sets `--pillar-accent` (hex) and `--pillar-glow` for custom usage.
 *
 * Colors:
 *   Power    → #FF5500 (22° orange)  — default brand
 *   Fuel     → #10B981 (160° emerald)
 *   Movement → #10B981 (160° emerald)
 *   Mindset  → #8B5CF6 (263° violet)
 *   Academy  → #3B82F6 (217° blue)
 *   UnTunes  → #00BCD4 (187° cyan)
 *   Default  → #FF5500 (brand orange)
 */

interface PillarDef {
  hex: string;
  hsl: string; // "H S% L%" for Tailwind HSL vars
}

const BRAND_DEFAULT: PillarDef = { hex: '#FF5500', hsl: '22 100% 50%' };

const PILLAR_MAP: Record<string, PillarDef> = {
  '/programming':      { hex: '#FF5500', hsl: '22 100% 50%' },
  '/calculators':      { hex: '#FF5500', hsl: '22 100% 50%' },
  '/fuel':             { hex: '#10B981', hsl: '160 84% 39%' },
  '/tracker':          { hex: '#10B981', hsl: '160 84% 39%' },
  '/mindset':          { hex: '#8B5CF6', hsl: '263 70% 66%' },
  '/university':       { hex: '#3B82F6', hsl: '217 91% 60%' },
  '/habits':           { hex: '#10B981', hsl: '160 84% 39%' },
  '/coaches':          { hex: '#FF5500', hsl: '22 100% 50%' },
  '/inbox':            { hex: '#00BCD4', hsl: '187 100% 42%' },
  '/ai-tokens':        { hex: '#FFB300', hsl: '42 100% 50%' },
  '/explore':          { hex: '#E91E63', hsl: '340 82% 52%' },
  '/profile':          { hex: '#FF5500', hsl: '22 100% 50%' },
  '/help':             { hex: '#FF5500', hsl: '22 100% 50%' },
  '/admin':            { hex: '#FF5500', hsl: '22 100% 50%' },
  '/untunes':          { hex: '#00BCD4', hsl: '187 100% 42%' },
  '/unbreakable-86':   { hex: '#FF5500', hsl: '22 100% 50%' },
};

export function usePillarTheme() {
  const { pathname } = useLocation();

  useEffect(() => {
    const match = Object.entries(PILLAR_MAP).find(([prefix]) =>
      pathname.startsWith(prefix)
    );
    const pillar = match ? match[1] : BRAND_DEFAULT;

    const root = document.documentElement;
    // Override Tailwind's --primary so text-primary/bg-primary adapts
    root.style.setProperty('--primary', pillar.hsl);
    root.style.setProperty('--ring', pillar.hsl);
    root.style.setProperty('--accent', pillar.hsl);
    // Custom vars for manual usage
    root.style.setProperty('--pillar-accent', pillar.hex);
    root.style.setProperty('--pillar-glow', `${pillar.hex}40`);

    return () => {
      root.style.setProperty('--primary', BRAND_DEFAULT.hsl);
      root.style.setProperty('--ring', BRAND_DEFAULT.hsl);
      root.style.setProperty('--accent', BRAND_DEFAULT.hsl);
      root.style.setProperty('--pillar-accent', BRAND_DEFAULT.hex);
      root.style.setProperty('--pillar-glow', 'rgba(255,85,0,0.25)');
    };
  }, [pathname]);
}
