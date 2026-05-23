
import { GeneratedProgram, WorkoutDay } from '@/lib/programTypes';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { useAuth } from '@/hooks/useAuth';
import { AskCoachCTA } from '@/components/coaching/AskCoachCTA';
import { 
  RefreshCw,
  Save,
  Loader2,
  TrendingUp,
  Utensils,
  Sparkles
} from 'lucide-react';

interface ProgramDisplayProps {
  program: GeneratedProgram;
  onReset: () => void;
  savedProgramId?: string;
  forUserId?: string;
  onEditDay?: (day: WorkoutDay, weekNumber: number) => void;
}

export function ProgramDisplay({ program, onReset, savedProgramId, forUserId }: ProgramDisplayProps) {
  const { user } = useAuth();
  const { saveProgram } = useTrainingPrograms();

  const phases = program?.phases || [];

  const handleSaveProgram = () => {
    if (!user) return;
    saveProgram.mutate({ program, forUserId });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header - Matches Cardio Style */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">💪</div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground tracking-wide mb-2">
          {program.programName}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {program.overview}
        </p>
        <Badge className="mt-4 font-display tracking-wide">
          STRENGTH • 12 WEEKS
        </Badge>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-2">
        {user && !savedProgramId && (
          <Button 
            onClick={handleSaveProgram} 
            className="gap-2 font-display tracking-wide"
            disabled={saveProgram.isPending}
          >
            {saveProgram.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            SAVE PROGRAMME
          </Button>
        )}
        <Button variant="outline" onClick={onReset} className="gap-2 font-display tracking-wide">
          <RefreshCw className="w-4 h-4" />
          NEW PROGRAMME
        </Button>
        <AskCoachCTA 
          context={{
            type: 'programme',
            name: program.programName,
          }}
          label="Ask Coach"
        />
      </div>

      {/* Phases Overview - Cardio Style */}
      {phases.length > 0 && (
        <Card className=" border-border border-gray-800 bg-[#111]">
          <CardContent className="p-6">
            <h3 className="font-display text-lg text-muted-foreground mb-4 tracking-wide">
              PROGRAMME PHASES
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {phases.map((phase, idx) => (
                <div
                  key={idx}
                  className="bg-muted/30 rounded-lg p-4 border-l-4 border-l-border"
                >
                  <p className="font-display text-primary tracking-wide text-sm">
                    {phase.weeks}
                  </p>
                  <p className="font-display text-foreground tracking-wide">
                    {phase.name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {phase.focus}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Block Info */}
      <Card className=" border-border border-gray-800 bg-[#111]">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            <Sparkles className="w-4 h-4 inline mr-1 text-primary" />
            Each 4-week block is built by your Unbreakable Coach based on your results and goals.
          </p>
        </CardContent>
      </Card>

      {/* Tips - Cardio Style */}
      <div className="grid md:grid-cols-2 gap-6">
        {program.progressionRules && program.progressionRules.length > 0 && (
          <Card className=" border-border border-gray-800 bg-[#111]">
            <CardContent className="p-6">
              <h4 className="font-display text-lg text-primary tracking-wide mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                PROGRESSION
              </h4>
              <ul className="space-y-2">
                {program.progressionRules.map((rule, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {program.nutritionTips && program.nutritionTips.length > 0 && (
          <Card className=" border-border border-gray-800 bg-[#111]">
            <CardContent className="p-6">
              <h4 className="font-display text-lg text-primary tracking-wide mb-4 flex items-center gap-2">
                <Utensils className="w-5 h-5" />
                NUTRITION
              </h4>
              <ul className="space-y-2">
                {program.nutritionTips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
