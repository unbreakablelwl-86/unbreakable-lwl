/**
 * Renders a row of social-media icons that link to the user's profiles.
 * Designed for both own-profile and public-profile views.
 */

interface SocialLinksDisplayProps {
  instagram?: string | null;
  tiktok?: string | null;
  twitter?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  snapchat?: string | null;
  className?: string;
}

/* ── Small SVG brand icons ──────────────────────────────────── */
const Icons = {
  instagram: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  snapchat: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.97-.315.164-.104.355-.154.54-.154.395 0 .725.244.855.624.105.27.03.57-.195.87-.315.39-.945.684-1.86.87-.135.03-.27.045-.405.06-.225.03-.435.06-.645.15-.195.09-.33.24-.435.39l-.06.075c-.63.93-1.395 1.8-2.445 2.505-.15.105-.33.18-.51.255-.18.075-.465.12-.72.075-.255-.045-.48-.18-.66-.345-.24-.24-.435-.48-.615-.735-.21-.27-.39-.54-.54-.81-.18.3-.39.6-.63.885-.195.255-.39.48-.63.69-.18.165-.405.3-.66.345-.255.045-.54 0-.72-.075-.18-.075-.36-.15-.51-.255-1.05-.705-1.815-1.575-2.445-2.505l-.06-.075c-.105-.15-.24-.3-.435-.39-.21-.09-.42-.12-.645-.15-.135-.015-.27-.03-.405-.06-.915-.186-1.545-.48-1.86-.87-.225-.3-.3-.6-.195-.87.13-.38.46-.624.855-.624.185 0 .375.05.54.154.31.195.67.299.97.315.198 0 .326-.045.4-.09-.007-.165-.018-.33-.03-.51l-.002-.06c-.105-1.628-.23-3.654.3-4.847C5.65 1.07 9.006.793 9.996.793h.21z"/>
    </svg>
  ),
};

const LINKS: {
  key: keyof typeof Icons;
  propKey: keyof SocialLinksDisplayProps;
  urlFn: (handle: string) => string;
  color: string;
}[] = [
  { key: 'instagram', propKey: 'instagram', urlFn: (h) => `https://instagram.com/${h}`, color: 'hover:text-[#FF5500]' },
  { key: 'tiktok',    propKey: 'tiktok',    urlFn: (h) => `https://tiktok.com/@${h}`,   color: 'hover:text-foreground' },
  { key: 'twitter',   propKey: 'twitter',   urlFn: (h) => `https://x.com/${h}`,         color: 'hover:text-foreground' },
  { key: 'facebook',  propKey: 'facebook',  urlFn: (h) => h.startsWith('http') ? h : `https://facebook.com/${h}`, color: 'hover:text-[#FF5500]' },
  { key: 'youtube',   propKey: 'youtube',   urlFn: (h) => h.startsWith('http') ? h : `https://youtube.com/${h}`,  color: 'hover:text-[#FF5500]' },
  { key: 'snapchat',  propKey: 'snapchat',  urlFn: (h) => `https://snapchat.com/add/${h}`, color: 'hover:text-[#FF5500]' },
];

export function SocialLinksDisplay(props: SocialLinksDisplayProps) {
  const visible = LINKS.filter((l) => {
    const val = props[l.propKey];
    return val && typeof val === 'string' && val.trim().length > 0;
  });

  if (visible.length === 0) return null;

  return (
    <div className={`flex items-center gap-3 ${props.className ?? ''}`}>
      {visible.map((l) => {
        const handle = (props[l.propKey] as string).trim();
        return (
          <a
            key={l.key}
            href={l.urlFn(handle)}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-muted-foreground transition-colors ${l.color}`}
            title={`@${handle}`}
          >
            {Icons[l.key]}
          </a>
        );
      })}
    </div>
  );
}
