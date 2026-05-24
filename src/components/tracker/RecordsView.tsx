import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import { useMedals } from '@/hooks/useMedals';
import { MEDAL_DEFINITIONS } from '@/lib/medalDefinitions';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { Trophy, Medal, Clock, TrendingUp, Zap, Crown, Route } from 'lucide-react';
import { SegmentAchievementsView } from './SegmentAchievementsView';

export function RecordsView() {
  const { getAllPRsWithLabels, loading: prsLoading } = usePersonalRecords();
  const { getAllMedalsWithStatus, loading: medalsLoading } = useMedals();

  const prs = getAllPRsWithLabels();
  const allMedals = getAllMedalsWithStatus();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}/km`;
  };

  const earnedMedals = allMedals.filter(m => m.earned);
  const unearnedMedals = allMedals.filter(m => !m.earned);

  const categoryLabels: Record<string, string> = {
    distance: 'Distance',
    streak: 'Streaks',
    pace: 'Speed',
    milestone: 'Milestones',
    special: 'Special',
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    distance: <TrendingUp className="w-4 h-4" />,
    streak: <Clock className="w-4 h-4" />,
    pace: <Zap className="w-4 h-4" />,
    milestone: <Trophy className="w-4 h-4" />,
    special: <Medal className="w-4 h-4" />,
  };

  if (prsLoading || medalsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="segments" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-background border border-border">
          <TabsTrigger value="segments" className="font-display tracking-wide text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Crown className="w-4 h-4 mr-1" />
            SEGMENTS
          </TabsTrigger>
          <TabsTrigger value="records" className="font-display tracking-wide text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Trophy className="w-4 h-4 mr-1" />
            RECORDS
          </TabsTrigger>
          <TabsTrigger value="medals" className="font-display tracking-wide text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Medal className="w-4 h-4 mr-1" />
            MEDALS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="segments" className="space-y-4 mt-4">
          <SegmentAchievementsView />
        </TabsContent>

        <TabsContent value="records" className="space-y-4 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="font-display text-lg text-foreground mb-3 tracking-wide">
              PERSONAL RECORDS
            </h3>
            <div className="grid gap-3">
              {prs.map((pr, index) => (
                <motion.div
                  key={pr.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`p-4 border-l-4 ${
                      pr.record
                        ? 'bg-card border-border border-l-primary'
                        : 'bg-background border-border border-l-locked opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            pr.record ? 'bg-primary/20 text-primary' : 'bg-secondary text-locked'
                          }`}
                        >
                          <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-display text-lg text-foreground tracking-wide">
                            {pr.label}
                          </p>
                          {pr.record ? (
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(pr.record.achieved_at), 'MMM d, yyyy')}
                            </p>
                          ) : (
                            <p className="text-sm text-locked-foreground">Not set yet</p>
                          )}
                        </div>
                      </div>
                      {pr.record && pr.record.time_seconds && (
                        <div className="text-right">
                          <p className="font-display text-xl text-primary">
                            {formatTime(pr.record.time_seconds)}
                          </p>
                          {pr.record.pace_per_km_seconds && (
                            <p className="text-sm text-muted-foreground">
                              {formatPace(pr.record.pace_per_km_seconds)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="medals" className="space-y-6 mt-4">
          {/* Earned Medals */}
          {earnedMedals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="font-display text-lg text-foreground mb-3 tracking-wide">
                EARNED ({earnedMedals.length}/{allMedals.length})
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {earnedMedals.map((medal, index) => (
                  <motion.div
                    key={medal.code}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className="p-3 border border-border border-l-4 border-l-primary text-center group relative border-border bg-card">
                      <div className="text-3xl mb-1 medal-unlocked">{medal.icon}</div>
                      <p className="font-display text-xs text-foreground tracking-wide line-clamp-2">
                        {medal.name}
                      </p>
                      {medal.earned && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {format(parseISO(medal.earned.earned_at), 'MMM d')}
                        </p>
                      )}
                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-background border border-border px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        Earned {medal.earned && format(parseISO(medal.earned.earned_at), 'MMM d, yyyy')}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Locked Medals by Category */}
          {Object.keys(categoryLabels).map((category) => {
            const categoryMedals = unearnedMedals.filter(m => m.category === category);
            if (categoryMedals.length === 0) return null;

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-muted-foreground">
                    {categoryIcons[category]}
                  </div>
                  <h3 className="font-display text-sm text-muted-foreground tracking-wide">
                    {categoryLabels[category].toUpperCase()}
                  </h3>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {categoryMedals.map((medal, index) => (
                    <motion.div
                      key={medal.code}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Card className="p-3 bg-background border border-border text-center group relative border-border bg-card">
                        <div className="text-3xl mb-1 medal-locked grayscale">{medal.icon}</div>
                        <p className="font-display text-xs text-locked-foreground tracking-wide line-clamp-2">
                          {medal.name}
                        </p>
                        <p className="text-[10px] text-locked-foreground mt-1">
                          Locked
                        </p>
                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-background border border-border px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 text-muted-foreground">
                          Unlock: {medal.description || medal.name}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}

          {earnedMedals.length === 0 && (
            <div className="text-center py-12">
              <Medal className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                No medals earned yet. Start running to unlock achievements!
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}