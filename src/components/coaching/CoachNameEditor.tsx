import { useState, useRef, useEffect } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

interface CoachNameEditorProps {
  coachName: string;
  onSave: (name: string) => void;
  /** Render as compact inline (header) or larger (welcome screen) */
  variant?: 'inline' | 'hero';
}

export function CoachNameEditor({ coachName, onSave, variant = 'inline' }: CoachNameEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(coachName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSave = () => {
    onSave(draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(coachName);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  if (variant === 'hero') {
    return (
      <div className="flex flex-col items-center gap-2">
        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-2"
            >
              <Input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={24}
                className="font-display text-2xl md:text-4xl tracking-wider text-center bg-transparent border-primary/40 focus:border-primary text-foreground h-auto py-2 w-64 md:w-80"
                placeholder="NAME YOUR COACH"
              />
              <Button variant="ghost" size="icon" onClick={handleSave} className="text-primary hover:bg-primary/10">
                <Check className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleCancel} className="text-muted-foreground hover:bg-destructive/10">
                <X className="w-5 h-5" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="display"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 group cursor-pointer"
              onClick={() => { setDraft(coachName); setEditing(true); }}
            >
              <h1 className="font-display text-3xl md:text-5xl tracking-wider">
                <span className="text-primary">{coachName.split(' ')[0]}</span>{' '}
                <span className="text-foreground">{coachName.split(' ').slice(1).join(' ')}</span>
              </h1>
              <Pencil className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          )}
        </AnimatePresence>
        <p className="text-xs text-muted-foreground">
          {editing ? 'Press Enter to save' : 'Click to rename your coach'}
        </p>
      </div>
    );
  }

  // Inline variant (header)
  return (
    <AnimatePresence mode="wait">
      {editing ? (
        <motion.div
          key="editing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-1.5"
        >
          <Input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={24}
            className="font-display text-sm tracking-wider bg-transparent border-primary/30 focus:border-primary text-foreground h-7 w-40"
            placeholder="Name..."
          />
          <Button variant="ghost" size="icon" onClick={handleSave} className="h-6 w-6 text-primary">
            <Check className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleCancel} className="h-6 w-6 text-muted-foreground">
            <X className="w-3.5 h-3.5" />
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key="display"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5 group cursor-pointer"
          onClick={() => { setDraft(coachName); setEditing(true); }}
        >
          <h2 className="font-display text-sm tracking-wider text-foreground truncate">
            {coachName}
          </h2>
          <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
