import { type LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Consistent empty-state UI for lists, feeds, and data views.
 * Drop in anywhere data might be empty — no more blank voids.
 */
export function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4"
        style={{ boxShadow: '0 0 20px rgba(255,85,0,0.08)' }}
      >
        <Icon className="w-7 h-7 text-primary/60" />
      </div>
      <h3 className="font-display text-base tracking-wider text-foreground mb-1">
        {title.toUpperCase()}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-5 py-2 bg-primary/10 text-primary font-display text-xs tracking-wider rounded-lg border border-primary/20 hover:bg-primary/20 transition-all"
        >
          {action.label.toUpperCase()}
        </button>
      )}
    </div>
  );
}
