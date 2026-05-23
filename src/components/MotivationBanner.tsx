import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, X } from 'lucide-react';

const MOTIVATION_QUOTES = [
  "🦍 Somewhere out there, the old you is watching from the sofa — make them jealous.",
  "🔥 Your alarm went off and you chose war instead of snooze — that's a different breed.",
  "⚡ Gravity just filed a complaint about you — keep lifting, let it cry.",
  "🧠 The battle between your ears is the hardest fight — and you're winning it.",
  "🏴 Nobody's coming to save you, and that's the best news you'll hear all day.",
  "💪 Pain is just weakness leaving the body. Let it go.",
  "🦁 Be the person your dog thinks you are — relentless and loyal.",
  "🔥 You didn't come this far to only come this far.",
  "⚡ Discipline is doing what needs to be done, even when you don't feel like it.",
  "🧠 Your body can stand almost anything. It's your mind you have to convince.",
  "💀 Comfort zones are where dreams go to die. Step out.",
  "🏋️ The iron never lies. What you put in is what you get out.",
  "🔥 Show up. Every. Single. Day. That's the secret nobody tells you.",
  "⚡ Champions don't show up to get everything they want; they show up to give everything they have.",
  "🦍 You vs You. The only competition that matters.",
  "💪 Suffer the pain of discipline or suffer the pain of regret. Choose wisely.",
  "🔥 Every rep counts. Every meal counts. Every second counts.",
  "🧠 Mental toughness isn't born — it's built. Rep by rep. Day by day.",
  "⚡ The best time to start was yesterday. The second best time is right now.",
  "🏴 Stop waiting for motivation. Motivation follows action.",
  "💪 They laughed at your goals. They won't laugh at your results.",
  "🔥 Consistency beats intensity. Show up and do the work.",
  "🦁 Be so good they can't ignore you.",
  "⚡ You don't have to be extreme, just consistent.",
  "🧠 Progress, not perfection. Keep moving forward.",
  "💀 Your excuses are getting old. Your results won't wait forever.",
  "🏋️ One more rep. One more step. One more day. That's how legends are made.",
  "🔥 The pain you feel today will be the strength you feel tomorrow.",
  "⚡ Dream big. Start small. Act now.",
  "🦍 You're not tired. You're uninspired. Find your fire.",
  "💪 Small daily improvements over time lead to stunning results.",
  "🔥 Don't count the days. Make the days count.",
  "🧠 It's not about having time. It's about making time.",
  "⚡ Success isn't owned — it's leased. And rent is due every single day.",
  "🏴 Fall seven times. Stand up eight. That's UNBREAKABLE.",
  "💪 What feels impossible today will one day be your warm-up.",
  "🔥 When you want to quit, remember why you started.",
  "🦁 Stay hungry. Stay foolish. Stay UNBREAKABLE.",
  "⚡ The only bad workout is the one that didn't happen.",
  "🧠 Your potential is endless. Go do what you were created to do.",
  "💀 Excuses don't burn calories. Get up and get after it.",
  "🏋️ Sweat is just fat crying. Make it weep.",
  "🔥 Be stronger than your strongest excuse.",
  "⚡ Work in silence. Let your body do the talking.",
  "🦍 Wake up with determination. Go to bed with satisfaction.",
  "💪 You're one workout away from a good mood. Always.",
  "🔥 Don't wish for it. Work for it.",
  "🧠 The mind gives up before the body does. Push through.",
  "⚡ Live Without Limits. Keep Showing Up. #UNBREAKABLE",
  "🏴 Today is the day the old you dies. The new you is UNBREAKABLE.",
];

export function MotivationBanner() {
  const [visible, setVisible] = useState(true);
  const [quoteIndex, setQuoteIndex] = useState(() =>
    Math.floor(Math.random() * MOTIVATION_QUOTES.length)
  );

  // Cycle quotes on page refresh (random start) and auto-scroll every 8s
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATION_QUOTES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const dismiss = useCallback(() => setVisible(false), []);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={quoteIndex}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="relative mx-3 mt-2 mb-1 rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,85,0,0.12) 0%, rgba(255,85,0,0.04) 100%)',
          border: '1px solid rgba(255,85,0,0.15)',
        }}
      >
        <div className="flex items-start gap-3 px-4 py-3">
          <div
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
            style={{ background: 'rgba(255,85,0,0.15)' }}
          >
            <Flame className="w-4 h-4 text-[#FF5500]" />
          </div>
          <motion.p
            key={quoteIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-[13px] text-[#ccc] leading-relaxed font-medium"
          >
            {MOTIVATION_QUOTES[quoteIndex]}
          </motion.p>
          <button
            onClick={dismiss}
            className="flex-shrink-0 p-1 rounded-full hover:bg-white/5 transition-colors"
          >
            <X size={14} className="text-[#555]" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
