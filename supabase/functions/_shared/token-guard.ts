/**
 * Token Guard — shared helper for AI edge functions
 *
 * Usage in any AI edge function:
 *
 *   import { requireToken } from "../_shared/token-guard.ts";
 *
 *   // At the start of your handler, after auth:
 *   const guard = await requireToken(serviceClient, userId, "generate-ai-programme", "programme_build");
 *   if (guard.error) {
 *     return new Response(JSON.stringify(guard.error), {
 *       status: 402,
 *       headers: { ...corsHeaders, "Content-Type": "application/json" },
 *     });
 *   }
 *   // guard.remaining has the new balance
 *
 * Pricing source of truth: TOKEN_ACTIONS in src/lib/tokenBurnConfig.ts,
 * mirrored server-side in ./token-actions.ts (see that file's header for
 * why edge functions can't just import src/lib directly). `actionId` must
 * be one of those keys — there is no generic default cost any more. An
 * unknown actionId throws (via getActionCost) rather than silently
 * charging 1.0, so a new AI function that forgets to register its price
 * fails loudly at call time instead of quietly under/over-charging.
 */

import { SupabaseClient } from "npm:@supabase/supabase-js@2.57.2";
import { getActionCost } from "./token-actions.ts";

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
  actionId: string,
  description?: string
): Promise<TokenGuardResult> {
  // Throws on an unknown actionId — see token-actions.ts. This is a
  // deliberate hard failure, not something to catch-and-default here.
  const actualCost = getActionCost(actionId);

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
