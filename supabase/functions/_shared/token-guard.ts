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

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

interface TokenGuardResult {
  error?: {
    code: "insufficient_tokens";
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
  cost: number = 1,
  description?: string
): Promise<TokenGuardResult> {
  const { data: remaining, error } = await serviceClient.rpc("deduct_token", {
    p_user_id: userId,
    p_amount: cost,
    p_function_name: functionName,
    p_description: description || `Used ${functionName}`,
  });

  if (error) {
    console.error("Token deduction error:", error);
    // On DB error, allow through (fail open) to avoid blocking users
    return { remaining: -1 };
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
        required: cost,
      },
      remaining: 0,
    };
  }

  return { remaining };
}
