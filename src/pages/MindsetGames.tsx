import { useState, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gamepad2, Zap, Blocks, ChevronRight, ArrowLeft } from "lucide-react";
const SnakeGame = lazy(() => import("@/components/mindset/SnakeGame"));
const AlleywayGame = lazy(() => import("@/components/mindset/AlleywayGame"));
const TetrisGame = lazy(() => import("@/components/mindset/TetrisGame"));

type ViewState = "selection" | "snake" | "alleyway" | "tetris";

const games = [
  { id: "snake" as const, name: "FUEL", icon: Gamepad2, tagline: "Hunt. Adapt. Survive.", desc: "Split-second decisions — react too slow and it's over. Reflexes become razor-sharp." },
  { id: "alleyway" as const, name: "UNBREAKABLE", icon: Zap, tagline: "Destroy what's in your way.", desc: "Smash barriers, build momentum. Precision, timing, and relentless aggression." },
  { id: "tetris" as const, name: "LIMITLESS", icon: Blocks, tagline: "Order from chaos.", desc: "Find clarity in the chaos — stay composed when everything accelerates." },
];

const MindsetGames = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewState>("selection");

  // Game views
  const GameWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen pb-24" style={{ background: '#080808' }}>
      <div className="px-4 pt-4 mb-4">
        <button onClick={() => setView("selection")} className="flex items-center gap-1 text-gray-500 text-sm hover:text-gray-300 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>
      <div className="px-4">
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <p className="font-display text-[#FF5500] tracking-wide animate-pulse">LOADING...</p>
          </div>
        }>
          {children}
        </Suspense>
      </div>
    </div>
  );

  if (view === "snake") return <GameWrapper><SnakeGame /></GameWrapper>;
  if (view === "alleyway") return <GameWrapper><AlleywayGame /></GameWrapper>;
  if (view === "tetris") return <GameWrapper><TetrisGame /></GameWrapper>;

  return (
    <div className="min-h-screen pb-24" style={{ background: '#080808' }}>
      {/* Back nav */}
      <div className="px-4 pt-4">
        <button onClick={() => navigate('/mindset')} className="flex items-center gap-1 text-gray-500 text-sm hover:text-gray-300 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Mind
        </button>
      </div>
      {/* Compact Mindset Hero */}
      <div className="relative px-4 pt-3 pb-5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,85,0,0.08), transparent 70%)' }} />
        <div className="relative z-10">
          <h1 className="font-display text-2xl tracking-wider text-center">
            <span className="text-[#FF5500]" style={{ textShadow: '0 0 20px rgba(255,85,0,0.4)' }}>UNBREAKABLE</span>
            <span className="text-white"> FOCUS</span>
          </h1>
          <p className="text-center text-gray-500 text-sm mt-1 font-display tracking-wide">
            SWITCH OFF THE WORLD
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Description Card */}
        <div className="p-3.5 rounded-xl border border-[#FF5500]/15 bg-card">
          <p className="text-gray-400 text-sm leading-relaxed">
            Life is loud. These games are your <span className="text-[#FF5500] font-semibold">switch-off</span>.
            Train sustained, unshakeable focus. Auto-scaling difficulty keeps you at your edge —
            always growing, never coasting. Be <span className="text-[#FF5500] font-semibold">UNBREAKABLE</span>.
          </p>
          <p className="text-[#FF5500] font-display text-xs tracking-wider mt-2">KEEP SHOWING UP.</p>
        </div>

        {/* Section Header */}
        <p className="text-xs font-display tracking-wider text-gray-400 pt-2">SELECT YOUR GAME</p>

        {/* Game Cards — Mindset compact rows */}
        <div className="space-y-2">
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <button
                key={game.id}
                onClick={() => setView(game.id)}
                className="w-full p-3.5 rounded-xl border border-border bg-card flex items-center gap-3 hover:border-[#FF5500]/30 transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-lg border border-[#FF5500]/20 flex items-center justify-center shrink-0" style={{ background: 'rgba(255,85,0,0.1)' }}>
                  <Icon className="w-5 h-5 text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 6px rgba(255,85,0,0.5))' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm tracking-wider text-white">{game.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{game.tagline}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#FF5500] transition-colors shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MindsetGames;
