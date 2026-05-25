import { useEffect, useRef, useState } from 'react';
import { Flame } from 'lucide-react';

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

/* Build a single long string with flame separators for the ticker */
const SEPARATOR = "   🔥   ";
const TICKER_TEXT = MOTIVATION_QUOTES.join(SEPARATOR);
/* Duplicate for seamless infinite scroll */
const DOUBLE_TICKER = TICKER_TEXT + SEPARATOR + TICKER_TEXT;

export function MotivationBanner() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  return (
    <div
      className="relative mx-3 mt-2 mb-1 overflow-hidden rounded-xl"
      style={{
        background: 'linear-gradient(90deg, rgba(255,85,0,0.12) 0%, rgba(255,85,0,0.03) 50%, rgba(255,85,0,0.12) 100%)',
        border: '1px solid rgba(255,85,0,0.15)',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, rgba(10,10,10,0.9), transparent)' }} />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(270deg, rgba(10,10,10,0.9), transparent)' }} />

      <div className="flex items-center py-2.5 px-2">
        {/* Fixed brand icon */}
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mr-2 z-20"
          style={{ background: 'rgba(255,85,0,0.18)', boxShadow: '0 0 10px rgba(255,85,0,0.25)' }}
        >
          <Flame className="w-3.5 h-3.5 text-primary" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.6))' }} />
        </div>

        {/* Scrolling marquee */}
        <div className="overflow-hidden flex-1">
          <div
            ref={scrollRef}
            className="whitespace-nowrap inline-block"
            style={{
              animation: `unbreakableMarquee 320s linear infinite`,
              animationPlayState: paused ? 'paused' : 'running',
            }}
          >
            <span className="text-[12px] font-display tracking-wider text-muted-foreground">
              {DOUBLE_TICKER}
            </span>
          </div>
        </div>
      </div>

      {/* Inject keyframes */}
      <style>{`
        @keyframes unbreakableMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
