import { useState } from 'react';
import { GeneratedProgram, WorkoutDay } from '@/lib/programTypes';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { useAuth } from '@/hooks/useAuth';
import { AskCoachCTA } from '@/components/coaching/AskCoachCTA';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw,
  Save,
  Loader2,
  TrendingUp,
  Utensils,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
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
  const templateDays = program?.templateWeek?.days || [];
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const currentDay = templateDays[selectedDayIndex];

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
        <Card className=" border-border border-border bg-card">
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

      {/* This Block's Sessions - Day-by-day breakdown, same pattern as Movement */}
      {templateDays.length > 0 && currentDay && (
        <Card className="border-border border-border bg-card">
          <CardContent className="p-6">
            <h3 className="font-display text-lg text-muted-foreground mb-4 tracking-wide">
              THIS BLOCK'S SESSIONS
            </h3>

            {/* Day Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDayIndex((i) => Math.max(0, i - 1))}
                disabled={selectedDayIndex === 0}
                className="font-display tracking-wide"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                PREV
              </Button>

              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-display text-lg tracking-wide">
                  {currentDay.day?.toUpperCase()}
                </span>
                <Badge variant="outline" className="ml-1">
                  {selectedDayIndex + 1} / {templateDays.length}
                </Badge>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDayIndex((i) => Math.min(templateDays.length - 1, i + 1))}
                disabled={selectedDayIndex === templateDays.length - 1}
                className="font-display tracking-wide"
              >
                NEXT
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Session Card */}
            <Card className="bg-card border-border border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-display text-primary tracking-wide text-sm">
                      {currentDay.day}
                    </p>
                    <h4 className="font-display text-xl text-foreground tracking-wide">
                      {currentDay.sessionType}
                    </h4>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {currentDay.duration}
                  </Badge>
                </div>

                <Tabs defaultValue="main" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="warmup" className="font-display text-xs tracking-wide">
                      WARMUP
                    </TabsTrigger>
                    <TabsTrigger value="main" className="font-display text-xs tracking-wide">
                      MAIN
                    </TabsTrigger>
                    <TabsTrigger value="cooldown" className="font-display text-xs tracking-wide">
                      COOLDOWN
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="warmup" className="mt-4">
                    <p className="text-muted-foreground">{currentDay.warmup}</p>
                  </TabsContent>
                  <TabsContent value="main" className="mt-4">
                    <div className="space-y-3">
                      {currentDay.exercises?.map((ex, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg"
                        >
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-display shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground font-medium">{ex.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {ex.sets} × {ex.reps}
                              {ex.intensity ? ` · ${ex.intensity}` : ''}
                              {ex.rest ? ` · ${ex.rest} rest` : ''}
                            </p>
                            {ex.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{ex.notes}</p>
                            )}
                          </div>
                          {ex.equipment && ex.equipment !== 'bodyweight' && (
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              {ex.equipment}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="cooldown" className="mt-4">
                    <p className="text-muted-foreground">{currentDay.cooldown}</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}

      {/* Block Info */}
      <Card className=" border-border border-border bg-card">
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
          <Card className=" border-border border-border bg-card">
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
          <Card className=" border-border border-border bg-card">
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
