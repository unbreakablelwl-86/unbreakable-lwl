import { useState, useEffect, lazy, Suspense } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gamepad2, Zap, Blocks, Shapes, Wind, Calculator, ChevronRight, ArrowLeft } from "lucide-react";
const SnakeGame = lazy(() => import("@/components/mindset/SnakeGame"));
const AlleywayGame = lazy(() => import("@/components/mindset/AlleywayGame"));
const TetrisGame = lazy(() => import("@/components/mindset/TetrisGame"));
const PatternBreakerGame = lazy(() => import("@/components/mindset/PatternBreakerGame"));
const FlowStateGame = lazy(() => import("@/components/mindset/FlowStateGame"));
const MentalMathsGame = lazy(() => import("@/components/mindset/MentalMathsGame"));

type ViewState = "selection" | "snake" | "alleyway" | "tetris" | "pattern" | "flow" | "maths";

const games = [
  { id: "snake" as const, name: "HUNT", icon: Gamepad2, tagline: "Chase. Devour. Never Stop.", desc: "Split-second decisions — react too slow and it's over. Reflexes become razor-sharp." },
  { id: "alleyway" as const, name: "SHATTER", icon: Zap, tagline: "Break Every Wall.", desc: "Walls go up, you smash them down. Precision, timing, and relentless aggression." },
  { id: "tetris" as const, name: "STACK", icon: Blocks, tagline: "Order From Chaos.", desc: "Pieces fall faster. Find clarity in the chaos — stack clean, think ahead, stay composed." },
  { id: "pattern" as const, name: "LOCK IN", icon: Shapes, tagline: "One Wrong Move, It's Over.", desc: "Watch. Listen. Repeat. Each round adds one more — break focus and you're done." },
  { id: "flow" as const, name: "FLOW", icon: Wind, tagline: "Stay In The Zone.", desc: "Endless runner — dodge obstacles at increasing speed. Double-jump your way to immortality." },
  { id: "maths" as const, name: "SOLVE", icon: Calculator, tagline: "Rapid Fire. Zero Hesitation.", desc: "Mental maths blitz — solve under countdown. Numbers grow, timer shrinks. 3 lives." },
];

// GameWrapper must be OUTSIDE the main component — if defined inside,
// React re-creates it on every render which unmounts/remounts children,
// breaking Suspense lazy-loading and causing infinite reload loops (black screen).
const GameWrapper = ({ children, onBack }: { children: React.ReactNode; onBack: () => void }) => (
  <div className="min-h-screen pb-24 bg-background">
    <div className="px-4 pt-4 mb-4">
      <button onClick={onBack} className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
    </div>
    <div className="px-4">
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <p className="font-display text-primary tracking-wide animate-pulse">LOADING...</p>
        </div>
      }>
        {children}
      </Suspense>
    </div>
  </div>
);

const GAME_COMPONENTS: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  snake: SnakeGame,
  alleyway: AlleywayGame,
  tetris: TetrisGame,
  pattern: PatternBreakerGame,
  flow: FlowStateGame,
  maths: MentalMathsGame,
};

const MindsetGames = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<ViewState>("selection");

  // Auto-launch game from URL param (?game=snake)
  useEffect(() => {
    const gameParam = searchParams.get("game") as ViewState | null;
    if (gameParam && games.some(g => g.id === gameParam)) {
      setView(gameParam);
      // Clear the param so back button returns to selector
      setSearchParams({}, { replace: true });
    }
  }, []);

  const handleBack = () => setView("selection");

  // Render game if selected
  if (view !== "selection") {
    const GameComponent = GAME_COMPONENTS[view];
    if (GameComponent) {
      return (
        <GameWrapper onBack={handleBack}>
          <GameComponent />
        </GameWrapper>
      );
    }
  }

  return (
    <div className="min-h-screen pb-24" >
      {/* Back nav */}
      <div className="px-4 pt-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground text-sm hover:text-muted-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Mind
        </button>
      </div>
      {/* Compact Mindset Hero */}
      <div className="relative px-4 pt-3 pb-5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,85,0,0.08), transparent 70%)' }} />
        <div className="relative z-10">
          <h1 className="font-display text-2xl tracking-wider text-center">
            <span className="text-primary" style={{ textShadow: '0 0 20px rgba(255,85,0,0.4)' }}>UNBREAKABLE</span>
            <span className="text-foreground"> FOCUS</span>
          </h1>
          <p className="text-center text-muted-foreground text-sm mt-1 font-display tracking-wide">
            SWITCH OFF THE WORLD
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Description Card */}
        <div className="p-3.5 rounded-xl border border-primary/15 bg-card">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Life is loud. These games are your <span className="text-primary font-semibold">switch-off</span>.
            Train sustained, unshakeable focus. Auto-scaling difficulty keeps you at your edge —
            always growing, never coasting. Be <span className="text-primary font-semibold">UNBREAKABLE</span>.
          </p>
          <p className="text-primary font-display text-xs tracking-wider mt-2">KEEP SHOWING UP.</p>
        </div>

        {/* Section Header */}
        <p className="text-xs font-display tracking-wider text-muted-foreground pt-2">SELECT YOUR GAME</p>

        {/* Game Cards — Mindset compact rows */}
        <div className="space-y-2">
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <button
                key={game.id}
                onClick={() => setView(game.id)}
                className="w-full p-3.5 rounded-xl border border-border bg-card flex items-center gap-3 hover:border-primary/30 transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-lg border border-primary/20 flex items-center justify-center shrink-0" style={{ background: 'rgba(255,85,0,0.1)' }}>
                  <Icon className="w-5 h-5 text-primary" style={{ filter: 'drop-shadow(0 0 6px rgba(255,85,0,0.5))' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-display text-sm tracking-wider text-foreground">{game.name}</p>
                  </div>
                  <p className="text-muted-foreground text-xs mt-0.5">{game.tagline}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MindsetGames;
