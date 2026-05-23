import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMindsetProgrammes, MindsetProgramme } from '@/hooks/useMindsetProgrammes';
import { useAuth } from '@/hooks/useAuth';
import { MindsetProgrammeDetail } from './MindsetProgrammeDetail';
import {
  Brain,
  Plus,
  Sparkles,
  Play,
  Pause,
  Trash2,
  ChevronRight,
  Flame,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

export function MindsetProgrammes() {
  const { user } = useAuth();
  const { programmes, activeProgrammes, isLoading, toggleActive, deleteProgramme } = useMindsetProgrammes();
  const [viewingProgramme, setViewingProgramme] = useState<MindsetProgramme | null>(null);

  if (!user) {
    return (
      <Link to="/help?context=Build%20me%20a%20mindset%20programme">
        <Card className="border-2 border-primary/30 bg-primary/5 p-6 hover:bg-primary/10 transition-all group cursor-pointer border-gray-800 bg-[#111]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-display text-sm tracking-wide">BUILD YOUR MINDSET PROGRAMME</p>
                <p className="text-xs text-muted-foreground">Sign in to get started</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-primary" />
          </div>
        </Card>
      </Link>
    );
  }

  if (viewingProgramme) {
    return (
      <MindsetProgrammeDetail
        programme={viewingProgramme}
        onBack={() => setViewingProgramme(null)}
      />
    );
  }

  const focusAreaIcon = (area: string) => {
    switch (area?.toLowerCase()) {
      case 'breathing': return '🫁';
      case 'meditation': return '🧘';
      case 'journaling': return '📓';
      case 'resilience': return '💪';
      case 'focus': return '🎯';
      case 'sleep': return '😴';
      case 'games': return '🎮';
      case 'focus games': return '🎮';
      case 'retention': return '⏱️';
      case 'cold exposure': return '🧊';
      case 'sauna': return '🔥';
      case 'exposure': return '🧊';
      default: return '🧠';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl tracking-wide flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          MY PROGRAMMES
        </h2>
        <Link to="/help?context=Build%20me%20a%20mindset%20programme">
          <Button variant="outline" size="sm" className="font-display tracking-wide gap-1">
            <Sparkles className="w-4 h-4" />
            BUILD NEW
          </Button>
        </Link>
      </div>

      {/* Active count */}
      {programmes && programmes.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Flame className="w-4 h-4 text-primary" />
          <span>{activeProgrammes.length}/2 active</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : programmes && programmes.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {programmes.map((prog) => (
              <motion.div
                key={prog.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card
                  className={`border-2 cursor-pointer transition-all hover:shadow-[0_0_15px_hsl(var(--primary)/0.2)] ${
                    prog.is_active
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                  onClick={() => setViewingProgramme(prog)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display tracking-wide text-foreground truncate">
                            {prog.name}
                          </span>
                          {prog.is_active && (
                            <Badge variant="default" className="bg-primary/20 text-primary text-xs shrink-0">
                              Active
                            </Badge>
                          )}
                        </div>
                        {prog.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                            {prog.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{prog.duration_weeks} weeks</span>
                          <span>·</span>
                          <span>{prog.daily_minutes} min/day</span>
                          {prog.focus_areas && prog.focus_areas.length > 0 && (
                            <>
                              <span>·</span>
                              <span>{prog.focus_areas.map(a => focusAreaIcon(a)).join(' ')}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleActive.mutate(prog.id);
                              }}
                            >
                              {prog.is_active ? (
                                <><Pause className="w-4 h-4 mr-2" /> Deactivate</>
                              ) : (
                                <><Play className="w-4 h-4 mr-2" /> Activate</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteProgramme.mutate(prog.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty state with AI CTA */
        <Link to="/help?context=Build%20me%20a%20mindset%20programme">
          <Card className="border-2 border-dashed border-primary/30 p-8 text-center hover:bg-primary/5 transition-all cursor-pointer border-gray-800 bg-[#111]">
            <Brain className="w-12 h-12 text-primary/40 mx-auto mb-4" />
            <p className="font-display tracking-wide mb-2">NO PROGRAMMES YET</p>
            <p className="text-sm text-muted-foreground mb-4">
              Ask your Unbreakable Coach to build a bespoke mindset programme
            </p>
            <Button variant="outline" className="font-display tracking-wide gap-1">
              <Sparkles className="w-4 h-4" />
              BUILD YOUR FIRST PROGRAMME
            </Button>
          </Card>
        </Link>
      )}
    </div>
  );
}
