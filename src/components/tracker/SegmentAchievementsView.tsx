import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSegments, useUserAchievements, useSegmentDetail } from '@/hooks/useSegments';
import { formatSegmentTime, getAchievementIcon, getPRMedalIcon } from '@/lib/segmentUtils';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Trophy, Medal, MapPin, ChevronRight, Users, Clock, Route } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export function SegmentAchievementsView() {
  const { segments, loading: segmentsLoading } = useSegments();
  const { achievements, loading: achievementsLoading } = useUserAchievements();
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);

  const loading = segmentsLoading || achievementsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Achievement Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <AchievementCard
          icon="👑"
          label="KOMs"
          count={achievements.komCount}
        />
        <AchievementCard
          icon="🏆"
          label="Trophies"
          count={achievements.trophyCount}
        />
        <AchievementCard
          icon="🌿"
          label="Local Legends"
          count={achievements.localLegendCount}
        />
        <AchievementCard
          icon="🏅"
          label="Total Efforts"
          count={achievements.totalEfforts}
        />
      </div>

      {/* PR Medals Summary */}
      <Card className="p-4 border border-border border-l-4 border-l-primary border-border bg-card">
        <h3 className="font-display text-sm text-muted-foreground mb-3 tracking-wide">
          PERSONAL RECORD MEDALS
        </h3>
        <div className="flex justify-around">
          <div className="text-center">
            <div className="text-3xl mb-1 medal-unlocked">🥇</div>
            <p className="font-display text-xl text-foreground">{achievements.prMedals.gold}</p>
            <p className="text-xs text-muted-foreground">Gold</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-1 medal-unlocked">🥈</div>
            <p className="font-display text-xl text-foreground">{achievements.prMedals.silver}</p>
            <p className="text-xs text-muted-foreground">Silver</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-1 medal-unlocked">🥉</div>
            <p className="font-display text-xl text-foreground">{achievements.prMedals.bronze}</p>
            <p className="text-xs text-muted-foreground">Bronze</p>
          </div>
        </div>
      </Card>

      {/* Segments List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-background border border-border">
          <TabsTrigger value="all" className="font-display tracking-wide text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Route className="w-4 h-4 mr-1" />
            ALL SEGMENTS
          </TabsTrigger>
          <TabsTrigger value="starred" className="font-display tracking-wide text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Crown className="w-4 h-4 mr-1" />
            MY CROWNS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <SegmentsList
            segments={segments}
            onSelectSegment={setSelectedSegmentId}
          />
        </TabsContent>

        <TabsContent value="starred" className="mt-4">
          <SegmentsList
            segments={segments}
            filterKom
            onSelectSegment={setSelectedSegmentId}
          />
        </TabsContent>
      </Tabs>

      {/* Segment Detail Modal */}
      <SegmentDetailModal
        segmentId={selectedSegmentId}
        onClose={() => setSelectedSegmentId(null)}
      />
    </div>
  );
}

function AchievementCard({
  icon,
  label,
  count,
}: {
  icon: string;
  label: string;
  count: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="p-4 border border-border border-l-4 border-l-primary border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="text-2xl medal-unlocked">{icon}</div>
          <div>
            <p className="font-display text-2xl text-foreground">{count}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function SegmentsList({
  segments,
  filterKom,
  onSelectSegment,
}: {
  segments: Array<{ id: string; name: string; distance_m: number; total_efforts: number }>;
  filterKom?: boolean;
  onSelectSegment: (id: string) => void;
}) {
  // For filterKom, we'd need to fetch user's KOM segments - simplified for now
  const displaySegments = segments;

  if (displaySegments.length === 0) {
    return (
      <div className="text-center py-12">
        <Route className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">
          {filterKom
            ? 'No crowns yet. Keep running to claim the top spot!'
            : 'No segments found. Start a GPS run to auto-detect segments!'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displaySegments.map((segment, index) => (
        <motion.div
          key={segment.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
        >
          <Card className="p-3 border border-border border-l-4 border-l-primary hover:border-primary cursor-pointer transition-colors border-border bg-card"
            onClick={() => onSelectSegment(segment.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Route className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-display text-sm text-foreground">{segment.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{(segment.distance_m / 1000).toFixed(2)} km</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {segment.total_efforts}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function SegmentDetailModal({
  segmentId,
  onClose,
}: {
  segmentId: string | null;
  onClose: () => void;
}) {
  const { segment, leaderboard, loading } = useSegmentDetail(segmentId);

  return (
    <Dialog open={!!segmentId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-background border-border bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-lg tracking-wide flex items-center gap-2">
            <Route className="w-5 h-5 text-primary" />
            {segment?.name || 'Segment'}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : segment ? (
          <div className="space-y-4">
            {/* Segment Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-card border border-border rounded-lg">
                <p className="text-xs text-muted-foreground">Distance</p>
                <p className="font-display text-lg text-foreground">
                  {(segment.distance_m / 1000).toFixed(2)}km
                </p>
              </div>
              <div className="text-center p-2 bg-card border border-border rounded-lg">
                <p className="text-xs text-muted-foreground">Efforts</p>
                <p className="font-display text-lg text-foreground">{segment.total_efforts}</p>
              </div>
              <div className="text-center p-2 bg-card border border-border rounded-lg">
                <p className="text-xs text-muted-foreground">Your Rank</p>
                <p className="font-display text-lg text-primary">
                  {segment.userRank ? `#${segment.userRank}` : '-'}
                </p>
              </div>
            </div>

            {/* Your Best */}
            {segment.userBestEffort && (
              <Card className="p-3 border border-border border-l-4 border-l-primary border-border bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl medal-unlocked">🏃</span>
                    <div>
                      <p className="text-xs text-muted-foreground">Your Best</p>
                      <p className="font-display text-lg text-primary">
                        {formatSegmentTime(segment.userBestEffort.elapsed_time_seconds)}
                      </p>
                    </div>
                  </div>
                  {segment.userRank === 1 && <span className="text-2xl medal-unlocked">👑</span>}
                  {segment.isLocalLegend && <span className="text-2xl medal-unlocked">🌿</span>}
                </div>
              </Card>
            )}

            {/* Leaderboard */}
            <div>
              <h4 className="font-display text-sm text-muted-foreground mb-2 tracking-wide">
                LEADERBOARD
              </h4>
              <ScrollArea className="h-48">
                <div className="space-y-1">
                  {leaderboard.map((entry) => (
                    <div
                      key={`${entry.userId}-${entry.rank}`}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        entry.isCurrentUser ? 'bg-primary/10 border border-primary/30' : 'bg-card border border-border'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 text-center font-display ${
                            entry.rank === 1
                              ? 'text-primary'
                              : entry.rank <= 3
                              ? 'text-primary/70'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {entry.rank === 1 ? '👑' : `#${entry.rank}`}
                        </span>
                        <span className={entry.isCurrentUser ? 'text-primary font-medium' : 'text-foreground'}>
                          {entry.displayName}
                        </span>
                      </div>
                      <span className="font-mono text-sm text-foreground">
                        {formatSegmentTime(entry.time)}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Beat the KOM hint */}
            {segment.komHolder && segment.userRank !== 1 && (
              <div className="text-center text-xs text-muted-foreground bg-card border border-border p-2 rounded-lg">
                <span className="text-primary">👑</span> Beat{' '}
                <span className="font-mono text-primary">{formatSegmentTime(segment.komHolder.time)}</span> to
                claim the crown!
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
