import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dumbbell, Footprints, ClipboardCheck, ChevronDown, ChevronUp, Play, Zap, Wind, UtensilsCrossed, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { useCardioPrograms } from '@/hooks/useCardioPrograms';
import { useMindsetProgrammes } from '@/hooks/useMindsetProgrammes';
import { useMealPlans } from '@/hooks/useMealPlans';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RecordActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRunModal: () => void;
}

export function RecordActionMenu({ isOpen, onClose, onOpenRunModal }: RecordActionMenuProps) {
  const navigate = useNavigate();
  const [programsOpen, setProgramsOpen] = useState(false);
  const { programs } = useTrainingPrograms();
  const { programs: cardioPrograms } = useCardioPrograms();
  const { programmes: mindsetProgrammes } = useMindsetProgrammes();
  const { mealPlans } = useMealPlans();

  const activeTraining = (programs || []).filter(p => p.is_active);
  const activeCardio = (cardioPrograms || []).filter(p => p.is_active);
  const activeMindset = (mindsetProgrammes || []).filter(p => p.is_active);
  const activeMealPlans = (mealPlans || []).filter(p => p.is_active);

  const totalActive = activeTraining.length + activeCardio.length + activeMindset.length + activeMealPlans.length;

  const handleCardioTracker = () => {
    onClose();
    onOpenRunModal();
  };

  const handleHabitTracker = () => {
    onClose();
    navigate('/habits');
  };

  const handleSelectProgram = (type: string, id: string) => {
    onClose();
    if (type === 'power') navigate(`/programming/my-programmes?continue=${id}`);
    else if (type === 'cardio') navigate(`/tracker/my-programmes?continue=${id}`);
    else if (type === 'mindset') navigate(`/mindset?continue=${id}`);
    else if (type === 'fuel') navigate(`/fuel/planning?continue=${id}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm bg-[#0a0a0a] border-gray-800">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground tracking-wide text-center">
            TRACK ACTIVITY
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-4 py-4 pr-2">
            {/* Programme Tracking - Combined Dropdown */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Collapsible open={programsOpen} onOpenChange={setProgramsOpen}>
                <CollapsibleTrigger asChild>
                  <Card className="cursor-pointer transition-all border-2 border-primary/30 hover:border-primary hover:bg-primary/10 border-gray-800 bg-[#111]">
                    <div className="p-6 text-center relative">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <Dumbbell className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-display text-xl text-foreground tracking-wide mb-1">MY PROGRAMMES</h3>
                      <p className="text-sm text-muted-foreground">
                        {totalActive > 0 ? `${totalActive} active programme${totalActive > 1 ? 's' : ''}` : 'No active programmes'}
                      </p>
                      <div className="absolute top-4 right-4">
                        {programsOpen ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                      </div>
                    </div>
                  </Card>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 space-y-1.5 pl-2"
                    >
                      {/* Power programmes */}
                      {activeTraining.map(p => (
                        <button
                          key={p.id}
                          onClick={() => handleSelectProgram('power', p.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-card/50 hover:border-primary hover:bg-primary/10 transition-all text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Zap className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground">Power • W{p.current_week || 1}D{p.current_day || 1}</p>
                          </div>
                          <Play className="w-4 h-4 text-primary flex-shrink-0" />
                        </button>
                      ))}

                      {/* Cardio programmes */}
                      {activeCardio.map(p => (
                        <button
                          key={p.id}
                          onClick={() => handleSelectProgram('cardio', p.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-card/50 hover:border-primary hover:bg-primary/10 transition-all text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Wind className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground">Movement • W{p.current_week || 1}D{p.current_day || 1}</p>
                          </div>
                          <Play className="w-4 h-4 text-primary flex-shrink-0" />
                        </button>
                      ))}

                      {/* Mindset programmes */}
                      {activeMindset.map(p => (
                        <button
                          key={p.id}
                          onClick={() => handleSelectProgram('mindset', p.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-card/50 hover:border-primary hover:bg-primary/10 transition-all text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Brain className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground">Mindset</p>
                          </div>
                          <Play className="w-4 h-4 text-primary flex-shrink-0" />
                        </button>
                      ))}

                      {/* Fuel plans */}
                      {activeMealPlans.map(p => (
                        <button
                          key={p.id}
                          onClick={() => handleSelectProgram('fuel', p.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-card/50 hover:border-primary hover:bg-primary/10 transition-all text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <UtensilsCrossed className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground">Fuel Plan</p>
                          </div>
                          <Play className="w-4 h-4 text-primary flex-shrink-0" />
                        </button>
                      ))}

                      {totalActive === 0 && (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground mb-2">No active programmes</p>
                          <button
                            onClick={() => { onClose(); navigate('/help'); }}
                            className="text-sm text-primary hover:underline font-medium"
                          >
                            Ask Coach to build one →
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>

            {/* Cardio Tracker - unchanged */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="cursor-pointer transition-all border-2 border-primary/30 hover:border-primary hover:bg-primary/10 border-gray-800 bg-[#111]"
                onClick={handleCardioTracker}
              >
                <div className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Footprints className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display text-xl text-foreground tracking-wide mb-1">CARDIO TRACKER</h3>
                  <p className="text-sm text-muted-foreground">Walk, Run, or Cycle with GPS</p>
                </div>
              </Card>
            </motion.div>

            {/* Habit Tracker - unchanged */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="cursor-pointer transition-all border-2 border-primary/30 hover:border-primary hover:bg-primary/10 border-gray-800 bg-[#111]"
                onClick={handleHabitTracker}
              >
                <div className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <ClipboardCheck className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display text-xl text-foreground tracking-wide mb-1">HABIT TRACKER</h3>
                  <p className="text-sm text-muted-foreground">Track your Daily 5</p>
                </div>
              </Card>
            </motion.div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
