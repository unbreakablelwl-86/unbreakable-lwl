import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Target,
  Zap,
  TrendingUp,
  Heart,
  Save,
  ArrowLeft,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  GeneratedCardioProgram,
  CardioWeek,
  activityLabels,
} from '@/lib/cardioTypes';

interface CardioProgramDisplayProps {
  program: GeneratedCardioProgram;
  onSave?: () => void;
  onBack: () => void;
  isSaving?: boolean;
}

export function CardioProgramDisplay({ program, onSave, onBack, isSaving }: CardioProgramDisplayProps) {
  const [selectedWeek, setSelectedWeek] = useState(1);
  
  const currentWeek = program.weeks?.find((w) => w.weekNumber === selectedWeek) || program.weeks?.[0];

  const getActivityIcon = () => {
    switch (program.activityType) {
      case 'walk': return '🚶';
      case 'run': return '🏃';
      case 'cycle': return '🚴';
      default: return '🏃';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">{getActivityIcon()}</div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground tracking-wide mb-2">
          {program.programName}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {program.overview}
        </p>
        <Badge className="mt-4 font-display tracking-wide">
          {activityLabels[program.activityType]} • 12 WEEKS
        </Badge>
      </div>

      {/* Phases Overview */}
      <Card className=" border-border mb-8 border-border bg-card">
        <CardContent className="p-6">
          <h3 className="font-display text-lg text-muted-foreground mb-4 tracking-wide">
            PROGRAMME PHASES
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {program.phases?.map((phase, idx) => (
              <div
                key={idx}
                className="bg-muted/30 rounded-lg p-4 border-l-4 border-l-primary"
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

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedWeek((w) => Math.max(1, w - 1))}
          disabled={selectedWeek === 1}
          className="font-display tracking-wide"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          PREV
        </Button>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <span className="font-display text-xl tracking-wide">
            WEEK {selectedWeek}
          </span>
          {currentWeek?.phase && (
            <Badge variant="outline" className="ml-2">
              {currentWeek.phase}
            </Badge>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedWeek((w) => Math.min(program.weeks?.length || 8, w + 1))}
          disabled={selectedWeek === (program.weeks?.length || 8)}
          className="font-display tracking-wide"
        >
          NEXT
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Week Content */}
      {currentWeek && (
        <motion.div
          key={selectedWeek}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {currentWeek.totalDistance && (
            <div className="text-center mb-6">
              <Badge variant="secondary" className="font-display tracking-wide">
                <TrendingUp className="w-4 h-4 mr-2" />
                TOTAL: {currentWeek.totalDistance}
              </Badge>
            </div>
          )}

          <div className="space-y-4">
            {currentWeek.sessions?.map((session, idx) => (
              <Card key={idx} className="bg-card border-border border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="font-display text-primary tracking-wide text-sm">
                        {session.day}
                      </p>
                      <h4 className="font-display text-xl text-foreground tracking-wide">
                        {session.sessionType}
                      </h4>
                    </div>
                    <div className="flex gap-3">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.duration}
                      </Badge>
                      {session.distance && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {session.distance}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="font-display text-sm tracking-wide text-muted-foreground">
                        INTENSITY
                      </span>
                    </div>
                    <p className="text-foreground">{session.intensity}</p>
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
                      <p className="text-muted-foreground">{session.warmup}</p>
                    </TabsContent>
                    <TabsContent value="main" className="mt-4">
                      <div className="space-y-3">
                        {session.mainSession?.map((segment, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg"
                          >
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-display">
                              {sIdx + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-foreground font-medium">
                                {segment.segment}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {segment.duration}
                                {segment.notes && ` • ${segment.notes}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="cooldown" className="mt-4">
                      <p className="text-muted-foreground">{session.cooldown}</p>
                    </TabsContent>
                  </Tabs>

                  {session.notes && (
                    <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-sm text-foreground flex items-center gap-2">
                        <Heart className="w-4 h-4 text-primary" />
                        {session.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tips */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
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

        {program.recoveryTips && program.recoveryTips.length > 0 && (
          <Card className=" border-border border-border bg-card">
            <CardContent className="p-6">
              <h4 className="font-display text-lg text-primary tracking-wide mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                RECOVERY
              </h4>
              <ul className="space-y-2">
                {program.recoveryTips.map((tip, idx) => (
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

      {/* Actions */}
      <div className="flex justify-between gap-4 mt-8">
        <Button
          variant="outline"
          onClick={onBack}
          className="font-display tracking-wide"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          BACK
        </Button>

        {onSave && (
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="font-display tracking-wide"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'SAVING...' : 'SAVE PROGRAMME'}
          </Button>
        )}
      </div>
    </div>
  );
}
