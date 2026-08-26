import { motion } from 'framer-motion';

interface CoachNameEditorProps {
  coachName: string;
  onSave?: (name: string) => void;
  /** Render as compact inline (header) or larger (welcome screen) */
  variant?: 'inline' | 'hero';
}

/**
 * Displays the AI coach's name.
 *
 * Renaming was removed for launch (Aug 2026) — the coach is always
 * "UNBREAKABLE COACH" so the brand stays consistent across every account.
 * The component name is kept so existing call sites don't need changing.
 */
export function CoachNameEditor({ coachName, variant = 'inline' }: CoachNameEditorProps) {
  const [first, ...rest] = coachName.split(' ');

  if (variant === 'hero') {
    return (
      <div className="flex flex-col items-center gap-2">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
          <h1 className="font-display text-3xl md:text-5xl tracking-wider">
            <span className="text-primary">{first}</span>{' '}
            <span className="text-foreground">{rest.join(' ')}</span>
          </h1>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5">
      <h2 className="font-display text-sm tracking-wider text-foreground truncate">{coachName}</h2>
    </motion.div>
  );
}
