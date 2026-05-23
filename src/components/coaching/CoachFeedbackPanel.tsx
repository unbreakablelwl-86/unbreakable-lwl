import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCoachingFeedback } from '@/hooks/useCoachingFeedback';
import { toast } from 'sonner';
import { Star, Send, Loader2 } from 'lucide-react';

interface CoachFeedbackPanelProps {
  athleteId: string;
  sessions?: { id: string; day_name: string; started_at: string }[];
  programs?: { id: string; name: string }[];
  onSaved?: () => void;
}

const FEEDBACK_TYPES = [
  { value: 'session_review', label: 'Session Review' },
  { value: 'appraisal', label: 'Appraisal' },
  { value: 'goal_setting', label: 'Goal Setting' },
  { value: 'plan_update', label: 'Plan Update' },
  { value: 'general', label: 'General' },
];

export function CoachFeedbackPanel({ athleteId, sessions = [], programs = [], onSaved }: CoachFeedbackPanelProps) {
  const { createFeedback, loading } = useCoachingFeedback();
  const [title, setTitle] = useState('');
  const [feedbackType, setFeedbackType] = useState('general');
  const [rating, setRating] = useState<number>(0);
  const [techniqueNotes, setTechniqueNotes] = useState('');
  const [nextGoals, setNextGoals] = useState('');
  const [generalComments, setGeneralComments] = useState('');
  const [relatedSessionId, setRelatedSessionId] = useState<string>('');
  const [relatedProgramId, setRelatedProgramId] = useState<string>('');

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    const { error } = await createFeedback({
      athlete_id: athleteId,
      feedback_type: feedbackType,
      title: title.trim(),
      performance_rating: rating > 0 ? rating : null,
      technique_notes: techniqueNotes.trim() || null,
      next_session_goals: nextGoals.trim() || null,
      general_comments: generalComments.trim() || null,
      related_session_id: relatedSessionId || null,
      related_program_id: relatedProgramId || null,
    });

    if (error) {
      toast.error('Failed to save feedback');
      console.error(error);
    } else {
      toast.success('Feedback saved & athlete notified');
      setTitle('');
      setFeedbackType('general');
      setRating(0);
      setTechniqueNotes('');
      setNextGoals('');
      setGeneralComments('');
      setRelatedSessionId('');
      setRelatedProgramId('');
      onSaved?.();
    }
  };

  return (
    <Card className="border-primary/30 border-gray-800 bg-[#111]">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-sm tracking-wide flex items-center gap-2">
          <Send className="w-4 h-4 text-primary" />
          NEW FEEDBACK
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Feedback title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="font-display text-sm"
        />

        <Select value={feedbackType} onValueChange={setFeedbackType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FEEDBACK_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Star Rating */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Performance Rating</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setRating(rating === n ? 0 : n)}
                className="transition-colors"
              >
                <Star
                  className={`w-6 h-6 ${n <= rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`}
                />
              </button>
            ))}
          </div>
        </div>

        <Textarea
          placeholder="Technique notes..."
          value={techniqueNotes}
          onChange={(e) => setTechniqueNotes(e.target.value)}
          rows={3}
        />

        <Textarea
          placeholder="Next session goals..."
          value={nextGoals}
          onChange={(e) => setNextGoals(e.target.value)}
          rows={3}
        />

        <Textarea
          placeholder="General comments..."
          value={generalComments}
          onChange={(e) => setGeneralComments(e.target.value)}
          rows={3}
        />

        {sessions.length > 0 && (
          <Select value={relatedSessionId} onValueChange={setRelatedSessionId}>
            <SelectTrigger>
              <SelectValue placeholder="Link to session (optional)" />
            </SelectTrigger>
            <SelectContent>
              {sessions.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.day_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {programs.length > 0 && (
          <Select value={relatedProgramId} onValueChange={setRelatedProgramId}>
            <SelectTrigger>
              <SelectValue placeholder="Link to programme (optional)" />
            </SelectTrigger>
            <SelectContent>
              {programs.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button
          onClick={handleSubmit}
          disabled={loading || !title.trim()}
          className="w-full font-display tracking-wide"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
          SAVE & NOTIFY
        </Button>
      </CardContent>
    </Card>
  );
}
