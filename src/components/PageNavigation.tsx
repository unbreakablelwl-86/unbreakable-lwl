import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, animate, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';

const NAV_FLOW = [
  { path: '/', label: 'TIMELINE' },
  { path: '/calculators', label: 'CALCULATORS' },
  { path: '/programming', label: 'POWER' },
  { path: '/tracker', label: 'MOVEMENT' },
  { path: '/fuel', label: 'FUEL' },
  { path: '/help', label: 'COACHING' },
  { path: '/untunes', label: 'UN-TUNES' },
];

export function usePageNavigation() {
  const location = useLocation();
  const currentIndex = NAV_FLOW.findIndex(item => item.path === location.pathname);
  
  const prev = currentIndex > 0 ? NAV_FLOW[currentIndex - 1] : null;
  const next = currentIndex < NAV_FLOW.length - 1 ? NAV_FLOW[currentIndex + 1] : null;
  const current = NAV_FLOW[currentIndex] || null;
  
  return { prev, next, current, currentIndex, totalPages: NAV_FLOW.length };
}

interface PageNavigationProps {
  className?: string;
}

export function PageNavigation({ className }: PageNavigationProps) {
  const { prev, next, current, currentIndex, totalPages } = usePageNavigation();
  
  if (!current) return null;
  
  return (
    <nav className={cn(
      'border-b border-border bg-card/30 backdrop-blur-sm',
      className
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          {/* Previous */}
          {prev ? (
            <Link 
              to={prev.path}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">{prev.label}</span>
            </Link>
          ) : (
            <div className="w-20" />
          )}
          
          {/* Current Page Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {NAV_FLOW.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-all',
                    idx === currentIndex 
                      ? 'bg-primary w-4' 
                      : 'bg-muted-foreground/30'
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground font-medium hidden sm:block">
              {currentIndex + 1} / {totalPages}
            </span>
          </div>
          
          {/* Next */}
          {next ? (
            <Link 
              to={next.path}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
            >
              <span className="hidden sm:inline">{next.label}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : (
            <div className="w-20" />
          )}
        </div>
      </div>
    </nav>
  );
}

interface SwipeNavigationWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function SwipeNavigationWrapper({ children, className }: SwipeNavigationWrapperProps) {
  const { prev, next } = usePageNavigation();
  const navigate = useNavigate();
  const x = useMotionValue(0);
  
  const leftIndicatorOpacity = useTransform(x, [0, 100], [0, 1]);
  const rightIndicatorOpacity = useTransform(x, [-100, 0], [1, 0]);
  
  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const threshold = 100;
    const velocity = info.velocity.x;
    const offset = info.offset.x;
    
    // Swipe right to go to previous page
    if ((offset > threshold || velocity > 500) && prev) {
      navigate(prev.path);
    }
    // Swipe left to go to next page
    else if ((offset < -threshold || velocity < -500) && next) {
      navigate(next.path);
    }
    
    // Reset position
    animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 });
  }, [prev, next, navigate, x]);
  
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Left swipe indicator */}
      {prev && (
        <motion.div 
          className="fixed left-0 top-1/2 -translate-y-1/2 z-50 pointer-events-none"
          style={{ opacity: leftIndicatorOpacity }}
        >
          <div className="flex items-center gap-2 bg-primary/90 text-primary-foreground px-3 py-2 rounded-r-lg shadow-lg">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-display tracking-wide">{prev.label}</span>
          </div>
        </motion.div>
      )}
      
      {/* Right swipe indicator */}
      {next && (
        <motion.div 
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 pointer-events-none"
          style={{ opacity: rightIndicatorOpacity }}
        >
          <div className="flex items-center gap-2 bg-primary/90 text-primary-foreground px-3 py-2 rounded-l-lg shadow-lg">
            <span className="text-sm font-display tracking-wide">{next.label}</span>
            <ChevronRight className="w-5 h-5" />
          </div>
        </motion.div>
      )}
      
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="touch-pan-y"
      >
        {children}
      </motion.div>
    </div>
  );
}
