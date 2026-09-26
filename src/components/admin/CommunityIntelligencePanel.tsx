import { useEffect } from 'react';
import { Users, MessageSquare, ShieldAlert, RefreshCw, TrendingUp, TrendingDown, Minus, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useCommunityIntelligence } from '@/hooks/useCommunityIntelligence';

// ---------------------------------------------------------------------------
// Community Intelligence AI — Level 1 (OBSERVE), zero LLM calls.
// Every number here comes straight from get_community_intelligence_overview(),
// pure SQL. This panel NEVER shows a report's free-text description or any
// post/comment body -- that full-detail review stays in the REPORTS tab.
// This tab exists to answer "is something building up that a human should
// look at", not to replace reading the actual reports.
// See claude/2026-09-26-community-intelligence-ai-report.md.
// ---------------------------------------------------------------------------

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-3">
      <p className="text-[10px] font-display tracking-wider text-muted-foreground">{label}</p>
      <p className="text-2xl font-display text-foreground mt-1">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'flat') return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
  if (trend === 'new_activity') return <TrendingUp className="w-3.5 h-3.5 text-amber-500" />;
  const n = parseFloat(trend);
  if (isNaN(n)) return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
  if (n > 0) return <TrendingUp className="w-3.5 h-3.5 text-amber-500" />;
  if (n < 0) return <TrendingDown className="w-3.5 h-3.5 text-primary" />;
  return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
}

export function CommunityIntelligencePanel() {
  const { overview, loading, error, fetchOverview } = useCommunityIntelligence();

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg tracking-wider text-foreground">COMMUNITY INTELLIGENCE</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Level 1 · OBSERVE only · zero LLM calls · pure SQL signals
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchOverview} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="pt-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {!overview && loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {overview && (
        <>
          <p className="text-[11px] text-muted-foreground">
            Generated {formatDistanceToNow(new Date(overview.generated_at), { addSuffix: true })}
          </p>

          {/* Volume */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base tracking-wide flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                VOLUME
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="POSTS (24H)" value={overview.volume.posts_last_24h} />
                <StatCard label="POSTS (7D)" value={overview.volume.posts_last_7d} />
                <StatCard label="POSTS (30D)" value={overview.volume.posts_last_30d} />
                <StatCard label="TOTAL POSTS" value={overview.volume.total_posts} />
                <StatCard label="POST COMMENTS (7D)" value={overview.volume.post_comments_last_7d} />
                <StatCard label="TOTAL POST COMMENTS" value={overview.volume.total_post_comments} />
                <StatCard label="OTHER COMMENTS (7D)" value={overview.volume.other_comments_last_7d} />
                <StatCard label="TOTAL OTHER COMMENTS" value={overview.volume.total_other_comments} />
              </div>
            </CardContent>
          </Card>

          {/* Growth */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base tracking-wide flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                GROWTH
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatCard label="NEW FRIENDSHIPS (7D)" value={overview.growth.new_friendships_7d} sub={`${overview.growth.total_friendships} total`} />
                <StatCard label="NEW FOLLOWS (7D)" value={overview.growth.new_follows_7d} sub={`${overview.growth.total_follows} total`} />
                <StatCard label="NEW BLOCKS (7D)" value={overview.growth.new_blocks_7d} sub={`${overview.growth.total_blocks} total`} />
              </div>
            </CardContent>
          </Card>

          {/* Safety Signals */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base tracking-wide flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-primary" />
                SAFETY SIGNALS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="OPEN REPORTS" value={overview.safety_signals.open_reports_count} />
                <StatCard
                  label="REPORTS (7D VS PRIOR 7D)"
                  value={`${overview.safety_signals.reports_last_7d} / ${overview.safety_signals.reports_prior_7d}`}
                  sub={overview.safety_signals.reports_trend}
                />
                <StatCard
                  label="OLDEST OPEN REPORT"
                  value={overview.safety_signals.oldest_open_report_age_days !== null ? `${overview.safety_signals.oldest_open_report_age_days}d` : '—'}
                />
                <div className="rounded-lg border border-border bg-card/50 p-3 flex items-center gap-2">
                  <TrendIcon trend={overview.safety_signals.reports_trend} />
                  <span className="text-[11px] text-muted-foreground">week-over-week trend</span>
                </div>
              </div>

              {Object.keys(overview.safety_signals.open_reports_by_reason).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(overview.safety_signals.open_reports_by_reason).map(([reason, count]) => (
                    <Badge key={reason} variant="outline" className="text-[10px]">
                      {reason}: {count}
                    </Badge>
                  ))}
                </div>
              )}

              {overview.safety_signals.open_reports_queue.length > 0 ? (
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-left p-2 font-display tracking-wide text-[10px] text-muted-foreground">REASON</th>
                        <th className="text-left p-2 font-display tracking-wide text-[10px] text-muted-foreground">CONTENT TYPE</th>
                        <th className="text-left p-2 font-display tracking-wide text-[10px] text-muted-foreground">AGE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.safety_signals.open_reports_queue.map((r) => (
                        <tr key={r.id} className="border-t border-border">
                          <td className="p-2 text-foreground">{r.reason ?? 'unspecified'}</td>
                          <td className="p-2 text-muted-foreground">{r.content_type ?? 'unspecified'}</td>
                          <td className="p-2 text-muted-foreground">{r.age_days}d</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-[10px] text-muted-foreground p-2 bg-muted/10 flex items-center gap-1.5">
                    <EyeOff className="w-3 h-3" />
                    Reason/type/age only — open the REPORTS tab to read the actual case before deciding anything.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No open reports.</p>
              )}
            </CardContent>
          </Card>

          {/* Excluded by design */}
          <Card className="bg-muted/10 border-border">
            <CardContent className="pt-4">
              <p className="text-[10px] font-display tracking-wider text-muted-foreground mb-2">EXCLUDED BY DESIGN — NEVER SEEN BY THIS TOOL</p>
              <div className="flex flex-wrap gap-1.5">
                {overview.excluded_by_design.map((item) => (
                  <Badge key={item} variant="outline" className="text-[10px] text-muted-foreground">
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
