import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Music, Shield, DollarSign, AlertTriangle, Scale } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const sections = [
  {
    icon: Music,
    title: '1. Overview',
    content: `Un-Tunes is the music and podcast platform built into the Unbreakable app, operated by Live Without Limits LTD ("we", "us", "Unbreakable"). By using Un-Tunes as a listener or artist, you agree to these terms.`,
  },
  {
    icon: Shield,
    title: '2. Artist Accounts',
    content: `Artists must pay a one-time sign-up fee of 50 tokens to upload content to Un-Tunes. By signing up, you confirm that:
• You are at least 18 years old
• You own or have the rights to distribute all content you upload
• Your content does not infringe any third-party copyrights, trademarks, or other rights
• Your content does not contain hate speech, illegal material, or explicit content without appropriate labelling

We reserve the right to remove content or suspend artist accounts that violate these terms.`,
  },
  {
    icon: DollarSign,
    title: '3. Revenue & Payments',
    content: `Un-Tunes operates an 80/20 revenue split on all track and album sales:
• 80% goes to the artist
• 20% is retained by Unbreakable (platform fee)

Payouts are processed monthly via Stripe for earnings above £10. Earnings below the threshold roll over to the next month.

The 50-token artist sign-up is a one-time fee separate from any revenue earned. It covers lifetime platform access, unlimited uploads, analytics, and promotional features.`,
  },
  {
    icon: FileText,
    title: '4. Content Ownership & Licensing',
    content: `You retain full ownership of all content you upload to Un-Tunes. By uploading, you grant Unbreakable a non-exclusive, worldwide licence to:
• Host, stream, and distribute your content within the Unbreakable platform
• Display your artist name, artwork, and metadata for promotional purposes
• Include your tracks in platform-curated playlists

This licence ends when you remove the content or close your artist account. We do not claim ownership of your music.`,
  },
  {
    icon: Scale,
    title: '5. Listener Terms',
    content: `Free tracks are available to all Unbreakable app users. Purchased tracks are for personal, non-commercial use only. You may not:
• Redistribute, resell, or publicly perform purchased content
• Rip, download, or extract audio from the streaming player
• Use any content for commercial purposes without the artist's written permission

Streaming is subject to fair use. Automated or bot-driven plays will be detected and may result in account suspension.`,
  },
  {
    icon: AlertTriangle,
    title: '6. Prohibited Content',
    content: `The following content is not permitted on Un-Tunes:
• Music or podcasts that promote violence, hatred, or discrimination
• Content that infringes copyright or intellectual property rights
• AI-generated music presented as human-performed without disclosure
• Spam, duplicate uploads, or misleading metadata
• Explicit sexual content

Violations may result in content removal, account suspension, or permanent ban.`,
  },
  {
    icon: Shield,
    title: '7. Disputes & Takedowns',
    content: `If you believe content on Un-Tunes infringes your rights, contact us at unbreakable.lwl@gmail.com with:
• Your name and contact details
• Description of the copyrighted work
• Link to the infringing content
• A statement that you have a good-faith belief the use is unauthorised

We will investigate and respond within 14 business days.`,
  },
  {
    icon: FileText,
    title: '8. Changes to Terms',
    content: `We may update these terms from time to time. Artists will be notified of material changes via email. Continued use of Un-Tunes after changes constitutes acceptance.`,
  },
  {
    icon: Scale,
    title: '9. Governing Law',
    content: `These terms are governed by the laws of England and Wales. Any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.

Live Without Limits LTD, Liverpool, United Kingdom.`,
  },
];

export default function UnTunesTerms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-lg tracking-wider text-foreground">UN-TUNES TERMS</h1>
            <p className="text-[10px] text-muted-foreground font-display tracking-wider">TERMS & CONDITIONS</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4 max-w-2xl mx-auto">
        <motion.div {...fadeIn} className="text-center mb-6">
          <p className="text-xs text-muted-foreground">Last updated: May 2026</p>
        </motion.div>

        {sections.map((section, i) => (
          <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.05 }}>
            <Card className="p-4 border-border/30 bg-card/50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <section.icon className="w-4 h-4 text-primary drop-shadow-[0_0_4px_rgba(255,85,0,0.4)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-sm tracking-wider text-foreground mb-2">{section.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
