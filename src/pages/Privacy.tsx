import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { LandingFooter } from '@/components/landing/LandingFooter';
import trademarkBadge from '@/assets/trademark-badge.png';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

export default function Privacy() {
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
              PRIVACY POLICY
            </h1>
            <p className="text-muted-foreground mb-10">
              Last updated: May 2026
            </p>
          </motion.div>

          <div className="prose prose-invert max-w-none space-y-8 text-foreground/90">
            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                1. WHO WE ARE
              </h2>
              <p className="leading-relaxed">
                Unbreakable is operated by <strong>Live Without Limits LTD</strong>, registered in England
                &amp; Wales. When we say "we", "our", or "Unbreakable" in this policy, we mean Live Without Limits LTD.
              </p>
              <p className="leading-relaxed">
                Contact: <a href="mailto:unbreakable.lwl@gmail.com" className="text-primary hover:underline">unbreakable.lwl@gmail.com</a>
              </p>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                2. WHAT WE COLLECT
              </h2>
              <p className="leading-relaxed mb-3">We collect information you give us directly:</p>
              <ul className="list-disc list-inside space-y-1 text-foreground/80">
                <li>Account details — name, email address, password (hashed)</li>
                <li>Profile information — age, fitness goals, experience level</li>
                <li>Training &amp; nutrition data — logs, programmes, meal entries you create</li>
                <li>University progress — course enrolment, quiz scores, assessment results</li>
                <li>Payment information — processed securely by Stripe; we never store card details</li>
                <li>Messages — coaching messages and in-app communications</li>
              </ul>
              <p className="leading-relaxed mt-3">We also collect automatically:</p>
              <ul className="list-disc list-inside space-y-1 text-foreground/80">
                <li>Device and browser information</li>
                <li>Usage data — pages visited, features used, session duration</li>
                <li>IP address and approximate location</li>
              </ul>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                3. HOW WE USE IT
              </h2>
              <ul className="list-disc list-inside space-y-1 text-foreground/80">
                <li>To provide and personalise your Unbreakable experience</li>
                <li>To track your training, nutrition, and university progress</li>
                <li>To process payments and manage subscriptions</li>
                <li>To send account-related communications (password resets, billing)</li>
                <li>To improve our platform based on usage patterns</li>
                <li>To match you with coaches and deliver coaching services</li>
              </ul>
              <p className="leading-relaxed mt-3">
                We will <strong>never</strong> sell your personal data to third parties.
              </p>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                4. DATA STORAGE &amp; SECURITY
              </h2>
              <p className="leading-relaxed">
                Your data is stored securely using <strong>Supabase</strong> (cloud-hosted PostgreSQL with
                row-level security). Passwords are hashed using industry-standard algorithms. Payment
                processing is handled entirely by <strong>Stripe</strong>, which is PCI-DSS compliant.
              </p>
              <p className="leading-relaxed mt-3">
                We use HTTPS encryption for all data in transit and follow security best practices
                for data at rest.
              </p>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                5. THIRD-PARTY SERVICES
              </h2>
              <p className="leading-relaxed mb-3">We use the following third-party services:</p>
              <ul className="list-disc list-inside space-y-1 text-foreground/80">
                <li><strong>Supabase</strong> — authentication, database, and file storage</li>
                <li><strong>Stripe</strong> — payment processing</li>
                <li><strong>Vercel / hosting provider</strong> — application hosting</li>
              </ul>
              <p className="leading-relaxed mt-3">
                Each of these services has their own privacy policies. We only share the minimum data
                necessary for them to provide their service.
              </p>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                6. YOUR RIGHTS
              </h2>
              <p className="leading-relaxed mb-3">
                Under UK GDPR, you have the right to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-foreground/80">
                <li><strong>Access</strong> — request a copy of your personal data</li>
                <li><strong>Rectification</strong> — correct inaccurate data</li>
                <li><strong>Erasure</strong> — request deletion of your data</li>
                <li><strong>Portability</strong> — receive your data in a portable format</li>
                <li><strong>Object</strong> — object to processing of your data</li>
                <li><strong>Restrict</strong> — request we limit how we use your data</li>
              </ul>
              <p className="leading-relaxed mt-3">
                To exercise any of these rights, email us at{' '}
                <a href="mailto:unbreakable.lwl@gmail.com" className="text-primary hover:underline">
                  unbreakable.lwl@gmail.com
                </a>.
                We will respond within 30 days.
              </p>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                7. COOKIES
              </h2>
              <p className="leading-relaxed">
                We use essential cookies to keep you signed in and remember your preferences.
                We do not use advertising or tracking cookies. Analytics cookies (if any) are
                anonymised and used solely to improve the platform.
              </p>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                8. DATA RETENTION
              </h2>
              <p className="leading-relaxed">
                We keep your data for as long as your account is active. If you delete your account,
                we will remove your personal data within 30 days, except where we are required by law
                to retain it (e.g., financial records for HMRC).
              </p>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                9. CHILDREN
              </h2>
              <p className="leading-relaxed">
                Unbreakable is not intended for children under 16. We do not knowingly collect data
                from anyone under 16. If you believe a child has provided us with personal data,
                please contact us and we will delete it.
              </p>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                10. CHANGES TO THIS POLICY
              </h2>
              <p className="leading-relaxed">
                We may update this policy from time to time. We will notify you of significant changes
                via email or in-app notification. The "Last updated" date at the top will always reflect
                the most recent version.
              </p>
            </motion.section>

            <motion.section {...fadeUp}>
              <h2 className="font-display text-xl text-primary/90 tracking-wide mb-3">
                QUESTIONS?
              </h2>
              <p className="leading-relaxed">
                If you have any questions about this privacy policy, contact us at{' '}
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
