import { Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { cn } from '@/lib/utils';

interface TokenBalanceBadgeProps {
  className?: string;
  showTier?: boolean;
  size?: 'sm' | 'md';
}

/**
 * Coach fuel badge.
 *
 * Members never see a raw token count (JJ, Aug 2026) — the badge shows how much
 * fuel is left as a bar plus a plain-English label. Tapping it opens pricing.
 */
export function TokenBalanceBadge({ className, showTier = false, size = 'sm' }: TokenBalanceBadgeProps) {
  const navigate = useNavigate();
  const { balance, monthlyTokens, isUnlimited, tierDisplayName, loading } = useTokenBalance();

  if (loading) return null;

  const allowance = monthlyTokens || 0;
  const percent = isUnlimited
    ? 100
    : allowance > 0
      ? Math.max(0, Math.min(100, (balance / allowance) * 100))
      : balance > 0 ? 100 : 0;

  const isEmpty = !isUnlimited && percent === 0;
  const isLow = !isUnlimited && percent > 0 && percent < 15;

  const label = isUnlimited
    ? 'UNLIMITED'
    : percent >= 75 ? 'FULL'
      : percent >= 40 ? 'GOOD'
        : percent >= 15 ? 'LOW'
          : percent > 0 ? 'NEARLY OUT'
            : 'EMPTY';

  return (
    <div
      onClick={() => navigate('/token-pricing')}
      role="button"
      aria-label={`Coach fuel: ${label.toLowerCase()}`}
      className={cn(
        'cursor-pointer hover:opacity-80 transition-opacity',
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
      <div className={cn('h-1.5 w-10 rounded-full bg-muted overflow-hidden', size === 'md' && 'w-14 h-2')}>
        <div
          className={cn(
            'h-full rounded-full transition-all',
            isEmpty || isLow ? 'bg-destructive' : 'bg-primary'
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className={cn('font-display text-[10px] tracking-wider', size === 'md' && 'text-xs')}>
        {label}
      </span>
      {showTier && (
        <span className="text-[10px] text-muted-foreground ml-0.5 font-medium">
          {tierDisplayName}
        </span>
      )}
    </div>
  );
}
