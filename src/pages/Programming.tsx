import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { 
  Dumbbell,
  Wrench,
  BookOpen,
  ArrowRight,
  Flame,
} from 'lucide-react';

export default function Programming() {
  return (
    <div className="min-h-screen bg-background">
{/* Hero */}
      <section className="pt-24 pb-16 md:pt-28 md:pb-20 border-b border-primary/20">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wide leading-none">
              <span className="text-primary neon-glow-subtle">UNBREAKABLE</span>
              <br />
              <span className="text-foreground">POWER</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Build bespoke training programmes tailored to your goals. Execute with precision.
              Your body is your armour — train it to be{' '}
              <span className="text-primary font-semibold">UNBREAKABLE</span>.
              Keep showing up.
            </p>
            <p className="text-primary font-display text-2xl tracking-wider neon-glow-subtle">
              #UNBREAKABLEPOWER
            </p>
          </motion.div>
        </div>
      </section>

      {/* Hub Navigation Cards */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl text-foreground mb-8 text-center tracking-wider">
            EXPLORE <span className="text-primary neon-glow-subtle">POWER</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Exercise Library Card */}
            <Link to="/programming/exercises">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="relative overflow-hidden p-8 h-full border-2 border-primary/30 hover:border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-transparent transition-all duration-300 neon-border-subtle group shadow-[0_0_20px_hsl(var(--primary)/0.1)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10 space-y-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center neon-glow">
                      <Dumbbell className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-display text-2xl text-foreground tracking-wide">
                      <span className="text-primary neon-glow-subtle">EXERCISE LIBRARY</span>
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      873 exercises with images, coaching breakdowns, and step-by-step instructions. Master every movement.
                    </p>
                    <div className="inline-flex items-center gap-2 text-primary font-display tracking-wider text-sm group-hover:gap-3 transition-all">
                      BROWSE LIBRARY
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Link>

            {/* Create Card */}
            <Link to="/programming/create">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="relative overflow-hidden p-8 h-full border-2 border-primary/30 hover:border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-transparent transition-all duration-300 neon-border-subtle group shadow-[0_0_20px_hsl(var(--primary)/0.1)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10 space-y-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center neon-glow">
                      <Wrench className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-display text-2xl text-foreground tracking-wide">
                      <span className="text-primary neon-glow-subtle">CREATE</span>
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Build a new training programme using the <span className="text-primary font-medium">Unbreakable Coach</span> or Manual Builder for full customisation.
                    </p>
                    <div className="inline-flex items-center gap-2 text-primary font-display tracking-wider text-sm group-hover:gap-3 transition-all">
                      START BUILDING
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Link>

            {/* Library Card */}
            <Link to="/programming/my-programmes">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="relative overflow-hidden p-8 h-full border-2 border-primary/30 hover:border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-transparent transition-all duration-300 neon-border-subtle group shadow-[0_0_20px_hsl(var(--primary)/0.1)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10 space-y-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center neon-glow">
                      <BookOpen className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-display text-2xl text-foreground tracking-wide">
                      <span className="text-primary neon-glow-subtle">LIBRARY</span>
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      View your saved programmes, track progress, and execute your training plans with guided sessions.
                    </p>
                    <div className="inline-flex items-center gap-2 text-muted-foreground font-display tracking-wider text-sm group-hover:gap-3 group-hover:text-primary transition-all">
                      VIEW PROGRAMMES
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Link>
          </div>
        </div>
      </main>

      {/* Coach Banner */}
      <section className="container mx-auto px-4 py-12 border-t border-primary/20">
        <Link to="/help" className="block max-w-3xl mx-auto">
          <Card className="border-2 border-primary/40 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 hover:bg-primary/10 transition-all neon-border-subtle shadow-[0_0_20px_hsl(var(--primary)/0.1)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center neon-glow">
                  <Flame className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-display text-xl tracking-wider text-foreground">
                    NEED HELP? <span className="text-primary neon-glow-subtle">ASK YOUR COACH</span>
                  </p>
                  <p className="text-muted-foreground mt-1">
                    Get personalised guidance on programming, technique, and progression
                  </p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-primary hidden sm:block" />
            </div>
          </Card>
        </Link>
      </section>
</div>
  );
}
