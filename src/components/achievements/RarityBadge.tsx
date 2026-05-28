/**
 * RarityBadge — Neon glow badge for rarity tier display
 * Used across card grid, leaderboard, profile, notifications.
 * Applies the full spec glow system per tier.
 */
import { cn } from '@/lib/utils';
import { RARITY_GLOW, type RarityTier, rarityTextGlow, rarityBoxGlow, rarityIconStyle } from '@/lib/rarityGlow';
import { Award, Medal, Crown, Diamond, Sparkles } from 'lucide-react';

const RARITY_ICONS: Record<RarityTier, React.ComponentType<any>> = {
  bronze: Award,
  silver: Medal,
  gold: Crown,
  diamond: Diamond,
  platinum: Sparkles,
};

interface RarityBadgeProps {
  tier: RarityTier;
  /** 'badge' = compact pill, 'label' = text with icon, 'icon' = icon only, 'underline' = tab indicator */
  variant?: 'badge' | 'label' | 'icon' | 'underline' | 'count';
  /** Optional count to show next to badge */
  count?: number;
  /** Size */
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export function RarityBadge({ tier, variant = 'badge', count, size = 'sm', className }: RarityBadgeProps) {
  const cfg = RARITY_GLOW[tier];
  const Icon = RARITY_ICONS[tier];
  const iconSize = size === 'xs' ? 10 : size === 'sm' ? 12 : 16;
  const textSize = size === 'xs' ? 'text-[8px]' : size === 'sm' ? 'text-[10px]' : 'text-xs';

  if (variant === 'icon') {
    return (
      <span className={cn('inline-flex items-center justify-center', className)}>
        <Icon
          width={iconSize}
          height={iconSize}
          style={rarityIconStyle(tier)}
        />
      </span>
    );
  }

  if (variant === 'underline') {
    return (
      <div
        className={cn('h-0.5 rounded-full', className)}
        style={{
          background: cfg.badgeGradient,
          boxShadow: `0 0 ${cfg.intensity * 3 + 4}px ${cfg.primary}60`,
        }}
      />
    );
  }

  if (variant === 'count') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 font-display tracking-wider',
          textSize,
          className,
        )}
        style={rarityTextGlow(tier)}
      >
        <Icon width={iconSize} height={iconSize} style={rarityIconStyle(tier)} />
        {count !== undefined && <span>{count}</span>}
      </span>
    );
  }

  if (variant === 'label') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 font-display tracking-[0.15em]',
          textSize,
          className,
        )}
        style={rarityTextGlow(tier)}
      >
        <Icon width={iconSize} height={iconSize} style={rarityIconStyle(tier)} />
        <span>{cfg.label}</span>
        {count !== undefined && (
          <span
            className="ml-1 font-mono"
            style={{ color: `${cfg.primary}99` }}
          >
            ×{count}
          </span>
        )}
      </span>
    );
  }

  // Default: badge pill
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-display tracking-[0.15em]',
        textSize,
        cfg.borderClass,
        cfg.bgClass,
        className,
      )}
      style={{
        ...rarityTextGlow(tier),
        ...rarityBoxGlow(tier),
      }}
    >
      <Icon width={iconSize} height={iconSize} style={rarityIconStyle(tier)} />
      <span>{cfg.label}</span>
      {count !== undefined && (
        <span className="ml-0.5 font-mono opacity-70">×{count}</span>
      )}
    </span>
  );
}

/**
 * RarityGlowContainer — Wrapper that applies rarity glow to any container
 */
interface RarityGlowContainerProps {
  tier: RarityTier;
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'span' | 'li';
}

export function RarityGlowContainer({
  tier,
  children,
  className,
  as: Tag = 'div',
}: RarityGlowContainerProps) {
  const cfg = RARITY_GLOW[tier];
  return (
    <Tag
      className={cn(
        'border rounded-xl transition-all',
        cfg.borderClass,
        className,
      )}
      style={rarityBoxGlow(tier)}
    >
      {children}
    </Tag>
  );
}
