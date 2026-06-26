/**
 * PageSkeleton — Reusable shimmer loading states for pages.
 * Matches the visual layout of each page for smooth perceived load.
 */
import { Skeleton } from '@/components/ui/skeleton';

/** Generic card-style skeleton */
function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-3">
      <Skeleton className="h-4 w-2/3 bg-foreground/[0.06]" />
      <Skeleton className="h-3 w-full bg-foreground/[0.04]" />
      <Skeleton className="h-3 w-4/5 bg-foreground/[0.04]" />
    </div>
  );
}

/** Home page skeleton */
export function HomeSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40 bg-foreground/[0.06]" />
        <Skeleton className="h-8 w-8 rounded-full bg-foreground/[0.06]" />
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="rounded-xl border border-border/50 bg-card/50 p-3 space-y-2">
            <Skeleton className="h-3 w-12 bg-foreground/[0.04]" />
            <Skeleton className="h-6 w-16 bg-foreground/[0.06]" />
          </div>
        ))}
      </div>
      {/* Cards */}
      {[0, 1, 2].map(i => <CardSkeleton key={i} />)}
    </div>
  );
}

/** Profile page skeleton */
export function ProfileSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-300">
      {/* Avatar + name */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full bg-foreground/[0.06]" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32 bg-foreground/[0.06]" />
          <Skeleton className="h-3 w-24 bg-foreground/[0.04]" />
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="rounded-xl border border-border/50 bg-card/50 p-3 space-y-2">
            <Skeleton className="h-3 w-16 bg-foreground/[0.04]" />
            <Skeleton className="h-5 w-12 bg-foreground/[0.06]" />
          </div>
        ))}
      </div>
      {/* Sections */}
      {[0, 1].map(i => <CardSkeleton key={i} />)}
    </div>
  );
}

/** Achievements / Cards skeleton */
export function CardCollectionSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-300">
      <Skeleton className="h-6 w-48 bg-foreground/[0.06]" />
      {/* Filter bar */}
      <div className="flex gap-2">
        {[0, 1, 2, 3].map(i => (
          <Skeleton key={i} className="h-8 w-20 rounded-full bg-foreground/[0.06]" />
        ))}
      </div>
      {/* Card grid */}
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
            <Skeleton className="aspect-[3/4] w-full bg-foreground/[0.04]" />
            <div className="p-2 space-y-1.5">
              <Skeleton className="h-3 w-3/4 bg-foreground/[0.06]" />
              <Skeleton className="h-2 w-1/2 bg-foreground/[0.04]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Un-Tunes store skeleton */
export function UnTunesSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-300">
      <Skeleton className="h-6 w-36 bg-foreground/[0.06]" />
      {/* Featured */}
      <Skeleton className="h-48 w-full rounded-xl bg-foreground/[0.04]" />
      {/* Albums row */}
      <div className="flex gap-3 overflow-hidden">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex-shrink-0 w-36">
            <Skeleton className="h-36 w-36 rounded-lg bg-foreground/[0.04]" />
            <Skeleton className="h-3 w-24 mt-2 bg-foreground/[0.06]" />
          </div>
        ))}
      </div>
      {/* Tracks */}
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-3 py-2">
          <Skeleton className="h-10 w-10 rounded bg-foreground/[0.04]" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-2/3 bg-foreground/[0.06]" />
            <Skeleton className="h-2 w-1/3 bg-foreground/[0.04]" />
          </div>
          <Skeleton className="h-7 w-16 rounded bg-foreground/[0.06]" />
        </div>
      ))}
    </div>
  );
}

/** Coach / Chat skeleton */
export function CoachSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-300">
      <Skeleton className="h-6 w-44 bg-foreground/[0.06]" />
      {/* Chat bubbles */}
      {[0, 1, 2].map(i => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
          <div className={`rounded-xl p-3 space-y-2 ${i % 2 === 0 ? 'w-3/4' : 'w-2/3'}`}>
            <Skeleton className="h-3 w-full bg-foreground/[0.06]" />
            <Skeleton className="h-3 w-4/5 bg-foreground/[0.04]" />
            {i % 2 === 0 && <Skeleton className="h-3 w-2/3 bg-foreground/[0.04]" />}
          </div>
        </div>
      ))}
      {/* Input */}
      <div className="fixed bottom-20 left-4 right-4">
        <Skeleton className="h-12 w-full rounded-xl bg-foreground/[0.06]" />
      </div>
    </div>
  );
}

/** Generic list skeleton */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="p-4 space-y-3 animate-in fade-in duration-300">
      <Skeleton className="h-6 w-40 bg-foreground/[0.06]" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2 border-b border-border/30">
          <Skeleton className="h-10 w-10 rounded-lg bg-foreground/[0.04]" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-3/4 bg-foreground/[0.06]" />
            <Skeleton className="h-2 w-1/2 bg-foreground/[0.04]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Full-page loading wrapper — shows skeleton while loading, then children */
export function PageLoader({
  loading,
  skeleton,
  children,
}: {
  loading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
}) {
  if (loading) return <>{skeleton}</>;
  return <>{children}</>;
}
