import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle, Flame } from 'lucide-react';
import { LandingFooter } from '@/components/landing/LandingFooter';
import trademarkBadge from '@/assets/trademark-badge.png';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: { category: string; items: FAQItem[] }[] = [
  {
    category: 'Getting Started',
    items: [
      {
        question: 'What is UNBREAKABLE?',
        answer:
          'UNBREAKABLE is your all-in-one fitness coaching platform. We take the knowledge behind £5,000+ personal training qualifications and make it accessible to everyone — covering Power (gym training), Fuel (nutrition), Movement (cardio & mobility), and Mindset (mental resilience).',
      },
      {
        question: 'Is UNBREAKABLE free to use?',
        answer:
          'Yes! Core features like workout tracking, nutrition tools, cardio tracking, habit tracking, calculators, 295+ recipes, and the community timeline are completely free. AI-powered features like the AI Coach, programme builds, meal plans, and Snap & Track use Unbreakable Tokens.',
      },
      {
        question: 'How do I create an account?',
        answer:
          'Tap "Get Started" on the homepage, enter your name, date of birth, email, and a password. You\'ll be guided through a quick onboarding flow to personalise your experience across Power, Fuel, Movement, and Mindset.',
      },
    ],
  },
  {
    category: 'Unbreakable Tokens',
    items: [
      {
        question: 'What are Unbreakable Tokens?',
        answer:
          'Tokens are the currency for AI-powered features. Chat with the AI Coach costs 0.2 tokens, programme builds cost 1.0 token, meal plans cost 1.0 token, and Snap & Track food scanning costs 0.5 tokens. You get tokens through our subscription plans.',
      },
      {
        question: 'What subscription plans are available?',
        answer:
          'We offer three plans: Starter (£25/month — 50 tokens), Pro (£49/month — 150 tokens), and Elite (£79/month — 500 tokens). All plans include full access to every AI feature.',
      },
      {
        question: 'Do tokens roll over?',
        answer:
          'Token balances are topped up each billing cycle. Unused tokens from the previous cycle remain in your balance — nothing is wasted.',
      },
    ],
  },
  {
    category: 'Features',
    items: [
      {
        question: 'What does the AI Coach do?',
        answer:
          'The AI Coach is your personal fitness assistant. It can build custom training programmes, create personalised meal plans, answer any fitness or nutrition question, and analyse your food with Snap & Track (just take a photo and it breaks down the macros).',
      },
      {
        question: 'What is Snap & Track?',
        answer:
          'Snap & Track lets you photograph your meals and instantly get a full macro breakdown (calories, protein, carbs, fat) for every item on your plate. Results can be logged straight to your food diary and Store Cupboard.',
      },
      {
        question: 'What is the University?',
        answer:
          'The UNBREAKABLE University offers structured courses in Power, Nutrition, and Mindset at Level 2 and Level 3 — the same content taught in professional PT qualifications. Each course has chapters, quizzes, and certificates on completion.',
      },
      {
        question: 'How do the games work?',
        answer:
          'We\'ve built fun fitness-themed games (Snake, Tetris, Alleyway) with global high-score leaderboards. They\'re free to play — a bit of fun between sets!',
      },
      {
        question: 'What recipes are available?',
        answer:
          'We have 295+ recipes across five collections: High-Protein, Low-Carb, Vegan, 5-Ingredient, and Air Fryer. All recipes include full macro breakdowns and are completely free.',
      },
    ],
  },
  {
    category: 'Community',
    items: [
      {
        question: 'How does the community timeline work?',
        answer:
          'Post updates, share progress photos and videos, and interact with other members. You can tag people with @mentions and use #hashtags. Posts can be public, friends-only, or private.',
      },
      {
        question: 'Can I make my profile private?',
        answer:
          'Yes — go to your Profile → Settings tab and toggle your profile visibility. Private profiles only show your posts to friends.',
      },
      {
        question: 'How do friends and followers work?',
        answer:
          'You can send friend requests (mutual connection) and also follow other members to see their public posts in your timeline. The Follow button appears on posts and user profiles.',
      },
    ],
  },
  {
    category: 'Account & Support',
    items: [
      {
        question: 'How do I change my password?',
        answer:
          'Go to your Profile page and scroll down to the Password section. Enter your new password and confirm to update it.',
      },
      {
        question: 'How do I update my social links?',
        answer:
          'Go to Profile → Settings → Social Links. Add your Instagram, TikTok, Twitter/X, Facebook, YouTube, or Snapchat handles and tap Save.',
      },
      {
        question: 'Who built UNBREAKABLE?',
        answer:
          'UNBREAKABLE is built by Live Without Limits LTD, founded in Liverpool, UK. Our mission is to make professional-grade fitness education affordable and accessible to everyone.',
      },
      {
        question: 'How do I get help?',
        answer:
          'You can chat with the AI Coach anytime via the Help page — it knows everything about the platform. For account issues, reach out via email at unbreakable.lwl@gmail.com.',
      },
    ],
  },
];

function FAQAccordion({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-primary/5 transition-colors"
      >
        <span className="font-semibold text-foreground pr-4">{item.question}</span>
        {open ? (
          <ChevronUp className="w-5 h-5 text-primary shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
        )}
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-5 pb-4"
        >
          <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
        </motion.div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={trademarkBadge} alt="UNBREAKABLE" className="h-8 logo-neon-glow" />
            <span className="font-display text-lg tracking-wide hidden sm:block">UNBREAKABLE</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 border-b border-border">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <motion.div {...fadeUp} className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-display tracking-wide">
              <span className="text-primary">FAQ</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about UNBREAKABLE
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <main className="flex-1 py-12">
        <div className="container mx-auto px-6 max-w-3xl space-y-10">
          {faqs.map((section, i) => (
            <motion.div
              key={section.category}
              {...fadeUp}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <h2 className="text-xl font-display tracking-wide text-primary mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5" />
                {section.category.toUpperCase()}
              </h2>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <FAQAccordion key={item.question} item={item} />
                ))}
              </div>
            </motion.div>
          ))}

          {/* Still have questions */}
          <motion.div {...fadeUp} className="text-center pt-8 border-t border-border">
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/help">
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-display tracking-wide hover:bg-primary/90 transition-colors">
                  ASK THE AI COACH
                </button>
              </Link>
              <a href="mailto:unbreakable.lwl@gmail.com">
                <button className="px-6 py-3 border border-primary/40 text-primary rounded-lg font-display tracking-wide hover:bg-primary/10 transition-colors">
                  EMAIL US
                </button>
              </a>
            </div>
          </motion.div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
