import { Link } from 'react-router-dom';
import trademarkBadge from '@/assets/trademark-badge.png';

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <img
              src={trademarkBadge}
              alt="Unbreakable Badge"
              className="h-10 object-contain logo-neon-glow mb-3"
            />
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Build a body and mind that last. Training, nutrition, mindset and
              education — all in one platform.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-display text-sm tracking-wider text-foreground mb-4">
              PLATFORM
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'Power', path: '/programming' },
                { label: 'Movement', path: '/tracker' },
                { label: 'Fuel', path: '/fuel' },
                { label: 'Mindset', path: '/mindset' },
                { label: 'University', path: '/university' },
                { label: 'Coaching', path: '/help' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="text-muted-foreground text-sm hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display text-sm tracking-wider text-foreground mb-4">
              COMPANY
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'Meet the Founder', path: '/founder' },
                { label: 'Plans & Pricing', path: '/plans' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="text-muted-foreground text-sm hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display text-sm tracking-wider text-foreground mb-4">
              LEGAL
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'Privacy Policy', path: '/privacy' },
                { label: 'Terms of Service', path: '/terms' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="text-muted-foreground text-sm hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            © {currentYear}{' '}
            <span className="text-primary font-display tracking-wide">
              UNBREAKABLE
            </span>
            . Live Without Limits LTD. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/unbreakable.lwl/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              Instagram
            </a>
            <a
              href="mailto:unbreakable.lwl@gmail.com"
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
