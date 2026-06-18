import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

const CONSENT_KEY = 'ub_cookie_consent';

type ConsentState = 'pending' | 'accepted' | 'rejected';

function getConsent(): ConsentState {
  try {
    return (localStorage.getItem(CONSENT_KEY) as ConsentState) || 'pending';
  } catch {
    return 'pending';
  }
}

function setConsent(value: 'accepted' | 'rejected') {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // noop
  }
}

/**
 * Disable Meta Pixel tracking if cookies are rejected.
 * The pixel is loaded in index.html — this disables it retroactively.
 */
function disableTracking() {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('consent', 'revoke');
  }
}

function enableTracking() {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('consent', 'grant');
  }
}

export default function CookieConsent() {
  const [state, setState] = useState<ConsentState>('accepted'); // default to hide flash

  useEffect(() => {
    const saved = getConsent();
    setState(saved);
    if (saved === 'rejected') disableTracking();
    if (saved === 'accepted') enableTracking();
  }, []);

  const handleAccept = () => {
    setConsent('accepted');
    setState('accepted');
    enableTracking();
  };

  const handleReject = () => {
    setConsent('rejected');
    setState('rejected');
    disableTracking();
  };

  return (
    <AnimatePresence>
      {state === 'pending' && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6"
        >
          <div className="max-w-lg mx-auto rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Cookie className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-sm tracking-wider text-foreground mb-1">COOKIES</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We use cookies for analytics to improve your experience. No personal data is sold.{' '}
                  <a
                    href="/privacy"
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </a>
                </p>
              </div>
              <button
                onClick={handleReject}
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 rounded-xl border border-border text-xs font-display tracking-wider text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
              >
                DECLINE
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-display tracking-wider hover:bg-primary/80 transition-colors shadow-lg shadow-primary/20"
              >
                ACCEPT
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
