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
} from 'lucide-react';
import shieldLogo from '@/assets/unbreakable-shield.png';

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
        a: 'UNBREAKABLE is an all-in-one fitness platform built by Live Without Limits LTD. It combines training programmes, nutrition tracking, movement logging, mindset tools, and Unbreakable Coaching — all in one place. Our mission: help you build a body and mind that cannot be broken.',
      },
      {
        q: 'Is UNBREAKABLE free to use?',
        a: 'Yes! The free tier gives you access to basic training tools, the community feed, habit tracking, and limited Unbreakable Coaching. Upgrade to Pro for full AI tokens, bespoke programme generation, 1-2-1 coaching options, and premium content.',
      },
      {
        q: 'How do I set up my profile?',
        a: 'When you first sign up, the onboarding flow collects your goals, experience level, and body stats. You can update these any time from your Profile page. The more info you give us, the better your Unbreakable-generated programmes will be.',
      },
      {
        q: 'What devices does UNBREAKABLE work on?',
        a: 'UNBREAKABLE is a progressive web app (PWA). It works on any device with a browser — iPhone, Android, tablet, desktop. Add it to your home screen for the full app experience.',
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
        a: 'We have 800+ exercises covering every muscle group, with proper form descriptions, target muscles, difficulty ratings, and real exercise images. Every description is written to UNBREAKABLE standards.',
      },
    ],
  },
  {
    title: 'Nutrition & Fuel',
    icon: Flame,
    items: [
      {
        q: 'How does meal tracking work?',
        a: 'Log your meals in the Fuel section. You can search foods, scan barcodes, or use the Unbreakable to generate a personalised meal plan. Track macros, calories, and water intake daily.',
      },
      {
        q: 'Can the Unbreakable create a meal plan for me?',
        a: 'Yes — the Unbreakable Coach can build a bespoke meal plan based on your goals, dietary preferences, and calorie targets. Just ask!',
      },
    ],
  },
  {
    title: 'Mindset',
    icon: Brain,
    items: [
      {
        q: 'What mindset tools are available?',
        a: 'The Mindset section includes breathing exercises, cold exposure protocols, meditation guides, journaling prompts, and mental resilience programmes — all branded to UNBREAKABLE standards.',
      },
      {
        q: 'Is this based on Wim Hof?',
        a: 'Our breathing and cold exposure protocols are built on widely practiced techniques. Everything is developed and branded under UNBREAKABLE and Live Without Limits — delivering our own approach to mental toughness.',
      },
    ],
  },
  {
    title: 'Coaching & Pro',
    icon: Users,
    items: [
      {
        q: 'What does Pro unlock?',
        a: 'Pro gives you full Unbreakable Coaching tokens, bespoke programme generation, advanced analytics, and the option for hybrid 1-2-1 human coaching with real UNBREAKABLE coaches.',
      },
      {
        q: 'How does 1-2-1 coaching work?',
        a: 'Choose your coach from the Coaches page. Coaches offer weekly, bi-weekly, or monthly check-ins via video. They build custom programme blocks, review your form, and track your progress through the platform.',
      },
      {
        q: 'What is Unbreakable University?',
        a: 'Unbreakable University is our own unofficial qualification system — branded under UNBREAKABLE, delivering NVQ-level fitness knowledge to the general public. It is NOT a legal NVQ or PT certification.',
      },
    ],
  },
  {
    title: 'Billing & Account',
    icon: CreditCard,
    items: [
      {
        q: 'How do I upgrade to Pro?',
        a: 'Go to your Profile → Settings → Subscription. You can upgrade to Pro at any time. Payment is handled securely through Stripe.',
      },
      {
        q: 'Can I cancel my subscription?',
        a: 'Yes, you can cancel any time from your subscription settings. You\'ll keep Pro access until the end of your billing period.',
      },
      {
        q: 'How do AI tokens work?',
        a: 'Free users get a limited number of Unbreakable Coaching interactions. Pro users get a generous monthly allocation. Tokens reset each billing cycle.',
      },
    ],
  },
];

/* ─── Team ─── */
const TEAM = [
  {
    name: 'John James',
    role: 'Founder & CEO',
    bio: 'Liverpool-born fitness entrepreneur. Founded Live Without Limits LTD to prove that anyone can build an unbreakable body and mind. Keep showing up.',
    avatar: '🦁',
  },
];

/* ─── Accordion Item ─── */
function AccordionItem({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.06]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 px-1 text-left transition-colors hover:text-[#FF5500]"
      >
        <span className="text-[14px] font-semibold text-white pr-4">{item.q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-[#555] flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="text-[13px] text-[#999] leading-relaxed pb-4 px-1">{item.a}</p>
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
    <div className="min-h-screen" style={{ background: '#080808' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/[0.06]" style={{ background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center justify-center gap-3 px-4 py-3 max-w-2xl mx-auto">
          <img src={shieldLogo} alt="UNBREAKABLE" className="h-7 w-7" />
          <h1 className="text-[15px] font-black uppercase tracking-[0.15em] text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Help & Support
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-28">
        {/* Unbreakable Coach CTA — top banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 mb-6 rounded-2xl overflow-hidden cursor-pointer"
          onClick={() => navigate('/help')}
          style={{
            background: 'linear-gradient(135deg, rgba(255,85,0,0.15) 0%, rgba(255,85,0,0.05) 100%)',
            border: '1px solid rgba(255,85,0,0.2)',
          }}
        >
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,85,0,0.15)' }}>
              <Sparkles className="w-6 h-6 text-[#FF5500]" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-white">Still need help?</p>
              <p className="text-[12px] text-[#888] mt-0.5">Chat with your Unbreakable Coach for instant answers</p>
            </div>
            <ExternalLink size={16} className="text-[#FF5500]" />
          </div>
        </motion.div>

        {/* FAQ Sections */}
        {FAQ_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="mb-8">
              <div className="flex items-center gap-2.5 mb-3">
                <Icon size={16} className="text-[#FF5500]" />
                <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#FF5500]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  {section.title}
                </h2>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="px-4">
                  {section.items.map((item, i) => (
                    <AccordionItem key={i} item={item} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* Meet the Team */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-3">
            <Users size={16} className="text-[#FF5500]" />
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#FF5500]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Meet the Founder
            </h2>
          </div>
          {TEAM.map((member) => (
            <div
              key={member.name}
              className="rounded-xl p-5"
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl" style={{ background: 'rgba(255,85,0,0.1)' }}>
                  {member.avatar}
                </div>
                <div>
                  <p className="text-[15px] font-bold text-white">{member.name}</p>
                  <p className="text-[12px] text-[#FF5500] font-semibold uppercase tracking-wider">{member.role}</p>
                </div>
              </div>
              <p className="text-[13px] text-[#999] leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>

        {/* Terms & Legal */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-3">
            <FileText size={16} className="text-[#FF5500]" />
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#FF5500]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Legal
            </h2>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="px-4">
              {[
                { label: 'Terms of Service', desc: 'Our terms for using the UNBREAKABLE platform' },
                { label: 'Privacy Policy', desc: 'How we handle and protect your data' },
                { label: 'Cookie Policy', desc: 'Information about cookies we use' },
                { label: 'Disclaimer', desc: 'UNBREAKABLE is not a substitute for professional medical advice' },
              ].map((item, i) => (
                <div key={i} className="py-4 border-b border-white/[0.06] last:border-0">
                  <p className="text-[14px] font-semibold text-white">{item.label}</p>
                  <p className="text-[12px] text-[#666] mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-3">
            <Mail size={16} className="text-[#FF5500]" />
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#FF5500]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Contact Us
            </h2>
          </div>
          <div className="rounded-xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.04)' }}>
            <p className="text-[13px] text-[#999] leading-relaxed mb-3">
              Live Without Limits LTD — Liverpool, UK
            </p>
            <div className="space-y-2">
              <a href="mailto:unbreakable.lwl@gmail.com" className="flex items-center gap-2 text-[13px] text-[#FF5500] hover:underline">
                <Mail size={14} /> unbreakable.lwl@gmail.com
              </a>
              <a href="https://instagram.com/unbreakable.lwl" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13px] text-[#FF5500] hover:underline">
                <Instagram size={14} /> @unbreakable.lwl
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Unbreakable Coach CTA */}
        <motion.div
          className="rounded-2xl overflow-hidden cursor-pointer mb-4"
          onClick={() => navigate('/help')}
          whileTap={{ scale: 0.98 }}
          style={{
            background: 'linear-gradient(135deg, #FF5500 0%, #CC4400 100%)',
          }}
        >
          <div className="flex items-center justify-center gap-3 px-5 py-4">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-[14px] font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Chat with Unbreakable Coach
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
