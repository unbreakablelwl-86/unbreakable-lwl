import { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'unbreakable-pwa-dismiss';
const DISMISS_DAYS = 7;

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

function wasDismissedRecently(): boolean {
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const dismissed = Number(raw);
  return Date.now() - dismissed < DISMISS_DAYS * 86400000;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already installed or recently dismissed
    if (isStandalone() || wasDismissedRecently()) return;

    if (isIOS()) {
      // Show iOS guide after a short delay
      const timer = setTimeout(() => setShowIOSGuide(true), 3000);
      return () => clearTimeout(timer);
    }

    // Listen for the install prompt (Android / Chrome / Edge)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Show banner when we have a prompt or iOS guide
  useEffect(() => {
    if (deferredPrompt || showIOSGuide) {
      setVisible(true);
    }
  }, [deferredPrompt, showIOSGuide]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] animate-in slide-in-from-bottom duration-300 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-card border border-border rounded-xl p-4 shadow-2xl shadow-primary/10 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="w-10 h-10 min-w-[40px] rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Download className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-display text-sm tracking-wide text-foreground mb-1">
              ADD TO HOME SCREEN
            </p>

            {showIOSGuide ? (
              <>
                <p className="text-muted-foreground text-xs leading-relaxed mb-3">
                  Get the full app experience — tap{' '}
                  <Share className="w-3.5 h-3.5 inline-block text-primary -mt-0.5" />{' '}
                  <strong className="text-foreground">Share</strong> in Safari, then{' '}
                  <strong className="text-foreground">"Add to Home Screen"</strong>
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs font-display tracking-wider"
                  onClick={handleDismiss}
                >
                  GOT IT
                </Button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground text-xs leading-relaxed mb-3">
                  Install Unbreakable as an app on your device — instant access, no app store needed.
                </p>
                <Button
                  size="sm"
                  className="w-full text-xs font-display tracking-wider"
                  onClick={handleInstall}
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  INSTALL APP
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
