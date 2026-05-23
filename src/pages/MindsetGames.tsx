import { useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gamepad2, Zap, Flame, ArrowRight, Blocks } from "lucide-react";
import { ThemedLogo } from "@/components/ThemedLogo";
import { ThemeToggle } from "@/components/hub/ThemeToggle";
const SnakeGame = lazy(() => import("@/components/mindset/SnakeGame"));
const AlleywayGame = lazy(() => import("@/components/mindset/AlleywayGame"));
const TetrisGame = lazy(() => import("@/components/mindset/TetrisGame"));

type ViewState = "selection" | "snake" | "alleyway" | "tetris";

const heroContent = {
  title: "UNBREAKABLE",
  titleAccent: "FOCUS",
  tagline: "SWITCH OFF THE WORLD. SWITCH ON YOUR MIND.",
  intro: "Life is loud. Notifications, pressure, expectations — it never stops. These games are your",
  emphasis: "SWITCH-OFF",
  description: "Step in here and the world disappears. No distractions, no noise — just you and the screen. This is where you train the skill that separates good from elite: sustained, unshakeable focus. Every session sharpens hand-eye coordination, reaction speed, and mental clarity under pressure. Auto-scaling difficulty keeps you right at your edge — always growing, never coasting.",
  goal: "Switch off your head from the world. Switch on your mind. Compete on the global leaderboard, push your reactions faster, your focus deeper, and your resilience",
  goalEmphasis: "UNBREAKABLE",
  goalEnd: ". KEEP SHOWING UP.",
  hashtag: "#UNBREAKABLEFOCUS",
};

const MindsetGames = () => {
  const [view, setView] = useState<ViewState>("selection");

  if (view === "snake") {
    return (
      <div className="min-h-screen pb-24" style={{ background: '#080808' }}>
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Link to="/" className="flex items-center gap-3">
                  <ThemedLogo />
                  <span className="font-display text-lg tracking-wide text-foreground hidden sm:block">UNBREAKABLE</span>
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="font-display text-xs tracking-wide" onClick={() => setView("selection")}>
                  ← BACK
                </Button>
</div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-6 pt-28 pb-12">
          <Suspense fallback={
            <div className="flex items-center justify-center py-20">
              <p className="font-display text-primary tracking-wide animate-pulse">LOADING...</p>
            </div>
          }>
            <SnakeGame />
          </Suspense>
        </main>
</div>
    );
  }

  if (view === "alleyway") {
    return (
      <div className="min-h-screen pb-24" style={{ background: '#080808' }}>
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Link to="/" className="flex items-center gap-3">
                  <ThemedLogo />
                  <span className="font-display text-lg tracking-wide text-foreground hidden sm:block">UNBREAKABLE</span>
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="font-display text-xs tracking-wide" onClick={() => setView("selection")}>
                  ← BACK
                </Button>
</div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-6 pt-28 pb-12">
          <Suspense fallback={
            <div className="flex items-center justify-center py-20">
              <p className="font-display text-primary tracking-wide animate-pulse">LOADING...</p>
            </div>
          }>
            <AlleywayGame />
          </Suspense>
        </main>
</div>
    );
  }

  if (view === "tetris") {
    return (
      <div className="min-h-screen pb-24" style={{ background: '#080808' }}>
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Link to="/" className="flex items-center gap-3">
                  <ThemedLogo />
                  <span className="font-display text-lg tracking-wide text-foreground hidden sm:block">UNBREAKABLE</span>
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="font-display text-xs tracking-wide" onClick={() => setView("selection")}>
                  ← BACK
                </Button>
</div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-6 pt-28 pb-12">
          <Suspense fallback={
            <div className="flex items-center justify-center py-20">
              <p className="font-display text-primary tracking-wide animate-pulse">LOADING...</p>
            </div>
          }>
            <TetrisGame />
          </Suspense>
        </main>
</div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#080808' }}>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link to="/" className="flex items-center gap-3">
                <ThemedLogo />
                <span className="font-display text-lg tracking-wide text-foreground hidden sm:block">UNBREAKABLE</span>
              </Link>
            </div>
</div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-12 text-center px-6">
        <div className="max-w-4xl mx-auto">
          <ThemedLogo className="h-32 md:h-40 object-contain mx-auto mb-6" />
          <h1 className="font-display text-6xl md:text-8xl text-primary tracking-wide leading-none mb-2">
            {heroContent.title}
          </h1>
          <h1 className="font-display text-6xl md:text-8xl text-foreground tracking-wide leading-none">
            {heroContent.titleAccent}
          </h1>
          <p className="text-primary font-display text-xl md:text-2xl tracking-wide mt-6">
            {heroContent.tagline}
          </p>
        </div>
      </section>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Description Card */}
          <div className="bg-card border-2 border-primary/30 rounded-lg p-8 md:p-10 mb-10 text-center max-w-4xl mx-auto">
            <p className="text-muted-foreground leading-relaxed mb-4">
              {heroContent.intro}{' '}
              <span className="text-primary font-semibold">{heroContent.emphasis}</span>.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {heroContent.description}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {heroContent.goal}{' '}
              <span className="text-primary font-semibold">{heroContent.goalEmphasis}</span>{heroContent.goalEnd}
            </p>
            <p className="text-primary font-display text-2xl tracking-wide mt-6">
              {heroContent.hashtag}
            </p>
          </div>

          <h2 className="font-display text-2xl text-primary mb-8 tracking-wide text-center">
            SELECT YOUR GAME
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className=" border-2 border-primary/30 border-l-4 border-l-primary p-6 cursor-pointer hover:bg-muted/50 transition-all group border-gray-800 bg-[#111]"
              onClick={() => setView("snake")}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div>
                 <h3 className="font-display text-xl text-foreground tracking-wide">FUEL</h3>
                   <p className="text-xs text-primary font-display">UNBREAKABLE EDITION</p>
                </div>
              </div>
              <p className="text-primary font-display text-sm tracking-wide mb-3">HUNT. ADAPT. SURVIVE.</p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                The world fades. Your instincts sharpen. Every turn is a split-second decision — react too slow and it's over. Colours shift, speed climbs, and only relentless focus keeps you alive. This is where reflexes become razor-sharp.
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                <span>Endless mode</span>
                <span>Auto-scaling difficulty</span>
              </div>
            </Card>

            <Card className=" border-2 border-primary/30 border-l-4 border-l-primary p-6 cursor-pointer hover:bg-muted/50 transition-all group border-gray-800 bg-[#111]"
              onClick={() => setView("alleyway")}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="font-display text-xl text-foreground tracking-wide">UNBREAKABLE</h3>
                   <p className="text-xs text-primary font-display">UNBREAKABLE EDITION</p>
                </div>
              </div>
              <p className="text-primary font-display text-sm tracking-wide mb-3">DESTROY WHAT'S IN YOUR WAY</p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Walls go up. You smash them down. Every barrier broken builds momentum — then the world flips and you adapt or fall. Precision, timing, and relentless aggression. Nothing stands between you and the leaderboard.
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                <span>Endless mode</span>
                <span>Auto-scaling difficulty</span>
              </div>
            </Card>

            <Card className=" border-2 border-primary/30 border-l-4 border-l-primary p-6 cursor-pointer hover:bg-muted/50 transition-all group border-gray-800 bg-[#111]"
              onClick={() => setView("tetris")}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <Blocks className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="font-display text-xl text-foreground tracking-wide">LIMITLESS</h3>
                   <p className="text-xs text-primary font-display">UNBREAKABLE EDITION</p>
                </div>
              </div>
              <p className="text-primary font-display text-sm tracking-wide mb-3">ORDER FROM CHAOS</p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                The pieces fall faster. The pressure builds. Your job is to find clarity in the chaos — stack clean, think ahead, and stay composed when everything accelerates. Mental discipline under fire. This is focus training at its purest.
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                <span>Endless mode</span>
                <span>Global leaderboard</span>
              </div>
            </Card>

          </div>
        </div>
      </main>

      
</div>
  );
};

export default MindsetGames;
