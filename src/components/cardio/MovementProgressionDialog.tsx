import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { TrendingUp, Check, X, Loader2, Zap } from 'lucide-react';

export interface ProgressionSuggestion {
  sessionType: string;
  currentTargets: string;
  suggestedTargets: string;
  reason: string;
  plannerId: string;
}

interface MovementProgressionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: ProgressionSuggestion[];
  onAccept: (suggestions: ProgressionSuggestion[]) => void;
  onDismiss: () => void;
  isApplying?: boolean;
}

export function MovementProgressionDialog({
  open,
  onOpenChange,
  suggestions,
  onAccept,
  onDismiss,
  isApplying,
}: MovementProgressionDialogProps) {
  if (suggestions.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wide flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            COACH PROGRESSION
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Based on your recent results, the Coach suggests these adjustments:
          </p>
        </DialogHeader>

        <div className="space-y-3 py-4 max-h-[50vh] overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <Card key={index} className="p-4 border border-border bg-card space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary shrink-0" />
                <h4 className="font-display text-sm text-foreground">
                  {suggestion.sessionType}
                </h4>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Current</p>
                  <p className="text-xs text-foreground">{suggestion.currentTargets}</p>
                </div>
                <div className="p-2 rounded bg-primary/10 border border-primary/30">
                  <p className="text-xs text-primary mb-1">Suggested</p>
                  <p className="text-xs text-foreground">{suggestion.suggestedTargets}</p>
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
