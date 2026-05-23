import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Flame, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MotivationalPopupProps {
  trigger: 'sign_in' | 'session_complete' | 'habits_logged' | 'programme_complete';
  context?: string;
  open: boolean;
  onClose: () => void;
}

export function MotivationalPopup({ trigger, context, open, onClose }: MotivationalPopupProps) {
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchQuote = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-motivation', {
        body: { trigger, context },
      });
      if (error) throw error;
      setQuote(data.quote || '');
    } catch {
      const fallbacks = [
        "🦍 Somewhere out there, the old you is watching from the sofa — make them jealous. #UNBREAKABLE",
        "🔥 Your alarm went off and you chose war instead of snooze — that's a different breed. #UNBREAKABLE",
        "⚡ Gravity just filed a complaint about you — keep lifting, let it cry. #UNBREAKABLE",
        "🧠 The battle between your ears is the hardest fight — and you're winning it. #UNBREAKABLE",
        "🏴 Nobody's coming to save you, and that's the best news you'll hear all day. #UNBREAKABLE",
      ];
      setQuote(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
    } finally {
      setLoading(false);
    }
  }, [trigger, context]);

  useEffect(() => {
    if (open) fetchQuote();
  }, [open, fetchQuote]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md border-2 border-primary/40  p-0 overflow-hidden bg-[#0a0a0a] border-gray-800">
        <div className="relative p-8 text-center space-y-6">
          {/* Glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="relative w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center"
          >
            <Flame className="w-8 h-8 text-primary" />
          </motion.div>

          {loading ? (
            <div className="space-y-3 py-4">
              <div className="w-3/4 h-4 bg-muted/40 rounded animate-pulse mx-auto" />
              <div className="w-1/2 h-4 bg-muted/40 rounded animate-pulse mx-auto" />
            </div>
          ) : (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative font-display text-lg md:text-xl tracking-wide text-foreground leading-relaxed"
            >
              {quote}
            </motion.p>
          )}

          <Button
            onClick={onClose}
            className="font-display tracking-wider w-full"
            size="lg"
          >
            LET'S GO
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
