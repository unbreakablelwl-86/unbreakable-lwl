import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Sparkles,
  Shield,
  Users,
  CreditCard,
  Dumbbell,
  Brain,
  Flame,
  FileText,
  Mail,
  ExternalLink,
  Instagram,
  ArrowRight,
  Activity,
  GraduationCap,
  Smartphone,
  Lock,
  Heart,
  Target,
  Zap,
  MessageCircle,
} from 'lucide-react';
const founderPhoto = 'https://vlwcoqilwyfcrsxodtdx.supabase.co/storage/v1/object/public/site-assets/misc/john-founder.webp';

/* ─── FAQ Data ─── */
interface FAQItem {
  q: string;
  a: string;
}

const FAQ_SECTIONS: { title: string; icon: typeof Shield; items: FAQItem[] }[] = [
  {
    title: 'Getting Started',
    icon: Shield,
    items: [
      {
        q: 'What is UNBREAKABLE?',
        a: 'UNBREAKABLE is an all-in-one fitness platform built by Live Without Limits LTD. It combines training programmes, nutrition tracking, movement logging, mindset tools, and the Unbreakable Coach — all in one place. Our mission: help you build a body and mind that cannot be broken.',
      },
      {
        q: 'Is UNBREAKABLE free to use?',
        a: 'Yes! The free tier gives you access to training tools, the community feed, habit tracking, and limited Unbreakable Coach interactions. Upgrade to Pro for full coaching tokens, bespoke programme generation, 1-2-1 coaching, and premium content.',
      },
      {
        q: 'How do I set up my profile?',
        a: 'When you first sign up, the onboarding flow collects your goals, experience level, and body stats. You can update these any time from your Profile page. The more info you give, the better your Unbreakable Coach-generated programmes will be.',
      },
      {
        q: 'What devices does UNBREAKABLE work on?',
        a: 'UNBREAKABLE is a progressive web app (PWA). It works on any device with a browser — iPhone, Android, tablet, desktop. Add it to your home screen for the full native-like app experience with offline support.',
      },
      {
        q: 'How do I add UNBREAKABLE to my home screen?',
        a: 'On Android: open the app in Chrome, tap the three-dot menu → "Add to Home Screen". On iPhone: open in Safari, tap the share icon → "Add to Home Screen". You\'ll get an app icon that launches full-screen.',
      },
      {
        q: 'Do I need to create an account?',
        a: 'You can browse as a guest, but to unlock tracking, programmes, the community feed, and Unbreakable Coach you\'ll need a free account. Sign up takes 30 seconds.',
      },
    ],
  },
  {
    title: 'Training & Power',
    icon: Dumbbell,
    items: [
      {
        q: 'How does the Unbreakable Builder work?',
        a: 'Tap "Auto Builder" in the Power section. The Unbreakable Coach pulls your saved profile data (goals, level, availability) and asks for anything missing. It then builds a fully periodised programme tailored to you — review it, confirm, and it saves straight to your profile.',
      },
      {
        q: 'Can I build my own programme manually?',
        a: 'Absolutely. Choose "Manual Builder" to create your own programme from scratch using our full exercise library of 800+ exercises with detailed breakdowns.',
      },
      {
        q: 'What exercises are in the library?',
        a: 'We have 800+ exercises covering every muscle group, movement pattern, and equipment type. Each exercise includes proper form descriptions, target muscles, difficulty ratings, and images. Every description is written to UNBREAKABLE standards.',
      },
      {
        q: 'Can I track my workouts and progress?',
        a: 'Yes — the Tracker section lets you log every set, rep, and weight. View your workout history, personal bests, and progression over time. The Unbreakable Coach can also analyse your training data to suggest adjustments.',
      },
      {
        q: 'What\'s the difference between Power and Movement?',
        a: 'Power covers strength training — programmes, exercises, the workout tracker. Movement covers cardio — running, walking, cycling, HIIT. The cardio tracker includes GPS tracking, voice coaching, and Strava-style stats.',
      },
    ],
  },
  {
    title: 'Movement & Cardio',
    icon: Activity,
    items: [
      {
        q: 'How does the cardio tracker work?',
        a: 'Start a cardio session from the Movement tab. The tracker uses your phone\'s GPS for distance, pace, and route mapping. You get real-time voice updates at each kilometre and a full summary when you finish.',
      },
      {
        q: 'Does it work with Strava?',
        a: 'The Movement section is built as a standalone Strava-style tracker within UNBREAKABLE. Your runs, walks, and sessions are tracked and stored directly in the app.',
      },
      {
        q: 'Can I use voice coaching during cardio?',
        a: 'Yes! Toggle voice on during any cardio session. You\'ll get spoken updates on distance, pace, and time. The voice works even when your screen is off.',
      },
    ],
  },
  {
    title: 'Nutrition & Fuel',
    icon: Flame,
    items: [
      {
        q: 'How does meal tracking work?',
        a: 'Log your meals in the Fuel section. Search foods from our database, log portions, and track your daily macros and calories. The Unbreakable Coach can also generate a personalised meal plan based on your goals.',
      },
      {
        q: 'Can the Unbreakable Coach create a meal plan for me?',
        a: 'Yes — the Unbreakable Coach can build a bespoke meal plan based on your goals, dietary preferences, allergies, and calorie targets. Just ask in the Coach chat.',
      },
      {
        q: 'What about recipes?',
        a: 'The Fuel section includes recipe suggestions that match your nutritional goals. The Unbreakable Coach can generate custom recipes on demand, complete with ingredients and macros.',
      },
      {
        q: 'How does the water tracker work?',
        a: 'Track your daily hydration by tapping glasses in the Mindset habits tab. Your goal is 8 glasses per day. Each glass fills up as you tap it — hit all 8 to complete your hydration habit.',
      },
    ],
  },
  {
    title: 'Mindset & Habits',
    icon: Brain,
    items: [
      {
        q: 'What mindset tools are available?',
        a: 'The Mindset section includes voice-guided breathing exercises (Box Breathing, 4-7-8, Tactical Calm, Unbreakable Breathwork), cold and heat exposure protocols with guided timers, focus games with global leaderboards, daily habit tracking, and journaling.',
      },
      {
        q: 'How does the Daily 7 habit tracker work?',
        a: 'Track 7 daily habits: Train, Learn, Hydrate (8 glasses), Hit Your Numbers, Breathwork, Sauna, and Cold Shower. Toggle each one as you complete it. Your progress shows as a percentage bar — aim for 7/7 every day.',
      },
      {
        q: 'What are the breathing exercises?',
        a: 'We offer multiple guided breathing protocols: Box Breathing (Navy SEAL technique), 4-7-8 (sleep and calm), Tactical Calm (stress response), and deep breathing variations. Each comes with voice guidance and visual timers.',
      },
      {
        q: 'How do the cold/heat exposure protocols work?',
        a: 'Choose from cold showers, ice baths, or sauna protocols. Each has a guided timer with progressive phases. Start easy and build your tolerance over time. Track your sessions as part of your Daily 7.',
      },
      {
        q: 'What are the focus games?',
        a: 'Reaction time tests, hand-eye coordination challenges, and memory games — all with global leaderboards so you can compete with the UNBREAKABLE community.',
      },
      {
        q: 'Where do the breathing techniques come from?',
        a: 'Our breathing and cold exposure protocols are built on widely practiced techniques from multiple disciplines — refined and delivered as the Unbreakable Breathwork Method. Everything is developed under UNBREAKABLE standards with our own approach to building mental toughness.',
      },
    ],
  },
  {
    title: 'Unbreakable Coach',
    icon: MessageCircle,
    items: [
      {
        q: 'What is the Unbreakable Coach?',
        a: 'The Unbreakable Coach is your AI-powered personal trainer, nutritionist, and mindset coach built into the app. It knows your profile, goals, and history — and gives personalised guidance across training, nutrition, and mindset.',
      },
      {
        q: 'What can I ask the Unbreakable Coach?',
        a: 'Anything fitness-related: build me a programme, create a meal plan, explain an exercise, review my progress, suggest a breathing routine, help me with motivation. It adapts to your level and goals.',
      },
      {
        q: 'How many messages do I get?',
        a: 'Free users get a limited number of Unbreakable Coach interactions per month. Pro users get a generous monthly token allocation that resets each billing cycle.',
      },
    ],
  },
  {
    title: 'Unbreakable University',
    icon: GraduationCap,
    items: [
      {
        q: 'What is Unbreakable University?',
        a: 'Unbreakable University is our education platform delivering fitness knowledge structured like an NVQ-level qualification. Courses cover anatomy, training principles, nutrition science, and coaching methodology.',
      },
      {
        q: 'Is this an official qualification?',
        a: 'No — Unbreakable University is branded under UNBREAKABLE and is NOT a legal NVQ, PT certification, or accredited qualification. It\'s designed to educate the general public with real, practical fitness knowledge.',
      },
      {
        q: 'How does it work?',
        a: 'Each course has levels, units, and chapters with quizzes and assessments. Complete a level to earn an UNBREAKABLE certificate. Work through at your own pace.',
      },
    ],
  },
  {
    title: 'Coaching & PT Hub',
    icon: Users,
    items: [
      {
        q: 'What does Pro unlock?',
        a: 'Pro gives you full Unbreakable Coach tokens, bespoke programme generation, advanced analytics, and the option for hybrid 1-2-1 human coaching with real UNBREAKABLE-verified coaches.',
      },
      {
        q: 'How does 1-2-1 coaching work?',
        a: 'Browse coaches on the Coaches page. Each coach sets their own prices and check-in frequency (weekly, bi-weekly, monthly). They build custom programme blocks, review your form via video, and track your progress through the platform.',
      },
      {
        q: 'Are coaches employed by UNBREAKABLE?',
        a: 'No — coaches on our platform are self-employed professionals. They set their own prices and manage their own client relationships. UNBREAKABLE provides the platform and tools.',
      },
      {
        q: 'Can I become a coach on UNBREAKABLE?',
        a: 'Yes — if you\'re a qualified fitness professional, you can apply to join as a coach. You\'ll get your own profile, programme builder, client management tools, and the Coach Command Centre.',
      },
    ],
  },
  {
    title: 'Billing & Account',
    icon: CreditCard,
    items: [
      {
        q: 'How do I upgrade to Pro?',
        a: 'Go to your Profile → Settings → Subscription, or tap the upgrade prompt anywhere in the app. Payment is handled securely through Stripe.',
      },
      {
        q: 'Can I cancel my subscription?',
        a: 'Yes, you can cancel any time from your subscription settings. You\'ll keep Pro access until the end of your current billing period.',
      },
      {
        q: 'How do AI tokens work?',
        a: 'Tokens are used each time you interact with the Unbreakable Coach. Free users get a starter allocation. Pro users get a generous monthly allocation that resets with each billing cycle.',
      },
      {
        q: 'Is my payment information secure?',
        a: 'All payments are processed through Stripe, a PCI-compliant payment processor. We never store your card details on our servers.',
      },
    ],
  },
  {
    title: 'Privacy & Security',
    icon: Lock,
    items: [
      {
        q: 'How is my data protected?',
        a: 'Your data is stored securely using Supabase (built on PostgreSQL) with row-level security. We follow GDPR principles and never sell your personal data to third parties.',
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes — you can request full account deletion from your Profile settings. All your data, including workout history, will be permanently removed.',
      },
      {
        q: 'Who can see my posts on the social feed?',
        a: 'Your posts on the community feed are visible to all UNBREAKABLE members. Your training data, habits, and journal entries are private to your account only.',
      },
    ],
  },
];

/* ─── Accordion Item ─── */
function AccordionItem({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 px-4 text-left group"
      >
        <span className={`text-sm font-display tracking-wide pr-4 transition-colors ${open ? 'text-primary' : 'text-foreground group-hover:text-muted-foreground'}`}>
          {item.q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className={`w-4 h-4 transition-colors ${open ? 'text-primary' : 'text-muted-foreground'}`} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted-foreground leading-relaxed px-4 pb-4">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Page ─── */
export default function FAQ() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-24" >
      {/* Hero */}
      <div className="relative px-4 pt-6 pb-5 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,85,0,0.08), transparent 70%)' }}
        />
        <div className="relative z-10">
          <h1 className="font-display text-2xl tracking-wider text-center">
            <span className="text-primary" style={{ textShadow: '0 0 20px rgba(255,85,0,0.4)' }}>UNBREAKABLE</span>
            <span className="text-foreground"> FAQ</span>
          </h1>
          <p className="text-center text-muted-foreground text-sm font-display tracking-wide mt-2">
            Everything you need to know
          </p>
        </div>
      </div>

      <div className="px-4 max-w-2xl mx-auto space-y-5">
        {/* Unbreakable Coach CTA */}
        <button
          onClick={() => navigate('/help')}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-primary/30" style={{ background: 'rgba(255,85,0,0.1)' }}>
            <Sparkles className="w-5 h-5 text-primary" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.6))' }} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-display text-sm text-foreground tracking-wide">NEED HELP?</h4>
            <p className="text-muted-foreground text-xs mt-0.5">Chat with your Unbreakable Coach for instant answers</p>
          </div>
          <ArrowRight className="w-4 h-4 text-primary" />
        </button>

        {/* FAQ Sections */}
        {FAQ_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <Icon className="w-4 h-4 text-primary" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />
                <span className="text-xs font-display tracking-wider text-muted-foreground">{section.title.toUpperCase()}</span>
              </div>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                {section.items.map((item, i) => (
                  <AccordionItem key={i} item={item} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Meet the Founder */}
        <div>
          <div className="flex items-center gap-2 mb-2 px-1">
            <Heart className="w-4 h-4 text-primary" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />
            <span className="text-xs font-display tracking-wider text-muted-foreground">THE FOUNDER</span>
          </div>
          <button
            onClick={() => navigate('/founder')}
            className="w-full rounded-xl border border-border bg-card p-5 text-left hover:border-border transition-all"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-primary/20">
                <img loading="lazy" src={founderPhoto} alt="John James — Founder" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-display text-base text-foreground tracking-wide">JOHN JAMES</p>
                <p className="text-primary text-xs font-display tracking-wider mt-0.5">FOUNDER & CEO</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Liverpool-born fitness entrepreneur. Founded Live Without Limits LTD to prove that anyone can build an unbreakable body and mind. Keep showing up.
            </p>
            <p className="text-xs text-primary font-display tracking-wider mt-3">TAP TO READ THE FULL STORY →</p>
          </button>
        </div>

        {/* Legal Links */}
        <div>
          <div className="flex items-center gap-2 mb-2 px-1">
            <FileText className="w-4 h-4 text-primary" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />
            <span className="text-xs font-display tracking-wider text-muted-foreground">LEGAL</span>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {[
              { label: 'Terms of Service', desc: 'Our terms for using the UNBREAKABLE platform', path: '/terms' },
              { label: 'Privacy Policy', desc: 'How we handle and protect your data', path: '/privacy' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center justify-between p-4 border-b border-border/50 last:border-0 text-left hover:bg-card transition-all"
              >
                <div>
                  <p className="text-sm font-display text-foreground tracking-wide">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <div className="flex items-center gap-2 mb-2 px-1">
            <Mail className="w-4 h-4 text-primary" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />
            <span className="text-xs font-display tracking-wider text-muted-foreground">CONTACT US</span>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <p className="text-sm text-muted-foreground">Live Without Limits LTD — Liverpool, UK</p>
            <div className="space-y-2">
              <a href="mailto:unbreakable.lwl@gmail.com" className="flex items-center gap-2 text-sm text-primary hover:underline">
                <Mail className="w-4 h-4" /> unbreakable.lwl@gmail.com
              </a>
              <a href="https://instagram.com/unbreakable.lwl" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                <Instagram className="w-4 h-4" /> @unbreakable.lwl
              </a>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <button
          onClick={() => navigate('/help')}
          className="w-full py-3.5 rounded-xl bg-primary text-black font-display tracking-wider text-sm hover:bg-primary/90 transition-all"
          style={{ boxShadow: '0 0 20px rgba(255,85,0,0.3)' }}
        >
          CHAT WITH UNBREAKABLE COACH
        </button>
      </div>
    </div>
  );
}
