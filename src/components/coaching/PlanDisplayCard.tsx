import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Edit3,
  ExternalLink,
  Dumbbell,
  UtensilsCrossed,
  Check,
  Calendar,
  Flame,
  ChevronDown,
  ChevronUp,
  Save,
  Brain,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { PlanContentRenderer } from './PlanContentRenderer';
import { GeneratedProgram, WorkoutDay } from '@/lib/programTypes';

type PlanType = 'programme' | 'meal_plan' | 'mindset';

interface PlanDisplayCardProps {
  planType: PlanType;
  planData: GeneratedProgram | any;
  planId: string;
  savedToHub: boolean;
  onEdit: () => void;
  onViewInHub: () => void;
  onSaveToLibrary?: () => void;
}

export function PlanDisplayCard({
  planType,
  planData,
  planId,
  savedToHub,
  onEdit,
  onViewInHub,
  onSaveToLibrary,
}: PlanDisplayCardProps) {
  const [showDetails, setShowDetails] = useState(true);
  const isProgramme = planType === 'programme';
  const isMindset = planType === 'mindset';
  const Icon = isProgramme ? Dumbbell : isMindset ? Brain : UtensilsCrossed;
  const hubLabel = isProgramme ? 'My Programmes' : isMindset ? 'My Programmes' : 'My Meal Plans';
  const navLabel = isProgramme ? 'POWER' : isMindset ? 'MINDSET' : 'FUEL';

  const planName = planData.programName || planData.planName || planData.name || 'Your Plan';
  const overview = planData.overview || planData.description || '';

  const getSummary = () => {
    if (isProgramme) {
      const days = planData.templateWeek?.days || planData.weeks?.[0]?.days || [];
      const phases = planData.phases?.length || 3;
      return {
        primary: `${days.length} training days/week`,
        secondary: `${phases} phases over 12 weeks`,
      };
    } else if (isMindset) {
      return {
        primary: `${planData.durationWeeks || 4} weeks`,
        secondary: `${planData.dailyMinutes || 15} min/day`,
      };
    } else {
      const days = planData.days?.length || 7;
      const avgCals = planData.weeklyCalories
        ? Math.round(planData.weeklyCalories / 7)
        : planData.days?.[0]?.totalCalories || 0;
      return {
        primary: `${days} days planned`,
        secondary: `~${avgCals.toLocaleString()} kcal/day`,
      };
    }
  };

  const summary = getSummary();

  return (
    <Card className="border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 max-w-full overflow-hidden border-gray-800 bg-[#111]">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center neon-glow shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <Flame className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-display tracking-wide text-primary">
                YOUR {isProgramme ? 'PROGRAMME' : isMindset ? 'MINDSET PROGRAMME' : 'MEAL PLAN'} IS READY
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground italic mt-0.5">
              Built for you. Stay patient with it.
            </p>
            <h3 className="font-display text-lg tracking-wide text-foreground leading-snug mt-1">
              {planName}
            </h3>
          </div>
          {savedToHub && (
            <Badge variant="outline" className="shrink-0 border-primary/50 text-primary text-xs">
              <Check className="w-3 h-3 mr-1" />
              Saved
            </Badge>
          )}
        </div>

        {/* Overview */}
        {overview && (
          <p className="text-xs text-muted-foreground line-clamp-4 mt-1 leading-relaxed">
            {overview}
          </p>
        )}

        {/* Summary Stats */}
        <div className="flex items-center gap-4 text-xs py-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>{summary.primary}</span>
          </div>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{summary.secondary}</span>
        </div>

        {/* Expandable Full Plan Details */}
        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground h-8">
              <span className="text-xs">{showDetails ? 'Hide Full Plan' : 'Show Full Plan'}</span>
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            {/* Clean Rendered Plan Content */}
            <PlanContentRenderer planType={planType} planData={planData} />
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 border-primary/40 hover:border-primary text-xs h-9"
            onClick={onEdit}
          >
            <Edit3 className="w-3.5 h-3.5" />
            EDIT PLAN
          </Button>
          {savedToHub ? (
            <Button
              size="sm"
              className="flex-1 gap-1.5 text-xs h-9"
              onClick={onViewInHub}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              VIEW IN {navLabel}
            </Button>
          ) : (
            <Button
              size="sm"
              className="flex-1 gap-1.5 text-xs h-9 bg-primary hover:bg-primary/90"
              onClick={onSaveToLibrary}
            >
              <Save className="w-3.5 h-3.5" />
              SAVE TO LIBRARY
            </Button>
          )}
        </div>

        {/* Hub Link Note */}
        <p className="text-[10px] text-muted-foreground text-center">
          {savedToHub
            ? <>Your plan is saved to <strong>{hubLabel}</strong> with status "Not Started"</>
            : <>Review your plan above, then save it to <strong>{hubLabel}</strong></>
          }
        </p>
      </CardContent>
    </Card>
  );
}
