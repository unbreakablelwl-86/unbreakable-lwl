import { Sparkles, Wrench, ChevronRight, MessageSquare } from 'lucide-react';

interface BuilderModeSelectorProps {
  onSelectMode: (mode: 'auto' | 'manual') => void;
}

export function BuilderModeSelector({ onSelectMode }: BuilderModeSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-display tracking-wider text-muted-foreground mb-3">CHOOSE YOUR PATH</p>

      <button
        onClick={() => onSelectMode('auto')}
        className="w-full p-3.5 rounded-xl border border-border bg-card flex items-center gap-3 hover:border-primary/30 transition-all group"
      >
        <div className="w-10 h-10 rounded-lg border border-primary/20 flex items-center justify-center" style={{ background: 'rgba(255,85,0,0.1)' }}>
          <MessageSquare className="w-5 h-5 text-primary" style={{ filter: 'drop-shadow(0 0 6px rgba(255,85,0,0.5))' }} />
        </div>
        <div className="flex-1 text-left">
          <p className="font-display text-sm tracking-wider text-foreground">UNBREAKABLE COACH BUILDER</p>
          <p className="text-muted-foreground text-xs mt-0.5">Chat with your coach — auto-builds your programme</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </button>

      <button
        onClick={() => onSelectMode('manual')}
        className="w-full p-3.5 rounded-xl border border-border bg-card flex items-center gap-3 hover:border-primary/30 transition-all group"
      >
        <div className="w-10 h-10 rounded-lg border border-primary/20 flex items-center justify-center" style={{ background: 'rgba(255,85,0,0.1)' }}>
          <Wrench className="w-5 h-5 text-primary" style={{ filter: 'drop-shadow(0 0 6px rgba(255,85,0,0.5))' }} />
        </div>
        <div className="flex-1 text-left">
          <p className="font-display text-sm tracking-wider text-foreground">MANUAL BUILDER</p>
          <p className="text-muted-foreground text-xs mt-0.5">Full customisation — build it yourself</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </button>
    </div>
  );
}
