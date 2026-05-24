import { Zap } from 'lucide-react';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { cn } from '@/lib/utils';

interface TokenBalanceBadgeProps {
  className?: string;
  showTier?: boolean;
  size?: 'sm' | 'md';
}

export function TokenBalanceBadge({ className, showTier = false, size = 'sm' }: TokenBalanceBadgeProps) {
  const { balance, isUnlimited, tierDisplayName, loading } = useTokenBalance();

  if (loading) return null;

  const isLow = !isUnlimited && balance <= 5;
  const isEmpty = !isUnlimited && balance === 0;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1',
        isEmpty
          ? 'border-destructive/30 bg-destructive/10 text-destructive'
          : isLow
            ? 'border-primary/30 bg-primary/10 text-primary'
            : 'border-primary/20 bg-primary/5 text-primary',
        size === 'md' && 'px-3 py-1.5',
        className
      )}
    >
      <Zap className={cn('w-3 h-3', size === 'md' && 'w-4 h-4')} />
      <span className={cn('font-display text-xs tracking-wider', size === 'md' && 'text-sm')}>
        {isUnlimited ? '∞' : balance.toLocaleString()}
      </span>
      {showTier && (
        <span className="text-[10px] text-muted-foreground ml-0.5 font-medium">
          {tierDisplayName}
        </span>
      )}
    </div>
  );
}
