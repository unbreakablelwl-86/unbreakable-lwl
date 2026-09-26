import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ---------------------------------------------------------------------------
// Marketing & Content AI — READ/DRAFT-ONLY FOUNDATION
//
// This function may only: research, brainstorm, draft, repurpose, and analyse
// already-published performance data. It has NO ability to publish, schedule
// a real post, comment, DM, or spend money. Every content item it creates or
// edits lands in the content_items table in a pre-publish status (idea /
// researching / briefed / draft / review) — never 'published', and never
// written into social_posts directly. A human founder must explicitly
// promote, edit, and schedule anything from here using the existing
// SocialCommandCentre tooling. See
// claude/2026-09-26-marketing-content-ai-report.md for the full design.
//
// Standing founder instruction, absolute unless explicitly changed:
// "DO NOT AUTO-PUBLISH SOCIAL CONTENT."
// ---------------------------------------------------------------------------

const MODES = ["generate_ideas", "create_brief", "draft_content", "repurpose", "analyze_performance"] as const;
type Mode = typeof MODES[number];

const LIVE_FEATURES = `
FEATURES THAT ARE ACTUALLY LIVE TODAY — you may only reference these as available to members:
- Power: AI-or-manual strength programme building, session logging, exercise library, personal records.
- Movement: GPS/manual cardio tracking, AI cardio programmes, doubles as the fitness social feed (kudos/comments/leaderboards).
- Fuel: manual/barcode food logging, AI photo food logging ("Snap & Track"), recipe library, AI meal planning.
- Mindset: guided breathwork, cold/heat exposure protocols, AI mindset programmes, and exactly 4 live mini-games with their in-app brand names — Snake is "HUNT", Alleyway is "SHATTER", Tetris is "STACK", Pattern Breaker is "LOCK IN".
- Unbreakable 86: the 86-day cross-pillar "Daily 7" habit challenge (train, learn, hydrate, hit your numbers, breathwork, sauna-or-cold-shower, journal).
- University: education platform, Levels 2 and 3 live for all paid members, ~2,500 quiz questions. ALWAYS pair any mention of University with the fact that it is NOT an accredited qualification, even though it is written to NVQ standard — never imply certification or accreditation.
- Un-Tunes: 42 original in-house tracks across 3 albums; full streaming on any paid tier (free tier gets 30-second previews).
- Unbreakable Coach: the persistent AI coaching chat. Per brand voice rules below, do not call it a generic "AI Coach" in anything member-facing.
- Community/social feed: posts, kudos, comments, direct messages, Stories, friends/follows.

FEATURES THAT ARE NOT LIVE — never market these as available, current, or something a member can do today:
- The 1-to-1 human coaching / PT marketplace (built, switched off for real clients).
- Un-Tunes collectible cards, packs, or the auction/trading house (built, switched off).
- PB / achievement cards (built, switched off).
- University Level 4 and Sport-specific certificate courses (built, switched off).
- Movement video/form analysis (built, switched off).
- Any of the 7 unused mini-games (Flappy, Flow, Focus Timer, Memory Matrix, Mental Maths, Reaction, Word Chain) — these have no live UI at all.
`.trim();

const PRICING_FACTS = `
PRICING FACTS (source: BUSINESS_BRAIN.md — verify against it before this copy is ever published):
- Foundation tier, shown to members as "Unbreakable": £50/month ("Founding Member" price, was £75, locked for life for anyone who joins at this price). This is the tier to promote.
- Free tier exists (£0) with a single free University chapter and limited access — a reasonable acquisition hook, not the main pitch.
- 7-day free trial via promo code NEWBEGINNING7.
- Do NOT mention the £7/month "Absolute Base" tier in outward marketing — it is a hidden, cancel-flow-only retention offer, not a publicly sold plan.
- Do not invent a discount, guarantee, or refund policy that isn't stated here.
`.trim();

const BRAND_VOICE = `
BRAND VOICE (source: BRAND_GUIDELINES.md — non-negotiable):
- Second-person, direct, blunt, no-nonsense. Talk to "you", never "our users".
- Anti-guru, education-first: understanding replaces dependency. Never write like an influencer promising a shortcut.
- Never overclaim expertise or outcomes. No "guaranteed results", no "the only way", no absolute claims.
- Avoid the word "AI" in anything member-facing where a de-AI'd alternative exists — say "Unbreakable Coach" not "AI Coach", "GET YOUR PLAN" not "CREATE WITH AI", "Coach Feedback" not "AI Feedback".
- UK spelling, £ currency, "Live Without Limits" as a recurring sign-off phrase.
- Recurring vocabulary: "showing up", "keep going", "unbreakable", "no shortcuts", "education first".
- Never invent a customer testimonial, before/after story, quote, or endorsement. If a request implies using a real member's story, refuse that part and say real, consented member content is required and none was supplied — do not fabricate a placeholder "member" quote.
- Never state a statistic, scientific claim, or medical/health claim that isn't explicitly provided to you. If a claim would strengthen the content but you cannot verify it, add it to claims_to_verify instead of stating it as fact.
`.trim();

const BASE_SYSTEM_PROMPT = `
ROLE
You are the Marketing & Content AI foundation for UNBREAKABLE (Live Without Limits) — a research, planning and drafting layer, operating in founder-supervised mode. You produce content ideas, briefs, drafts and repurposed variants. You NEVER publish anything, and everything you produce lands in a pre-publish review state for a human founder to approve, reject, or request changes on.

${LIVE_FEATURES}

${PRICING_FACTS}

${BRAND_VOICE}

OUTPUT FORMAT
You must respond with ONLY a single valid JSON object matching the schema described in the user message. No prose before or after, no markdown code fences.

HARD RULES
- Never invent a qualification, testimonial, customer result, statistic, scientific claim, medical claim, transformation story, or endorsement.
- Only reference product features listed as LIVE above. Never imply a disabled feature is available.
- Always preserve the University "not an accredited qualification" disclaimer whenever University is mentioned.
- If a claim would need evidence you don't have, put it in a "claims_to_verify" array field instead of stating it as fact in the draft copy.
- If the request is impossible to do honestly (e.g. asks for a fabricated testimonial), still return valid JSON, but put an explanation in a "flagged" field and leave the content field minimal/empty rather than inventing something.
`.trim();

interface ContentItemRow {
  id: string;
  title: string;
  content_pillar: string;
  topic: string | null;
  objective: string | null;
  target_audience: string | null;
  format: string;
  status: string;
  brief: Record<string, unknown>;
  draft_content: string | null;
  cta: string | null;
  supporting_product_feature: string | null;
  supporting_educational_concept: string | null;
  source_material: unknown[];
  claims_to_verify: unknown[];
  parent_content_id: string | null;
  ai_generated: boolean;
  generated_by_model: string | null;
  current_version: number;
}

async function callClaude(systemPrompt: string, userPrompt: string, apiKey: string, maxTokens = 2048) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      stream: false,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${errText.slice(0, 500)}`);
  }
  const json = await res.json();
  const text: string = (json.content ?? [])
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("\n")
    .trim();
  return text;
}

function parseJsonLoose(text: string): Record<string, unknown> {
  const cleaned = text.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const svcClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  let requestedBy: string | null = null;
  let mode: Mode | null = null;
  let body: Record<string, unknown> = {};

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - please sign in" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authError } = await supabaseClient.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    requestedBy = (claimsData.claims as { sub: string }).sub;

    const { data: isDev, error: roleError } = await supabaseClient.rpc("has_role", {
      _user_id: requestedBy,
      _role: "dev",
    });
    if (roleError || !isDev) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Marketing & Content AI is founder/dev-only" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const windowStart = new Date(Date.now() - 60_000).toISOString();
    const { count: recentCount } = await svcClient
      .from("marketing_content_ai_audit_log")
      .select("*", { count: "exact", head: true })
      .eq("requested_by", requestedBy)
      .gte("created_at", windowStart);
    if ((recentCount ?? 0) >= 20) {
      return new Response(
        JSON.stringify({ error: "rate_limited", message: "Too many requests. Please wait a moment." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" } }
      );
    }

    body = await req.json();
    mode = body.mode as Mode;
    if (!mode || !MODES.includes(mode)) {
      return new Response(
        JSON.stringify({ error: `mode must be one of: ${MODES.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // -----------------------------------------------------------------
    // analyze_performance — deterministic SQL aggregation, NO LLM call.
    // Numbers come straight from social_posts; no risk of the model
    // inventing or rounding a figure. Causation is never claimed.
    // -----------------------------------------------------------------
    if (mode === "analyze_performance") {
      const days = Math.min(Math.max(Number(body.days) || 90, 1), 365);
      const since = new Date(Date.now() - days * 86_400_000).toISOString();

      const { data: posts, error: postsError } = await supabaseClient
        .from("social_posts")
        .select("content_type, tone, platform, likes, saves, comments_count, shares, reach, impressions, engagement_rate, published_at")
        .not("published_at", "is", null)
        .gte("published_at", since);

      if (postsError) throw new Error(`Failed to read social_posts: ${postsError.message}`);

      const rows = posts ?? [];
      const groupBy = (key: "content_type" | "tone" | "platform") => {
        const groups: Record<string, { count: number; engagement_rate_sum: number; reach_sum: number; has_reach: number }> = {};
        for (const r of rows as Record<string, unknown>[]) {
          const k = String(r[key] ?? "unknown");
          groups[k] ??= { count: 0, engagement_rate_sum: 0, reach_sum: 0, has_reach: 0 };
          groups[k].count += 1;
          if (typeof r.engagement_rate === "number") groups[k].engagement_rate_sum += r.engagement_rate;
          if (typeof r.reach === "number") { groups[k].reach_sum += r.reach; groups[k].has_reach += 1; }
        }
        return Object.entries(groups).map(([key2, g]) => ({
          value: key2,
          published_count: g.count,
          avg_engagement_rate: g.count ? Number((g.engagement_rate_sum / g.count).toFixed(4)) : null,
          avg_reach: g.has_reach ? Math.round(g.reach_sum / g.has_reach) : null,
        })).sort((a, b) => (b.avg_engagement_rate ?? 0) - (a.avg_engagement_rate ?? 0));
      };

      const result = {
        window_days: days,
        total_published_posts_in_window: rows.length,
        sample_size_warning: rows.length < 10
          ? "FACT: fewer than 10 published posts in this window. Any pattern below is CALCULATED from a very small sample and should not be treated as a reliable signal, let alone a causal one."
          : null,
        by_pillar: { label: "FACT — measured averages by content_type, not a causal claim", data: groupBy("content_type") },
        by_tone: { label: "FACT — measured averages by tone preset, not a causal claim", data: groupBy("tone") },
        by_platform: { label: "FACT — measured averages by platform, not a causal claim", data: groupBy("platform") },
        note: "These are observed averages only (FACT/CALCULATED). Nothing here establishes that a pillar, tone, or platform CAUSED higher engagement — other factors (timing, audience reach, topic) are not controlled for.",
      };

      await logAudit(svcClient, {
        requestedBy, mode, input: body, status: "success",
        outputSummary: `Analyzed ${rows.length} published posts over ${days}d`,
        sourcesUsed: ["social_posts (performance columns)"],
      });

      return new Response(JSON.stringify({ result, sources_used: ["social_posts (performance columns)"] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // All remaining modes use Claude for creative drafting.
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("AI service is temporarily unavailable");

    let outputSummary = "";
    let sourcesUsed = ["BRAND_GUIDELINES.md", "FEATURE_STATUS.md", "BUSINESS_BRAIN.md (pricing)"];
    let contentItemId: string | null = null;
    let responsePayload: Record<string, unknown> = {};

    if (mode === "generate_ideas") {
      const pillar = String(body.content_pillar ?? "").trim();
      const topic = String(body.topic ?? "").trim();
      const objective = String(body.objective ?? "").trim();
      const count = Math.min(Math.max(Number(body.count) || 5, 1), 10);

      const userPrompt = `Generate ${count} distinct content ideas.
${pillar ? `Content pillar: ${pillar}` : "Content pillar: your choice, but only from the LIVE features/pillars list."}
${topic ? `Topic focus: ${topic}` : ""}
${objective ? `Objective: ${objective}` : "Objective: your judgement — vary across education, community, and product-feature awareness."}

Respond with ONLY this JSON shape:
{"ideas": [{"title": string, "content_pillar": one of ["power","movement","fuel","mindset","education","un-tunes","transformation","real-talk","community","app-feature","brand-story"], "topic": string, "objective": string, "format": one of ["post","reel","carousel","story","video_script","email_concept","article","discussion_prompt"], "hook": string, "why_now": string}]}`;

      const raw = await callClaude(BASE_SYSTEM_PROMPT, userPrompt, ANTHROPIC_API_KEY);
      const parsed = parseJsonLoose(raw);
      const ideas = (parsed.ideas as Record<string, unknown>[]) ?? [];

      const rowsToInsert = ideas.map((idea) => ({
        title: String(idea.title ?? "Untitled idea"),
        content_pillar: String(idea.content_pillar ?? "app-feature"),
        topic: idea.topic ? String(idea.topic) : null,
        objective: idea.objective ? String(idea.objective) : null,
        format: String(idea.format ?? "post"),
        status: "idea",
        brief: { hook: idea.hook ?? null, why_now: idea.why_now ?? null },
        ai_generated: true,
        generated_by_model: "claude-sonnet-4-6",
        created_by: requestedBy,
      }));

      const { data: inserted, error: insertError } = await supabaseClient
        .from("content_items")
        .insert(rowsToInsert)
        .select("id, title, content_pillar, format, status");
      if (insertError) throw new Error(`Failed to save generated ideas: ${insertError.message}`);

      responsePayload = { ideas: inserted };
      outputSummary = `Generated ${inserted?.length ?? 0} ideas`;
    }

    else if (mode === "create_brief") {
      contentItemId = String(body.content_item_id ?? "");
      if (!contentItemId) throw new Error("content_item_id is required for create_brief");

      const { data: item, error: itemErr } = await supabaseClient
        .from("content_items").select("*").eq("id", contentItemId).maybeSingle();
      if (itemErr || !item) throw new Error("content_item not found or not accessible");
      const row = item as ContentItemRow;

      const userPrompt = `Create a content brief for this idea:
Title: ${row.title}
Pillar: ${row.content_pillar}
Topic: ${row.topic ?? "(not set)"}
Objective: ${row.objective ?? "(not set)"}
Format: ${row.format}
Existing notes: ${JSON.stringify(row.brief)}

Respond with ONLY this JSON shape:
{"brief": {"angle": string, "key_points": string[], "hook_options": string[], "proof_points": string[], "format_notes": string}, "cta": string, "supporting_product_feature": string|null, "supporting_educational_concept": string|null, "claims_to_verify": string[]}`;

      const raw = await callClaude(BASE_SYSTEM_PROMPT, userPrompt, ANTHROPIC_API_KEY);
      const parsed = parseJsonLoose(raw);

      const { data: updated, error: updErr } = await supabaseClient
        .from("content_items")
        .update({
          brief: parsed.brief ?? {},
          cta: parsed.cta ?? null,
          supporting_product_feature: parsed.supporting_product_feature ?? null,
          supporting_educational_concept: parsed.supporting_educational_concept ?? null,
          claims_to_verify: parsed.claims_to_verify ?? [],
          status: "briefed",
        })
        .eq("id", contentItemId)
        .select("id, status, brief")
        .single();
      if (updErr) throw new Error(`Failed to save brief: ${updErr.message}`);

      responsePayload = { content_item: updated };
      outputSummary = `Briefed content item ${contentItemId}`;
    }

    else if (mode === "draft_content") {
      contentItemId = String(body.content_item_id ?? "");
      if (!contentItemId) throw new Error("content_item_id is required for draft_content");

      const { data: item, error: itemErr } = await supabaseClient
        .from("content_items").select("*").eq("id", contentItemId).maybeSingle();
      if (itemErr || !item) throw new Error("content_item not found or not accessible");
      const row = item as ContentItemRow;

      const platform = body.platform ? String(body.platform) : null;
      const userPrompt = `Write the actual draft copy/script for this content item.
Title: ${row.title}
Pillar: ${row.content_pillar}
Format: ${row.format}
${platform ? `Target platform: ${platform}` : ""}
Brief: ${JSON.stringify(row.brief)}
CTA so far: ${row.cta ?? "(none set — propose one)"}

Respond with ONLY this JSON shape:
{"draft_content": string, "cta": string, "claims_to_verify": string[], "flagged": string|null}`;

      const raw = await callClaude(BASE_SYSTEM_PROMPT, userPrompt, ANTHROPIC_API_KEY);
      const parsed = parseJsonLoose(raw);

      const { data: updated, error: updErr } = await supabaseClient
        .from("content_items")
        .update({
          draft_content: parsed.draft_content ?? null,
          cta: parsed.cta ?? row.cta,
          claims_to_verify: parsed.claims_to_verify ?? row.claims_to_verify,
          status: "draft",
        })
        .eq("id", contentItemId)
        .select("id, status, draft_content, cta, claims_to_verify")
        .single();
      if (updErr) throw new Error(`Failed to save draft: ${updErr.message}`);

      responsePayload = { content_item: updated, flagged: parsed.flagged ?? null };
      outputSummary = `Drafted content item ${contentItemId}`;
    }

    else if (mode === "repurpose") {
      contentItemId = String(body.content_item_id ?? "");
      const targetFormats = Array.isArray(body.target_formats) ? (body.target_formats as string[]) : [];
      if (!contentItemId) throw new Error("content_item_id is required for repurpose");
      if (!targetFormats.length) throw new Error("target_formats (array) is required for repurpose");

      const { data: item, error: itemErr } = await supabaseClient
        .from("content_items").select("*").eq("id", contentItemId).maybeSingle();
      if (itemErr || !item) throw new Error("source content_item not found or not accessible");
      const row = item as ContentItemRow;

      const userPrompt = `Repurpose this SOURCE content into ${targetFormats.length} new format(s), preserving the underlying message/hook but adapting tone/length/structure to each format.
SOURCE title: ${row.title}
SOURCE pillar: ${row.content_pillar}
SOURCE draft/content: ${row.draft_content ?? JSON.stringify(row.brief)}
Target formats: ${targetFormats.join(", ")}

Respond with ONLY this JSON shape:
{"variants": [{"format": string, "title": string, "draft_content": string, "cta": string, "claims_to_verify": string[]}]}`;

      const raw = await callClaude(BASE_SYSTEM_PROMPT, userPrompt, ANTHROPIC_API_KEY);
      const parsed = parseJsonLoose(raw);
      const variants = (parsed.variants as Record<string, unknown>[]) ?? [];

      const rowsToInsert = variants.map((v) => ({
        title: String(v.title ?? row.title),
        content_pillar: row.content_pillar,
        topic: row.topic,
        objective: row.objective,
        format: String(v.format ?? "post"),
        status: "draft",
        brief: row.brief,
        draft_content: v.draft_content ? String(v.draft_content) : null,
        cta: v.cta ? String(v.cta) : null,
        claims_to_verify: v.claims_to_verify ?? [],
        parent_content_id: contentItemId,
        ai_generated: true,
        generated_by_model: "claude-sonnet-4-6",
        created_by: requestedBy,
      }));

      const { data: inserted, error: insertError } = await supabaseClient
        .from("content_items")
        .insert(rowsToInsert)
        .select("id, title, format, status, parent_content_id");
      if (insertError) throw new Error(`Failed to save repurposed variants: ${insertError.message}`);

      responsePayload = { variants: inserted };
      outputSummary = `Repurposed ${contentItemId} into ${inserted?.length ?? 0} variants`;
    }

    await logAudit(svcClient, {
      requestedBy, mode, input: body, contentItemId, status: "success",
      outputSummary, sourcesUsed,
    });

    return new Response(JSON.stringify({ ...responsePayload, sources_used: sourcesUsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("marketing-content-ai error:", err);
    const message = err instanceof Error ? err.message : String(err);
    if (requestedBy && mode) {
      await logAudit(svcClient, {
        requestedBy, mode, input: body, status: "error", errorMessage: message,
      });
    }
    return new Response(
      JSON.stringify({ error: "Internal error", detail: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function logAudit(
  svcClient: ReturnType<typeof createClient>,
  opts: {
    requestedBy: string | null;
    mode: string;
    input: Record<string, unknown>;
    contentItemId?: string | null;
    status: "success" | "error";
    outputSummary?: string;
    sourcesUsed?: string[];
    errorMessage?: string;
  }
) {
  return svcClient
    .from("marketing_content_ai_audit_log")
    .insert({
      requested_by: opts.requestedBy,
      mode: opts.mode,
      input: opts.input ?? {},
      content_item_id: opts.contentItemId ?? null,
      output_summary: opts.outputSummary ?? null,
      sources_used: opts.sourcesUsed ?? [],
      model: "claude-sonnet-4-6",
      response_status: opts.status,
      error_message: opts.errorMessage ?? null,
    })
    .select("id")
    .single();
}
