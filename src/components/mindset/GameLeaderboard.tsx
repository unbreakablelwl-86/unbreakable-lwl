import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Trophy, Crown, Gem, Medal, Award } from "lucide-react";
import { motion } from "framer-motion";

interface ScoreEntry {
  id: string;
  user_id: string;
  score: number;
  created_at: string;
  display_name?: string;
  avatar_url?: string;
  [key: string]: any;
}

type TierInfo = {
  name: string;
  color: string;
  bg: string;
  border: string;
  glow: string;
  icon: React.ReactNode;
};

const getTier = (rank: number, total: number): TierInfo | null => {
  if (total < 1) return null;
  if (rank <= 3) return {
    name: "DIAMOND",
    color: "text-cyan-300",
    bg: "bg-cyan-500/10",
    border: "border-cyan-400/40",
    glow: "0 0 12px rgba(34,211,238,0.3)",
    icon: <Gem className="w-4 h-4 text-cyan-300" />,
  };
  if (rank <= 10) return {
    name: "GOLD",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-400/30",
    glow: "0 0 8px rgba(250,204,21,0.2)",
    icon: <Crown className="w-4 h-4 text-yellow-400" />,
  };
  if (rank <= 20) return {
    name: "SILVER",
    color: "text-gray-300",
    bg: "bg-gray-400/10",
    border: "border-gray-400/30",
    glow: "0 0 6px rgba(156,163,175,0.2)",
    icon: <Medal className="w-4 h-4 text-gray-300" />,
  };
  if (rank <= 50) return {
    name: "BRONZE",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-400/20",
    glow: "none",
    icon: <Award className="w-4 h-4 text-orange-400" />,
  };
  return null;
};

const getRankDisplay = (rank: number): React.ReactNode => {
  if (rank === 1) return <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center"><Trophy className="w-4 h-4 text-cyan-300" /></div>;
  if (rank === 2) return <div className="w-7 h-7 rounded-full bg-cyan-500/10 flex items-center justify-center"><Gem className="w-4 h-4 text-cyan-200/80" /></div>;
  if (rank === 3) return <div className="w-7 h-7 rounded-full bg-cyan-500/10 flex items-center justify-center"><Gem className="w-4 h-4 text-cyan-200/60" /></div>;
  if (rank <= 10) return <div className="w-7 h-7 rounded-full bg-yellow-500/10 flex items-center justify-center"><span className="font-display text-xs text-yellow-400">{rank}</span></div>;
  if (rank <= 20) return <div className="w-7 h-7 rounded-full bg-gray-500/10 flex items-center justify-center"><span className="font-display text-xs text-gray-300">{rank}</span></div>;
  return <div className="w-7 h-7 flex items-center justify-center"><span className="font-display text-xs text-muted-foreground">{rank}</span></div>;
};

interface GameLeaderboardProps {
  scores: ScoreEntry[];
  userBest: number | null;
  currentUserId?: string;
  gameName: string;
  onClose: () => void;
  onRefetch: () => void;
  /** Optional secondary stat to show per entry, e.g. "Level 12" */
  getSubLabel?: (entry: ScoreEntry) => string;
}

export const GameLeaderboard = ({
  scores,
  userBest,
  currentUserId,
  gameName,
  onClose,
  onRefetch,
  getSubLabel,
}: GameLeaderboardProps) => {
  // Find current user's rank
  const userRank = currentUserId
    ? scores.findIndex((s) => s.user_id === currentUserId) + 1
    : 0;
  const userTier = userRank > 0 ? getTier(userRank, scores.length) : null;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button onClick={onClose} variant="ghost" size="sm" className="font-display text-xs tracking-wide gap-1">
          <ArrowLeft className="w-4 h-4" /> BACK
        </Button>
        <h2 className="font-display text-xl text-primary tracking-wide" style={{ textShadow: "0 0 15px rgba(255,85,0,0.4)" }}>
          GLOBAL TOP 50
        </h2>
        <Button onClick={onRefetch} variant="ghost" size="icon" className="h-8 w-8">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Tier Legend */}
      <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
        <span className="flex items-center gap-1 text-[10px] font-display tracking-wider"><Gem className="w-3 h-3 text-cyan-300" /> DIAMOND <span className="text-muted-foreground">Top 3</span></span>
        <span className="flex items-center gap-1 text-[10px] font-display tracking-wider"><Crown className="w-3 h-3 text-yellow-400" /> GOLD <span className="text-muted-foreground">Top 10</span></span>
        <span className="flex items-center gap-1 text-[10px] font-display tracking-wider"><Medal className="w-3 h-3 text-gray-300" /> SILVER <span className="text-muted-foreground">Top 20</span></span>
        <span className="flex items-center gap-1 text-[10px] font-display tracking-wider"><Award className="w-3 h-3 text-orange-400" /> BRONZE <span className="text-muted-foreground">Top 50</span></span>
      </div>

      {/* User's Best + Rank */}
      {userBest !== null && (
        <Card className={`p-4 mb-4 text-center ${userTier ? `${userTier.bg} ${userTier.border}` : "bg-primary/10 border-primary/30"}`}
          style={userTier ? { boxShadow: userTier.glow } : undefined}>
          <div className="flex items-center justify-center gap-3">
            {userTier && userTier.icon}
            <div>
              <p className="font-display text-[10px] tracking-wider text-muted-foreground">
                YOUR BEST {userRank > 0 && `· RANK #${userRank}`} {userTier && `· ${userTier.name}`}
              </p>
              <p className={`font-display text-3xl ${userTier ? userTier.color : "text-primary"}`}>{userBest.toLocaleString()}</p>
            </div>
            {userTier && userTier.icon}
          </div>
        </Card>
      )}

      {/* Scores list */}
      <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
        {scores.length === 0 ? (
          <Card className="border-border p-8 text-center bg-card">
            <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-display text-lg text-muted-foreground tracking-wide">NO SCORES YET</p>
            <p className="text-sm text-muted-foreground mt-1">Be the first on the board!</p>
          </Card>
        ) : (
          scores.map((entry, index) => {
            const rank = index + 1;
            const tier = getTier(rank, scores.length);
            const isCurrentUser = currentUserId && entry.user_id === currentUserId;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.5) }}
              >
                <Card
                  className={`p-2.5 transition-all ${
                    isCurrentUser
                      ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                      : tier
                        ? `${tier.border} ${tier.bg}`
                        : "border-border bg-card"
                  }`}
                  style={rank <= 3 ? { boxShadow: tier?.glow } : undefined}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Rank */}
                    {getRankDisplay(rank)}

                    {/* Avatar + Name */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                        {entry.avatar_url ? (
                          <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-display text-[10px] text-primary">
                            {(entry.display_name || "?")[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className={`font-display text-xs tracking-wide truncate block ${
                          isCurrentUser ? "text-primary" : "text-foreground"
                        }`}>
                          {entry.display_name || "Unknown"}
                          {isCurrentUser && " (YOU)"}
                        </span>
                        {tier && (
                          <span className={`text-[8px] font-display tracking-widest ${tier.color} opacity-70`}>
                            {tier.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right shrink-0">
                      <p className={`font-display text-lg ${rank <= 3 ? "text-cyan-300" : rank <= 10 ? "text-yellow-400" : "text-primary"}`}>
                        {entry.score.toLocaleString()}
                      </p>
                      {getSubLabel && (
                        <p className="text-[9px] text-muted-foreground font-display tracking-wider">
                          {getSubLabel(entry)}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-4">
        <p className="text-[10px] text-muted-foreground/60 font-display tracking-widest">
          {gameName} · GLOBAL RANKINGS
        </p>
      </div>
    </div>
  );
};
