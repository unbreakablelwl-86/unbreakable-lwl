import { MessageCircle } from 'lucide-react';

interface Props {
  text: string;
}

export function CoachNoteBox({ text }: Props) {
  return (
    <div className="relative border border-muted/40 bg-gradient-to-br from-muted/20 to-muted/5 rounded-xl p-5 my-6 overflow-hidden">
      {/* Subtle accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-muted-foreground/30 rounded-l-xl" />
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
          <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <span className="font-display text-xs tracking-wider text-muted-foreground">COACH'S NOTE</span>
      </div>
      <p className="text-muted-foreground italic text-sm leading-[1.8] pl-0.5">{text}</p>
    </div>
  );
}
