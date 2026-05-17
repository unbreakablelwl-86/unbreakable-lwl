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

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const beliefs = [
  {
    title: 'Everyone deserves to understand their own body.',
    desc: 'This should be taught in schools. It shouldn\'t cost £200 a month. Your body belongs to you and so does the knowledge of how it works. Full stop.',
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
    title: 'Mental health needs more than a hashtag.',
    desc: 'The real conversation happens when someone is brave enough to say the dark thing out loud, and someone else stays in the room. That\'s what this community is built to be.',
  },
  {
    title: 'Your life is yours.',
    desc: 'Not your employer\'s version of it. Not what society mapped out for you. The moment I stopped performing someone else\'s script, even when it cost me everything, was the moment things started making sense.',
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
    label: 'Growing Up',
    desc: 'Learning to mask. Learning to survive. Undiagnosed, navigating a world that didn\'t quite fit. Manufacturing a version of myself that could get through the day. The gym becomes the only constant that asks nothing back.',
  },
  {
    label: '2018',
    desc: 'Left a decade of guaranteed career in two weeks. Walked away from security, status, everything that looked right from the outside. Qualified as a PT because helping people felt like the first honest thing I\'d done in years.',
  },
  {
    label: '2020',
    desc: 'Saw the industry for what it was. Left. Realised the model was broken, dependency over empowerment, gatekeeping over education. Couldn\'t be part of it. Stopped forcing 1-2-1 and started thinking bigger.',
  },
  {
    label: 'The Dark Years',
    desc: 'Three years. Lowest point. Completely alone. Reached out. Got nothing back. Years going blank. The gym the only thing I kept showing up to, with no idea it was building the message that would eventually become all of this.',
  },
  {
    label: 'The Shift',
    desc: 'Diagnosis. Clarity. Decades explained. Autism and ADHD. Everything I\'d carried, the masking, the exhaustion, the relationships that never held, suddenly had context. Not broken. Different. And different became the foundation.',
  },
  {
    label: 'Now',
    desc: 'Unbreakable. Built for the people I was. Unmasking. Finding purpose. Building the community I needed and couldn\'t find. This is what Keep Showing Up was always pointing toward.',
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
          <h1 className="font-display text-[clamp(58px,14vw,96px)] leading-[0.88] tracking-wide text-foreground mb-6">
            NOT A<br />
            <span className="text-primary neon-glow-subtle">GURU.</span><br />
            JUST SOMEONE<br />
            WHO GETS IT.
          </h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed max-w-[340px] mx-auto mb-8">
            I built Unbreakable because I needed it and it didn't exist. Not a programme, not a coaching package, not another influencer selling a transformation.{' '}
            <strong className="text-foreground">
              A community built on truth, education, and the kind of honest connection that the fitness industry never bothered to offer.
            </strong>
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
        </div>
      </section>

      {/* ═══ OPENER ═══ */}
      <section className="py-11 px-6 border-b border-border">
        <motion.div {...fadeUp} className="max-w-lg mx-auto">
          <div className="bg-card border-l-4 border-primary rounded-r-lg p-5 mb-7 relative overflow-hidden">
            <span className="absolute top-[-10px] right-4 font-display text-[80px] text-primary/[0.08] leading-none">"</span>
            <p className="font-display text-[clamp(20px,5vw,28px)] tracking-wide leading-[1.2] text-primary relative z-10">
              "EVERYONE CARES UNTIL YOU ACTUALLY REACH OUT."
            </p>
          </div>

          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            I found that out the hard way. For years I heard the same conversation about mental health, the campaigns, the awareness weeks, the open doors. It all sounds right until you actually need it. Until you find the courage to say the real thing out loud, the dark thing that costs something to admit, and then you watch the people around you quietly disappear. Not because they're bad people, but because nobody actually teaches us how to sit with someone else's pain.
          </p>
          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            <strong className="text-foreground">That specific kind of loneliness, reaching out and ending up more isolated than before, is something I know deeply.</strong> And it's exactly what this community is being built to change.
          </p>
          <p className="text-muted-foreground text-[15px] leading-[1.85]">
            Not through a programme. Not through a 12-week plan. Through genuine connection with people who understand because they've actually been there. Because understanding doesn't come from a qualification. <em className="text-primary not-italic">It comes from experience, and some of us have had more of it than we ever asked for.</em>
          </p>
        </motion.div>
      </section>

      {/* ═══ WHERE IT STARTS ═══ */}
      <section className="py-11 px-6 border-b border-border">
        <motion.div {...fadeUp} className="max-w-lg mx-auto">
          <p className="font-mono text-[9px] tracking-[3px] text-primary uppercase mb-2.5">Where It Starts</p>
          <h2 className="font-display text-[clamp(28px,7vw,42px)] leading-[1.05] tracking-wide text-foreground mb-5">
            I KEPT SHOWING UP <span className="text-primary neon-glow-subtle">BEFORE I KNEW WHY</span>
          </h2>

          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            The gym was never really about aesthetics for me. It was the one place I could show up without having to explain myself, without performing a version of myself that would be accepted. No expectations, no judgement, just the honest result of whatever effort I had that day. Some days that was a lot. Some days it was almost nothing. But I kept going back regardless.
          </p>
          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            Through the worst of it, the depression, the years of isolation, the months where everything felt blank and I couldn't see a reason to push forward, <strong className="text-foreground">the gym was the one constant.</strong> I kept showing up even when I had no idea why. Looking back now I can see what I couldn't see then. That decision to show up again, repeated across years of difficult days, was quietly building something. I thought I was just surviving. It turns out I was building the foundation of everything that came next.
          </p>

          <div className="bg-card border-l-4 border-primary rounded-r-lg p-5 my-7 relative overflow-hidden">
            <span className="absolute top-[-10px] right-4 font-display text-[80px] text-primary/[0.08] leading-none">"</span>
            <p className="font-display text-[clamp(18px,5vw,26px)] tracking-wide leading-[1.2] text-primary relative z-10">
              THE GYM KEPT ME HERE LONG ENOUGH TO FIND MY ANSWERS. THAT'S NOT SOMETHING I SAY FOR DRAMATIC EFFECT. IT'S JUST THE TRUTH OF IT.
            </p>
          </div>

          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            <strong className="text-foreground">Unbreakable isn't built on perfect weeks. It's built on the decision to show up again.</strong>
          </p>
          <p className="text-muted-foreground text-[15px] leading-[1.85]">
            One session. One walk. One meal. One choice. That decision, repeated, across the hard days and the blank days and the days you have nothing left, <em className="text-primary not-italic">that's how limits disappear.</em>
          </p>
        </motion.div>
      </section>

      {/* ═══ THE HARD TRUTH ═══ */}
      <section className="py-11 px-6 border-b border-border bg-card/30">
        <motion.div {...fadeUp} className="max-w-lg mx-auto">
          <p className="font-mono text-[9px] tracking-[3px] text-primary uppercase mb-2.5">The Hard Truth</p>
          <h2 className="font-display text-[clamp(30px,7vw,44px)] leading-none tracking-wide text-foreground mb-5">
            THE INDUSTRY <span className="text-primary neon-glow-subtle">FAILED YOU.</span>
          </h2>

          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            Somewhere along the way, fitness stopped being about what your body can do and became entirely about what it looks like. Chasing someone else's ideal, a shape, a size, a standard that was never designed with you in mind. <strong className="text-foreground">The industry built itself around that confusion deliberately, because a confused person keeps paying, and an empowered person doesn't need you anymore.</strong>
          </p>
          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            I qualified as a PT in 2018 because I genuinely believed I could help people differently. And for a while I tried. But the more time I spent inside the industry, the more clearly I could see what it was actually built on. Overcomplicated programmes that created dependency rather than capability. Information that should be freely available, locked behind expensive monthly packages. A business model that measured success by how long a client stayed reliant on you, not by how well they learned to stand on their own. I couldn't keep being part of that. So I walked away and started thinking about what something honest might actually look like.
          </p>
          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            Here's the truth most people miss: <strong className="text-foreground">When you understand how your body actually works, you don't need a guru.</strong> You don't need a £200 a month coaching package. You need the basics, delivered honestly, in a community that holds you to them. That information should be free. It should be taught in schools. It belongs to you, not to an industry that profits from your confusion.
          </p>
          <p className="text-muted-foreground text-[15px] leading-[1.85]">
            <em className="text-primary not-italic">So I stopped coaching. And I started building the thing that should have existed all along.</em>
          </p>
        </motion.div>
      </section>

      {/* ═══ THE TURNING POINT ═══ */}
      <section className="py-11 px-6 border-b border-border">
        <motion.div {...fadeUp} className="max-w-lg mx-auto">
          <p className="font-mono text-[9px] tracking-[3px] text-primary uppercase mb-2.5">The Turning Point</p>
          <h2 className="font-display text-[clamp(28px,7vw,42px)] leading-[1.05] tracking-wide text-foreground mb-5">
            DECADES EXPLAINED IN <span className="text-primary neon-glow-subtle">A DIAGNOSIS.</span>
          </h2>

          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            For most of my life I felt like I was operating on a completely different frequency to the people around me. I spent years manufacturing a version of myself that could pass, could function, could get through the day without standing out too much. That kind of constant performance is exhausting in ways that are genuinely difficult to describe unless you've lived it. You don't realise how much energy it costs until you stop doing it.
          </p>
          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            Years went past in a blur. Relationships that had once felt like everything faded into silence. I reached out over the years in different directions and mostly got nothing back. Not cruelty, just absence. That quiet kind of being left to deal with it alone that nobody really prepares you for. I felt like the odd one out in every room I'd ever been in, and for a long time I had no real understanding of why, just the persistent sense that something about the way I moved through the world was different to everyone else.
          </p>
          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            At my lowest point I finally pushed through and went looking for proper help. What came back changed the entire shape of my life. <strong className="text-foreground">Autism and ADHD, a diagnosis that answered questions I'd been carrying for decades.</strong> The way my brain worked, the exhaustion behind the masking, the relationships that never quite held the way I needed them to, it all had context suddenly. I wasn't broken. I'd just spent my whole life trying to fit a mould that was never made for me. And once you understand that, different stops being a flaw and starts being a foundation.
          </p>

          <div className="bg-card border-l-4 border-primary rounded-r-lg p-5 my-7 relative overflow-hidden">
            <span className="absolute top-[-10px] right-4 font-display text-[80px] text-primary/[0.08] leading-none">"</span>
            <p className="font-display text-[clamp(18px,5vw,26px)] tracking-wide leading-[1.2] text-primary relative z-10">
              I STOPPED LIVING BY SOMEONE ELSE'S SCRIPT. EVEN WHEN IT COST ME EVERYTHING AT THE TIME, THAT WAS THE MOMENT THINGS STARTED MAKING SENSE.
            </p>
          </div>

          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            Years before the diagnosis, I'd walked away from a decade of guaranteed career in the space of two weeks. Left behind everything that looked like security and success from the outside. I understand now that was an autistic meltdown reaching a point where the mask simply couldn't hold anymore. At the time I just knew I was done. Done with performing a version of myself that didn't fit. Done with a life I'd been living for reasons that had nothing to do with who I actually was.
          </p>
          <p className="text-muted-foreground text-[15px] leading-[1.85]">
            Through all of it, the career, the isolation, the years of searching for answers, <strong className="text-foreground">the gym was the one constant that never asked me to be anything other than what I was that day.</strong> The message <em className="text-primary not-italic">Keep Showing Up</em> wasn't something I came up with for a brand. It was the thing I was already living, the quiet decision I made over and over again during years when I had very little else to hold on to. It kept me here long enough to eventually find my purpose. Now I'm building something with it.
          </p>
        </motion.div>
      </section>

      {/* ═══ COMMUNITY & EDUCATION ═══ */}
      <section className="py-11 px-6 border-b border-border bg-card/30">
        <motion.div {...fadeUp} className="max-w-lg mx-auto">
          <p className="font-mono text-[9px] tracking-[3px] text-primary uppercase mb-2.5">The Foundation</p>
          <h2 className="font-display text-[clamp(26px,7vw,42px)] leading-[1.05] tracking-wide text-foreground mb-5">
            COMMUNITY AND EDUCATION FIRST. <span className="text-primary neon-glow-subtle">ALWAYS.</span>
          </h2>

          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            Unbreakable is not a coaching business with a community bolted on as an afterthought. <strong className="text-foreground">The community is the whole point, and education is the foundation it's built on.</strong> Everything else, any programmes, any resources, anything that comes after, grows from that base. Not the other way around.
          </p>
          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            Something is shifting in the way people relate to health and fitness. More and more people are exhausted by the performance of it all, the perfect transformations, the influencers who have all the answers, the constant pressure to buy the next thing that will finally fix what's broken. What people are actually looking for, underneath all of that noise, is something real. Genuine connection with other people who understand from the inside. Information that respects their intelligence. A space where showing up as you actually are is enough.
          </p>
          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-6">
            That is what Unbreakable is being built to be. A place where understanding your own body is treated as a basic right, not a premium service. Where the conversation about mental health goes deeper than a caption. Where the people around you have been through something real and stayed anyway, <em className="text-primary not-italic">because that is what community actually means.</em>
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
      <section className="py-11 px-6 border-b border-border">
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
      <section className="py-11 px-6 border-b border-border bg-card/30">
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
      <section className="py-11 px-6 border-b border-border">
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
              <strong>Unbreakable isn't perfect. It's not supposed to be.</strong> It's built by real people, for real people —
              and it will keep evolving as long as people keep showing up. That's the deal. You show up, we show up.
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
              If any part of this story felt familiar, if you've felt let down by the industry, by the conversation around mental health, or simply by the gap between what you've been told is possible and what you've actually experienced, then you're exactly the person this community is being built for. This is about something deeper than aesthetics. It always was.
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
              START YOUR JOURNEY
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
