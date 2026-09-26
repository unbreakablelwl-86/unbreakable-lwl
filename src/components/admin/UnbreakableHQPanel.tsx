import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, AlertTriangle, ShieldAlert, Info, Users, Megaphone, MessageSquareText,
  ListChecks, Clock, BookMarked, Activity, ChevronDown, ChevronUp, CheckCircle2, XCircle,
  Loader2, Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { useUnbreakableHQ, type HqDecisionItem, type AiRoleContract } from '@/hooks/useUnbreakableHQ';

type Section = 'overview' | 'ai_team' | 'decisions' | 'memory' | 'activity';

const SECTIONS: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'COMMAND CENTRE', icon: LayoutDashboard },
  { id: 'ai_team', label: 'AI TEAM', icon: Users },
  { id: 'decisions', label: 'DECISIONS', icon: ListChecks },
  { id: 'memory', label: 'BUSINESS MEMORY', icon: BookMarked },
  { id: 'activity', label: 'AI ACTIVITY', icon: Activity },
];

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-destructive/10 text-destructive border-destructive/30',
  important: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  later: 'bg-muted text-muted-foreground border-border',
};

function fresh(ts: string | null | undefined) {
  if (!ts) return 'No data yet';
  try {
    return `${formatDistanceToNow(new Date(ts))} ago`;
  } catch {
    return 'Unknown';
  }
}

export function UnbreakableHQPanel() {
  const {
    overview, roles, activity, businessMemory, loading, error,
    fetchOverview, fetchRoles, fetchActivity, fetchBusinessMemory,
    recordFounderDecision, addManualDecision, addBusinessMemory,
  } = useUnbreakableHQ();
  const [section, setSection] = useState<Section>('overview');
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [decisionText, setDecisionText] = useState('');
  const [decisionStatus, setDecisionStatus] = useState<'decided' | 'deferred' | 'archived'>('decided');
  const [showAddDecision, setShowAddDecision] = useState(false);
  const [newDecision, setNewDecision] = useState('');
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [newMemory, setNewMemory] = useState('');
  const [newMemoryArea, setNewMemoryArea] = useState<'pricing' | 'product' | 'brand' | 'launch' | 'feature' | 'operational' | 'ai_permissions' | 'prohibited'>('operational');

  useEffect(() => {
    fetchOverview();
    fetchRoles();
    fetchBusinessMemory();
  }, [fetchOverview, fetchRoles, fetchBusinessMemory]);

  useEffect(() => {
    if (section === 'activity') fetchActivity();
  }, [section, fetchActivity]);

  const roleByName = useMemo(() => {
    const m = new Map<string, AiRoleContract>();
    roles.forEach((r) => m.set(r.name, r));
    return m;
  }, [roles]);

  const submitDecision = async (item: HqDecisionItem) => {
    if (!decisionText.trim()) return;
    await recordFounderDecision(item.id, decisionText.trim(), decisionStatus);
    setDecidingId(null);
    setDecisionText('');
    await fetchOverview();
  };

  const submitManualDecision = async () => {
    if (!newDecision.trim()) return;
    await addManualDecision({ decision_required: newDecision.trim() });
    setNewDecision('');
    setShowAddDecision(false);
    await fetchOverview();
  };

  const submitMemory = async () => {
    if (!newMemory.trim()) return;
    await addBusinessMemory({ decision: newMemory.trim(), area: newMemoryArea });
    setNewMemory('');
    setShowAddMemory(false);
    await fetchBusinessMemory();
    await fetchOverview();
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg tracking-wide flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4 text-primary" />
          UNBREAKABLE HQ — AI OPERATING SYSTEM
        </h2>
        <p className="text-xs text-muted-foreground">
          Founder control centre. Aggregates the existing AI capabilities — it is not an autonomous CEO
          and never executes anything on its own. You remain the sole final decision-maker.
        </p>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
        <p>
          Every number below is a live query — zero AI/LLM calls happen just to load this page.
          No AI role registered here can hold Level 5 (autonomous) authority; that is enforced in the
          database, not just the UI.
        </p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-display tracking-wide whitespace-nowrap transition-colors ${
              section === s.id
                ? 'bg-primary/15 border border-primary/40 text-primary'
                : 'border border-border bg-card/50 text-muted-foreground hover:border-primary/20'
            }`}
          >
            <s.icon className="w-3.5 h-3.5" />
            {s.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {loading && !overview && (
        <div className="flex items-center justify-center py-10 text-muted-foreground text-sm gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading HQ overview...
        </div>
      )}

      {overview && section === 'overview' && (
        <div className="space-y-4">
          {/* ATTENTION REQUIRED */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-sm tracking-wide flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> ATTENTION REQUIRED
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {overview.alerts.length === 0 ? (
                <p className="text-xs text-muted-foreground">No observable alert conditions right now.</p>
              ) : (
                overview.alerts.map((a, i) => (
                  <div key={i} className={`rounded-md border p-2.5 text-xs space-y-1 ${SEVERITY_STYLES[a.severity] ?? SEVERITY_STYLES.later}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{a.what}</span>
                      <Badge variant="outline" className="text-[9px] shrink-0">{a.severity.toUpperCase()}</Badge>
                    </div>
                    <p className="opacity-80">{a.recommended_human_review}</p>
                    <p className="opacity-60">Affects: {a.affected_area}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* WHAT NEEDS A DECISION */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-sm tracking-wide flex items-center gap-1.5">
                <ListChecks className="w-4 h-4 text-primary" /> DECISIONS AWAITING YOU ({overview.decisions.pending_count})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {overview.decisions.items.slice(0, 3).map((d) => (
                <div key={d.id} className="text-xs border-b border-border last:border-0 py-2">
                  <span className="font-medium">{d.decision_required}</span>
                </div>
              ))}
              {overview.decisions.pending_count > 3 && (
                <button onClick={() => setSection('decisions')} className="text-[11px] text-primary mt-1">
                  View all {overview.decisions.pending_count} in DECISIONS →
                </button>
              )}
              {overview.decisions.pending_count === 0 && (
                <p className="text-xs text-muted-foreground">Nothing pending.</p>
              )}
            </CardContent>
          </Card>

          {/* TODAY / WHAT'S HAPPENING */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-xs tracking-wide flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5 text-primary" /> COMMUNITY
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs">
                <p>Posts (24h): <span className="text-foreground font-medium">{overview.community.posts_last_24h}</span></p>
                <p>Posts (7d): <span className="text-foreground font-medium">{overview.community.posts_last_7d}</span></p>
                <p>Open reports: <span className="text-foreground font-medium">{overview.community.open_reports}</span></p>
                <p className="text-muted-foreground pt-1 border-t border-border mt-1">{overview.community.note}</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-xs tracking-wide flex items-center gap-1.5">
                  <MessageSquareText className="w-3.5 h-3.5 text-primary" /> MARKETING PIPELINE
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs">
                {Object.keys(overview.marketing.content_items_by_status).length === 0 ? (
                  <p className="text-muted-foreground">No content_items yet.</p>
                ) : (
                  Object.entries(overview.marketing.content_items_by_status).map(([k, v]) => (
                    <p key={k}>{k}: <span className="text-foreground font-medium">{v}</span></p>
                  ))
                )}
                <p className="text-muted-foreground pt-1 border-t border-border mt-1">
                  Last AI activity: {fresh(overview.marketing.last_ai_activity_at)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* DATA FRESHNESS */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-xs tracking-wide flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" /> DATA FRESHNESS
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              {Object.entries(overview.data_freshness).map(([k, v]) => (
                <p key={k}>{k.replace(/_/g, ' ')}: <span className="text-foreground">{fresh(v)}</span></p>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {section === 'ai_team' && (
        <div className="space-y-2">
          {roles.map((r) => {
            const live = overview?.ai_team.find((a) => a.name === r.name);
            const expanded = expandedRole === r.id;
            return (
              <Card key={r.id} className="border-border bg-card">
                <button
                  onClick={() => setExpandedRole(expanded ? null : r.id)}
                  className="w-full flex items-center justify-between p-3 text-left"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm">{r.name}</span>
                      <Badge variant="outline" className={`text-[9px] ${r.status === 'active' ? 'border-primary/40 text-primary' : 'border-border text-muted-foreground'}`}>
                        {r.status === 'active' ? 'ACTIVE' : 'PLANNED'}
                      </Badge>
                      <Badge variant="outline" className="text-[9px]">L{r.authority_level} · {r.authority_label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.purpose}</p>
                    {live && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {live.calls_last_7d} call(s) in 7d · last activity {fresh(live.last_activity_at)}
                        {live.errors_last_7d > 0 && <span className="text-destructive"> · {live.errors_last_7d} error(s)</span>}
                      </p>
                    )}
                  </div>
                  {expanded ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                </button>
                {expanded && (
                  <CardContent className="pt-0 text-xs space-y-2 border-t border-border">
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <p className="text-muted-foreground mb-1">Authorised data</p>
                        {r.authorised_data.length ? r.authorised_data.map((x, i) => <p key={i}>• {x}</p>) : <p className="opacity-60">—</p>}
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Restricted data</p>
                        {r.restricted_data.length ? r.restricted_data.map((x, i) => <p key={i}>• {x}</p>) : <p className="opacity-60">—</p>}
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Permitted actions</p>
                        {r.permitted_actions.length ? r.permitted_actions.map((x, i) => <p key={i}>• {x}</p>) : <p className="opacity-60">—</p>}
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Prohibited actions</p>
                        {r.prohibited_actions.length ? r.prohibited_actions.map((x, i) => <p key={i}>• {x}</p>) : <p className="opacity-60">—</p>}
                      </div>
                    </div>
                    <p><span className="text-muted-foreground">Escalation: </span>{r.escalation_rules ?? '—'}</p>
                    <p><span className="text-muted-foreground">Human approval: </span>{r.human_approval_required ?? '—'}</p>
                    <p><span className="text-muted-foreground">Audit: </span>{r.audit_requirements ?? '—'}{r.audit_table_name ? ` (${r.audit_table_name})` : ''}</p>
                    {r.notes && <p className="text-muted-foreground italic border-t border-border pt-2">{r.notes}</p>}
                    {r.report_doc_path && <p className="text-[10px] text-muted-foreground">Report: {r.report_doc_path}</p>}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {section === 'decisions' && overview && (
        <div className="space-y-3">
          {overview.decisions.items.map((d) => (
            <Card key={d.id} className="border-border bg-card">
              <CardContent className="pt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm">{d.decision_required}</span>
                  <Badge variant="outline" className={`text-[9px] shrink-0 ${SEVERITY_STYLES[d.severity] ?? ''}`}>{d.severity.toUpperCase()}</Badge>
                </div>
                {d.why_it_matters && <p className="text-muted-foreground">{d.why_it_matters}</p>}
                {d.ai_recommendation && (
                  <p className="rounded-md bg-primary/5 border border-primary/20 p-2">
                    <span className="text-primary">AI recommendation: </span>{d.ai_recommendation}
                  </p>
                )}
                {d.source && <p className="text-[10px] text-muted-foreground">Source: {d.source}</p>}

                {decidingId === d.id ? (
                  <div className="space-y-2 pt-1">
                    <Textarea
                      value={decisionText}
                      onChange={(e) => setDecisionText(e.target.value)}
                      placeholder="Your decision..."
                      className="min-h-[60px] text-xs"
                    />
                    <div className="flex items-center gap-2">
                      <Select value={decisionStatus} onValueChange={(v) => setDecisionStatus(v as typeof decisionStatus)}>
                        <SelectTrigger className="h-8 text-xs w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="decided">Decided</SelectItem>
                          <SelectItem value="deferred">Deferred</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" className="h-8" onClick={() => submitDecision(d)}>Save</Button>
                      <Button size="sm" variant="ghost" className="h-8" onClick={() => setDecidingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setDecidingId(d.id); setDecisionText(''); }}>
                    Make a decision
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
          {overview.decisions.items.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">Nothing pending.</p>
          )}

          {showAddDecision ? (
            <Card className="border-border bg-card">
              <CardContent className="pt-4 space-y-2">
                <Textarea value={newDecision} onChange={(e) => setNewDecision(e.target.value)} placeholder="Decision required..." className="min-h-[60px] text-xs" />
                <div className="flex gap-2">
                  <Button size="sm" onClick={submitManualDecision}>Add to queue</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowAddDecision(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button size="sm" variant="outline" className="text-xs" onClick={() => setShowAddDecision(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Log a decision manually
            </Button>
          )}
        </div>
      )}

      {section === 'memory' && (
        <div className="space-y-2">
          {businessMemory.map((b) => (
            <div key={b.id} className="rounded-lg border border-border bg-card p-3 text-xs space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{b.decision}</span>
                <Badge variant="outline" className="text-[9px] shrink-0">{b.area}</Badge>
              </div>
              <p className="text-muted-foreground">
                {b.decision_date} · {b.status}{!b.can_be_revisited ? ' · standing rule' : ''}
                {b.source ? ` · ${b.source}` : ''}
              </p>
            </div>
          ))}
          {businessMemory.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No entries yet.</p>}

          {showAddMemory ? (
            <Card className="border-border bg-card">
              <CardContent className="pt-4 space-y-2">
                <Input value={newMemory} onChange={(e) => setNewMemory(e.target.value)} placeholder="Confirmed decision..." className="text-xs h-9" />
                <Select value={newMemoryArea} onValueChange={(v) => setNewMemoryArea(v as typeof newMemoryArea)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(['pricing', 'product', 'brand', 'launch', 'feature', 'operational', 'ai_permissions', 'prohibited'] as const).map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button size="sm" onClick={submitMemory}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowAddMemory(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button size="sm" variant="outline" className="text-xs" onClick={() => setShowAddMemory(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Log a confirmed decision
            </Button>
          )}
        </div>
      )}

      {section === 'activity' && (
        <div className="space-y-1.5">
          {activity.map((a) => (
            <div key={a.activity_id} className="rounded-lg border border-border bg-card p-2.5 text-xs flex items-start gap-2">
              {a.error ? <XCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" /> : <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />}
              <div className="min-w-0">
                <p><span className="font-medium">{a.role}</span> — {a.task}</p>
                <p className="text-muted-foreground">{fresh(a.occurred_at)} · {a.status}</p>
                {a.error && <p className="text-destructive">{a.error}</p>}
              </div>
            </div>
          ))}
          {activity.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No AI activity logged yet.</p>}
        </div>
      )}
    </div>
  );
}
