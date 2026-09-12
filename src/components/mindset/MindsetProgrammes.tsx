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
  Sparkles,
  Play,
  Pause,
  Trash2,
  Eye,
  ChevronDown,
  Flame,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function MindsetProgrammes() {
  const { user } = useAuth();
  const { programmes, activeProgrammes, isLoading, toggleActive, deleteProgramme } = useMindsetProgrammes();
  const [viewingProgramme, setViewingProgramme] = useState<MindsetProgramme | null>(null);

  if (!user) {
    return (
      <Link to="/help?context=Build%20me%20a%20mindset%20programme">
        <Card className="border-2 border-primary/30 bg-primary/5 p-6 hover:bg-primary/10 transition-all group cursor-pointer border-border bg-card">
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
      {/* Header — active count + always-visible Build with Coach CTA, matching Power */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-surface rounded-lg border border-border">
        <div className="flex items-center gap-3">
          <Flame className="w-5 h-5 text-primary shrink-0" />
          <span className="text-sm md:text-base text-muted-foreground">
            Active: <span className="text-foreground font-medium">{activeProgrammes.length}</span> / 2
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/help?context=Build%20me%20a%20mindset%20programme">
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
              <Sparkles className="w-4 h-4" />
              Build with Coach
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : programmes && programmes.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {programmes.map((prog) => (
              <motion.div
                key={prog.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Same card anatomy as Power/Movement/Fuel: name+badge row,
                    description, meta row, then two action rows with every
                    action visible — this used to hide Activate/Delete behind
                    a kebab menu and combine "view" and "track" into one
                    whole-card click. */}
                <Card
                  className={`p-5 border bg-card transition-all ${
                    prog.is_active ? 'border-primary shadow-[0_0_15px_hsl(var(--primary)/0.15)]' : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Brain className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="font-display text-xl text-foreground leading-tight">{prog.name}</h3>
                      {prog.is_active && (
                        <Badge variant="outline" className="bg-primary text-primary-foreground border-primary">
                          Active
                        </Badge>
                      )}
                    </div>
                    {prog.is_active && (
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0 mt-2" />
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {prog.description || 'Custom mindset programme'}
                  </p>

                  <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                    <span>{prog.duration_weeks} weeks</span>
                    <span>{prog.daily_minutes} min/day</span>
                    {prog.focus_areas && prog.focus_areas.length > 0 && (
                      <span>{prog.focus_areas.map(a => focusAreaIcon(a)).join(' ')}</span>
                    )}
                  </div>

                  <div className="space-y-2 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => toggleActive.mutate(prog.id)}
                        disabled={toggleActive.isPending}
                        className="gap-1.5 flex-1"
                      >
                        {toggleActive.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : prog.is_active ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        {prog.is_active ? 'Pause' : 'Activate Programme'}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingProgramme(prog)}
                        className="gap-1.5 flex-1"
                      >
                        <Eye className="w-4 h-4" />
                        View Plan
                        <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteProgramme.mutate(prog.id)}
                        className="text-destructive hover:text-destructive shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty state with AI CTA */
        <Link to="/help?context=Build%20me%20a%20mindset%20programme">
          <Card className="border-2 border-dashed border-primary/30 p-8 text-center hover:bg-primary/5 transition-all cursor-pointer border-border bg-card">
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
