import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ScoreEntry {
  id: string;
  user_id: string;
  score: number;
  max_sequence: number;
  created_at: string;
  display_name?: string;
  avatar_url?: string;
}

export const usePatternBreakerScores = () => {
  const { user } = useAuth();
  const [topScores, setTopScores] = useState<ScoreEntry[]>([]);
  const [userBest, setUserBest] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchScores = useCallback(async () => {
    setLoading(true);
    try {
      const { data: scores, error } = await supabase
        .from("pattern_breaker_scores" as any)
        .select("*")
        .order("score", { ascending: false })
        .limit(20);

      if (error) throw error;

      if (scores && scores.length > 0) {
        const userIds = [...new Set((scores as any[]).map((s) => s.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", userIds);

        const profileMap = new Map(
          (profiles || []).map((p) => [p.user_id, p])
        );

        const enriched = (scores as any[]).map((s) => {
          const profile = profileMap.get(s.user_id);
          return {
            ...s,
            display_name: profile?.display_name || undefined,
            avatar_url: profile?.avatar_url || undefined,
          };
        });

        setTopScores(enriched);
      } else {
        setTopScores([]);
      }

      if (user) {
        const { data: best } = await supabase
          .from("pattern_breaker_scores" as any)
          .select("score")
          .eq("user_id", user.id)
          .order("score", { ascending: false })
          .limit(1)
          .maybeSingle();

        setUserBest((best as any)?.score ?? null);
      }
    } catch (err) {
      console.error("Failed to fetch pattern breaker scores:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveScore = useCallback(
    async (score: number, maxSequence: number) => {
      if (!user) return;

      try {
        const { error } = await supabase.from("pattern_breaker_scores" as any).insert({
          user_id: user.id,
          score,
          max_sequence: maxSequence,
        } as any);

        if (error) throw error;

        if (userBest === null || score > userBest) {
          setUserBest(score);
        }
      } catch (err) {
        console.error("Failed to save pattern breaker score:", err);
        toast.error("Failed to save score");
      }
    },
    [user, userBest]
  );

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  return { topScores, userBest, loading, saveScore, refetch: fetchScores };
};
