import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Un-Tunes per-track/album/bundle token purchases — REMOVED (JJ, Sept 2026).
 *
 * Decision: paying members get all Un-Tunes tracks unlocked as part of their
 * subscription; there is no separate token purchase for individual tracks, albums,
 * or bundles any more. This function is kept in place (rather than deleted outright)
 * as a deliberately-disabled stub so any stray caller gets a clear, typed error
 * instead of a 404/silent failure, and so the historical implementation stays
 * available via git history if ever needed for reference.
 *
 * This does NOT touch existing data: `un_tunes_purchases` and `un_tunes_user_cards`
 * rows from real past purchases are untouched — members keep whatever cards they
 * already own. Only the ability to make new purchases through this endpoint is
 * disabled. The Un-Tunes collectible-card economy itself (packs, rarity, etc.) is a
 * separate, still-built-but-flagged-off feature (`FEATURES.untunesCards`) with its own
 * pending founder go/no-go — see claude/DO_NOT_AUTOMATE_YET.md #9 and
 * claude/PRE_LAUNCH_ROADMAP.md.
 */
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  return new Response(
    JSON.stringify({
      error: "gone",
      message:
        "Un-Tunes track/album/bundle purchases have been removed. All tracks are included for paying members.",
    }),
    {
      status: 410,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
