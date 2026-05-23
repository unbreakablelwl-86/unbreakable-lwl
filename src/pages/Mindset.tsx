import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Brain, Wind, Gamepad2, Flame, ArrowRight, BookOpen } from "lucide-react";
import { ThemedLogo } from "@/components/ThemedLogo";
import { ThemeToggle } from "@/components/hub/ThemeToggle";
import { MindsetProgrammes } from "@/components/mindset/MindsetProgrammes";

const heroContent = {
  title: "UNBREAKABLE",
  titleAccent: "MINDSET",
  tagline: "LIVE WITHOUT LIMITS",
  intro: "Your mind is your ultimate weapon. This isn't meditation for relaxation — it's",
  emphasis: "MENTAL CONDITIONING",
  description: "Controlled breathing rewires your nervous system. Focus games sharpen your reactions. Every session builds",
  descEmphasis: "RESILIENCE UNDER PRESSURE",
  descEnd: ".",
  goal: "Develop a mind that stays calm in chaos — focused, present, and",
  goalEmphasis: "UNBREAKABLE",
  goalEnd: ". KEEP SHOWING UP.",
  hashtag: "#UNBREAKABLEMINDSET",
};

const exploreCards = [
  {
    title: "BREATHING",
    subtitle: "BREATHE WITH PURPOSE",
    description: "Voice-guided breathing sessions built on proven techniques — from military-grade Box Breathing to deep parasympathetic resets. Train your nervous system for calm under pressure.",
    icon: Wind,
    link: "/mindset/breathing",
  },
  {
    title: "FOCUS GAMES",
    subtitle: "TRAIN YOUR REACTIONS",
    description: "Reaction-based games that sharpen focus and hand-eye coordination. Auto-scaling difficulty and global leaderboards push you to compete against yourself and others.",
    icon: Gamepad2,
    link: "/mindset/games",
  },
  {
    title: "DAILY JOURNAL",
    subtitle: "REFLECT & GROW",
    description: "Structured daily journaling to build self-awareness and accountability. Record what went well, what was hardest, and what you'll improve tomorrow.",
    icon: BookOpen,
    link: "/habits",
  },
];
const Mindset = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link to="/" className="flex items-center gap-3">
                <ThemedLogo />
                <span className="font-display text-lg tracking-wide text-foreground hidden sm:block">
                  UNBREAKABLE
                </span>
              </Link>
            </div>
</div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-12 text-center px-6">
        <div className="max-w-4xl mx-auto">
          <ThemedLogo className="h-32 md:h-40 object-contain mx-auto mb-6" />
          <h1 className="font-display text-6xl md:text-8xl text-primary tracking-wide leading-none mb-2 neon-glow-subtle">
            {heroContent.title}
          </h1>
          <h1 className="font-display text-6xl md:text-8xl text-foreground tracking-wide leading-none">
            {heroContent.titleAccent}
          </h1>
          <p className="text-primary font-display text-xl md:text-2xl tracking-wide mt-6 neon-glow-subtle">
            {heroContent.tagline}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Description Card */}
          <div className="bg-card border-2 border-primary/30 neon-border-subtle rounded-lg p-8 md:p-10 mb-10 text-center max-w-4xl mx-auto">
            <p className="text-muted-foreground leading-relaxed mb-4">
              {heroContent.intro}{' '}
              <span className="text-primary font-semibold">{heroContent.emphasis}</span>.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {heroContent.description}{' '}
              <span className="text-primary font-semibold">{heroContent.descEmphasis}</span>
              {heroContent.descEnd}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {heroContent.goal}{' '}
              <span className="text-primary font-semibold">{heroContent.goalEmphasis}</span>{' '}
              {heroContent.goalEnd}
            </p>
            <p className="text-primary font-display text-2xl tracking-wide mt-6 neon-glow-subtle">
              {heroContent.hashtag}
            </p>
          </div>

          {/* My Programmes Section */}
          <div className="mb-12">
            <MindsetProgrammes />
          </div>

          {/* Explore Section */}
          <h2 className="font-display text-2xl text-primary mb-8 tracking-wide text-center neon-glow-subtle">
            EXPLORE
          </h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {exploreCards.map((card) => (
              <Link key={card.title} to={card.link}>
                <Card className="bg-card border-2 border-primary/30 neon-border-subtle border-l-4 border-l-primary p-6 cursor-pointer hover:bg-muted/50 transition-all group h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <card.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl text-foreground tracking-wide">
                        {card.title}
                      </h3>
                      <p className="text-xs text-primary font-display">{card.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {card.description}
                  </p>
                  <div className="flex items-center gap-2 mt-4 text-primary font-display text-sm tracking-wide">
                    <span>ENTER</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Coach Banner */}
      <section className="container mx-auto px-6 py-12 border-t border-border">
        <Link to="/help" className="block max-w-3xl mx-auto">
          <Card className="border-2 border-primary/40 bg-primary/5 p-6 hover:bg-primary/10 transition-all neon-border-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center neon-glow">
                  <Flame className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-display text-xl tracking-wide text-foreground">
                    NEED MORE? <span className="text-primary neon-glow-subtle">ASK YOUR COACH</span>
                  </p>
                  <p className="text-muted-foreground mt-1">
                    Mindset tips, stress management, and mental performance coaching
                  </p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-primary hidden sm:block" />
            </div>
          </Card>
        </Link>
      </section>
</div>
  );
};

export default Mindset;
