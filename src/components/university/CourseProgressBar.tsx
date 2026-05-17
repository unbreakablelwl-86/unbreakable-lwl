import { motion } from 'framer-motion';

interface Props {
  label: string;
  completed: number;
  total: number;
  colorClass?: string; // e.g. 'bg-emerald-500' — defaults to primary
}

export function CourseProgressBar({ label, completed, total, colorClass }: Props) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const fillColor = colorClass || 'bg-primary';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-display tracking-wider" style={{ color: colorClass ? undefined : 'hsl(var(--primary))' }}>
          <span className="text-foreground font-medium">{completed}</span>
          <span className="text-muted-foreground">/{total}</span>
          <span className="ml-1.5 text-muted-foreground">({percent}%)</span>
        </span>
      </div>
      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${fillColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
