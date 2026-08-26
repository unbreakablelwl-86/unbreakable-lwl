/**
 * AchievementsPage — Tab-based page for Achievement Cards, PB Leaderboard
 * Route: /achievements
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Trophy, Globe, TrendingUp, ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FEATURES } from '@/config/features';
import { AchievementCollection } from '@/components/achievements/AchievementCollection';
import { PBLeaderboard } from '@/components/achievements/PBLeaderboard';

type AchievementsTab = 'collection' | 'leaderboard';

export default function AchievementsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AchievementsTab>(FEATURES.pbCards ? 'collection' : 'leaderboard');

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-display text-lg tracking-wider">ACHIEVEMENTS</h1>
            <p className="text-xs text-muted-foreground">PBs • Global Rankings</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-lg mx-auto px-4 flex gap-1 pb-2">
          {FEATURES.pbCards && (
            <Button
              variant={activeTab === 'collection' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1 font-display tracking-wider text-xs"
              onClick={() => setActiveTab('collection')}
            >
              <Trophy className="w-4 h-4 mr-1.5" />
              MY CARDS
            </Button>
          )}
          <Button
            variant={activeTab === 'leaderboard' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1 font-display tracking-wider text-xs"
            onClick={() => setActiveTab('leaderboard')}
          >
            <Globe className="w-4 h-4 mr-1.5" />
            LEADERBOARD
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-4">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {FEATURES.pbCards && activeTab === 'collection' ? (
            <AchievementCollection />
          ) : (
            <PBLeaderboard />
          )}
        </motion.div>
      </div>
    </div>
  );
}
