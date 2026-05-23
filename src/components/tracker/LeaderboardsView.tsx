import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import { 
  AgeGroup, 
  DistanceBucket, 
  AGE_GROUPS, 
  DISTANCE_BUCKETS,
  TROPHY_ICONS,
  formatPace,
} from '@/lib/trophyDefinitions';
import { getLeaderboard, LeaderboardEntry } from '@/hooks/useTrophies';
import { useAuth } from '@/hooks/useAuth';
import { Trophy, Users, Filter } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export function LeaderboardsView() {
  const { user } = useAuth();
  const [ageGroup, setAgeGroup] = useState<AgeGroup | 'all'>('all');
  const [distanceBucket, setDistanceBucket] = useState<DistanceBucket>('5k');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [ageGroup, distanceBucket]);

  const loadLeaderboard = async () => {
    setLoading(true);
    const data = await getLeaderboard(
      distanceBucket,
      ageGroup === 'all' ? null : ageGroup,
      50
    );
    setEntries(data);
    setLoading(false);
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className=" border-border p-6 border-gray-800 bg-[#111]">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-primary" />
            <h2 className="font-display text-2xl text-foreground tracking-wide">
              LEADERBOARDS
            </h2>
          </div>
          <p className="text-muted-foreground">
            Compete for gold, silver, and bronze in your age group and distance category.
          </p>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className=" border-border p-4 border-gray-800 bg-[#111]">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <span className="font-display text-lg tracking-wide text-foreground">FILTERS</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Distance</label>
              <Select
                value={distanceBucket}
                onValueChange={(v) => setDistanceBucket(v as DistanceBucket)}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DISTANCE_BUCKETS.map((bucket) => (
                    <SelectItem key={bucket.value} value={bucket.value}>
                      {bucket.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Age Group</label>
              <Select
                value={ageGroup}
                onValueChange={(v) => setAgeGroup(v as AgeGroup | 'all')}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  {AGE_GROUPS.map((group) => (
                    <SelectItem key={group.value} value={group.value}>
                      {group.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Leaderboard Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className=" border-border overflow-hidden border-gray-800 bg-[#111]">
          <div className="flex items-center gap-2 p-4 border-b border-border">
            <Users className="w-5 h-5 text-primary" />
            <span className="font-display text-lg tracking-wide text-foreground">
              TOP {Math.min(entries.length, 50)} RUNNERS
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No runs in this category yet.</p>
              <p className="text-sm mt-2">Be the first to claim the gold!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.run_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`flex items-center gap-4 p-4 ${
                    entry.user_id === user?.id ? 'bg-primary/10' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className="w-12 text-center">
                    {entry.rank <= 3 ? (
                      <span className="text-2xl">{TROPHY_ICONS[entry.rank as 1 | 2 | 3]}</span>
                    ) : (
                      <span className="font-display text-xl text-muted-foreground">
                        {entry.rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar & Name */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary font-display">
                      {getInitials(entry.display_name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${
                      entry.user_id === user?.id ? 'text-primary' : 'text-foreground'
                    }`}>
                      {entry.display_name || 'Anonymous'}
                      {entry.user_id === user?.id && (
                        <span className="text-xs ml-2 text-primary">(You)</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(entry.started_at), 'MMM d, yyyy')}
                    </p>
                  </div>

                  {/* Distance */}
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {entry.distance_km.toFixed(2)} km
                    </p>
                  </div>

                  {/* Pace */}
                  <div className="text-right w-24">
                    <p className={`font-display text-lg ${
                      entry.rank <= 3 ? 'text-primary' : 'text-foreground'
                    }`}>
                      {formatPace(entry.pace_per_km_seconds)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
