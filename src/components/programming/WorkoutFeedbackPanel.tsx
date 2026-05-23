import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useWorkoutFeedback, WorkoutFeedback } from '@/hooks/useWorkoutFeedback';
import { useAIPreferences } from '@/hooks/useAIPreferences';
import { format } from 'date-fns';
import {
  Sparkles,
  Volume2,
  VolumeX,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Heart,
  Brain,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface WorkoutFeedbackPanelProps {
  sessionId?: string;
  exerciseLogs?: any[];
  onGenerateFeedback?: () => void;
}

export function WorkoutFeedbackPanel({ 
  sessionId, 
  exerciseLogs,
  onGenerateFeedback 
}: WorkoutFeedbackPanelProps) {
  const { feedback, latestFeedback, isLoading, generateFeedback } = useWorkoutFeedback(sessionId);
  const { preferences } = useAIPreferences();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const displayFeedback = sessionId 
    ? feedback?.find(f => f.session_id === sessionId)
    : latestFeedback;

  const handleGenerateFeedback = async () => {
    if (!sessionId || !exerciseLogs) return;
    await generateFeedback.mutateAsync({ sessionId, exerciseLogs });
    onGenerateFeedback?.();
  };

  const handlePlayVoice = () => {
    if (!displayFeedback?.voice_url) return;
    const audio = new Audio(displayFeedback.voice_url);
    audio.play();
    setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
  };

  const getRatingIcon = (rating: string | null) => {
    switch (rating) {
      case 'excellent':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'good':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'average':
        return <Minus className="w-5 h-5 text-yellow-500" />;
      case 'below_average':
        return <TrendingDown className="w-5 h-5 text-orange-500" />;
      case 'poor':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-primary" />;
    }
  };

  const getRatingColor = (rating: string | null) => {
    switch (rating) {
      case 'excellent': return 'text-green-500 border-green-500';
      case 'good': return 'text-green-400 border-green-400';
      case 'average': return 'text-yellow-500 border-yellow-500';
      case 'below_average': return 'text-orange-500 border-orange-500';
      case 'poor': return 'text-red-500 border-red-500';
      default: return 'text-primary border-primary';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4 border border-border border-gray-800 bg-[#111]">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="border border-border overflow-hidden border-gray-800 bg-[#111]">
      <CardHeader 
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg tracking-wide flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            COACHING FEEDBACK
          </CardTitle>
          <div className="flex items-center gap-2">
            {displayFeedback && (
              <Badge variant="outline" className={getRatingColor(displayFeedback.performance_rating)}>
                {displayFeedback.performance_rating?.replace('_', ' ') || 'Pending'}
              </Badge>
            )}
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <CardContent className="space-y-4">
              {displayFeedback ? (
                <>
                  {/* Performance Rating */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
                    <div className="flex items-center gap-3">
                      {getRatingIcon(displayFeedback.performance_rating)}
                      <div>
                        <p className="text-sm font-medium text-foreground capitalize">
                          {displayFeedback.performance_rating?.replace('_', ' ') || 'Session Complete'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(displayFeedback.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                    
                    {displayFeedback.fatigue_score && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Fatigue Level</p>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={displayFeedback.fatigue_score * 10} 
                            className="w-16 h-2"
                          />
                          <span className="text-sm font-medium text-foreground">
                            {displayFeedback.fatigue_score}/10
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Feedback Content */}
                  <div className="p-3 rounded-lg bg-surface border border-border">
                    <p className="text-sm text-foreground leading-relaxed">
                      {displayFeedback.content}
                    </p>
                  </div>

                  {/* Suggestions */}
                  {displayFeedback.suggestions && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Suggestions
                      </h4>
                      <ul className="space-y-1">
                        {(displayFeedback.suggestions as string[]).map((suggestion, idx) => (
                          <li 
                            key={idx}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="text-primary">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Voice Playback */}
                  {preferences?.voice_feedback_enabled && displayFeedback.voice_url && (
                    <Button
                      variant="outline"
                      onClick={handlePlayVoice}
                      disabled={isPlaying}
                      className="w-full gap-2"
                    >
                      {isPlaying ? (
                        <>
                          <VolumeX className="w-4 h-4" />
                          Playing...
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          Play Voice Feedback
                        </>
                      )}
                    </Button>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No feedback available yet
                  </p>
                  {sessionId && exerciseLogs && (
                    <Button
                      onClick={handleGenerateFeedback}
                      disabled={generateFeedback.isPending}
                      className="gap-2"
                    >
                      {generateFeedback.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Feedback
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}