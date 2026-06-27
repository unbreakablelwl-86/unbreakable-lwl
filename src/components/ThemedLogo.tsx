const logo = 'https://vlwcoqilwyfcrsxodtdx.supabase.co/storage/v1/object/public/site-assets/misc/logo.webp';

interface ThemedLogoProps {
  className?: string;
  alt?: string;
}

export function ThemedLogo({ className = 'h-10 object-contain', alt = 'Unbreakable - Live Without Limits' }: ThemedLogoProps) {
  return (
    <img
      src={logo}
      alt={alt}
      className={`${className} logo-neon-glow`}
    />
  );
}
