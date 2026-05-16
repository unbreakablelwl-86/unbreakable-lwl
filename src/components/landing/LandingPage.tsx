import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ThemedLogo } from '@/components/ThemedLogo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/hub/ThemeToggle';
import { LandingFooter } from '@/components/landing/LandingFooter';
import {
  Flame,
  Dumbbell,
  Brain,
  Heart,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Shield,
  Check,
  Crown,
  GraduationCap,
  Activity,
  ChevronDown,
  UserPlus,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { TIERS } from '@/lib/subscriptionTiers';

interface LandingPageProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ─── Platform Features ─── */
const platformFeatures = [
  {
    icon: Dumbbell,
    title: 'POWER',
    desc: 'Build bespoke training programmes, log every session, and track progressive overload week by week.',
  },
  {
    icon: Activity,
    title: 'MOVEMENT',
    desc: 'Run, cycle, swim, row or walk — structured cardio programmes with distance, pace and heart-rate tracking.',
  },
  {
    icon: Flame,
    title: 'FUEL',
    desc: 'Track nutrition, plan meals, discover recipes and get AI-generated meal plans tailored to your goals.',
  },
  {
    icon: Brain,
    title: 'MINDSET',
    desc: 'Guided breathing protocols, focus games, and science-backed mental resilience training.',
  },
  {
    icon: GraduationCap,
    title: 'UNIVERSITY',
    desc: 'Structured fitness courses — real PT qualification content made affordable and relatable for everyone.',
  },
  {
    icon: MessageSquare,
    title: 'AI COACH',
    desc: 'Chat with your Unbreakable Coach anytime. Get bespoke programmes, meal plans, and advice on demand.',
  },
];

/* ─── How it works steps ─── */
const howItWorks = [
  {
    step: '01',
    icon: UserPlus,
    title: 'SIGN UP FREE',
    desc: 'Create your account in seconds. Access the social hub, calculators and habit tools straight away — no card needed.',
  },
  {
    step: '02',
    icon: Target,
    title: 'CHOOSE YOUR PATH',
    desc: 'Start your 7-day free trial and unlock everything: Power, Movement, Fuel, Mindset, University and your AI Coach.',
  },
  {
    step: '03',
    icon: Trophy,
    title: 'TRAIN & LEVEL UP',
    desc: 'Log sessions, hit goals, earn trophies. Your coach adapts to you. The community keeps you accountable.',
  },
];

/* ─── Coaching tier features ─── */
const coachingFeatures = [
  'Full Power programme builder (manual & AI-built)',
  'Session logging, tracking & progression tools',
  'Fuel tracker, meal planning & recipe library',
  'Mindset programmes, breathing & focus games',
  'Movement programmes (run, cycle, swim, row, walk)',
  'Unlimited AI Coach conversations',
  'University learning hub & calculators',
  'Community Hub — feed, stories & messaging',
  'Daily habit diary & lifestyle tracking',
];

const oneToOneExtras = [
  'Dedicated 1-to-1 human coach',
  'Bi-weekly check-ins & progress reviews',
  'Personalised feedback on sessions & form',
  'Bespoke programming adjustments each block',
  'Nutrition & lifestyle guidance from your coach',
  'Priority support & accountability',
];

export function LandingPage({ onSignIn, onSignUp }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* ━━━ Header ━━━ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link to="/" className="flex items-center gap-3">
                <ThemedLogo />
                <span className="font-display text-lg tracking-wide text-foreground hidden sm:block">
                  UNBREAKABLE
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                className="font-display tracking-wide text-muted-foreground hover:text-primary"
                onClick={onSignIn}
              >
                LOG IN
              </Button>
              <Button
                className="font-display tracking-wide"
                onClick={onSignUp}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                START FREE TRIAL
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ━━━ Hero ━━━ */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 pt-24 pb-8 overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative max-w-4xl mx-auto"
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
            <ThemedLogo className="h-20 md:h-28 lg:h-36 object-contain mx-auto mb-6" />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground tracking-wide leading-none mb-2"
          >
            BECOME{' '}
            <span className="text-primary neon-glow-subtle">UNBREAKABLE</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-primary font-display text-xl md:text-2xl tracking-wide neon-glow-subtle mb-5 mt-3"
          >
            LIVE WITHOUT LIMITS. KEEP SHOWING UP.
          </motion.p>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-8"
          >
            Training, nutrition, mindset and education — all in one platform.
            Stop guessing. Start building a body and mind that last.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4"
          >
            <Button
              size="lg"
              className="font-display text-lg tracking-wide px-10 py-6"
              onClick={onSignUp}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              START YOUR 7-DAY FREE TRIAL
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="font-display text-lg tracking-wide px-10 py-6 border-primary/40 hover:bg-primary/10"
              onClick={() =>
                document
                  .getElementById('features')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              SEE WHAT'S INSIDE
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-muted-foreground text-sm"
          >
            No card required · Cancel anytime · From £{TIERS.tier1.monthlyPrice}/month after trial
          </motion.p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-6"
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground/50 animate-bounce" />
        </motion.div>
      </section>

      {/* ━━━ Social proof bar ━━━ */}
      <section className="border-y border-border bg-card/30 py-5">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-center">
            <div>
              <p className="font-display text-2xl md:text-3xl text-primary neon-glow-subtle">4</p>
              <p className="text-muted-foreground text-xs tracking-widest uppercase">
                Training Tracks
              </p>
            </div>
            <div>
              <p className="font-display text-2xl md:text-3xl text-primary neon-glow-subtle">10+</p>
              <p className="text-muted-foreground text-xs tracking-widest uppercase">
                Courses & Levels
              </p>
            </div>
            <div>
              <p className="font-display text-2xl md:text-3xl text-primary neon-glow-subtle">1,800+</p>
              <p className="text-muted-foreground text-xs tracking-widest uppercase">
                Quiz Questions
              </p>
            </div>
            <div>
              <p className="font-display text-2xl md:text-3xl text-primary neon-glow-subtle">290+</p>
              <p className="text-muted-foreground text-xs tracking-widest uppercase">
                Exercise Library
              </p>
            </div>
            <div>
              <p className="font-display text-2xl md:text-3xl text-primary neon-glow-subtle">AI</p>
              <p className="text-muted-foreground text-xs tracking-widest uppercase">
                Powered Coach
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ What is Unbreakable? ━━━ */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <Badge
                variant="outline"
                className="border-primary/40 text-primary mb-4 font-display tracking-wider"
              >
                THE PHILOSOPHY
              </Badge>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="font-display text-3xl md:text-5xl text-foreground mb-6 tracking-wide"
            >
              THIS ISN'T ABOUT{' '}
              <span className="text-primary neon-glow-subtle">PERFECTION</span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto mb-10"
            >
              Forget chasing someone else's ideal. Unbreakable is about building
              a body that <span className="text-primary">works</span>, a mind
              that <span className="text-primary">stays sharp</span>, and
              habits that <span className="text-primary">actually stick</span>.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="grid md:grid-cols-3 gap-6"
            >
              {[
                {
                  icon: Dumbbell,
                  title: 'ABILITY',
                  text: 'Lift, move, run, push, pull — live without fear of your body failing you.',
                },
                {
                  icon: Brain,
                  title: 'MINDSET',
                  text: "Keep going when it's hard, boring, or inconvenient. Rebuild when life knocks you sideways.",
                },
                {
                  icon: Heart,
                  title: 'LONGEVITY',
                  text: 'Train for the long game. Strong joints. Capable muscles. A body that lasts.',
                },
              ].map((item) => (
                <Card
                  key={item.title}
                  className="bg-card border-2 border-primary/20 hover:border-primary/40 transition-colors p-8 text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-xl text-primary mb-3 tracking-wide neon-glow-subtle">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {item.text}
                  </p>
                </Card>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ Platform Features ━━━ */}
      <section id="features" className="py-16 md:py-24 bg-card/30 scroll-mt-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="text-center mb-12">
              <Badge
                variant="outline"
                className="border-primary/40 text-primary mb-4 font-display tracking-wider"
              >
                THE PLATFORM
              </Badge>
              <h2 className="font-display text-3xl md:text-5xl text-foreground tracking-wide mb-4">
                EVERYTHING YOU NEED.{' '}
                <span className="text-primary neon-glow-subtle">ONE APP.</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Six pillars of training — all connected, all in your pocket. No
                more juggling five different apps.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {platformFeatures.map((f) => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="h-full bg-card border border-border hover:border-primary/30 transition-colors p-6 group">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors flex items-center justify-center flex-shrink-0">
                        <f.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg text-foreground tracking-wide mb-1">
                          {f.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {f.desc}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ How it works ━━━ */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="text-center mb-12">
              <Badge
                variant="outline"
                className="border-primary/40 text-primary mb-4 font-display tracking-wider"
              >
                HOW IT WORKS
              </Badge>
              <h2 className="font-display text-3xl md:text-5xl text-foreground tracking-wide mb-4">
                THREE STEPS.{' '}
                <span className="text-primary neon-glow-subtle">NO NONSENSE.</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {howItWorks.map((item, i) => (
                <motion.div
                  key={item.step}
                  variants={fadeUp}
                  transition={{ duration: 0.4 }}
                  className="text-center relative"
                >
                  {/* Connector line (desktop only) */}
                  {i < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] border-t border-dashed border-primary/20" />
                  )}
                  <div className="relative">
                    <span className="font-display text-6xl text-primary/10 absolute -top-2 left-1/2 -translate-x-1/2">
                      {item.step}
                    </span>
                    <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4 relative z-10">
                      <item.icon className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-display text-xl text-foreground tracking-wide mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="text-center mt-10">
              <Button
                size="lg"
                className="font-display tracking-wide px-8 py-6"
                onClick={onSignUp}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                GET STARTED FREE
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ University spotlight ━━━ */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="max-w-5xl mx-auto"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="text-center mb-10">
              <Badge
                variant="outline"
                className="border-primary/40 text-primary mb-4 font-display tracking-wider"
              >
                UNBREAKABLE UNIVERSITY
              </Badge>
              <h2 className="font-display text-3xl md:text-5xl text-foreground tracking-wide mb-4">
                REAL PT EDUCATION.{' '}
                <span className="text-primary neon-glow-subtle">FOR EVERYONE.</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                People spend £5,000+ getting fitness qualifications — learning things
                we should all know. We took that education and made it affordable,
                relatable, and genuinely useful.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {[
                {
                  icon: Dumbbell,
                  title: 'POWER',
                  desc: 'Anatomy, exercise science, programming and progressive overload.',
                  levels: 'L2 + L3 + L4',
                },
                {
                  icon: Flame,
                  title: 'NUTRITION',
                  desc: 'Macros, meal planning, sports nutrition and behaviour change.',
                  levels: 'L2 + L3',
                },
                {
                  icon: Brain,
                  title: 'MINDSET',
                  desc: 'Stress management, breathing science, focus and resilience.',
                  levels: 'L2 + L3',
                },
                {
                  icon: Zap,
                  title: 'SPORT',
                  desc: 'Sport-specific training, periodisation and performance science.',
                  levels: '10 Courses',
                },
              ].map((course) => (
                <Card
                  key={course.title}
                  className="bg-card border border-border hover:border-primary/30 transition-colors p-5"
                >
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <course.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display text-lg text-foreground tracking-wide mb-1.5">
                    {course.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                    {course.desc}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {course.levels}
                  </Badge>
                </Card>
              ))}
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mt-6 bg-primary/5 border border-primary/20 rounded-lg p-5 text-center"
            >
              <p className="text-muted-foreground">
                <span className="text-foreground font-medium">4 units per level</span> ·{' '}
                <span className="text-foreground font-medium">Interactive chapter quizzes</span> ·{' '}
                <span className="text-foreground font-medium">Unit assessments</span> ·{' '}
                <span className="text-foreground font-medium">Final exams</span>
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                All included in every plan — learn at your own pace.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ Keep showing up ━━━ */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="font-display text-4xl md:text-6xl text-primary mb-6 tracking-wide neon-glow-subtle"
            >
              KEEP SHOWING UP
            </motion.h2>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="space-y-2 text-muted-foreground text-lg leading-relaxed mb-8"
            >
              <p>Some days you'll feel unstoppable.</p>
              <p>Some days you'll feel tired, busy, or unmotivated.</p>
              <p className="text-foreground font-medium pt-2">
                Unbreakable isn't built on perfect weeks. It's built on the
                decision to show up again.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap justify-center gap-3 text-primary font-display text-base md:text-lg tracking-wide"
            >
              {['ONE SESSION', 'ONE WALK', 'ONE MEAL', 'ONE CHOICE'].map(
                (tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-primary/10 rounded-lg border border-primary/20"
                  >
                    {tag}
                  </span>
                ),
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ Pricing ━━━ */}
      <section id="pricing" className="py-16 md:py-24 bg-card/30 scroll-mt-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="text-center mb-12">
              <Badge
                variant="outline"
                className="border-primary/40 text-primary mb-4 font-display tracking-wider"
              >
                PRICING
              </Badge>
              <h2 className="font-display text-3xl md:text-5xl text-foreground tracking-wide mb-4">
                SIMPLE.{' '}
                <span className="text-primary neon-glow-subtle">HONEST.</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Start with a 7-day free trial. No card required. Cancel anytime.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Coaching tier */}
              <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                <Card className="h-full bg-card border-2 border-border hover:border-primary/30 transition-colors p-8 flex flex-col">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-primary" />
                      <h3 className="font-display text-2xl text-foreground tracking-wide">
                        COACHING
                      </h3>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-4xl text-primary neon-glow-subtle">
                        £{TIERS.tier1.monthlyPrice}
                      </span>
                      <span className="text-muted-foreground text-sm">/month</span>
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">
                      {TIERS.tier1.commitmentMonths}-month commitment
                    </p>
                  </div>

                  <ul className="space-y-3 flex-1 mb-8">
                    {coachingFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground text-sm">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full font-display tracking-wide border-primary/40 hover:bg-primary/10"
                    onClick={onSignUp}
                  >
                    START FREE TRIAL
                  </Button>
                </Card>
              </motion.div>

              {/* 1-to-1 tier */}
              <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                <Card className="h-full bg-card border-2 border-primary/40 neon-border-subtle p-8 flex flex-col relative overflow-hidden">
                  <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground font-display tracking-wider">
                    PREMIUM
                  </Badge>

                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-primary" />
                      <h3 className="font-display text-2xl text-foreground tracking-wide">
                        1-TO-1
                      </h3>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-4xl text-primary neon-glow-subtle">
                        £{TIERS.tier2.monthlyPrice}
                      </span>
                      <span className="text-muted-foreground text-sm">/month</span>
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">
                      {TIERS.tier2.commitmentMonths}-month commitment
                    </p>
                  </div>

                  <p className="text-muted-foreground text-sm mb-4">
                    Everything in Coaching, plus:
                  </p>

                  <ul className="space-y-3 flex-1 mb-8">
                    {oneToOneExtras.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <Crown className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground text-sm">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    size="lg"
                    className="w-full font-display tracking-wide"
                    onClick={onSignUp}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    START FREE TRIAL
                  </Button>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ Final CTA ━━━ */}
      <section className="py-20 md:py-28 border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-3xl mx-auto"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <h2 className="font-display text-3xl md:text-5xl text-foreground mb-5 tracking-wide">
                READY TO BECOME{' '}
                <span className="text-primary neon-glow-subtle">UNBREAKABLE</span>?
              </h2>

              <div className="space-y-1 font-display text-xl md:text-2xl tracking-wide mb-8">
                <p className="text-foreground">LIVE WITHOUT LIMITS.</p>
                <p className="text-primary neon-glow-subtle">
                  KEEP SHOWING UP.
                </p>
              </div>

              <Button
                size="lg"
                className="font-display text-xl tracking-wide px-12 py-7"
                onClick={onSignUp}
              >
                START YOUR FREE TRIAL
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <p className="text-muted-foreground text-sm mt-5">
                7 days free · No card required · Cancel anytime
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ Bottom links ━━━ */}
      <section className="container mx-auto px-6 py-10 border-t border-border">
        <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
          <Link to="/founder">
            <Card className="border border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition-all h-full">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center neon-glow flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-display text-lg tracking-wide text-foreground">
                    MEET THE{' '}
                    <span className="text-primary neon-glow-subtle">FOUNDER</span>
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    The story behind Unbreakable.
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/help">
            <Card className="border border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition-all h-full">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center neon-glow flex-shrink-0">
                  <Flame className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-display text-lg tracking-wide text-foreground">
                    UNBREAKABLE{' '}
                    <span className="text-primary neon-glow-subtle">COACH</span>
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Your personal AI coach awaits.
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/university">
            <Card className="border border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition-all h-full">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center neon-glow flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-display text-lg tracking-wide text-foreground">
                    UNBREAKABLE{' '}
                    <span className="text-primary neon-glow-subtle">UNI</span>
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Real fitness education for everyone.
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
