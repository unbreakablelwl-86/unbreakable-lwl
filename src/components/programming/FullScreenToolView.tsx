import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';

interface FullScreenToolViewProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function FullScreenToolView({
  title,
  subtitle,
  icon,
  onClose,
  children,
  footer,
}: FullScreenToolViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] bg-background flex flex-col"
    >
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                {icon}
              </div>
            )}
            <div>
              <h1 className="font-display text-lg text-foreground tracking-wide">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </header>

      {/* Content - scrollable area */}
      <main className="flex-1 overflow-y-auto overscroll-contain p-4">
        <div className="min-h-full">
          {children}
        </div>
      </main>

      {/* Footer */}
      {footer && (
        <footer className="p-4 border-t border-border bg-card shrink-0">
          {footer}
        </footer>
      )}
    </motion.div>
  );
}
