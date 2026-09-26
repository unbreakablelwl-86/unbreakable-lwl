import { useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, HelpCircle,
  Users, Target, Flame, CreditCard, Activity, Repeat, ShieldCheck, RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import {
  useFounderDashboard,
  RANGE_LABELS,
  type FounderDashboardRange,
} from '@/hooks/useFounderDashboard';

// ---------------------------------------------------------------------------
// Types matching the shape returned by public.get_founder_dashboard_metrics()
// ---------------------------------------------------------------------------
interface DashboardData {
  generated_at: string;
  overview: {
    total_members: number;
    new_members_period: number;
    new_members_prev_period: number;
    confirmed_members: number;
    active_subscriptions_total: number;
    active_subscriptions_by_tier: Record<string, number>;
    new_subscriptions_period: number;
    cancellations_period: number;
    revenue_events_period: number;
    u86_active_participants: number;
    u86_completions_alltime: number;
    u86_completion_rate_alltime: number | null;
    engagement_events_period: number;
  };
  acquisition: {
    signups_period: number;
    signups_prev_period: number;
    acquisition_source_breakdown: null;
    signup_to_onboarding_rate: number | null;
    onboarding_to_u86_activation_rate: number | null;
    data_gaps: string[];
  };
  u86: {
    total_starts_alltime: number;
    starts_period: number;
    starts_prev_period: number;
    currently_active: number;
    by_status: Record<string, number>;
    day7_progression: number;
    day30_progression: number;
    day60_progression: number;
    day86_completions: number;
    completion_rate_alltime: number | null;
    avg_current_day_active_participants: number;
    reset_count_total_alltime: number;
  };
  commercial: {
    active_subscriptions_by_tier: Record<string, number>;
    active_subscriptions_total: number;
    new_subscriptions_period: number;
    cancellations_period: number;
    payment_failed_period: number;
    payment_succeeded_period: number;
    checkout_started_period: number;
    checkout_completed_period: number;
    trial_started_period: number;
    lifetime_discount_applied_period: number;
    checkout_conversion_rate_period: number | null;
    processed_stripe_webhook_events_alltime: number;
    data_gaps: string[];
  };
  engagement: {
    workout_sessions_period: number;
    workout_sessions_prev_period: number;
    food_logs_period: number;
    posts_period: number;
    posts_prev_period: number;
    notifications_sent_period: number;
    notifications_read_rate_period: number;
    university_completions_period: number;
    mindset_completions_period: number;
    u86_daily_logs_period: number;
    coverage_notes: string[];
  };
  retention: {
    day1_retention: null;
    day7_retention: null;
    day30_retention: null;
    monthly_retention: null;
    retention_unknown_reason: string;
    u86_daily_log_consistency_active_participants: number;
  };
  data_health: {
    total_events_alltime: number;
    total_events_period: number;
    total_events_prev_period: number;
    event_counts_alltime: Record<string, number>;
    event_counts_period: Record<string, number>;
    distinct_event_names_seen_alltime: string[];
    instrumented_event_names_expected: string[];
    events_never_fired: string[];
    last_event_at: string | null;
    events_last_24h: number;
    events_last_7d: number;
    possible_duplicate_events_alltime: number;
    processed_stripe_events_alltime: number;
    analytics_pipeline_live_since: string;
  };
}

type MetricKind = 'FACT' | 'CALCULATED' | 'UNKNOWN';

function ClassBadge({ kind }: { kind: MetricKind }) {
  const styles: Record<MetricKind, string> = {
    FACT: 'bg-primary/10 text-primary border-primary/30',
    CALCULATED: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    UNKNOWN: 'bg-muted text-muted-foreground border-border',
  };
  return (
    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 tracking-wide ${styles[kind]}`}>
      {kind}
    </Badge>
  );
}

function formatValue(value: number | string | null | undefined, format?: 'percent' | 'plain'): string {
  if (value === null || value === undefined) return '—';
  if (format === 'percent') return `${Math.round((value as number) * 1000) / 10}%`;
  if (typeof value === 'number') return value.toLocaleString();
  return String(value);
}

function Delta({ current, prev }: { current: number | null | undefined; prev: number | null | undefined }) {
  if (current === null || current === undefined || prev === null || prev === undefined) return null;
  if (prev === 0 && current === 0) return null;
  if (prev === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-primary">
        <TrendingUp className="w-3 h-3" /> new
      </span>
    );
  }
  const diff = current - prev;
  const pct = Math.round((diff / prev) * 100);
  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus className="w-3 h-3" /> flat vs prior period
      </span>
    );
  }
  const Icon = diff > 0 ? TrendingUp : TrendingDown;
  const color = diff > 0 ? 'text-emerald-500' : 'text-destructive';
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs ${color}`}>
      <Icon className="w-3 h-3" /> {diff > 0 ? '+' : ''}{diff} ({pct > 0 ? '+' : ''}{pct}%) vs prior period
    </span>
  );
}

interface TileProps {
  label: string;
  value: number | string | null | undefined;
  kind: MetricKind;
  format?: 'percent' | 'plain';
  prev?: number | null;
  note?: string;
}

function MetricTile({ label, value, kind, format, prev, note }: TileProps) {
  const isUnknown = kind === 'UNKNOWN' || value === null || value === undefined;
  return (
    <div
      className={`rounded-lg border p-3 flex flex-col gap-1 ${isUnknown ? 'border-dashed border-border bg-muted/30' : 'border-border bg-card'}`}
      title={note}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground leading-tight">{label}</span>
        <ClassBadge kind={kind} />
      </div>
      <div className={`text-xl font-display ${isUnknown ? 'text-muted-foreground' : 'text-foreground'}`}>
        {isUnknown ? 'Unavailable' : formatValue(value, format)}
      </div>
      {!isUnknown && prev !== undefined && (
        <Delta current={value as number} prev={prev} />
      )}
      {note && isUnknown && (
        <p className="text-[10px] text-muted-foreground leading-snug">{note}</p>
      )}
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
  accent,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
  accent?: 'default' | 'warn';
}) {
  return (
    <Card className={accent === 'warn' ? 'border-amber-500/30 bg-card' : 'border-border bg-card'}>
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-base flex items-center gap-2 tracking-wide">
          <Icon className={`w-4 h-4 ${accent === 'warn' ? 'text-amber-500' : 'text-primary'}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {children}
      </CardContent>
    </Card>
  );
}

export function FounderIntelligenceDashboard() {
  const { range, setRange, data, loading, error, refetch } = useFounderDashboard('30d');
  const d = data as unknown as DashboardData | null;

  const staleness = useMemo(() => {
    if (!d?.data_health?.last_event_at) return null;
    const last = new Date(d.data_health.last_event_at);
    const hoursAgo = (Date.now() - last.getTime()) / 3600000;
    return { last, hoursAgo, stale: hoursAgo > 72 };
  }, [d]);

  return (
    <div className="space-y-4">
      {/* Header + time controls */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="font-display text-lg tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              FOUNDER INTELLIGENCE
            </h2>
            <p className="text-xs text-muted-foreground">
              Read-only view of authoritative production data. Dev access only.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {(Object.keys(RANGE_LABELS) as FounderDashboardRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-display tracking-wide whitespace-nowrap border transition-colors ${
                range === r
                  ? 'bg-primary/15 border-primary/40 text-primary'
                  : 'border-border bg-card/50 text-muted-foreground hover:border-primary/20'
              }`}
            >
              {RANGE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Data trust banner */}
      {d && (
        <div
          className={`rounded-lg border p-3 flex items-start gap-2 text-xs ${
            staleness?.stale
              ? 'border-amber-500/40 bg-amber-500/5 text-amber-600'
              : 'border-primary/20 bg-primary/5 text-muted-foreground'
          }`}
        >
          {staleness?.stale ? (
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
          )}
          <div>
            <p>
              Analytics pipeline live since <strong>{d.data_health.analytics_pipeline_live_since}</strong> —{' '}
              {d.data_health.total_events_alltime} event(s) recorded all-time. Last event{' '}
              {d.data_health.last_event_at
                ? formatDistanceToNow(new Date(d.data_health.last_event_at), { addSuffix: true })
                : 'never'}
              .
            </p>
            <p className="mt-0.5">
              With only {d.overview.total_members} total accounts in production, every rate and percentage below
              is based on a very small sample — read trends directionally, not as statistically reliable figures, until
              volume grows.
            </p>
          </div>
        </div>
      )}

      {loading && !d && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load dashboard data: {error}
        </div>
      )}

      {d && (
        <>
          {/* 1. Executive Overview */}
          <SectionCard icon={Target} title="1. Executive Overview">
            <MetricTile label="Total Members" value={d.overview.total_members} kind="FACT" />
            <MetricTile
              label="New Members (period)"
              value={d.overview.new_members_period}
              prev={d.overview.new_members_prev_period}
              kind="FACT"
            />
            <MetricTile label="Confirmed Emails" value={d.overview.confirmed_members} kind="FACT" />
            <MetricTile
              label="Active Subscriptions"
              value={d.overview.active_subscriptions_total}
              kind="FACT"
              note="From token_balances.current_tier ≠ free — see Commercial data gaps: some were set by manual DB writes, not real Stripe checkouts."
            />
            <MetricTile
              label="New Subscriptions (period)"
              value={d.overview.new_subscriptions_period}
              kind="FACT"
              note="Counts subscription_started analytics events in the selected period."
            />
            <MetricTile
              label="Cancellations (period)"
              value={d.overview.cancellations_period}
              kind="FACT"
            />
            <MetricTile
              label="Revenue Events (period)"
              value={d.overview.revenue_events_period}
              kind="FACT"
              note="Count of payment_succeeded events — not a £ amount. No monetary field exists in analytics."
            />
            <MetricTile
              label="U86 Active Participants"
              value={d.overview.u86_active_participants}
              kind="FACT"
            />
            <MetricTile
              label="U86 Completion Rate (all-time)"
              value={d.overview.u86_completion_rate_alltime}
              format="percent"
              kind="CALCULATED"
              note="Completions ÷ total starts, all-time. Sample size is very small — treat as directional only."
            />
            <MetricTile
              label="Overall Engagement (period)"
              value={d.overview.engagement_events_period}
              kind="CALCULATED"
              note="Sum of workout sessions + food logs + posts + U86 daily logs in the selected period."
            />
          </SectionCard>

          {/* 2. Acquisition */}
          <SectionCard icon={Users} title="2. Acquisition">
            <MetricTile
              label="Sign-ups (period)"
              value={d.acquisition.signups_period}
              prev={d.acquisition.signups_prev_period}
              kind="FACT"
            />
            <MetricTile
              label="Acquisition Source Breakdown"
              value={null}
              kind="UNKNOWN"
              note="No acquisition source, campaign, or referrer is captured anywhere in the schema for general sign-ups."
            />
            <MetricTile
              label="Signup → Onboarding"
              value={d.acquisition.signup_to_onboarding_rate}
              format="percent"
              kind="CALCULATED"
              note="Approximated as profiles.terms_accepted_at IS NOT NULL ÷ total profiles. No dedicated onboarding-completed event exists."
            />
            <MetricTile
              label="Onboarding → U86 Activation"
              value={d.acquisition.onboarding_to_u86_activation_rate}
              format="percent"
              kind="CALCULATED"
            />
          </SectionCard>

          {/* 3. Unbreakable86 */}
          <SectionCard icon={Flame} title="3. Unbreakable86">
            <MetricTile
              label="Total Starts (all-time)"
              value={d.u86.total_starts_alltime}
              kind="FACT"
            />
            <MetricTile
              label="Starts (period)"
              value={d.u86.starts_period}
              prev={d.u86.starts_prev_period}
              kind="FACT"
            />
            <MetricTile label="Currently Active" value={d.u86.currently_active} kind="FACT" />
            <MetricTile
              label="By Status"
              value={Object.entries(d.u86.by_status).map(([k, v]) => `${k}: ${v}`).join(' · ') || null}
              kind="FACT"
            />
            <MetricTile label="Reached Day 7" value={d.u86.day7_progression} kind="FACT" />
            <MetricTile label="Reached Day 30" value={d.u86.day30_progression} kind="FACT" />
            <MetricTile label="Reached Day 60" value={d.u86.day60_progression} kind="FACT" />
            <MetricTile label="Day 86 Completions" value={d.u86.day86_completions} kind="FACT" />
            <MetricTile
              label="Completion Rate (all-time)"
              value={d.u86.completion_rate_alltime}
              format="percent"
              kind="CALCULATED"
              note="Very small sample — directional only."
            />
            <MetricTile
              label="Avg Current Day (active)"
              value={d.u86.avg_current_day_active_participants}
              kind="CALCULATED"
            />
            <MetricTile
              label="Total Resets (all-time)"
              value={d.u86.reset_count_total_alltime}
              kind="FACT"
            />
          </SectionCard>

          {/* 4. Commercial */}
          <SectionCard icon={CreditCard} title="4. Commercial">
            <MetricTile
              label="Active Subs by Tier"
              value={Object.entries(d.commercial.active_subscriptions_by_tier).map(([k, v]) => `${k}: ${v}`).join(' · ') || null}
              kind="FACT"
            />
            <MetricTile label="New Subscriptions (period)" value={d.commercial.new_subscriptions_period} kind="FACT" />
            <MetricTile label="Cancellations (period)" value={d.commercial.cancellations_period} kind="FACT" />
            <MetricTile label="Payment Failures (period)" value={d.commercial.payment_failed_period} kind="FACT" />
            <MetricTile label="Payments Succeeded (period)" value={d.commercial.payment_succeeded_period} kind="FACT" />
            <MetricTile label="Checkouts Started (period)" value={d.commercial.checkout_started_period} kind="FACT" />
            <MetricTile label="Checkouts Completed (period)" value={d.commercial.checkout_completed_period} kind="FACT" />
            <MetricTile
              label="Checkout Conversion (period)"
              value={d.commercial.checkout_conversion_rate_period}
              format="percent"
              kind="CALCULATED"
              note={d.commercial.checkout_started_period === 0 ? 'No checkouts started in this period.' : undefined}
            />
            <MetricTile label="Trials Started (period)" value={d.commercial.trial_started_period} kind="FACT" />
            <MetricTile
              label="Stripe Webhooks Processed (all-time)"
              value={d.commercial.processed_stripe_webhook_events_alltime}
              kind="FACT"
              note="0 historically means no Stripe webhook has ever been confirmed fully processed in this project."
            />
            <MetricTile
              label="Revenue (£)"
              value={null}
              kind="UNKNOWN"
              note="No monetary amount field exists in analytics_events. Use the Stripe dashboard directly for £ revenue totals."
            />
          </SectionCard>

          {/* 5. Product Engagement */}
          <SectionCard icon={Activity} title="5. Product Engagement">
            <MetricTile
              label="Workout Sessions (period)"
              value={d.engagement.workout_sessions_period}
              prev={d.engagement.workout_sessions_prev_period}
              kind="FACT"
            />
            <MetricTile label="Food Logs (period)" value={d.engagement.food_logs_period} kind="FACT" />
            <MetricTile
              label="Social Posts (period)"
              value={d.engagement.posts_period}
              prev={d.engagement.posts_prev_period}
              kind="FACT"
            />
            <MetricTile
              label="Notifications Sent (period)"
              value={d.engagement.notifications_sent_period}
              kind="FACT"
            />
            <MetricTile
              label="Notification Read Rate (period)"
              value={d.engagement.notifications_read_rate_period}
              format="percent"
              kind="CALCULATED"
            />
            <MetricTile label="University Completions (period)" value={d.engagement.university_completions_period} kind="FACT" />
            <MetricTile label="Mindset Completions (period)" value={d.engagement.mindset_completions_period} kind="FACT" />
            <MetricTile label="U86 Daily Logs (period)" value={d.engagement.u86_daily_logs_period} kind="FACT" />
            <MetricTile
              label="AI Coach Usage"
              value={null}
              kind="UNKNOWN"
              note="No dedicated analytics events exist for AI Coach usage."
            />
          </SectionCard>

          {/* 6. Retention */}
          <SectionCard icon={Repeat} title="6. Retention">
            <MetricTile label="Day 1 Retention" value={null} kind="UNKNOWN" note={d.retention.retention_unknown_reason} />
            <MetricTile label="Day 7 Retention" value={null} kind="UNKNOWN" note={d.retention.retention_unknown_reason} />
            <MetricTile label="Day 30 Retention" value={null} kind="UNKNOWN" note={d.retention.retention_unknown_reason} />
            <MetricTile label="Monthly Retention" value={null} kind="UNKNOWN" note={d.retention.retention_unknown_reason} />
            <MetricTile
              label="U86 Daily-Log Consistency"
              value={d.retention.u86_daily_log_consistency_active_participants}
              format="percent"
              kind="CALCULATED"
              note="Proxy metric: % of elapsed enrolment days with a submitted daily log, averaged across currently-active participants. Not a true return-visit retention metric."
            />
          </SectionCard>

          {/* 7. Data Health */}
          <SectionCard
            icon={HelpCircle}
            title="7. Data Health"
            accent={staleness?.stale || d.data_health.possible_duplicate_events_alltime > 0 ? 'warn' : 'default'}
          >
            <MetricTile label="Events Received (all-time)" value={d.data_health.total_events_alltime} kind="FACT" />
            <MetricTile
              label="Events (period)"
              value={d.data_health.total_events_period}
              prev={d.data_health.total_events_prev_period}
              kind="FACT"
            />
            <MetricTile label="Events (last 24h)" value={d.data_health.events_last_24h} kind="FACT" />
            <MetricTile label="Events (last 7d)" value={d.data_health.events_last_7d} kind="FACT" />
            <MetricTile
              label="Event Types Ever Seen"
              value={`${d.data_health.distinct_event_names_seen_alltime.length} / ${d.data_health.instrumented_event_names_expected.length}`}
              kind="FACT"
              note={
                d.data_health.events_never_fired.length > 0
                  ? `Never fired: ${d.data_health.events_never_fired.join(', ')}`
                  : 'All instrumented event types have fired at least once.'
              }
            />
            <MetricTile
              label="Possible Duplicate Events (all-time)"
              value={d.data_health.possible_duplicate_events_alltime}
              kind="CALCULATED"
              note="Heuristic: same user + same event within 2 seconds. Known cause: a U86 concurrent-mount race condition, fixed in code (see reports) but the fix may not be deployed yet."
            />
            <MetricTile
              label="Stripe Webhooks Processed (all-time)"
              value={d.data_health.processed_stripe_events_alltime}
              kind="FACT"
            />
            <MetricTile
              label="Last Event Received"
              value={
                d.data_health.last_event_at
                  ? formatDistanceToNow(new Date(d.data_health.last_event_at), { addSuffix: true })
                  : 'Never'
              }
              kind="FACT"
            />
            <MetricTile
              label="Failed Analytics Writes"
              value={null}
              kind="UNKNOWN"
              note="Client-side analytics inserts are fire-and-forget in most of the app; a failed write is not currently logged anywhere, so this cannot be measured yet."
            />
          </SectionCard>

          {/* Consolidated data-gap list */}
          {(d.acquisition.data_gaps.length > 0 || d.commercial.data_gaps.length > 0 || d.engagement.coverage_notes.length > 0) && (
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-sm flex items-center gap-2 tracking-wide text-muted-foreground">
                  <AlertTriangle className="w-4 h-4" />
                  KNOWN DATA GAPS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                  {[...d.acquisition.data_gaps, ...d.commercial.data_gaps, ...d.engagement.coverage_notes].map((gap, i) => (
                    <li key={i}>{gap}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
