/**
 * Token Guard — shared helper for AI edge functions
 *
 * Usage in any AI edge function:
 *
 *   import { requireToken } from "../_shared/token-guard.ts";
 *
 *   // At the start of your handler, after auth:
 *   const guard = await requireToken(serviceClient, userId, "generate-ai-programme");
 *   if (guard.error) {
 *     return new Response(JSON.stringify(guard.error), {
 *       status: 402,
 *       headers: { ...corsHeaders, "Content-Type": "application/json" },
 *     });
 *   }
 *   // guard.remaining has the new balance
 */

import { SupabaseClient } from "npm:@supabase/supabase-js@2.57.2";

/**
 * Token costs per function:
 * - 0.2 tokens: chat, motivation, progression suggestions
 * - 1.0 tokens: programme builds, meal plans, analysis, feedback
 */
const FUNCTION_COSTS: Record<string, number> = {
  "help-chat": 0.2,
  "generate-motivation": 0.2,
  "suggest-movement-progression": 0.2,
  "suggest-power-progression": 0.2,
  "snap-track": 0.5,
  // Everything else defaults to 1.0
};

function getFunctionCost(functionName: string): number {
  return FUNCTION_COSTS[functionName] ?? 1;
}

interface TokenGuardResult {
  error?: {
    code: "insufficient_tokens" | "token_check_failed";
    message: string;
    balance: number;
    required: number;
  };
  remaining: number;
}

export async function requireToken(
  serviceClient: SupabaseClient,
  userId: string,
  functionName: string,
  cost?: number,
  description?: string
): Promise<TokenGuardResult> {
  const actualCost = cost ?? getFunctionCost(functionName);

  const { data: remaining, error } = await serviceClient.rpc("deduct_token", {
    p_user_id: userId,
    p_amount: actualCost,
    p_function_name: functionName,
    p_description: description || `Used ${functionName}`,
  });

  if (error) {
    console.error("Token deduction error:", error);
    // Fail CLOSED: an RPC/DB error must not let the action through for free.
    // Treat this the same as a blocked request so the caller's existing
    // `if (tokenGuard.error)` check trips and the AI action does not proceed
    // without a token being deducted.
    return {
      error: {
        code: "token_check_failed",
        message: "We couldn't verify your AI token balance. Please try again in a moment.",
        balance: 0,
        required: actualCost,
      },
      remaining: 0,
    };
  }

  if (remaining === -1) {
    // Get current balance for error message
    const { data: balance } = await serviceClient
      .from("token_balances")
      .select("balance")
      .eq("user_id", userId)
      .single();

    return {
      error: {
        code: "insufficient_tokens",
        message: `You've used all your AI tokens. Upgrade your plan for more.`,
        balance: balance?.balance ?? 0,
        required: actualCost,
      },
      remaining: 0,
    };
  }

  return { remaining };
}
