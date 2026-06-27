import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SamplePlayer } from '@/components/untunes/SamplePlayer';
import {
  Flame,
  Dumbbell,
  Brain,
  Sparkles,
  MessageSquare,
  Check,
  GraduationCap,
  Activity,
  ChevronDown,
  UserPlus,
  Target,
  Trophy,
  Zap,
  Coins,
  Shield,
  Music,
  Gamepad2,
  Quote,
  Users,
} from 'lucide-react';
const shieldLogo = 'https://vlwcoqilwyfcrsxodtdx.supabase.co/storage/v1/object/public/site-assets/misc/unbreakable-shield.webp';
const lwlFilmstrip = 'https://vlwcoqilwyfcrsxodtdx.supabase.co/storage/v1/object/public/site-assets/misc/lwl-filmstrip-web.webp';
const johnFounder = 'https://vlwcoqilwyfcrsxodtdx.supabase.co/storage/v1/object/public/site-assets/misc/john-founder.webp';
const jj2018 = 'https://vlwcoqilwyfcrsxodtdx.supabase.co/storage/v1/object/public/site-assets/misc/jj-journey-2018.webp';
const jj2020 = 'https://vlwcoqilwyfcrsxodtdx.supabase.co/storage/v1/object/public/site-assets/misc/jj-journey-2020.webp';
const jjReturn = 'https://vlwcoqilwyfcrsxodtdx.supabase.co/storage/v1/object/public/site-assets/misc/jj-return-2025-2026.webp';

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
    color: '#FF5500',
    stat: 'Strength',
  },
  {
    icon: Activity,
    title: 'MOVEMENT',
    desc: 'Run, cycle, swim, row or walk — structured cardio with distance, pace and heart-rate tracking.',
    color: '#00C853',
    stat: 'Cardio',
  },
  {
    icon: Flame,
    title: 'FUEL',
    desc: 'Track nutrition, plan meals, discover recipes and get AI-generated meal plans tailored to your goals.',
    color: '#FF8C00',
    stat: 'Nutrition',
  },
  {
    icon: Brain,
    title: 'MINDSET',
    desc: 'Guided breathing, focus games, journalling and science-backed mental resilience training.',
    color: '#7C4DFF',
    stat: 'Mental',
  },
  {
    icon: GraduationCap,
    title: 'UNIVERSITY',
    desc: 'Real PT-level courses across training, nutrition, mindset and sport — learn why, not just how.',
    color: '#2196F3',
    stat: 'Education',
  },
  {
    icon: MessageSquare,
    title: 'UNBREAKABLE COACH',
    desc: 'Your 24/7 AI personal trainer. Programmes, meal plans, form checks and advice — whenever you need it.',
    color: '#FF5500',
    stat: 'Coaching',
  },
];

/* ─── How it works ─── */
const howItWorks = [
  {
    step: '01',
    icon: UserPlus,
    title: 'SIGN UP FREE',
    desc: 'Create your account in seconds. Everything is free to use — no card, no catch.',
  },
  {
    step: '02',
    icon: Target,
    title: 'SET YOUR GOALS',
    desc: 'Pick your pillars. Your Unbreakable Coach builds your first programme in under a minute.',
  },
  {
    step: '03',
    icon: Trophy,
    title: 'SHOW UP & LEVEL UP',
    desc: 'Log sessions, track progress, earn achievements. The platform grows with you.',
  },
];

/* ─── Free features ─── */
const freeFeatures = [
  'Full training programme builder',
  'Session logging with progressive overload',
  'Cardio tracker (run, cycle, swim, row, walk)',
  'Nutrition tracker & meal planner',
  'Recipe library with macros',
  'Mindset programmes & breathing exercises',
  '9 focus & reaction games',
  'Community Hub — feed, stories & messaging',
  'Daily habit diary & lifestyle tracking',
  'Calculators & body composition tools',
  'Music library (Un-Tunes)',
  '5 free coach tokens on signup',
];

/* ─── Token tiers ─── */
const tokenTiers = [
  { name: 'FREE', tokens: 5, price: '£0', desc: 'Try the Coach with 5 tokens on signup', highlight: false, features: ['5 tokens on signup', 'All free tools', 'Community access'] },
  { name: 'STARTER', tokens: 50, price: '£20', period: '/mo', desc: 'AI coaching, UNBREAKABLE 86 & full UnTunes', highlight: false, features: ['50 tokens/month', 'AI coach chat', 'Full UnTunes'] },
  { name: 'PRO', tokens: 100, price: '£30', period: '/mo', desc: 'Full AI coach, programmes & exercise library', highlight: true, features: ['100 tokens/month', 'AI programme builder', 'University access'] },
  { name: 'ELITE', tokens: 200, price: '£40', period: '/mo', desc: 'PT Hub, priority AI & coach command centre', highlight: false, features: ['200 tokens/month', 'Priority AI', 'Coach command centre'] },
];

/* ─── What makes this different ─── */
const differentiators = [
  {
    icon: Shield,
    title: 'NOT ANOTHER TRACKING APP',
    desc: 'We don\'t just count reps. We combine training, nutrition, mindset and education into one ecosystem that actually changes how you live.',
  },
  {
    icon: Users,
    title: 'BUILT BY SOMEONE WHO GETS IT',
    desc: 'Founded by someone who trained through addiction recovery, mental health battles and every restart in between. This isn\'t theory.',
  },
  {
    icon: Zap,
    title: 'AI THAT ADAPTS TO YOU',
    desc: 'Your Unbreakable Coach learns your goals, your schedule and your body. It builds around your life — not the other way round.',
  },
];

export function LandingPage({ onSignIn, onSignUp }: LandingPageProps) {
  const navigate = useNavigate();

  const goSignIn = () => navigate('/signin');
  const goSignUp = () => navigate('/signin?mode=signup');

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      {/* ━━━ Header ━━━ */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05]"
        style={{ background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(20px)' }}>
        <div className="container mx-auto px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img loading="lazy" src={shieldLogo} alt="UNBREAKABLE" className="h-8 w-8 object-contain" />
              <span className="font-heading font-black text-base tracking-[0.12em] text-white uppercase hidden sm:block">
                UNBREAKABLE
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="text-[#888] hover:text-white font-heading font-bold text-sm uppercase tracking-wider transition-colors px-3 py-2"
                onClick={goSignIn}
              >
                LOG IN
              </button>
              <button
                className="px-5 py-2.5 rounded-xl font-heading font-bold text-sm uppercase tracking-wider text-white transition-all active:scale-[0.97] flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #FF5500 0%, #CC4400 100%)',
                  boxShadow: '0 0 16px rgba(255,85,0,0.3), 0 0 50px rgba(255,85,0,0.1)',
                }}
                onClick={goSignUp}
              >
                <Sparkles size={14} />
                JOIN FREE
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ━━━ Hero ━━━ */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center text-center px-6 pt-24 pb-8 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[180px]"
            style={{ background: 'rgba(255,85,0,0.08)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080808] to-transparent" />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative max-w-4xl mx-auto"
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
            <img
              src={shieldLogo}
              alt="UNBREAKABLE"
              className="h-24 md:h-32 lg:h-40 object-contain mx-auto mb-6 shield-pulse"
            />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="font-heading font-black text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-white tracking-[0.04em] leading-[0.95] mb-3 uppercase"
          >
            STOP STARTING OVER.
            <br />
            <span className="text-[#FF5500]" style={{
              textShadow: '0 0 20px rgba(255,85,0,0.5), 0 0 60px rgba(255,85,0,0.2)',
            }}>
              START BUILDING.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-[#888] text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-8"
          >
            Training, nutrition, mindset and education in one platform.
            Your own AI coach. A community that keeps you accountable.
            Built for people who are done quitting.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-5"
          >
            <button
              className="w-full sm:w-auto px-10 py-4 rounded-xl font-heading font-bold text-lg uppercase tracking-wider text-white transition-all active:scale-[0.97] flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #FF5500 0%, #CC4400 100%)',
                boxShadow: '0 0 24px rgba(255,85,0,0.4), 0 0 80px rgba(255,85,0,0.15)',
              }}
              onClick={goSignUp}
            >
              <Sparkles size={18} />
              JOIN FREE — NO CARD NEEDED
            </button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[#666] text-xs sm:text-sm"
          >
            <span className="flex items-center gap-1.5"><Check size={14} className="text-[#FF5500]" /> 100% free to use</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-[#FF5500]" /> 5 coach tokens on signup</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-[#FF5500]" /> No card required</span>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-6"
        >
          <ChevronDown className="w-6 h-6 text-[#444] animate-bounce" />
        </motion.div>
      </section>

      {/* ━━━ Social proof bar ━━━ */}
      <section className="border-y border-white/[0.06] py-5" style={{ background: 'rgba(14,14,14,0.5)' }}>
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-16 text-center">
            {[
              { val: '6', label: 'Training Pillars' },
              { val: '4,400+', label: 'Quiz Questions' },
              { val: '24', label: 'Original Tracks' },
              { val: '9', label: 'Focus Games' },
              { val: '24/7', label: 'AI Coach' },
            ].map(s => (
              <div key={s.label}>
                <p className="font-heading font-black text-xl sm:text-2xl md:text-3xl text-[#FF5500]"
                  style={{ textShadow: '0 0 10px rgba(255,85,0,0.3)' }}>{s.val}</p>
                <p className="text-[#666] text-[10px] sm:text-xs tracking-widest uppercase">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ Problem / Why ━━━ */}
      <section className="py-16 sm:py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <p className="text-[#FF5500] font-heading font-bold text-sm uppercase tracking-[0.2em] mb-2">The Problem</p>
              <h2 className="font-heading font-black text-2xl sm:text-3xl md:text-5xl text-white uppercase tracking-wide mb-4">
                Fitness Apps Are Broken
              </h2>
              <p className="text-[#888] max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                One app to track meals. Another for training. A YouTube video for mindset. A course that costs £3,000.
                None of them talk to each other. None of them care if you show up tomorrow.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {differentiators.map(d => {
                const Icon = d.icon;
                return (
                  <motion.div
                    key={d.title}
                    variants={fadeUp}
                    className="p-5 rounded-2xl"
                    style={{ background: 'rgba(14,14,14,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: 'rgba(255,85,0,0.1)' }}>
                      <Icon size={20} className="text-[#FF5500]" />
                    </div>
                    <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider mb-2">{d.title}</h3>
                    <p className="text-[#888] text-sm leading-relaxed">{d.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ App Showcase (Filmstrip) ━━━ */}
      <section className="py-12 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-transparent to-[#080808] z-10 pointer-events-none" />
          <img
            src={lwlFilmstrip}
            alt="UNBREAKABLE App"
            className="w-full max-w-5xl mx-auto opacity-80"
            style={{ filter: 'drop-shadow(0 0 40px rgba(255,85,0,0.1))' }}
          />
        </motion.div>
      </section>

      {/* ━━━ Features ━━━ */}
      <section id="features" className="py-16 sm:py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <p className="text-[#FF5500] font-heading font-bold text-sm uppercase tracking-[0.2em] mb-2">The Platform</p>
              <h2 className="font-heading font-black text-2xl sm:text-3xl md:text-5xl text-white uppercase tracking-wide">
                Six Pillars. One Platform.
              </h2>
              <p className="text-[#888] mt-3 max-w-xl mx-auto text-sm sm:text-base">
                Everything from the barbell to the brain — integrated, tracked, and coached.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platformFeatures.map(f => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={f.title}
                    variants={fadeUp}
                    className="p-5 rounded-2xl transition-all hover:scale-[1.02] group relative overflow-hidden"
                    style={{
                      background: 'rgba(14,14,14,0.6)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: `${f.color}15` }} />
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: `${f.color}15` }}>
                          <Icon size={20} style={{ color: f.color }} />
                        </div>
                        <span className="text-[10px] font-heading font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
                          style={{ background: `${f.color}10`, color: f.color }}>{f.stat}</span>
                      </div>
                      <h3 className="font-heading font-bold text-lg text-white uppercase tracking-wider mb-1.5">
                        {f.title}
                      </h3>
                      <p className="text-[#888] text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ Extras: Games + Music ━━━ */}
      <section className="py-16 sm:py-20 px-6" style={{ background: 'rgba(10,10,10,0.5)' }}>
        <div className="container mx-auto max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <p className="text-[#FF5500] font-heading font-bold text-sm uppercase tracking-[0.2em] mb-2">Beyond Training</p>
              <h2 className="font-heading font-black text-2xl sm:text-3xl md:text-5xl text-white uppercase tracking-wide">
                More Than a Fitness App
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Games */}
              <motion.div variants={fadeUp} className="p-6 rounded-2xl"
                style={{ background: 'rgba(14,14,14,0.6)', border: '1px solid rgba(124,77,255,0.15)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(124,77,255,0.1)' }}>
                    <Gamepad2 size={24} className="text-[#7C4DFF]" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-white uppercase tracking-wider">Focus Games</h3>
                    <p className="text-[#666] text-xs">9 games. Real cognitive training.</p>
                  </div>
                </div>
                <p className="text-[#888] text-sm leading-relaxed mb-3">
                  Reaction speed. Pattern memory. Mental maths. Sequence recall. Not filler — genuine focus
                  and reaction training with leaderboards, stages and personal bests.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['HUNT', 'SHATTER', 'STRIKE', 'RECALL', 'LOCK IN', 'FLOW', 'STACK', 'MATHS', 'FOCUS'].map(g => (
                    <span key={g} className="text-[10px] font-heading font-bold tracking-wider px-2 py-1 rounded-lg"
                      style={{ background: 'rgba(124,77,255,0.08)', color: '#7C4DFF' }}>{g}</span>
                  ))}
                </div>
              </motion.div>

              {/* Music */}
              <motion.div variants={fadeUp} className="p-6 rounded-2xl"
                style={{ background: 'rgba(14,14,14,0.6)', border: '1px solid rgba(255,85,0,0.15)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,85,0,0.1)' }}>
                    <Music size={24} className="text-[#FF5500]" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-white uppercase tracking-wider">Un-Tunes</h3>
                    <p className="text-[#666] text-xs">Original music built for your sessions.</p>
                  </div>
                </div>
                <p className="text-[#888] text-sm leading-relaxed mb-3">
                  24 original tracks across two albums — <em>New Beginnings</em> and <em>Strong Foundations</em>.
                  Post-hardcore meets motivation. Built to match the pace of your training.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['POWER', 'MOVEMENT', 'MINDSET', 'FUEL', 'RECOVERY'].map(p => (
                    <span key={p} className="text-[10px] font-heading font-bold tracking-wider px-2 py-1 rounded-lg"
                      style={{ background: 'rgba(255,85,0,0.08)', color: '#FF5500' }}>{p}</span>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ Founder Story ━━━ */}
      <section className="py-16 sm:py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <p className="text-[#FF5500] font-heading font-bold text-sm uppercase tracking-[0.2em] mb-2">The Story</p>
              <h2 className="font-heading font-black text-2xl sm:text-3xl md:text-5xl text-white uppercase tracking-wide">
                Built From Experience
              </h2>
            </motion.div>

            <motion.div variants={fadeUp} className="rounded-2xl p-6 sm:p-8 md:p-10"
              style={{ background: 'rgba(14,14,14,0.6)', border: '1px solid rgba(255,85,0,0.1)' }}>
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-shrink-0">
                  <img
                    src={johnFounder}
                    alt="John James — Founder"
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover"
                    style={{ border: '2px solid rgba(255,85,0,0.2)', boxShadow: '0 0 30px rgba(255,85,0,0.1)' }}
                  />
                </div>
                <div>
                  <Quote size={28} className="text-[#FF5500]/30 mb-2" />
                  <p className="text-[#ccc] text-sm sm:text-base leading-relaxed mb-4">
                    I didn't build UNBREAKABLE because I had it figured out. I built it because I didn't.
                    I've trained through addiction recovery, mental health crises and years of starting over.
                    Every feature in this app exists because I needed it myself.
                  </p>
                  <p className="text-[#888] text-sm leading-relaxed mb-4">
                    This isn't a corporate fitness app built by people who've never missed a Monday.
                    It's built by someone who's missed hundreds of Mondays — and still showed back up.
                  </p>
                  <p className="font-heading font-bold text-white text-sm tracking-wider">
                    JOHN JAMES <span className="text-[#FF5500]">·</span> <span className="text-[#666] font-normal">Founder, Live Without Limits LTD</span>
                  </p>
                </div>
              </div>

              {/* Journey timeline */}
              <div className="mt-8 pt-6 border-t border-white/[0.06]">
                <p className="text-[#666] text-xs font-heading tracking-widest uppercase mb-4 text-center">The Journey</p>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="text-center">
                    <img loading="lazy" src={jj2018} alt="2018" className="w-full aspect-square object-cover rounded-xl mb-2 opacity-80 hover:opacity-100 transition-opacity"
                      style={{ border: '1px solid rgba(255,255,255,0.06)' }} />
                    <p className="text-[#666] text-[10px] sm:text-xs font-heading tracking-wider">2018 — THE START</p>
                  </div>
                  <div className="text-center">
                    <img loading="lazy" src={jj2020} alt="2020" className="w-full aspect-square object-cover rounded-xl mb-2 opacity-80 hover:opacity-100 transition-opacity"
                      style={{ border: '1px solid rgba(255,255,255,0.06)' }} />
                    <p className="text-[#666] text-[10px] sm:text-xs font-heading tracking-wider">2020 — THE GRIND</p>
                  </div>
                  <div className="text-center">
                    <img loading="lazy" src={jjReturn} alt="2025-2026" className="w-full aspect-square object-cover rounded-xl mb-2 opacity-80 hover:opacity-100 transition-opacity"
                      style={{ border: '1px solid rgba(255,85,0,0.15)' }} />
                    <p className="text-[#FF5500] text-[10px] sm:text-xs font-heading tracking-wider">2025 — UNBREAKABLE</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ How it works ━━━ */}
      <section className="py-16 sm:py-20 px-6" style={{ background: 'rgba(10,10,10,0.5)' }}>
        <div className="container mx-auto max-w-4xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <p className="text-[#FF5500] font-heading font-bold text-sm uppercase tracking-[0.2em] mb-2">Getting Started</p>
              <h2 className="font-heading font-black text-2xl sm:text-3xl md:text-5xl text-white uppercase tracking-wide">
                3 Steps. No Excuses.
              </h2>
            </motion.div>

            <div className="space-y-4 sm:space-y-6">
              {howItWorks.map(s => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.step}
                    variants={fadeUp}
                    className="flex gap-4 sm:gap-5 items-start p-5 rounded-2xl"
                    style={{ background: 'rgba(14,14,14,0.5)', border: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255,85,0,0.1)', border: '1px solid rgba(255,85,0,0.2)' }}>
                      <span className="font-heading font-black text-[#FF5500] text-lg">{s.step}</span>
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base sm:text-lg text-white uppercase tracking-wider mb-1">{s.title}</h3>
                      <p className="text-[#888] text-sm leading-relaxed">{s.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ Free features ━━━ */}
      <section className="py-16 sm:py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <p className="text-[#FF5500] font-heading font-bold text-sm uppercase tracking-[0.2em] mb-2">No Paywall</p>
              <h2 className="font-heading font-black text-2xl sm:text-3xl md:text-5xl text-white uppercase tracking-wide">
                Free. Seriously.
              </h2>
              <p className="text-[#888] mt-3 max-w-xl mx-auto text-sm sm:text-base">
                Every tool is free to use. Tokens unlock your Unbreakable Coach and premium University courses.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="rounded-2xl p-6"
              style={{ background: 'rgba(14,14,14,0.5)', border: '1px solid rgba(255,85,0,0.1)' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {freeFeatures.map(f => (
                  <div key={f} className="flex items-start gap-2.5">
                    <Check size={16} className="text-[#FF5500] flex-shrink-0 mt-0.5" />
                    <span className="text-[#ccc] text-sm">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ Tokens (pricing) ━━━ */}
      <section className="py-16 sm:py-20 px-6" style={{ background: 'rgba(10,10,10,0.5)' }}>
        <div className="container mx-auto max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coins size={18} className="text-[#FF5500]" />
                <p className="text-[#FF5500] font-heading font-bold text-sm uppercase tracking-[0.2em]">
                  Unbreakable Tokens
                </p>
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl md:text-5xl text-white uppercase tracking-wide">
                Founding Member Pricing
              </h2>
              <p className="text-[#888] mt-3 max-w-xl mx-auto text-sm">
                🔒 First 100 members lock in these prices <span className="text-white font-semibold">for life</span>.
                Your rate never increases, no matter how much the platform grows.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {tokenTiers.map(t => (
                <motion.div
                  key={t.name}
                  variants={fadeUp}
                  className="rounded-2xl p-5 relative transition-all hover:scale-[1.02]"
                  style={{
                    background: t.highlight ? 'rgba(255,85,0,0.08)' : 'rgba(14,14,14,0.5)',
                    border: t.highlight ? '1.5px solid rgba(255,85,0,0.3)' : '1px solid rgba(255,255,255,0.05)',
                    boxShadow: t.highlight ? '0 0 30px rgba(255,85,0,0.1)' : 'none',
                  }}
                >
                  {t.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{ background: 'linear-gradient(135deg, #FF5500, #CC4400)', boxShadow: '0 0 12px rgba(255,85,0,0.4)' }}>
                      Most Popular
                    </div>
                  )}
                  <h3 className="font-heading font-black text-lg text-white uppercase tracking-wider mb-1">{t.name}</h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="font-heading font-black text-2xl text-[#FF5500]">{t.price}</span>
                    {t.period && <span className="text-[#666] text-xs">{t.period}</span>}
                  </div>
                  <ul className="space-y-1.5 mb-3">
                    {t.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs">
                        <Check size={12} className="text-[#FF5500] flex-shrink-0" />
                        <span className="text-[#aaa]">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[#666] text-[11px] leading-relaxed">{t.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Top-ups & credit info */}
            <motion.div variants={fadeUp} className="mt-6 text-center space-y-1.5">
              <p className="text-[#aaa] text-xs">
                <span className="text-[#FF5500] font-bold">Monthly credits reset</span> each billing cycle &nbsp;·&nbsp;
                <span className="text-[#FF5500] font-bold">Top-ups carry over</span> — never lose purchased tokens
              </p>
              <p className="text-[#666] text-[11px]">
                Need more? Grab a £10 top-up anytime — 25 tokens that never expire
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ University callout ━━━ */}
      <section className="py-16 sm:py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="rounded-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(33,150,243,0.08) 0%, rgba(14,14,14,0.6) 100%)',
              border: '1px solid rgba(33,150,243,0.15)',
            }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[100px] opacity-30"
              style={{ background: 'rgba(33,150,243,0.15)' }} />
            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(33,150,243,0.1)', border: '1px solid rgba(33,150,243,0.2)' }}>
                <GraduationCap size={32} className="text-[#2196F3]" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="font-heading font-black text-xl sm:text-2xl text-white uppercase tracking-wide mb-2">
                  Unbreakable University
                </h3>
                <p className="text-[#888] text-sm leading-relaxed max-w-lg">
                  Real PT-level content across 8+ courses — training science, nutrition science, mindset psychology and sport-specific modules.
                  Over 4,400 quiz questions. Certificates on completion. All for a fraction of what traditional PT courses charge.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ Final CTA ━━━ */}
      <section className="py-20 sm:py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[180px]"
            style={{ background: 'rgba(255,85,0,0.06)' }} />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <img loading="lazy" src={shieldLogo} alt="" className="h-16 w-16 mx-auto mb-5 shield-pulse" />
          <h2 className="font-heading font-black text-3xl md:text-5xl text-white uppercase tracking-wide mb-4">
            Ready to Be <span className="text-[#FF5500]">Unbreakable</span>?
          </h2>
          <p className="text-[#888] mb-8 max-w-md mx-auto text-sm sm:text-base">
            Stop starting over. Join the platform built for people who keep showing up.
          </p>
          <button
            className="w-full sm:w-auto px-12 py-4 rounded-xl font-heading font-bold text-lg uppercase tracking-wider text-white transition-all active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, #FF5500 0%, #CC4400 100%)',
              boxShadow: '0 0 30px rgba(255,85,0,0.4), 0 0 80px rgba(255,85,0,0.15)',
            }}
            onClick={goSignUp}
          >
            START NOW — IT'S FREE
          </button>
          <p className="text-[#555] text-xs mt-4">No card needed · 5 free coach tokens · Cancel anytime</p>
        </div>
      </section>

      {/* ━━━ Footer ━━━ */}
      <LandingFooter />

      {/* ━━━ Un-Tunes 30s Sample Player (non-users) ━━━ */}
      <SamplePlayer onSignUp={goSignUp} />
    </div>
  );
}
