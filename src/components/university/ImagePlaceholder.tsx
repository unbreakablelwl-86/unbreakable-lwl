import { ImageIcon } from 'lucide-react';

interface Props {
  description: string;
}

export function ImagePlaceholder({ description }: Props) {
  return (
    <div className="relative border border-dashed border-primary/15 rounded-xl p-8 my-5 flex flex-col items-center gap-3 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.03),transparent_70%)]" />
      <div className="relative w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
        <ImageIcon className="w-6 h-6 text-primary/40" />
      </div>
      <p className="relative text-xs text-muted-foreground text-center max-w-sm leading-relaxed">{description}</p>
    </div>
  );
}
