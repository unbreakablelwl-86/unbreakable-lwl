import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { TrendingUp, Check, X, Loader2, Zap } from 'lucide-react';

export interface PowerProgressionSuggestion {
  exerciseName: string;
  currentWeight: string;
  currentReps: string;
  suggestedWeight: string;
  suggestedReps: string;
  reason: string;
}

interface PowerProgressionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: PowerProgressionSuggestion[];
  onAccept: (suggestions: PowerProgressionSuggestion[]) => void;
  onDismiss: () => void;
  isApplying?: boolean;
}

export function PowerProgressionDialog({
  open,
  onOpenChange,
  suggestions,
  onAccept,
  onDismiss,
  isApplying,
}: PowerProgressionDialogProps) {
  if (suggestions.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0a0a0a] border-gray-800">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wide flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            COACH PROGRESSION
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Based on your logged performance, the Coach suggests:
          </p>
        </DialogHeader>

        <div className="space-y-3 py-4 max-h-[50vh] overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <Card key={index} className="p-4 border border-border bg-card space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary shrink-0" />
                <h4 className="font-display text-sm text-foreground">
                  {suggestion.exerciseName}
                </h4>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Current</p>
                  <p className="text-xs text-foreground">{suggestion.currentWeight} × {suggestion.currentReps}</p>
                </div>
                <div className="p-2 rounded bg-primary/10 border border-primary/30">
                  <p className="text-xs text-primary mb-1">Suggested</p>
                  <p className="text-xs text-foreground">{suggestion.suggestedWeight} × {suggestion.suggestedReps}</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground italic">
                {suggestion.reason}
              </p>
            </Card>
          ))}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onDismiss} disabled={isApplying}>
            <X className="w-4 h-4 mr-1" />
            Dismiss
          </Button>
          <Button
            onClick={() => onAccept(suggestions)}
            disabled={isApplying}
            className="gap-2 font-display tracking-wide"
          >
            {isApplying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            APPLY CHANGES
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
