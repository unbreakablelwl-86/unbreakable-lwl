import { Flame } from 'lucide-react';

interface Props {
  text: string;
}

export function UnbreakableInsightBox({ text }: Props) {
  return (
    <div className="relative border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl p-5 my-6 overflow-hidden">
      {/* Accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl" />
      {/* Subtle glow */}
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display text-xs tracking-wider text-primary">UNBREAKABLE INSIGHT</span>
        </div>
        <p className="text-foreground font-medium text-sm leading-[1.8] pl-0.5">{text}</p>
      </div>
    </div>
  );
}
