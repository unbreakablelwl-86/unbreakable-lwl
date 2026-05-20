import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ThemedLogo } from '@/components/ThemedLogo';
import { Button } from '@/components/ui/button';
import { NavigationDrawer } from '@/components/NavigationDrawer';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { ThemeToggle } from '@/components/hub/ThemeToggle';
import { AuthModal } from '@/components/tracker/AuthModal';
import { Card } from '@/components/ui/card';
import {
  Dumbbell,
  Brain,
  Heart,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import founderPhoto from '@/assets/john-founder.png';
import journey2018 from '@/assets/jj-journey-2018.png';
import journey2019 from '@/assets/jj-journey-2019.png';
import journey2020 from '@/assets/jj-journey-2020.png';
import returnPhoto from '@/assets/jj-return-2025-2026.png';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const beliefs = [
  {
    title: 'Everyone deserves to understand their own body.',
    desc: 'This should be taught in schools. Your body belongs to you and so does the knowledge of how it works. Full stop.',
  },
  {
    title: 'Community beats coaching every single time.',
    desc: 'A room full of people who genuinely understand is worth more than any programme. The fitness industry forgot about connection because you can\'t put a price on it. I built a place that puts it first.',
  },
  {
    title: 'Showing up is the whole thing.',
    desc: 'Not perfectly. Not every day. Just again. One more time. That single decision, repeated across the hard days and the blank ones, is what unbreakable actually means.',
  },
  {
    title: 'Your life is yours.',
    desc: 'Not your employer\'s version of it. Not what society mapped out for you. The moment I stopped performing someone else\'s script, even when it cost me everything, was the moment things started making sense.',
  },
  {
    title: 'It\'s okay to not be okay.',
    desc: 'Mental health isn\'t a weakness and it isn\'t a brand. It\'s just real life. The more we talk about it honestly, without performing it for an audience, the less power it has over us.',
  },
  {
    title: 'Purpose keeps you here.',
    desc: 'I know what it feels like to have none. I know what it feels like to find it again. The gap between those two places is what Unbreakable was built to help people cross.',
  },
];

const chips = [
  'TRAIN HARD', 'EAT SMART', 'SLEEP WELL', 'LEARN DAILY',
  'MOVE YOUR BODY', 'PROTECT YOUR MIND', 'BUILD YOUR PEOPLE',
  'DO THE HARD THING', 'STAY HONEST', 'KEEP GOING',
];

const timeline = [
  {
    label: '2018',
    desc: 'Qualified as a Level 3 Personal Trainer. Wanted to learn how my own body actually works, not to chase an image or become a guru. The more I learned, the more I realised this information should be available to everyone.',
  },
  {
    label: '2018 – 2020',
    desc: 'Spent two years applying everything I learned to my own life. Training properly, eating with purpose, understanding the science behind it all. The transformation wasn\'t about aesthetics — it was proof that education and consistency work.',
  },
  {
    label: '2020',
    desc: 'Saw the industry for what it was. Overcomplicated programmes that kept people paying, not progressing. Information locked behind expensive packages. A model built on dependency, not empowerment. Walked away and started thinking bigger.',
  },
  {
    label: 'The Build',
    desc: 'Started building Unbreakable from scratch. Not a coaching business, not a cookie-cutter app — a genuine community built on truth, education, and the kind of honest connection the fitness industry never offered.',
  },
  {
    label: '2024',
    desc: 'Levelled up to Level 4 Strength & Conditioning. Added sport-specific science, periodisation and performance programming to the Unbreakable University. Always learning, always building.',
  },
  {
    label: '2025',
    desc: 'Diagnosed autistic and ADHD at 36. Suddenly a lot of things made sense — the way I process, the intensity, the need for structure. Stepped away from the gym. Started rebuilding from scratch.',
  },
  {
    label: 'Now',
    desc: 'Back in the gym. Back building Unbreakable. An ad-free safe space to track your progress, educate yourself, and be part of a community that actually gets it. Stronger for every setback. Still showing up.',
  },
];

const Founder = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authDefaultMode, setAuthDefaultMode] = useState<'signin' | 'signup'>('signin');

  const handleSignUp = () => {
    setAuthDefaultMode('signup');
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
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
              <Button className="font-display tracking-wide" onClick={handleSignUp}>
                START YOUR JOURNEY
              </Button>
              <NavigationDrawer />
            </div>
          </div>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="pt-[100px] pb-14 text-center px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,hsl(var(--primary)/0.08)_0%,transparent_60%)] pointer-events-none" />
        <motion.div {...fadeUp} className="max-w-lg mx-auto relative z-10">
          <span className="inline-block font-mono text-[9px] tracking-[3px] text-primary uppercase border border-border px-4 py-1.5 rounded-full mb-6">
            The Founder
          </span>
          <h1 className="font-display text-[clamp(48px,12vw,80px)] leading-[0.88] tracking-wide text-foreground mb-6">
            NOT A<br />
            <span className="text-primary neon-glow-subtle">GURU.</span><br />
            <span className="text-[clamp(28px,7vw,48px)]">JUST SOMEONE<br />WHO GETS IT.</span>
          </h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed max-w-[380px] mx-auto mb-8">
            I built Unbreakable because I needed it and it didn't exist. Not a programme, not a coaching package, not another influencer selling a transformation.{' '}
            <strong className="text-foreground">A community built on truth, education, and the kind of honest connection the fitness industry never bothered to offer.</strong>
          </p>
          <p className="font-mono text-[10px] tracking-[3px] text-primary uppercase">
            Live Without Limits · Keep Showing Up
          </p>
        </motion.div>
      </section>

      <div className="border-t border-border" />

      {/* Founder Photo */}
      <section className="py-11 flex flex-col items-center gap-5 border-b border-border">
        <motion.div {...fadeUp}>
          <div className="relative w-[150px] h-[150px]">
            <div className="absolute inset-[-4px] rounded-full animate-[spin_8s_linear_infinite] opacity-60"
              style={{ background: 'conic-gradient(hsl(var(--primary)) 0deg, transparent 180deg, hsl(var(--primary)) 360deg)' }}
            />
            <div className="absolute inset-1 rounded-full bg-card overflow-hidden">
              <img src={founderPhoto} alt="John James — Founder" className="w-full h-full object-cover" />
            </div>
          </div>
        </motion.div>
        <div className="text-center">
          <h2 className="font-display text-[32px] tracking-[3px] text-foreground">JOHN JAMES</h2>
          <p className="font-mono text-[9px] tracking-[2px] text-primary uppercase">Founder & Creator · Unbreakable LWL</p>
          <p className="font-mono text-[8px] tracking-[2px] text-muted-foreground uppercase mt-1">L4 S&C · L3 PT · Liverpool, UK</p>
        </div>
      </section>

      {/* ═══ OPENER — MY STORY ═══ */}
      <section className="py-11 px-6 border-b border-border">
        <motion.div {...fadeUp} className="max-w-lg mx-auto">
          <div className="bg-card border-l-4 border-primary rounded-r-lg p-5 mb-7 relative overflow-hidden">
            <span className="absolute top-[-10px] right-4 font-display text-[80px] text-primary/[0.08] leading-none">"</span>
            <p className="font-display text-[clamp(20px,5vw,28px)] tracking-wide leading-[1.2] text-primary relative z-10">
              "I GOT EDUCATED TO UNDERSTAND MY BODY AS THE VEHICLE IT IS."
            </p>
          </div>

          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            My name's JJ. I'm the sole founder and creator of Unbreakable — Live Without Limits. I'm based in Liverpool, and I built this whole platform from scratch because the fitness industry let me down, and I know it's let you down too.
          </p>
          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            I originally certified as a <strong className="text-foreground">Level 3 Personal Trainer back in 2018.</strong> Not because I wanted to become a PT and sell sessions. I did it because I'd started my own fitness journey and quickly realised I was training blind — no real understanding of how my body actually worked, just copying what I'd seen online and hoping for the best. That bothered me. So I went and got qualified.
          </p>
          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            What struck me most during those qualifications wasn't how complicated the science was — <strong className="text-foreground">it was how straightforward it should have been.</strong> Anatomy, nutrition, how muscles grow, how to train properly. None of it was rocket science. It was basic human knowledge about the vehicle you live in every single day. The kind of thing that should be taught in schools, not hidden behind a certificate and a price tag that most people can't afford.
          </p>
          <p className="text-muted-foreground text-[15px] leading-[1.85]">
            In September 2024 I levelled up to <strong className="text-foreground">Level 4 Strength & Conditioning</strong> — adding sport-specific training, periodisation, and performance science to what I could offer through Unbreakable. Not because I needed more letters after my name, but because I believe if you're going to educate people, <em className="text-primary not-italic">you should never stop learning yourself.</em>
          </p>
        </motion.div>
      </section>

      {/* ═══ MY JOURNEY — PHOTOS ═══ */}
      <section className="py-11 px-6 border-b border-border bg-card/30">
        <motion.div {...fadeUp} className="max-w-lg mx-auto">
          <p className="font-mono text-[9px] tracking-[3px] text-primary uppercase mb-2.5">The Journey</p>
          <h2 className="font-display text-[clamp(28px,7vw,42px)] leading-[1.05] tracking-wide text-foreground mb-5">
            2018 – 2020.{' '}
            <span className="text-primary neon-glow-subtle">EDUCATION IN ACTION.</span>
          </h2>
          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-6">
            This isn't a transformation for likes. It's what happens when you stop guessing, start understanding your body, and stay consistent. No shortcuts. No magic supplements. Just education, applied daily, over two years.
          </p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { src: journey2018, label: '2018', sub: 'Day one. No knowledge.' },
              { src: journey2019, label: '2019', sub: 'Learning & applying.' },
              { src: journey2020, label: '2020', sub: 'Education works.' },
            ].map(img => (
              <div key={img.label} className="relative">
                <div className="aspect-[3/4] rounded-lg overflow-hidden border border-border">
                  <img src={img.src} alt={`JJ journey ${img.label}`} className="w-full h-full object-cover" />
                </div>
                <div className="mt-2 text-center">
                  <p className="font-display text-sm tracking-wide text-primary">{img.label}</p>
                  <p className="text-[10px] text-muted-foreground">{img.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card border-l-4 border-primary rounded-r-lg p-5 mt-7 relative overflow-hidden">
            <span className="absolute top-[-10px] right-4 font-display text-[80px] text-primary/[0.08] leading-none">"</span>
            <p className="font-display text-[clamp(16px,4vw,22px)] tracking-wide leading-[1.2] text-primary relative z-10">
              SAME PERSON. SAME GYM. THE ONLY DIFFERENCE IS UNDERSTANDING WHAT I WAS DOING AND WHY.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ═══ THE RETURN — 2025–2026 ═══ */}
      <section className="py-11 px-6 border-b border-border">
        <motion.div {...fadeUp} className="max-w-lg mx-auto">
          <p className="font-mono text-[9px] tracking-[3px] text-primary uppercase mb-2.5">The Return</p>
          <h2 className="font-display text-[clamp(28px,7vw,42px)] leading-[1.05] tracking-wide text-foreground mb-5">
            REBUILD. WEEK{' '}
            <span className="text-primary neon-glow-subtle">BY WEEK.</span>
          </h2>
          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-6">
            In 2025, at 36, I was diagnosed autistic and ADHD. Suddenly a lifetime of feeling like I was wired differently had a name. It knocked me sideways — I stepped away from the gym, away from most things, and had to figure out how to plug back into the world on my own terms. Six months later, I walked back in. Not because I was fixed, but because <strong className="text-foreground">showing up is what I teach and it had to start with me.</strong>
          </p>

          <div className="rounded-lg overflow-hidden border border-border">
            <img src={returnPhoto} alt="JJ transformation — Nov 2025 to Apr 2026" className="w-full h-auto" />
          </div>

          <div className="flex items-center justify-between mt-3">
            <p className="font-mono text-[9px] tracking-[2px] text-muted-foreground uppercase">Nov 2025 → Apr 2026</p>
            <p className="font-display text-xs tracking-[2px] text-primary">THE REBUILD</p>
          </div>

          <div className="bg-card border-l-4 border-primary rounded-r-lg p-5 mt-7 relative overflow-hidden">
            <span className="absolute top-[-10px] right-4 font-display text-[80px] text-primary/[0.08] leading-none">"</span>
            <p className="font-display text-[clamp(16px,4vw,22px)] tracking-wide leading-[1.2] text-primary relative z-10">
              THE GYM DIDN'T FIX ANYTHING. BUT IT GAVE ME SOMEWHERE TO START.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ═══ THE REAL STORY ═══ */}
      <section className="py-11 px-6 border-b border-border bg-card/30">
        <motion.div {...fadeUp} className="max-w-lg mx-auto">
          <p className="font-mono text-[9px] tracking-[3px] text-primary uppercase mb-2.5">Being Honest</p>
          <h2 className="font-display text-[clamp(28px,7vw,42px)] leading-[1.05] tracking-wide text-foreground mb-5">
            NOT JUST <span className="text-primary neon-glow-subtle">FITNESS.</span>
          </h2>

          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            I'm not going to stand here and pretend this is just about sets and reps. Mental health has been part of my story from the start — long before I had the language for it. <strong className="text-foreground">The gym was never just exercise for me. It was the one place where the noise in my head got quieter.</strong>
          </p>
          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            Getting diagnosed autistic and ADHD in my mid-thirties was like someone finally handing me the manual to my own brain. It didn't make everything easier, but it made everything make sense. The obsessive focus, the burnout cycles, the sensory overload, the way I process the world differently to most people around me — none of that was broken. It was just undiagnosed.
          </p>
          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            I'm open about it because I think we need more people to be. Not in a performative way. Not for content. <strong className="text-foreground">Just honestly.</strong> If one person reads this and recognises something in themselves — the constant masking, the feeling of being slightly out of sync with the rest of the world — then it was worth writing.
          </p>
          <p className="text-muted-foreground text-[15px] leading-[1.85]">
            Unbreakable was always built for people who've been through something and are still standing. <em className="text-primary not-italic">That includes me.</em>
          </p>
        </motion.div>
      </section>

      {/* ═══ WHY I BUILT UNBREAKABLE ═══ */}
      <section className="py-11 px-6 border-b border-border">
        <motion.div {...fadeUp} className="max-w-lg mx-auto">
          <p className="font-mono text-[9px] tracking-[3px] text-primary uppercase mb-2.5">Why I Built This</p>
          <h2 className="font-display text-[clamp(28px,7vw,42px)] leading-[1.05] tracking-wide text-foreground mb-5">
            THE INDUSTRY <span className="text-primary neon-glow-subtle">FAILED YOU.</span>
          </h2>

          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            Somewhere along the way, fitness stopped being about what your body can do and became entirely about what it looks like. Chasing someone else's ideal, a shape, a size, a standard that was never designed with you in mind. <strong className="text-foreground">The industry built itself around that confusion deliberately, because a confused person keeps paying, and an empowered person doesn't need you anymore.</strong>
          </p>
          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            I saw it from the inside. Overcomplicated programmes that created dependency rather than capability. Information that should be freely available, locked behind expensive monthly packages. A business model that measured success by how long a client stayed reliant on you, not by how well they learned to stand on their own. I couldn't keep being part of that. So I walked away.
          </p>
          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            Here's the truth: <strong className="text-foreground">when you understand how your body actually works, you don't need a guru.</strong> You need the basics, delivered honestly, in a community that holds you to them. That information should be taught in schools. It belongs to you, not to an industry that profits from your confusion.
          </p>
          <p className="text-muted-foreground text-[15px] leading-[1.85]">
            <em className="text-primary not-italic">So I stopped coaching. And I started building the thing that should have existed all along.</em>
          </p>
        </motion.div>
      </section>

      {/* ═══ WHY NOT SOCIAL MEDIA ═══ */}
      <section className="py-11 px-6 border-b border-border bg-card/30">
        <motion.div {...fadeUp} className="max-w-lg mx-auto">
          <p className="font-mono text-[9px] tracking-[3px] text-primary uppercase mb-2.5">The Real Reason</p>
          <h2 className="font-display text-[clamp(28px,7vw,42px)] leading-[1.05] tracking-wide text-foreground mb-5">
            I BUILT AN <span className="text-primary neon-glow-subtle">AD-FREE SAFE SPACE</span>
          </h2>

          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            I personally hate social media. Honestly. The only platform I ever used was Instagram, and even that was just my own personal diary — tracking my own progress for myself. Not performing for an audience. Not chasing likes. Not comparing myself to someone else's highlight reel.
          </p>
          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            <strong className="text-foreground">That's exactly why I built Unbreakable.</strong> An ad-free, algorithm-free, pressure-free space where you can track your progress, share your journey, and be part of a real community — without anyone trying to sell you something or make you feel like you're not enough. No forced adverts. No engagement tricks. No noise.
          </p>
          <p className="text-muted-foreground text-[15px] leading-[1.85]">
            Just a place built for people who want to understand their body, stay consistent, and connect with others who are doing the same thing. <em className="text-primary not-italic">Your progress is yours. It shouldn't be content for someone else's algorithm.</em>
          </p>
        </motion.div>
      </section>

      {/* ═══ COMMUNITY & EDUCATION ═══ */}
      <section className="py-11 px-6 border-b border-border">
        <motion.div {...fadeUp} className="max-w-lg mx-auto">
          <p className="font-mono text-[9px] tracking-[3px] text-primary uppercase mb-2.5">The Foundation</p>
          <h2 className="font-display text-[clamp(26px,7vw,42px)] leading-[1.05] tracking-wide text-foreground mb-5">
            COMMUNITY AND EDUCATION FIRST. <span className="text-primary neon-glow-subtle">ALWAYS.</span>
          </h2>

          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            Unbreakable is not a coaching business with a community bolted on as an afterthought. <strong className="text-foreground">The community is the whole point, and education is the foundation it's built on.</strong> Everything else grows from that base. Not the other way around.
          </p>
          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            More and more people are exhausted by the performance of it all — the perfect transformations, the influencers who have all the answers, the constant pressure to buy the next thing. What people are actually looking for is something real. Genuine connection with other people who understand. Information that respects their intelligence. A space where showing up as you actually are is enough.
          </p>
          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-6">
            That is what Unbreakable is. A place where understanding your own body is treated as a basic right, not a premium service. Where the people around you have been through something real and stayed anyway, <em className="text-primary not-italic">because that is what community actually means.</em>
          </p>

          {/* Three Pillars */}
          <div className="flex flex-col gap-3">
            {[
              { icon: <Dumbbell className="w-5 h-5 text-primary" />, name: 'ABILITY', desc: 'To lift, move, run, push, pull, and live without fear of your body failing you. Strength that carries into real life, not just the gym.' },
              { icon: <Brain className="w-5 h-5 text-primary" />, name: 'MINDSET', desc: 'To keep going when it\'s boring, hard, or inconvenient, and to rebuild when life knocks you sideways. A mindset that doesn\'t crumble when motivation fades.' },
              { icon: <Heart className="w-5 h-5 text-primary" />, name: 'LONGEVITY', desc: 'To train for the long game. Strong joints. Capable muscles. Fitness that supports you for decades, not months. A body that lasts.' },
            ].map(p => (
              <Card key={p.name} className="bg-card border border-border p-5 flex gap-4 items-start">
                <div className="w-11 h-11 min-w-[44px] rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shadow-[0_0_16px_hsl(var(--primary)/0.25)]">
                  {p.icon}
                </div>
                <div>
                  <h3 className="font-display text-xl tracking-[2px] text-primary mb-1">{p.name}</h3>
                  <p className="text-muted-foreground text-[13px] leading-relaxed">{p.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ WHAT I BELIEVE ═══ */}
      <section className="py-11 px-6 border-b border-border bg-card/30">
        <motion.div {...fadeUp} className="max-w-lg mx-auto">
          <p className="font-mono text-[9px] tracking-[3px] text-primary uppercase mb-2.5">What I Believe</p>
          <h2 className="font-display text-[clamp(30px,7vw,44px)] leading-none tracking-wide text-foreground mb-5">
            THE <span className="text-primary neon-glow-subtle">NON-NEGOTIABLES</span>
          </h2>

          <div className="flex flex-col gap-2.5 mt-6">
            {beliefs.map((b, i) => (
              <Card key={i} className="bg-card border border-border rounded-lg p-[18px] flex gap-3.5 items-start">
                <span className="font-display text-[30px] leading-none text-primary/70 min-w-[30px]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="pt-0.5">
                  <strong className="text-foreground text-[15px] block mb-0.5">{b.title}</strong>
                  <span className="text-muted-foreground text-sm leading-relaxed">{b.desc}</span>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ WHAT SHOWING UP LOOKS LIKE ═══ */}
      <section className="py-11 px-6 border-b border-border">
        <motion.div {...fadeUp} className="max-w-lg mx-auto">
          <p className="font-mono text-[9px] tracking-[3px] text-primary uppercase mb-2.5">Daily Practice</p>
          <h2 className="font-display text-[clamp(30px,7vw,44px)] leading-none tracking-wide text-foreground mb-5">
            WHAT <span className="text-primary neon-glow-subtle">SHOWING UP</span> LOOKS LIKE
          </h2>
          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-5">
            Being Unbreakable isn't about grand gestures. It's about <strong className="text-foreground">daily choices</strong> that stack into something extraordinary.
          </p>
          <div className="flex flex-wrap gap-2">
            {chips.map(c => (
              <span key={c} className="border border-primary rounded-lg px-4 py-2.5 font-display text-sm tracking-[2px] text-primary bg-primary/10">
                {c}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ THE JOURNEY SO FAR ═══ */}
      <section className="py-11 px-6 border-b border-border bg-card/30">
        <motion.div {...fadeUp} className="max-w-lg mx-auto">
          <p className="font-mono text-[9px] tracking-[3px] text-primary uppercase mb-2.5">The Journey So Far</p>
          <h2 className="font-display text-[clamp(30px,7vw,44px)] leading-none tracking-wide text-foreground mb-6">
            HOW WE <span className="text-primary neon-glow-subtle">GOT HERE</span>
          </h2>

          <div className="relative pl-5 mt-6">
            <div className="absolute left-[15px] top-5 bottom-0 w-0.5 bg-gradient-to-b from-primary to-transparent" />

            {timeline.map((t, i) => (
              <div key={i} className="relative pl-8 pb-7">
                <div className="absolute left-[-6px] top-1.5 w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.25)]" />
                <p className="font-mono text-[8px] tracking-[2px] text-primary uppercase mb-1">{t.label}</p>
                <p className="text-muted-foreground text-[13px] leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ ORANGE BLOCK ═══ */}
      <section className="py-11 px-6 border-b border-border">
        <motion.div {...fadeUp} className="max-w-lg mx-auto">
          <div className="bg-primary rounded-xl p-7">
            <p className="font-mono text-[8px] tracking-[3px] text-primary-foreground/50 uppercase mb-2.5">From The Founder</p>
            <p className="text-primary-foreground text-[15px] leading-[1.8] font-medium">
              <strong>Unbreakable isn't perfect. It's not supposed to be.</strong> It's built by one person, for real people —
              and it will keep evolving as long as people keep showing up. That's the deal. You show up, I show up.
              Every tool, every update, every feature exists because <strong>someone in this community needed it.</strong>{' '}
              That's how we build. That's how we grow. That's how we stay Unbreakable.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-11 px-6 pb-16">
        <motion.div {...fadeUp} className="max-w-lg mx-auto">
          <Card className="bg-card border border-border rounded-xl p-9 text-center relative overflow-hidden">
            <div className="absolute bottom-[-60px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[radial-gradient(circle,hsl(var(--primary)/0.08)_0%,transparent_65%)] pointer-events-none" />

            <p className="font-mono text-[9px] tracking-[3px] text-primary uppercase mb-3.5 relative z-10">
              Your Journey Starts Here
            </p>
            <h2 className="font-display text-[clamp(30px,9vw,48px)] tracking-[2px] leading-[0.95] text-foreground mb-2 relative z-10">
              BECOME<br />
              <span className="text-primary neon-glow-subtle">UNBREAKABLE.</span><br />
              <span className="text-[clamp(22px,6vw,36px)]">LIVE WITHOUT LIMITS.</span>
            </h2>
            <p className="text-muted-foreground text-[13px] leading-relaxed max-w-[340px] mx-auto mb-7 relative z-10">
              If any part of this story resonated — if you've felt let down by the industry, overwhelmed by misinformation, or just want to understand your body without the gatekeeping — you're exactly who this is built for. Sign up, explore everything, and keep showing up.
            </p>
            <p className="text-foreground text-[13px] font-semibold mb-5 relative z-10">
              Education first. Community built on truth. No shortcuts.
            </p>
            <Button
              size="lg"
              className="w-full font-display text-[13px] tracking-wider py-5 relative z-10"
              onClick={handleSignUp}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              JOIN THE COMMUNITY
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </motion.div>
      </section>

      <UnifiedFooter />

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultMode={authDefaultMode} />
    </div>
  );
};

export default Founder;
