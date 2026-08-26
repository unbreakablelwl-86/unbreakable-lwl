import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { LandingFooter } from '@/components/landing/LandingFooter';
const trademarkBadge = 'https://vlwcoqilwyfcrsxodtdx.supabase.co/storage/v1/object/public/site-assets/misc/trademark-badge.webp';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img loading="lazy" src={trademarkBadge} alt="Unbreakable" className="h-8 logo-neon-glow" />
            <span className="font-display text-lg tracking-wider text-primary">
              UNBREAKABLE
            </span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="container mx-auto px-6 py-16 max-w-3xl">
          <motion.div {...fadeUp}>
            <h1 className="font-display text-4xl md:text-5xl text-primary mb-2">
              TERMS OF SERVICE
            </h1>
            <p className="text-muted-foreground mb-10">
              Last updated: August 2026
            </p>
          </motion.div>

          <div className="prose prose-invert max-w-none space-y-8 text-foreground/90">
            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                1. AGREEMENT
              </h2>
              <p className="leading-relaxed">
                By creating an account or using Unbreakable (the "Platform"), you agree to these Terms
                of Service. The Platform is operated by <strong>Live Without Limits LTD</strong>,
                registered in England &amp; Wales.
              </p>
              <p className="leading-relaxed mt-3">
                If you do not agree to these terms, please do not use the Platform.
              </p>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                2. THE PLATFORM
              </h2>
              <p className="leading-relaxed">
                Unbreakable provides fitness tools, training programming, nutrition tracking, mindset
                resources, educational courses (the "University"), and coaching services. The Platform
                is an educational and fitness-tracking tool — it is <strong>not a medical service</strong>.
              </p>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                3. ACCOUNTS
              </h2>
              <ul className="list-disc list-inside space-y-2 text-foreground/80">
                <li>You must be at least 16 years old to create an account</li>
                <li>You are responsible for maintaining the security of your account credentials</li>
                <li>One account per person — account sharing is not permitted</li>
                <li>You must provide accurate information when creating your account</li>
                <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
              </ul>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                4. SUBSCRIPTIONS &amp; PAYMENTS
              </h2>
              <p className="leading-relaxed mb-3">
                Unbreakable offers one free plan and one paid plan:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80">
                <li><strong>Free</strong> — the hub, your profile, the community feed, manual trackers, calculators and habits</li>
                <li><strong>Unbreakable (£50 per month)</strong> — everything on Free, plus 1,000 tokens each month, the
                    Unbreakable Coach, AI programmes and nutrition plans, UNBREAKABLE 86, the full exercise library,
                    Unbreakable University and UnTunes streaming</li>
              </ul>
              <p className="leading-relaxed mt-3">
                Paid subscriptions are billed via <strong>Stripe</strong> on a recurring basis (as shown
                at checkout). You can cancel anytime from your profile. Cancellation takes effect at the
                end of your current billing period — you will retain access until then.
              </p>
              <p className="leading-relaxed mt-3">
                Prices may change with reasonable notice. Any price changes will not affect your current
                billing period.
              </p>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                5. REFUNDS
              </h2>
              <p className="leading-relaxed mb-3">
                If you are a consumer in the UK you have a statutory right to cancel within 14 days of
                starting a subscription. Because Unbreakable gives you immediate access to digital content,
                by subscribing you ask us to start the service straight away — if you then cancel within
                the 14 days we may make a proportionate deduction for the period you had access.
              </p>
              <p className="leading-relaxed">
                Outside that period we consider refunds case by case. If you believe you are entitled to a refund,
                contact us at{' '}
                <a href="mailto:unbreakable.lwl@gmail.com" className="text-primary hover:underline">
                  unbreakable.lwl@gmail.com
                </a>{' '}
                within 14 days of your purchase. We are committed to being fair and reasonable.
              </p>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                6. UNIVERSITY &amp; EDUCATIONAL CONTENT
              </h2>
              <p className="leading-relaxed mb-3">
                The Unbreakable University provides educational courses in fitness, nutrition, and
                mindset. Important points:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80">
                <li>Courses are for educational purposes and personal development</li>
                <li>Completion does not constitute a formally accredited qualification</li>
                <li>Content is based on established exercise science, nutrition science, and psychology principles</li>
                <li>Content should not replace professional medical, nutritional, or psychological advice</li>
                <li>Quiz and assessment results are for your own learning — they are not certifications</li>
              </ul>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                7. COACHING SERVICES
              </h2>
              <p className="leading-relaxed">
                Coaching features connect you with fitness coaches for guidance and accountability.
                Coaches provide general fitness and wellbeing guidance — they are <strong>not medical
                professionals</strong>. Always consult a qualified healthcare provider for medical concerns.
              </p>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                8. HEALTH DISCLAIMER
              </h2>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-4">
                <p className="leading-relaxed font-medium">
                  Unbreakable is not a medical service. The information, tools, and educational content
                  provided on the Platform are for general fitness and educational purposes only. They
                  are not intended as medical advice, diagnosis, or treatment.
                </p>
                <p className="leading-relaxed mt-3">
                  Always consult a qualified healthcare professional before starting any new exercise
                  programme, nutrition plan, or if you have any health concerns. If you experience pain,
                  dizziness, or any unusual symptoms during exercise, stop immediately and seek medical
                  attention.
                </p>
              </div>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                9. THE UNBREAKABLE COACH &amp; TOKENS
              </h2>
              <p className="leading-relaxed mb-3">
                The Unbreakable Coach is an AI assistant. It produces training, nutrition and mindset
                suggestions automatically and can be wrong. It is not a personal trainer, dietitian,
                physiotherapist or medical professional, and nothing it says is medical advice. Always
                apply your own judgement and see section 8 (Health Disclaimer).
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80">
                <li>Unbreakable includes 1,000 tokens each month. Tokens are spent on AI actions such as building programmes, meal plans and coach conversations.</li>
                <li>Tokens are a licence to use features on the platform. They are not money, have no cash value, and cannot be sold, transferred or exchanged for cash.</li>
                <li>Your monthly allowance refreshes with your billing cycle. Unused monthly tokens do not roll over.</li>
                <li>We may fairly limit or slow AI usage to protect the service from abuse or runaway costs.</li>
              </ul>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                10. UNBREAKABLE 86
              </h2>
              <p className="leading-relaxed mb-3">
                UNBREAKABLE 86 is a self-directed 86-day challenge. Taking part is voluntary and entirely
                at your own risk. By starting it you accept that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80">
                <li>Your progress and streak are tracked from what you log yourself — the honesty of it is on you.</li>
                <li>Missing a required daily task resets your streak in line with the rules shown in the app at the time.</li>
                <li>Any forfeits or challenge rules are personal motivation tools. They are not enforceable debts and we do not collect money for them.</li>
                <li>You can stop at any time, and you should stop if you feel unwell or injured.</li>
              </ul>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                11. UN-TUNES
              </h2>
              <p className="leading-relaxed">
                Music streamed through UN-TUNES is licensed to you for personal, non-commercial listening
                while your account is active. You may not download, copy, redistribute or publicly perform
                it except where the platform explicitly offers that. Separate UN-TUNES terms apply to
                purchases and artist accounts and are available on the UN-TUNES terms page.
              </p>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                12. YOUR CONTENT
              </h2>
              <p className="leading-relaxed">
                You retain ownership of all content you create on the Platform (training logs, meal
                entries, notes, etc.). By using the Platform, you grant us a limited licence to store,
                display, and process your content solely for the purpose of providing the service to you.
              </p>
              <p className="leading-relaxed mt-3">
                You must not upload content that is illegal, harmful, abusive, or infringes on the
                rights of others.
              </p>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                13. INTELLECTUAL PROPERTY
              </h2>
              <p className="leading-relaxed">
                All Unbreakable branding, course content, designs, code, and educational material are
                the property of Live Without Limits LTD. You may not copy, distribute, modify, or
                create derivative works from our content without written permission.
              </p>
              <p className="leading-relaxed mt-3">
                The Unbreakable name, logo, and "Live Without Limits" are trademarks of Live Without
                Limits LTD.
              </p>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                14. ACCEPTABLE USE
              </h2>
              <p className="leading-relaxed mb-3">You agree not to:</p>
              <ul className="list-disc list-inside space-y-1 text-foreground/80">
                <li>Use the Platform for any unlawful purpose</li>
                <li>Attempt to gain unauthorised access to any part of the Platform</li>
                <li>Share your account credentials with others</li>
                <li>Scrape, copy, or republish Platform content</li>
                <li>Harass, abuse, or harm other users or coaches</li>
                <li>Use the Platform to promote competing services</li>
              </ul>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                15. LIMITATION OF LIABILITY
              </h2>
              <p className="leading-relaxed">
                To the fullest extent permitted by law, Live Without Limits LTD shall not be liable
                for any indirect, incidental, or consequential damages arising from your use of the
                Platform. Our total liability shall not exceed the amount you paid us in the 12 months
                prior to any claim.
              </p>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                16. CHANGES TO TERMS
              </h2>
              <p className="leading-relaxed">
                We may update these terms from time to time. We will notify you of material changes
                via email or in-app notification. Continued use of the Platform after changes take
                effect constitutes acceptance of the updated terms.
              </p>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                17. GOVERNING LAW
              </h2>
              <p className="leading-relaxed">
                These terms are governed by the laws of England &amp; Wales. Any disputes will be
                subject to the exclusive jurisdiction of the courts of England &amp; Wales.
              </p>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                QUESTIONS?
              </h2>
              <p className="leading-relaxed">
                If you have any questions about these terms, contact us at{' '}
                <a href="mailto:unbreakable.lwl@gmail.com" className="text-primary hover:underline">
                  unbreakable.lwl@gmail.com
                </a>.
              </p>
            </motion.section>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
