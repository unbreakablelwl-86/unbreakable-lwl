import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LandingFooter } from '@/components/landing/LandingFooter';
import {
  Flame,
  Dumbbell,
  Brain,
  ArrowRight,
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
} from 'lucide-react';
import shieldLogo from '@/assets/unbreakable-shield.png';
import lwlFilmstrip from '@/assets/lwl-filmstrip-web.png';

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
  },
  {
    icon: Activity,
    title: 'MOVEMENT',
    desc: 'Run, cycle, swim, row or walk — structured cardio programmes with distance, pace and heart-rate tracking.',
    color: '#00C853',
  },
  {
    icon: Flame,
    title: 'FUEL',
    desc: 'Track nutrition, plan meals, discover recipes and get AI-generated meal plans tailored to your goals.',
    color: '#FF8C00',
  },
  {
    icon: Brain,
    title: 'MINDSET',
    desc: 'Guided breathing protocols, focus games, and science-backed mental resilience training.',
    color: '#7C4DFF',
  },
  {
    icon: GraduationCap,
    title: 'UNIVERSITY',
    desc: 'Structured fitness courses — real PT qualification content made affordable and relatable for everyone.',
    color: '#2196F3',
  },
  {
    icon: MessageSquare,
    title: 'UNBREAKABLE COACH',
    desc: 'Chat with your Unbreakable Coach anytime. Get bespoke programmes, meal plans, and advice on demand.',
    color: '#FF5500',
  },
];

/* ─── How it works ─── */
const howItWorks = [
  {
    step: '01',
    icon: UserPlus,
    title: 'SIGN UP FREE',
    desc: 'Create your account in seconds. Access everything straight away — no card needed.',
  },
  {
    step: '02',
    icon: Target,
    title: 'CHOOSE YOUR PATH',
    desc: 'Everything is free to use. Grab tokens to unlock your Unbreakable Coach, programme builds, and University courses.',
  },
  {
    step: '03',
    icon: Trophy,
    title: 'TRAIN & LEVEL UP',
    desc: 'Log sessions, hit goals, earn trophies. Your coach adapts to you. The community keeps you accountable.',
  },
];

/* ─── Free features ─── */
const freeFeatures = [
  'Power programme builder & session logging',
  'Movement tracker (run, cycle, swim, row, walk)',
  'Fuel tracker, meal planning & recipe library',
  'Mindset programmes, breathing & focus games',
  'Community Hub — feed, stories & messaging',
  'Daily habit diary & lifestyle tracking',
  'Calculators & free tools',
  '5 free tokens on signup to try the Unbreakable Coach',
];

/* ─── Token tiers ─── */
const tokenTiers = [
  { name: 'FREE', tokens: 5, price: '£0', fullPrice: null, desc: 'Try the Unbreakable Coach — 5 tokens on signup', highlight: false },
  { name: 'BASE', tokens: 50, price: '£25/mo', fullPrice: '£50/mo', desc: 'Programmes, meal plans & form feedback', highlight: false },
  { name: 'PRO', tokens: 150, price: '£50/mo', fullPrice: '£100/mo', desc: 'Full coaching across all pillars', highlight: true },
  { name: 'ELITE', tokens: 500, price: '£100/mo', fullPrice: '£200/mo', desc: 'Unlimited feel — perfect for PT students', highlight: false },
];

export function LandingPage({ onSignIn, onSignUp }: LandingPageProps) {
  const navigate = useNavigate();

  const goSignIn = () => navigate('/signin');
  const goSignUp = () => navigate('/signin');

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      {/* ━━━ Header ━━━ */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05]"
        style={{ background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(20px)' }}>
        <div className="container mx-auto px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src={shieldLogo} alt="UNBREAKABLE" className="h-8 w-8 object-contain" />
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
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-6 pt-24 pb-8 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[150px]"
            style={{ background: 'rgba(255,85,0,0.07)' }} />
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
              className="h-28 md:h-36 lg:h-44 object-contain mx-auto mb-6 shield-pulse"
            />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="font-heading font-black text-5xl md:text-7xl lg:text-8xl text-white tracking-[0.05em] leading-none mb-2 uppercase"
          >
            BECOME{' '}
            <span className="text-[#FF5500]" style={{
              textShadow: '0 0 20px rgba(255,85,0,0.5), 0 0 60px rgba(255,85,0,0.2)',
            }}>
              UNBREAKABLE
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="font-heading font-bold text-xl md:text-2xl tracking-[0.15em] uppercase mt-3 mb-5"
            style={{ color: '#FF5500', textShadow: '0 0 12px rgba(255,85,0,0.4)' }}
          >
            LIVE WITHOUT LIMITS. KEEP SHOWING UP.
          </motion.p>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-[#888] text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-8"
          >
            Training, nutrition, mindset and education — all in one platform.
            Stop guessing. Start building a body and mind that last.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4"
          >
            <button
              className="px-10 py-4 rounded-xl font-heading font-bold text-lg uppercase tracking-wider text-white transition-all active:scale-[0.97] flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #FF5500 0%, #CC4400 100%)',
                boxShadow: '0 0 24px rgba(255,85,0,0.4), 0 0 80px rgba(255,85,0,0.15)',
              }}
              onClick={goSignUp}
            >
              <Sparkles size={18} />
              JOIN FREE
            </button>
            <button
              className="px-10 py-4 rounded-xl font-heading font-bold text-lg uppercase tracking-wider transition-all active:scale-[0.97] flex items-center gap-2 text-[#FF5500] hover:text-white"
              style={{
                border: '1.5px solid rgba(255,85,0,0.35)',
                background: 'rgba(255,85,0,0.05)',
              }}
              onClick={() =>
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              SEE WHAT'S INSIDE
              <ArrowRight size={18} />
            </button>
          </motion.div>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-[#555] text-sm"
          >
            100% free to use · 5 tokens on signup · No card required
          </motion.p>
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
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-center">
            {[
              { val: '4', label: 'Training Tracks' },
              { val: '100+', label: 'Programmes' },
              { val: '24/7', label: 'Unbreakable Coach' },
              { val: '∞', label: 'Potential' },
            ].map(s => (
              <div key={s.label}>
                <p className="font-heading font-black text-2xl md:text-3xl text-[#FF5500]"
                  style={{ textShadow: '0 0 10px rgba(255,85,0,0.3)' }}>{s.val}</p>
                <p className="text-[#666] text-xs tracking-widest uppercase">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ Features ━━━ */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <p className="text-[#FF5500] font-heading font-bold text-sm uppercase tracking-[0.2em] mb-2">The Platform</p>
              <h2 className="font-heading font-black text-3xl md:text-5xl text-white uppercase tracking-wide">
                Everything You Need
              </h2>
              <p className="text-[#888] mt-3 max-w-xl mx-auto">
                Six pillars of complete fitness — from the barbell to the brain.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platformFeatures.map(f => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={f.title}
                    variants={fadeUp}
                    className="p-5 rounded-2xl transition-all hover:scale-[1.02] group"
                    style={{
                      background: 'rgba(14,14,14,0.6)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: `${f.color}15` }}>
                      <Icon size={20} style={{ color: f.color }} />
                    </div>
                    <h3 className="font-heading font-bold text-lg text-white uppercase tracking-wider mb-1.5">
                      {f.title}
                    </h3>
                    <p className="text-[#888] text-sm leading-relaxed">{f.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ How it works ━━━ */}
      <section className="py-20 px-6" style={{ background: 'rgba(10,10,10,0.5)' }}>
        <div className="container mx-auto max-w-4xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <p className="text-[#FF5500] font-heading font-bold text-sm uppercase tracking-[0.2em] mb-2">Getting Started</p>
              <h2 className="font-heading font-black text-3xl md:text-5xl text-white uppercase tracking-wide">
                3 Steps. No Excuses.
              </h2>
            </motion.div>

            <div className="space-y-6">
              {howItWorks.map(s => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.step}
                    variants={fadeUp}
                    className="flex gap-5 items-start p-5 rounded-2xl"
                    style={{ background: 'rgba(14,14,14,0.5)', border: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255,85,0,0.1)', border: '1px solid rgba(255,85,0,0.2)' }}>
                      <span className="font-heading font-black text-[#FF5500] text-lg">{s.step}</span>
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg text-white uppercase tracking-wider mb-1">{s.title}</h3>
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
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <p className="text-[#FF5500] font-heading font-bold text-sm uppercase tracking-[0.2em] mb-2">No Paywall</p>
              <h2 className="font-heading font-black text-3xl md:text-5xl text-white uppercase tracking-wide">
                Free. Seriously.
              </h2>
              <p className="text-[#888] mt-3 max-w-xl mx-auto">
                Every tool is free to use. Tokens unlock your Unbreakable Coach and premium courses.
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
      <section className="py-20 px-6" style={{ background: 'rgba(10,10,10,0.5)' }}>
        <div className="container mx-auto max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coins size={18} className="text-[#FF5500]" />
                <p className="text-[#FF5500] font-heading font-bold text-sm uppercase tracking-[0.2em]">
                  Unbreakable Tokens
                </p>
              </div>
              <h2 className="font-heading font-black text-3xl md:text-5xl text-white uppercase tracking-wide">
                Power Up Your Coach
              </h2>
              <p className="text-[#888] mt-3 max-w-xl mx-auto text-sm">
                Tokens fuel your Unbreakable Coach — programmes, meal plans, form feedback, course access.
                Everything else is free.
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
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-heading font-black text-2xl text-[#FF5500]">{t.price}</span>
                    {t.fullPrice && <span className="text-[#555] line-through text-xs">{t.fullPrice}</span>}
                  </div>
                  <p className="text-[#888] text-xs mb-3">{t.tokens} tokens/month</p>
                  <p className="text-[#666] text-xs leading-relaxed">{t.desc}</p>
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
                Need more? Grab a token top-up anytime — Small (50) · Medium (150) · Large (300)
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ CTA ━━━ */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[150px]"
            style={{ background: 'rgba(255,85,0,0.06)' }} />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <img src={shieldLogo} alt="" className="h-16 w-16 mx-auto mb-5 shield-pulse" />
          <h2 className="font-heading font-black text-3xl md:text-5xl text-white uppercase tracking-wide mb-4">
            Ready to Be <span className="text-[#FF5500]">Unbreakable</span>?
          </h2>
          <p className="text-[#888] mb-8 max-w-md mx-auto">
            Join the movement. Free forever. No card needed.
          </p>
          <button
            className="px-12 py-4 rounded-xl font-heading font-bold text-lg uppercase tracking-wider text-white transition-all active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, #FF5500 0%, #CC4400 100%)',
              boxShadow: '0 0 30px rgba(255,85,0,0.4), 0 0 80px rgba(255,85,0,0.15)',
            }}
            onClick={goSignUp}
          >
            START NOW — IT'S FREE
          </button>
        </div>
      </section>

      {/* ━━━ Footer ━━━ */}
      <LandingFooter />
    </div>
  );
}
