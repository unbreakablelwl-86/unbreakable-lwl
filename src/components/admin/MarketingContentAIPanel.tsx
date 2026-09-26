import { useEffect, useState, useMemo } from 'react';
import {
  Sparkles, Lightbulb, ChevronDown, ChevronUp, Loader2, Info, Copy, Archive,
  CheckCircle2, XCircle, Edit3, Send, BarChart3, Wand2, Layers,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMarketingContentAI, type ContentItem, type ContentItemStatus } from '@/hooks/useMarketingContentAI';

const PILLARS = ['power', 'movement', 'fuel', 'mindset', 'education', 'un-tunes', 'transformation', 'real-talk', 'community', 'app-feature', 'brand-story'];
const FORMATS = ['post', 'reel', 'carousel', 'story', 'video_script', 'email_concept', 'article', 'discussion_prompt'];
const PLATFORMS = ['instagram', 'tiktok', 'facebook', 'x'];

const STATUS_GROUPS: { key: ContentItemStatus; label: string }[] = [
  { key: 'idea', label: 'IDEA' },
  { key: 'researching', label: 'RESEARCHING' },
  { key: 'briefed', label: 'BRIEFED' },
  { key: 'draft', label: 'DRAFT' },
  { key: 'review', label: 'REVIEW' },
  { key: 'changes_requested', label: 'CHANGES REQUESTED' },
  { key: 'approved', label: 'APPROVED' },
  { key: 'ready_to_publish', label: 'READY TO PUBLISH' },
  { key: 'published', label: 'PUBLISHED' },
  { key: 'archived', label: 'ARCHIVED' },
];

function ItemCard({ item, ai }: { item: ContentItem; ai: ReturnType<typeof useMarketingContentAI> }) {
  const [expanded, setExpanded] = useState(false);
  const [draftText, setDraftText] = useState(item.draft_content ?? '');
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [busy, setBusy] = useState(false);

  useEffect(() => setDraftText(item.draft_content ?? ''), [item.draft_content]);

  const saveDraftEdit = async () => {
    setBusy(true);
    const { supabase } = await import('@/integrations/supabase/client');
    await supabase.from('content_items').update({ draft_content: draftText }).eq('id', item.id);
    await ai.fetchItems();
    setBusy(false);
  };

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    await fn();
    setBusy(false);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">{item.title}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            <Badge variant="outline" className="text-[10px]">{item.content_pillar}</Badge>
            <Badge variant="outline" className="text-[10px]">{item.format}</Badge>
            {item.ai_generated && <Badge variant="outline" className="text-[10px] text-primary border-primary/40">AI-drafted</Badge>}
            {item.approved_version && <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/40">v{item.approved_version} approved</Badge>}
          </div>
        </div>
        <button onClick={() => setExpanded((v) => !v)} className="text-muted-foreground hover:text-foreground">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="space-y-2 pt-1 border-t border-border/60">
          {!!Object.keys(item.brief ?? {}).length && (
            <pre className="text-[10px] leading-snug bg-muted/40 rounded-md p-2 overflow-x-auto max-h-40 overflow-y-auto">
              {JSON.stringify(item.brief, null, 2)}
            </pre>
          )}

          <Textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder="Draft copy/script..."
            className="min-h-[80px] text-sm"
          />
          {draftText !== (item.draft_content ?? '') && (
            <Button size="sm" variant="outline" onClick={() => run(saveDraftEdit)} disabled={busy}>
              Save edit
            </Button>
          )}

          {item.claims_to_verify?.length > 0 && (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-2 text-[11px] text-amber-600">
              <span className="font-medium">Claims flagged for verification:</span>
              <ul className="list-disc list-inside mt-1">
                {item.claims_to_verify.map((c, i) => <li key={i}>{String(c)}</li>)}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 pt-1">
            {item.status === 'idea' && (
              <Button size="sm" variant="outline" disabled={busy || ai.generating} onClick={() => run(() => ai.createBrief(item.id))}>
                <Wand2 className="w-3.5 h-3.5 mr-1" /> Create brief
              </Button>
            )}
            {(item.status === 'briefed' || item.status === 'researching' || item.status === 'changes_requested') && (
              <Button size="sm" variant="outline" disabled={busy || ai.generating} onClick={() => run(() => ai.draftContent(item.id))}>
                <Wand2 className="w-3.5 h-3.5 mr-1" /> Draft content
              </Button>
            )}
            {item.status === 'draft' && (
              <>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => run(() => ai.sendToReview(item.id))}>
                  <Send className="w-3.5 h-3.5 mr-1" /> Send to review
                </Button>
                <Button size="sm" variant="outline" disabled={busy || ai.generating} onClick={() => run(() => ai.repurpose(item.id, ['reel', 'carousel']))}>
                  <Layers className="w-3.5 h-3.5 mr-1" /> Repurpose (reel + carousel)
                </Button>
              </>
            )}
            {item.status === 'review' && (
              <>
                <Button size="sm" variant="outline" className="text-emerald-500 border-emerald-500/40" disabled={busy} onClick={() => run(() => ai.approve(item))}>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                </Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => run(() => ai.requestChanges(item))}>
                  <Edit3 className="w-3.5 h-3.5 mr-1" /> Request changes
                </Button>
                <Button size="sm" variant="outline" className="text-destructive border-destructive/40" disabled={busy} onClick={() => run(() => ai.reject(item))}>
                  <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                </Button>
              </>
            )}
            {item.status === 'approved' && (
              <Button size="sm" variant="outline" disabled={busy} onClick={() => run(() => ai.markReadyToPublish(item.id))}>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark ready to publish
              </Button>
            )}
            {item.status === 'ready_to_publish' && (
              <div className="flex items-center gap-1.5">
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => run(async () => {
                  const { error } = await ai.promoteToSocialDraft(item, platform);
                  if (!error) await ai.fetchItems();
                })}>
                  <Send className="w-3.5 h-3.5 mr-1" /> Send to Social Command Centre
                </Button>
              </div>
            )}
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => run(() => ai.duplicate(item))}>
              <Copy className="w-3.5 h-3.5 mr-1" /> Duplicate
            </Button>
            {item.status !== 'archived' && (
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => run(() => ai.archive(item))}>
                <Archive className="w-3.5 h-3.5 mr-1" /> Archive
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PerformancePanel({ ai }: { ai: ReturnType<typeof useMarketingContentAI> }) {
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const { result: r, error } = await ai.analyzePerformance(90);
    if (!error) setResult(r as Record<string, unknown>);
    setLoading(false);
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-sm tracking-wide flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" /> Content performance (FACT / CALCULATED only)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button size="sm" variant="outline" onClick={run} disabled={loading}>
          {loading ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <BarChart3 className="w-3.5 h-3.5 mr-1" />}
          Analyze last 90 days
        </Button>
        {result && (
          <div className="space-y-2 pt-2">
            <p className="text-[11px] text-muted-foreground">
              {String(result.total_published_posts_in_window)} published posts in window.
            </p>
            {!!result.sample_size_warning && (
              <p className="text-[11px] text-amber-600 border border-amber-500/40 bg-amber-500/5 rounded-md p-2">
                {String(result.sample_size_warning)}
              </p>
            )}
            <pre className="text-[10px] leading-snug bg-muted/40 rounded-md p-2 overflow-x-auto max-h-64 overflow-y-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MarketingContentAIPanel() {
  const ai = useMarketingContentAI();
  const [pillar, setPillar] = useState<string>('');
  const [topic, setTopic] = useState('');
  const [objective, setObjective] = useState('');
  const [activeStatus, setActiveStatus] = useState<ContentItemStatus>('idea');
  const [genError, setGenError] = useState<string | null>(null);

  useEffect(() => { ai.fetchItems(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const grouped = useMemo(() => {
    const map: Record<string, ContentItem[]> = {};
    for (const s of STATUS_GROUPS) map[s.key] = [];
    for (const item of ai.items) (map[item.status] ??= []).push(item);
    return map;
  }, [ai.items]);

  const handleGenerate = async () => {
    setGenError(null);
    const { error } = await ai.generateIdeas({ content_pillar: pillar || undefined, topic: topic || undefined, objective: objective || undefined, count: 5 });
    if (error) setGenError(error);
    else { setTopic(''); setObjective(''); setActiveStatus('idea'); }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg tracking-wide flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          MARKETING & CONTENT AI — FOUNDER REVIEW
        </h2>
        <p className="text-xs text-muted-foreground">
          Dev-only. Drafts ideas, briefs, copy and repurposed variants for your review. It never publishes,
          comments, or messages anyone — everything here needs your explicit approval before it can be sent
          to the Social Command Centre for real scheduling.
        </p>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
        <p>
          Standing rule: <span className="text-foreground font-medium">DO NOT AUTO-PUBLISH SOCIAL CONTENT.</span> Every
          generation call is logged to <code className="mx-1 px-1 rounded bg-muted">marketing_content_ai_audit_log</code>,
          and every approval/rejection to <code className="mx-1 px-1 rounded bg-muted">content_approval_log</code>.
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-sm tracking-wide flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary" /> Generate content ideas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Select value={pillar} onValueChange={setPillar}>
              <SelectTrigger className="h-9 w-40 text-sm"><SelectValue placeholder="Any pillar" /></SelectTrigger>
              <SelectContent>{PILLARS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Topic (optional)" value={topic} onChange={(e) => setTopic(e.target.value)} className="h-9 text-sm flex-1 min-w-[160px]" />
            <Input placeholder="Objective (optional)" value={objective} onChange={(e) => setObjective(e.target.value)} className="h-9 text-sm flex-1 min-w-[160px]" />
          </div>
          <Button size="sm" onClick={handleGenerate} disabled={ai.generating}>
            {ai.generating ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1" />}
            Generate 5 ideas
          </Button>
          {genError && <p className="text-xs text-destructive">{genError}</p>}
        </CardContent>
      </Card>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {STATUS_GROUPS.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveStatus(s.key)}
            className={`px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap border transition-colors ${
              activeStatus === s.key ? 'bg-primary/15 border-primary/40 text-primary' : 'border-border bg-card/50 text-muted-foreground'
            }`}
          >
            {s.label} ({grouped[s.key]?.length ?? 0})
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-[45vh] overflow-y-auto">
        {ai.loading && <p className="text-xs text-muted-foreground text-center py-6">Loading...</p>}
        {!ai.loading && (grouped[activeStatus]?.length ?? 0) === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">Nothing in this stage yet.</p>
        )}
        {grouped[activeStatus]?.map((item) => <ItemCard key={item.id} item={item} ai={ai} />)}
      </div>

      <PerformancePanel ai={ai} />
    </div>
  );
}
