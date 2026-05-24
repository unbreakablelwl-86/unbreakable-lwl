import { FullScreenToolView } from './FullScreenToolView';
import { useProgressionHistory, ProgressionEntry } from '@/hooks/useProgressionHistory';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AskCoachCTA } from '@/components/coaching/AskCoachCTA';
import { TrendingUp, TrendingDown, Minus, Loader2, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

interface ProgressMetricsViewProps {
  onClose: () => void;
}

export function ProgressMetricsView({ onClose }: ProgressMetricsViewProps) {
  const { history, isLoading } = useProgressionHistory();

  // Group progressions by exercise
  const groupedProgressions = history?.reduce((acc, p) => {
    if (!acc[p.exercise_name]) {
      acc[p.exercise_name] = [];
    }
    acc[p.exercise_name].push(p);
    return acc;
  }, {} as Record<string, ProgressionEntry[]>);

  const getTrendIcon = (type?: string | null) => {
    if (type === 'increase') return <TrendingUp className="w-4 h-4 text-primary" />;
    if (type === 'decrease') return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <FullScreenToolView
      title="PROGRESS METRICS"
      subtitle="Track your strength progression"
      icon={<BarChart3 className="w-5 h-5" />}
      onClose={onClose}
    >
      <div className="space-y-6 max-w-2xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : groupedProgressions && Object.keys(groupedProgressions).length > 0 ? (
          Object.entries(groupedProgressions).map(([exerciseName, records]) => {
            const latestRecord = records?.[0];
            
            return (
              <Card key={exerciseName} className="p-4 border-border bg-card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-lg text-foreground">{exerciseName}</h3>
                  {latestRecord?.adjustment_type && (
                    <Badge variant="outline" className="gap-1">
                      {getTrendIcon(latestRecord.adjustment_type)}
                      {latestRecord.adjustment_type}
                    </Badge>
                  )}
                </div>

                {/* Latest Stats */}
                {latestRecord && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-surface border border-border">
                      <p className="text-xs text-muted-foreground">Current Weight</p>
                      <p className="font-display text-xl text-foreground">
                        {latestRecord.new_weight_kg ?? '-'} kg
                      </p>
                      {latestRecord.previous_weight_kg && (
                        <p className="text-xs text-muted-foreground">
                          was {latestRecord.previous_weight_kg} kg
                        </p>
                      )}
                    </div>
                    <div className="p-3 rounded-lg bg-surface border border-border">
                      <p className="text-xs text-muted-foreground">Current Reps</p>
                      <p className="font-display text-xl text-foreground">
                        {latestRecord.new_reps ?? '-'}
                      </p>
                      {latestRecord.previous_reps && (
                        <p className="text-xs text-muted-foreground">
                          was {latestRecord.previous_reps}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* History */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Recent History</p>
                  {records?.slice(0, 5).map((record, idx) => (
                    <div
                      key={record.id || idx}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        {getTrendIcon(record.adjustment_type)}
                        <span className="text-sm text-foreground">
                          {record.new_weight_kg}kg × {record.new_reps}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(record.recorded_at), 'MMM d')}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-8 text-center border-border border-border bg-card">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg text-foreground mb-2">No Progress Data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete workouts to start tracking your progression.
            </p>
          </Card>
        )}

        {/* Ask Coach CTA at bottom */}
        <div className="pt-4">
          <AskCoachCTA 
            context={{ type: 'progress' }}
            label="Analyse Progress"
            variant="card"
          />
        </div>
      </div>
    </FullScreenToolView>
  );
}
