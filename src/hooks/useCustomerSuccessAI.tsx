import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CustomerSuccessAIResult {
  answer: string;
  escalate: boolean;
  escalation_reason: string | null;
  sources_used: string[];
  context: Record<string, unknown>;
  audit_id: string | null;
}

export interface CustomerSuccessAITurn {
  question: string;
  result?: CustomerSuccessAIResult;
  error?: string;
  askedAt: string;
}

/**
 * Founder-only, read-only Customer Success AI testing hook.
 *
 * Calls the `customer-success-ai` edge function, which independently
 * re-verifies dev-role access and returns a factual answer scoped to exactly
 * one member's authorised (SAFE-classified) context, never raw table data.
 */
export function useCustomerSuccessAI() {
  const [turns, setTurns] = useState<CustomerSuccessAITurn[]>([]);
  const [loading, setLoading] = useState(false);

  const ask = useCallback(async (memberUserId: string, question: string) => {
    setLoading(true);
    const askedAt = new Date().toISOString();
    try {
      const { data, error } = await supabase.functions.invoke('customer-success-ai', {
        body: { member_user_id: memberUserId, question },
      });

      if (error) {
        const turn: CustomerSuccessAITurn = { question, askedAt, error: error.message };
        setTurns((prev) => [...prev, turn]);
        return turn;
      }

      const turn: CustomerSuccessAITurn = { question, askedAt, result: data as CustomerSuccessAIResult };
      setTurns((prev) => [...prev, turn]);
      return turn;
    } catch (err) {
      const turn: CustomerSuccessAITurn = {
        question,
        askedAt,
        error: err instanceof Error ? err.message : 'Failed to reach Customer Success AI',
      };
      setTurns((prev) => [...prev, turn]);
      return turn;
    } finally {
      setLoading(false);
    }
  }, []);

  const flagFeedback = useCallback(
    async (auditId: string, rating: 'correct' | 'incorrect', note?: string) => {
      try {
        await supabase
          .from('customer_success_ai_audit_log')
          .update({
            human_feedback: {
              rating,
              note: note ?? null,
              at: new Date().toISOString(),
            },
          })
          .eq('id', auditId);
        return true;
      } catch (err) {
        console.error('Failed to save feedback:', err);
        return false;
      }
    },
    []
  );

  const clear = useCallback(() => setTurns([]), []);

  return { turns, loading, ask, flagFeedback, clear };
}
