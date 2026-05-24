import { Card } from '@/components/ui/card';
import { 
  ClipboardList, 
  StickyNote, 
  ChevronRight,
  Trophy
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SessionActionTilesProps {
  onOpenLogging: () => void;
  onOpenNotes: () => void;
  onOpenResults?: () => void;
  completedSets: number;
  totalSets: number;
  hasNotes?: boolean;
  isCompleted?: boolean;
}

export function SessionActionTiles({
  onOpenLogging,
  onOpenNotes,
  onOpenResults,
  completedSets,
  totalSets,
  hasNotes,
  isCompleted,
}: SessionActionTilesProps) {
  const tiles = [
    // Show Results tile first if session is completed
    ...(isCompleted && onOpenResults ? [{
      id: 'results',
      title: 'View Results',
      description: 'Session summary & stats',
      icon: Trophy,
      onClick: onOpenResults,
    }] : []),
    {
      id: 'logging',
      title: 'Log Session',
      description: 'Record sets, reps & weight',
      icon: ClipboardList,
      onClick: onOpenLogging,
    },
    {
      id: 'notes',
      title: 'Session Notes',
      description: 'Add workout notes',
      icon: StickyNote,
      onClick: onOpenNotes,
    },
  ];

  const getIndicator = (id: string) => {
    if (id === 'logging') {
      return `${completedSets}/${totalSets}`;
    }
    if (id === 'results' && isCompleted) return '✓';
    if (id === 'notes' && hasNotes) return '✓';
    return null;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {tiles.map((tile, index) => {
        const Icon = tile.icon;
        const indicator = getIndicator(tile.id);

        return (
          <motion.div
            key={tile.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-4 border border-border hover:border-primary/50 hover: cursor-pointer transition-all group border-border bg-card"
              onClick={tile.onClick}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-display text-foreground tracking-wide">
                      {tile.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {tile.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {indicator && (
                    <span className="text-sm font-medium text-primary">
                      {indicator}
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
