import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Target,
  Flame,
  Zap,
  Medal,
  TrendingUp,
  Share2,
  Check,
  Globe,
  Users,
  Lock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Milestone } from '@/hooks/useMilestones';
import { useAuth } from '@/hooks/useAuth';

interface MilestoneCardProps {
  milestone: Milestone;
  onShare?: (milestoneId: string) => void;
  onUnshare?: (milestoneId: string) => void;
}

const iconMap: Record<string, React.ElementType> = {
  trophy: Trophy,
  target: Target,
  flame: Flame,
  zap: Zap,
  medal: Medal,
  trending: TrendingUp,
};

const typeLabels: Record<Milestone['milestone_type'], string> = {
  streak: 'STREAK',
  programme_complete: 'PROGRAMME',
  distance_total: 'DISTANCE',
  workout_count: 'WORKOUTS',
  trophy: 'TROPHY',
  level_up: 'LEVEL UP',
};

const typeColors: Record<Milestone['milestone_type'], string> = {
  streak: 'bg-orange-500/20 text-orange-400',
  programme_complete: 'bg-primary/20 text-primary',
  distance_total: 'bg-primary/20 text-primary',
  workout_count: 'bg-primary/20 text-primary',
  trophy: 'bg-primary/20 text-primary',
  level_up: 'bg-primary/20 text-primary',
};

export function MilestoneCard({ milestone, onShare, onUnshare }: MilestoneCardProps) {
  const { user } = useAuth();
  const isOwner = user?.id === milestone.user_id;
  const IconComponent = iconMap[milestone.icon || 'trophy'] || Trophy;

  const getInitials = () => {
    const name = milestone.profiles?.display_name || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getVisibilityIcon = () => {
    switch (milestone.visibility) {
      case 'public': return <Globe className="w-3 h-3" />;
      case 'friends': return <Users className="w-3 h-3" />;
      case 'private': return <Lock className="w-3 h-3" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className=" border-border border-l-4 border-l-primary overflow-hidden border-border bg-card">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <Avatar className="w-10 h-10">
              {milestone.profiles?.avatar_url && (
                <AvatarImage src={milestone.profiles.avatar_url} alt="User" />
              )}
              <AvatarFallback className="bg-primary/20 text-primary font-display">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-foreground">
                  {milestone.profiles?.display_name || 'User'}
                </span>
                <span className="text-muted-foreground text-sm">earned an achievement</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span>{formatDistanceToNow(new Date(milestone.achieved_at), { addSuffix: true })}</span>
                <span>•</span>
                {getVisibilityIcon()}
              </div>
            </div>

            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => milestone.is_shared ? onUnshare?.(milestone.id) : onShare?.(milestone.id)}
              >
                {milestone.is_shared ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>

          {/* Achievement Content */}
          <div className="bg-muted/50 rounded-lg p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <IconComponent className="w-8 h-8 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <Badge className={`${typeColors[milestone.milestone_type]} mb-2 font-display text-xs`}>
                {typeLabels[milestone.milestone_type]}
              </Badge>
              <h3 className="font-display text-lg text-foreground tracking-wide">
                {milestone.title}
              </h3>
              {milestone.description && (
                <p className="text-muted-foreground text-sm mt-1">
                  {milestone.description}
                </p>
              )}
              {milestone.value && (
                <p className="text-primary font-display text-2xl mt-2">
                  {milestone.value.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
