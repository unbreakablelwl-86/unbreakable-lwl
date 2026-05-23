import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Sparkles, ArrowRight, Wrench, Dumbbell, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BuilderModeSelectorProps {
  onSelectMode: (mode: 'auto' | 'manual') => void;
}

export function BuilderModeSelector({ onSelectMode }: BuilderModeSelectorProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        {/* Auto Builder Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            onClick={() => onSelectMode('auto')}
            className={cn(
              'relative overflow-hidden cursor-pointer p-8 h-full',
              'border-2 border-primary/40 hover:border-primary',
              'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent',
              'transition-all duration-300',
              ' shadow-[0_0_20px_hsl(var(--primary)/0.15)]',
              'hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)]'
            )}
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10 space-y-5">
              <div className="w-16 h-16 md:w-18 md:h-18 rounded-xl bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 md:w-9 md:h-9 text-primary" />
              </div>
              
              <h3 className="font-display text-2xl md:text-3xl text-foreground tracking-wide">
                <span className="text-primary">UNBREAKABLE</span> AUTO
              </h3>
              
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Answer a few questions about your goals, schedule, and experience. 
                Let the <span className="text-primary font-semibold">Unbreakable Coach</span> build a personalised 12-week programme tailored to you.
              </p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MessageCircle className="w-4 h-4 text-primary shrink-0" />
                <span>Includes coaching support & feedback</span>
              </div>
              
              <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-display tracking-wider text-sm shadow-[0_0_15px_hsl(var(--primary)/0.4)]">
                START AUTO BUILD
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Manual Builder Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            onClick={() => onSelectMode('manual')}
            className={cn(
              'relative overflow-hidden cursor-pointer p-8 h-full',
              'border-2 border-primary/30 hover:border-primary',
              'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent',
              'transition-all duration-300',
              ' shadow-[0_0_20px_hsl(var(--primary)/0.1)]',
              'hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)]'
            )}
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10 space-y-5">
              <div className="w-16 h-16 md:w-18 md:h-18 rounded-xl bg-primary/20 flex items-center justify-center">
                <Wrench className="w-8 h-8 md:w-9 md:h-9 text-primary" />
              </div>
              
              <h3 className="font-display text-2xl md:text-3xl text-foreground tracking-wide">
                <span className="text-primary">UNBREAKABLE</span> MANUAL
              </h3>
              
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Full control over your programme. Pick exercises from our comprehensive library, 
                set your own sets, reps, and progression. Perfect for experienced lifters.
              </p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Dumbbell className="w-4 h-4 text-primary shrink-0" />
                <span>230+ exercises with coaching tips</span>
              </div>
              
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary border border-primary/40 px-6 py-3 rounded-lg font-display tracking-wider text-sm hover:bg-primary hover:text-primary-foreground transition-all">
                BUILD MANUALLY
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
