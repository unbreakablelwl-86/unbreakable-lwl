import { Link } from 'react-router-dom';
import { ThemedLogo } from '@/components/ThemedLogo';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  /** Section label shown next to logo (e.g., "POWER", "FUEL") */
  sectionLabel?: string;
  /** Whether to show sign-in button for logged out users */
  showSignIn?: boolean;
  /** Callback when sign-in is clicked */
  onSignIn?: () => void;
  /** Whether to show sticky header */
  sticky?: boolean;
  /** Additional classes */
  className?: string;
}

export function PageHeader({
  sectionLabel,
  showSignIn = false,
  onSignIn,
  sticky = true,
  className = '',
}: PageHeaderProps) {
  return (
    <header
      className={`${sticky ? 'sticky top-0 z-50' : ''} bg-background/80 backdrop-blur-md border-b border-primary/15 ${className}`}
    >
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <ThemedLogo className="h-8 w-8 sm:h-10 sm:w-10" />
              <div className="hidden sm:flex items-center gap-2">
                <span className="font-display text-lg tracking-wide text-foreground">
                  UNBREAKABLE
                </span>
                {sectionLabel && (
                  <span className="font-display text-sm tracking-wide text-primary">
                    {sectionLabel}
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {showSignIn && onSignIn && (
              <Button
                className="font-display tracking-wide"
                onClick={onSignIn}
              >
                SIGN IN
              </Button>
            )}
</div>
        </div>
      </div>
    </header>
  );
}
