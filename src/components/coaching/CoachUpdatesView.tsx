import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useCoachingFeedback, CoachingFeedback, FeedbackResponse } from '@/hooks/useCoachingFeedback';
import { formatDistanceToNow } from 'date-fns';
import {
  Star, ClipboardList, Target, RefreshCw, MessageSquare,
  Loader2, ChevronDown, ChevronRight, Trash2, CheckCircle2, Send, Reply
} from 'lucide-react';

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  session_review: { label: 'Session Review', icon: <ClipboardList className="w-3 h-3" />, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  appraisal: { label: 'Appraisal', icon: <Star className="w-3 h-3" />, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  goal_setting: { label: 'Goal Setting', icon: <Target className="w-3 h-3" />, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  plan_update: { label: 'Plan Update', icon: <RefreshCw className="w-3 h-3" />, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  general: { label: 'General', icon: <MessageSquare className="w-3 h-3" />, color: 'bg-muted text-muted-foreground border-border' },
};

export function CoachUpdatesView() {
  const {
    getMyCoachFeedback, deleteFeedback,
    getResponsesForMultipleFeedback, respondToFeedback, acknowledgeFeedback, deleteResponse
  } = useCoachingFeedback();
  const [feedback, setFeedback] = useState<CoachingFeedback[]>([]);
  const [responses, setResponses] = useState<Record<string, FeedbackResponse[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [sendingReply, setSendingReply] = useState<string | null>(null);
  const [acknowledging, setAcknowledging] = useState<string | null>(null);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    setLoading(true);
    const { data } = await getMyCoachFeedback();
    setFeedback(data);

    // Load all responses
    if (data.length > 0) {
      const { data: allResponses } = await getResponsesForMultipleFeedback(data.map(f => f.id));
      const grouped: Record<string, FeedbackResponse[]> = {};
      (allResponses || []).forEach(r => {
        if (!grouped[r.feedback_id]) grouped[r.feedback_id] = [];
        grouped[r.feedback_id].push(r);
      });
      setResponses(grouped);
    }

    setLoading(false);
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteFeedback(id);
    if (!error) {
      setFeedback(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleAcknowledge = async (feedbackId: string) => {
    setAcknowledging(feedbackId);
    const { data } = await acknowledgeFeedback(feedbackId);
    if (data) {
      setResponses(prev => ({
        ...prev,
        [feedbackId]: [...(prev[feedbackId] || []), data],
      }));
    }
    setAcknowledging(null);
  };

  const handleSendReply = async (feedbackId: string) => {
    const text = replyTexts[feedbackId]?.trim();
    if (!text) return;
    setSendingReply(feedbackId);
    const { data } = await respondToFeedback(feedbackId, text);
    if (data) {
      setResponses(prev => ({
        ...prev,
        [feedbackId]: [...(prev[feedbackId] || []), data],
      }));
      setReplyTexts(prev => ({ ...prev, [feedbackId]: '' }));
    }
    setSendingReply(null);
  };

  const handleDeleteResponse = async (responseId: string, feedbackId: string) => {
    const { error } = await deleteResponse(responseId);
    if (!error) {
      setResponses(prev => ({
        ...prev,
        [feedbackId]: (prev[feedbackId] || []).filter(r => r.id !== responseId),
      }));
    }
  };

  const isAcknowledged = (feedbackId: string) =>
    (responses[feedbackId] || []).some(r => r.response_type === 'acknowledged');

  const replyCount = (feedbackId: string) =>
    (responses[feedbackId] || []).filter(r => r.response_type === 'reply').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (feedback.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No coach updates yet</p>
        <p className="text-sm text-muted-foreground mt-1">Your coach's feedback will appear here</p>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[600px]">
      <div className="space-y-2">
        {feedback.map((fb) => {
          const typeConf = TYPE_CONFIG[fb.feedback_type] || TYPE_CONFIG.general;
          const isExpanded = expandedIds.has(fb.id);
          const ack = isAcknowledged(fb.id);
          const replies = replyCount(fb.id);
          const fbResponses = responses[fb.id] || [];

          return (
            <Collapsible key={fb.id} open={isExpanded} onOpenChange={() => toggleExpanded(fb.id)}>
              <Card className="border-border border-gray-800 bg-[#111]">
                <CardContent className="p-0">
                  <CollapsibleTrigger className="w-full p-3 flex items-center justify-between text-left hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display text-sm tracking-wide text-foreground">{fb.title}</h3>
                        <Badge className={`text-[10px] ${typeConf.color}`}>
                          {typeConf.icon}
                          <span className="ml-1">{typeConf.label}</span>
                        </Badge>
                        {ack && (
                          <Badge className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle2 className="w-3 h-3 mr-0.5" /> Acknowledged
                          </Badge>
                        )}
                        {replies > 0 && (
                          <Badge variant="outline" className="text-[10px]">
                            <Reply className="w-3 h-3 mr-0.5" /> {replies}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(fb.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleDelete(fb.id); }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
                      {/* Original feedback content */}
                      {fb.performance_rating && (
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(n => (
                            <Star
                              key={n}
                              className={`w-4 h-4 ${n <= fb.performance_rating! ? 'fill-primary text-primary' : 'text-muted-foreground/20'}`}
                            />
                          ))}
                        </div>
                      )}

                      {fb.technique_notes && (
                        <div>
                          <p className="text-[10px] font-display tracking-wide text-muted-foreground mb-1">TECHNIQUE NOTES</p>
                          <p className="text-sm text-foreground">{fb.technique_notes}</p>
                        </div>
                      )}

                      {fb.next_session_goals && (
                        <div>
                          <p className="text-[10px] font-display tracking-wide text-muted-foreground mb-1">NEXT SESSION GOALS</p>
                          <p className="text-sm text-foreground">{fb.next_session_goals}</p>
                        </div>
                      )}

                      {fb.general_comments && (
                        <div>
                          <p className="text-[10px] font-display tracking-wide text-muted-foreground mb-1">COMMENTS</p>
                          <p className="text-sm text-foreground">{fb.general_comments}</p>
                        </div>
                      )}

                      {/* Response thread */}
                      {fbResponses.length > 0 && (
                        <div className="border-t border-border pt-2 space-y-2">
                          <p className="text-[10px] font-display tracking-wide text-muted-foreground">RESPONSES</p>
                          {fbResponses.map(r => (
                            <div key={r.id} className="flex items-start gap-2 py-1">
                              {r.response_type === 'acknowledged' ? (
                                <div className="flex items-center gap-1 text-xs text-green-400">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Acknowledged</span>
                                  <span className="text-muted-foreground ml-1">
                                    {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex-1 bg-muted/30 rounded-lg p-2">
                                  <p className="text-sm text-foreground">{r.content}</p>
                                  <p className="text-[10px] text-muted-foreground mt-1">
                                    {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                                  </p>
                                </div>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDeleteResponse(r.id, fb.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-1 border-t border-border">
                        {!ack && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8"
                            disabled={acknowledging === fb.id}
                            onClick={() => handleAcknowledge(fb.id)}
                          >
                            {acknowledging === fb.id ? (
                              <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                            )}
                            Acknowledge
                          </Button>
                        )}
                      </div>

                      {/* Reply input */}
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyTexts[fb.id] || ''}
                          onChange={e => setReplyTexts(prev => ({ ...prev, [fb.id]: e.target.value }))}
                          className="min-h-[60px] text-sm"
                        />
                        <Button
                          size="icon"
                          className="h-10 w-10 shrink-0 self-end"
                          disabled={!replyTexts[fb.id]?.trim() || sendingReply === fb.id}
                          onClick={() => handleSendReply(fb.id)}
                        >
                          {sendingReply === fb.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </CardContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </ScrollArea>
  );
}
