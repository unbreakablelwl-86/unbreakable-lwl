import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Trophy, Medal } from "lucide-react";
import { motion } from "framer-motion";

interface ScoreEntry {
  id: string;
  user_id: string;
  score: number;
  theme_shifts: number;
  created_at: string;
  display_name?: string;
  avatar_url?: string;
}

interface AlleywayLeaderboardProps {
  scores: ScoreEntry[];
  userBest: number | null;
  onClose: () => void;
  onRefetch: () => void;
}

export const AlleywayLeaderboard = ({ scores, userBest, onClose, onRefetch }: AlleywayLeaderboardProps) => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-primary" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-muted-foreground" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-primary/70" />;
    return <span className="font-display text-sm text-muted-foreground w-5 text-center">{rank}</span>;
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button onClick={onClose} variant="ghost" size="sm" className="font-display text-xs tracking-wide gap-1">
          <ArrowLeft className="w-4 h-4" /> BACK
        </Button>
        <h2 className="font-display text-2xl text-primary tracking-wide">
          LEADERBOARD
        </h2>
        <Button onClick={onRefetch} variant="ghost" size="icon" className="h-8 w-8">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {userBest !== null && (
        <Card className="bg-primary/10 border-primary/30 p-4 mb-4 text-center border-gray-800 bg-[#111]">
          <p className="font-display text-xs tracking-wider text-muted-foreground">YOUR BEST</p>
          <p className="font-display text-4xl text-primary">{userBest}</p>
        </Card>
      )}

      <div className="space-y-2">
        {scores.length === 0 ? (
          <Card className=" border-border p-8 text-center border-gray-800 bg-[#111]">
            <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-display text-lg text-muted-foreground tracking-wide">NO SCORES YET</p>
            <p className="text-sm text-muted-foreground mt-1">Be the first on the board!</p>
          </Card>
        ) : (
          scores.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className=" border-border hover:border-primary/30 transition-all p-3 border-gray-800 bg-[#111]">
                <div className="flex items-center gap-3">
                  <div className="w-8 flex justify-center">
                    {getRankIcon(index + 1)}
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                      {entry.avatar_url ? (
                        <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-display text-xs text-primary">
                          {(entry.display_name || "?")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="font-display text-sm tracking-wide text-foreground truncate">
                      {entry.display_name || "Unknown"}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl text-primary">{entry.score}</p>
                    {entry.theme_shifts > 0 && (
                      <p className="text-[10px] text-muted-foreground">
                        {entry.theme_shifts} shift{entry.theme_shifts > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
