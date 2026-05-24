import { FullScreenToolView } from './FullScreenToolView';
import { useWorkoutFeedback } from '@/hooks/useWorkoutFeedback';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AskCoachCTA } from '@/components/coaching/AskCoachCTA';
import { Sparkles, TrendingUp, AlertCircle, Lightbulb, Loader2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface AIFeedbackViewProps {
  sessionId?: string;
  onClose: () => void;
}

export function AIFeedbackView({ sessionId, onClose }: AIFeedbackViewProps) {
  const { feedback, isLoading, generateFeedback } = useWorkoutFeedback(sessionId);
  const { activeSession } = useWorkoutSessions();

  const latestFeedback = feedback?.[0];
  const exerciseLogs = activeSession?.exercise_logs || [];

  const handleGenerateFeedback = () => {
    if (sessionId) {
      generateFeedback.mutate({ sessionId, exerciseLogs });
    }
  };

  return (
    <FullScreenToolView
      title="COACH FEEDBACK"
      subtitle="Expert insights for your session"
      icon={<Sparkles className="w-5 h-5" />}
      onClose={onClose}
    >
      <div className="space-y-6 max-w-2xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : latestFeedback ? (
          <>
            {/* Performance Rating */}
            {latestFeedback.performance_rating && (
              <Card className="p-4 border-primary bg-primary/5 border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Performance Rating</p>
                    <p className="font-display text-2xl text-foreground capitalize">
                      {latestFeedback.performance_rating}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Main Feedback */}
            <Card className="p-4 border-border border-border bg-card">
              <div className="flex items-start gap-3 mb-3">
                <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <Badge variant="outline" className="mb-2">
                    {latestFeedback.feedback_type}
                  </Badge>
                  <p className="text-foreground whitespace-pre-wrap">
                    {latestFeedback.content}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Generated {format(new Date(latestFeedback.created_at), 'MMM d, yyyy h:mm a')}
              </p>
            </Card>

            {/* Suggestions */}
            {latestFeedback.suggestions && Array.isArray(latestFeedback.suggestions) && latestFeedback.suggestions.length > 0 && (
              <Card className="p-4 border-border border-border bg-card">
                <h3 className="font-display text-lg text-foreground mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  SUGGESTIONS
                </h3>
                <ul className="space-y-2">
                  {(latestFeedback.suggestions as string[]).map((suggestion, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Regenerate Button */}
            <Button
              variant="outline"
              onClick={handleGenerateFeedback}
              disabled={generateFeedback.isPending}
              className="w-full gap-2"
            >
            {generateFeedback.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Generate New Feedback
          </Button>

          {/* Ask Coach about specific feedback */}
          <AskCoachCTA 
            context={{
              type: 'session',
              id: sessionId,
              name: 'workout feedback',
            }}
            label="Discuss with Coach"
            variant="card"
          />
          </>
        ) : (
          <Card className="p-8 text-center border-border border-border bg-card">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg text-foreground mb-2">No Feedback Yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Generate expert coaching insights based on your workout performance.
            </p>
            <Button
              onClick={handleGenerateFeedback}
              disabled={generateFeedback.isPending || !sessionId}
              className="gap-2"
            >
              {generateFeedback.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Generate Feedback
            </Button>
          </Card>
        )}
      </div>
    </FullScreenToolView>
  );
}
