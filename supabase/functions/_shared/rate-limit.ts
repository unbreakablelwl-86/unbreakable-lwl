/**
 * Rate Limiter — shared helper for AI edge functions
 * 
 * Uses a lightweight in-memory approach with Supabase as fallback.
 * Limits: 30 requests per minute per user for AI functions.
 * 
 * Usage:
 *   import { checkRateLimit } from "../_shared/rate-limit.ts";
 *   
 *   const limited = await checkRateLimit(serviceClient, userId, "help-chat");
 *   if (limited) {
 *     return new Response(JSON.stringify({ error: "rate_limited", message: "Too many requests. Please wait a moment." }), {
 *       status: 429,
 *       headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" },
 *     });
 *   }
 */

import { SupabaseClient } from "npm:@supabase/supabase-js@2.57.2";

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS: Record<string, number> = {
  "help-chat": 30,
  "generate-ai-programme": 5,
  "generate-program": 5,
  "generate-meal-plan": 5,
  "generate-cardio-program": 5,
  "generate-mindset-programme": 5,
  "analyze-movement": 10,
  "analyze-nutrition": 10,
  "snap-track": 20,
  "generate-workout-feedback": 10,
  "generate-motivation": 20,
  "suggest-movement-progression": 15,
  "suggest-power-progression": 15,
  "generate-social-content": 10,
  "generate-untunes-card-bio": 10,
  "generate-pb-bio": 10,
  "daily-autofill": 10,
  "on-session-complete": 10,
};

function getMaxRequests(functionName: string): number {
  return MAX_REQUESTS[functionName] ?? 10;
}

/**
 * Check if a user has exceeded their rate limit for a function.
 * Uses token_transactions table as a lightweight rate check
 * (transactions are already logged by token-guard).
 * Returns true if rate limited, false if ok.
 */
export async function checkRateLimit(
  serviceClient: SupabaseClient,
  userId: string,
  functionName: string
): Promise<boolean> {
  const maxReqs = getMaxRequests(functionName);
  const windowStart = new Date(Date.now() - WINDOW_MS).toISOString();

  const { count, error } = await serviceClient
    .from("token_transactions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("function_name", functionName)
    .gte("created_at", windowStart);

  if (error) {
    // Fail open — don't block users on DB errors
    console.error("Rate limit check error:", error);
    return false;
  }

  return (count ?? 0) >= maxReqs;
}
