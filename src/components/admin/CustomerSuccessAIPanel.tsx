import { useState, useMemo, useEffect } from 'react';
import {
  MessageSquareText, Send, ShieldAlert, ChevronDown, ChevronUp,
  ThumbsUp, ThumbsDown, Loader2, Info, Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useCustomerSuccessAI, type CustomerSuccessAITurn } from '@/hooks/useCustomerSuccessAI';

const SUGGESTED_QUESTIONS = [
  'Where is this member in Unbreakable86?',
  'Have they been active recently?',
  'Have they completed onboarding?',
  'What University progress have they made?',
  'Are there any engagement or drop-off signals I should know about?',
];

function TurnCard({
  turn,
  onFeedback,
}: {
  turn: CustomerSuccessAITurn;
  onFeedback: (auditId: string, rating: 'correct' | 'incorrect') => void;
}) {
  const [showEvidence, setShowEvidence] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'correct' | 'incorrect' | null>(null);

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{turn.question}</p>
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
          {new Date(turn.askedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {turn.error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
          {turn.error}
        </div>
      )}

      {turn.result && (
        <>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{turn.result.answer}</p>

          {turn.result.escalate && (
            <div className="flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/5 px-2 py-1.5 text-xs text-amber-600">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              Recommends human escalation
              {turn.result.escalation_reason ? ` — ${turn.result.escalation_reason}` : ''}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-1.5">
            {turn.result.sources_used.length === 0 ? (
              <Badge variant="outline" className="text-[10px]">no data sources (member not found)</Badge>
            ) : (
              turn.result.sources_used.map((s) => (
                <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
              ))
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setShowEvidence((v) => !v)}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
            >
              {showEvidence ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showEvidence ? 'Hide evidence used' : 'Show evidence used'}
            </button>

            {turn.result.audit_id && (
              <div className="flex items-center gap-1">
                <button
                  title="Mark correct"
                  onClick={() => { onFeedback(turn.result!.audit_id!, 'correct'); setFeedbackGiven('correct'); }}
                  className={`p-1 rounded hover:bg-muted ${feedbackGiven === 'correct' ? 'text-emerald-500' : 'text-muted-foreground'}`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  title="Flag as incorrect"
                  onClick={() => { onFeedback(turn.result!.audit_id!, 'incorrect'); setFeedbackGiven('incorrect'); }}
                  className={`p-1 rounded hover:bg-muted ${feedbackGiven === 'incorrect' ? 'text-destructive' : 'text-muted-foreground'}`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {showEvidence && (
            <pre className="text-[10px] leading-snug bg-muted/40 rounded-md p-2 overflow-x-auto max-h-64 overflow-y-auto">
              {JSON.stringify(turn.result.context, null, 2)}
            </pre>
          )}
        </>
      )}
    </div>
  );
}

export function CustomerSuccessAIPanel() {
  const { users, loading: usersLoading, fetchUsers } = useAdminUsers();
  const { turns, loading, ask, flagFeedback, clear } = useCustomerSuccessAI();
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [question, setQuestion] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(q) ||
        u.display_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const selectedMember = users.find((u) => u.user_id === selectedMemberId);

  const handleAsk = async (q?: string) => {
    const finalQuestion = q ?? question;
    if (!selectedMemberId || !finalQuestion.trim() || loading) return;
    setQuestion('');
    await ask(selectedMemberId, finalQuestion.trim());
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg tracking-wide flex items-center gap-2">
          <MessageSquareText className="w-4 h-4 text-primary" />
          CUSTOMER SUCCESS AI — READ-ONLY TEST MODE
        </h2>
        <p className="text-xs text-muted-foreground">
          Dev-only. Answers factual questions about one member's product state from authorised data only.
          It cannot message members, change any record, or take any action — see the report for the full
          data-access and escalation rules.
        </p>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
        <p>
          This is a testing interface for a not-yet-launched AI role. It never sends anything to the
          member and never writes to their account. Every question and answer here is logged to
          <code className="mx-1 px-1 rounded bg-muted">customer_success_ai_audit_log</code>
          for review.
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-sm tracking-wide">Select a member</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by name, username, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
          <Select value={selectedMemberId} onValueChange={(v) => { setSelectedMemberId(v); clear(); }}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder={usersLoading ? 'Loading members...' : 'Choose a member record'} />
            </SelectTrigger>
            <SelectContent>
              {filteredUsers.map((u) => (
                <SelectItem key={u.user_id} value={u.user_id}>
                  {u.display_name || u.username || u.email || u.user_id} {u.role && u.role !== 'user' ? `(${u.role})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedMember && (
            <p className="text-[11px] text-muted-foreground">
              Testing against: <span className="text-foreground">{selectedMember.email}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {selectedMemberId && (
        <>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleAsk(q)}
                disabled={loading}
                className="px-2.5 py-1 rounded-full text-[11px] border border-border bg-card/50 text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {turns.map((t, i) => (
              <TurnCard key={i} turn={t} onFeedback={(id, rating) => flagFeedback(id, rating)} />
            ))}
            {turns.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">
                Ask a factual question about this member's product state to get started.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What's their current U86 day and have they reset before?"
              className="min-h-[44px] text-sm resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
            />
            <Button onClick={() => handleAsk()} disabled={loading || !question.trim()} className="shrink-0">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
