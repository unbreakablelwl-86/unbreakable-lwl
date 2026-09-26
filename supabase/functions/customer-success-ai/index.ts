import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ---------------------------------------------------------------------------
// Customer Success AI — READ-ONLY FOUNDATION (Phase 1)
//
// This function may only: read an authorised, pre-filtered member context
// object and answer factual questions about it. It has NO tool access at
// inference time, NO ability to write to any table, and NO ability to send
// any communication. Every path re-verifies the caller holds the 'dev' role
// before touching a real member's data. See
// claude/2026-09-26-customer-success-ai-report.md for the full design.
// ---------------------------------------------------------------------------

const PRICING_FACTS = `
UNBREAKABLE PRICING & TOKEN FACTS (source: BUSINESS_BRAIN.md, verify against it before quoting externally):
- Free tier: £0/mo. Home hub, profile/timeline, Un-Tunes 30s previews, 1 free University chapter.
- Absolute Base: £7/mo. Hidden — offered only in the cancel/retention flow. Basic AI coach chat + full Un-Tunes streaming.
- Foundation (displayed to members as "Unbreakable"): £50/mo (originally £75, "Founding Member" price locked for life). 1,000 tokens/mo. Unlocks everything: all 4 pillars, University L2/L3, Unbreakable 86, social feed, calculators, exercise library, inbox, full AI coach, manual + AI programme/meal building.
- Legacy grandfathered "Unbreakable Coaching"/"Unbreakable 1-to-1": £59.67/mo or £133/mo (3-month commitments) — not sold to new members, kept for existing subscribers only.
- Free actions (0 tokens): manual tracking, calculators, social feed, habit tracking, exercise library browsing, the one free University chapter, profile/timeline, notifications, messaging, motivation quotes.
- Token top-ups (paid tiers only): £2.50 → 50 tokens, £5.00 → 120 tokens, £10.00 → 250 tokens.
- Members are never shown a raw token number — balance shows as a qualitative fuel gauge (FULL TANK/PLENTY LEFT/RUNNING LOW/NEARLY OUT/EMPTY).
`.trim();

const SYSTEM_PROMPT = `
ROLE
You are the Customer Success AI foundation for UNBREAKABLE (Live Without Limits), operating in a READ-ONLY, FOUNDER-SUPERVISED TEST MODE. You are being used by the founder or a developer to test whether you can answer factual questions about a specific member's product state accurately, safely, and without inventing anything.

WHAT YOU MAY DO
- Answer factual questions about the member described in the MEMBER CONTEXT block below, using only that data.
- Synthesise/summarise multiple context fields into a clear answer.
- Identify observable engagement patterns that are directly supported by the context (e.g. "no product activity recorded in the last 30 days" or "reached Day 13 with one earlier reset").
- Recommend that a human follow up, when appropriate (see ESCALATION below).
- Quote pricing/token facts ONLY from the PRICING FACTS block below.

WHAT YOU MUST NEVER DO
- Never invent, estimate, or guess any fact not present in the MEMBER CONTEXT or PRICING FACTS blocks. If the context field is null, missing, or the "unknown_reason" explains why it can't be known, say plainly that this is not known — do not fill the gap with a plausible-sounding guess.
- Never comment on, infer, or speculate about the member's health, body, mental health, weight, nutrition content, or journal content — this data was deliberately excluded from your context (see "excluded_by_design" in the context) and you must not try to reason around that exclusion.
- Never suggest, approve, or imply a refund, discount, credit, subscription change, cancellation, or any billing action. You have no authority over money.
- Never suggest or imply you can send a message, email, push notification, or any communication to the member. You cannot act — only report and recommend that a human acts.
- Never suggest changing programme progression, scores, habits, or account status.
- Never provide medical, psychological, or safety advice, or make a judgement call about a member's safety or wellbeing.
- Never claim to be a human, and never claim authority you don't have.
- Never answer about any member other than the one in the MEMBER CONTEXT block, even if asked to.

WHEN YOU DON'T KNOW
If the honest answer is "I don't have enough information to determine that," say exactly that (in your own natural words), and name which context field would be needed. Do not soften this into a vague-but-confident-sounding answer.

ESCALATION
If the question or context suggests any of the following, say so plainly and recommend the founder/a human handle it directly, rather than attempting to resolve it yourself: a payment or billing problem, a complaint, a safeguarding or health/safety concern, a refund request, a legal or data-privacy request (e.g. "delete my data", GDPR), a distressed or angry member, or anything outside what you're authorised to do. When you do this, end your reply with a hidden tag on its own line: [ESCALATE:<short-category>] — for example [ESCALATE:billing] or [ESCALATE:safeguarding]. Only include this tag when escalation is genuinely warranted; omit it entirely otherwise. The user will not see this tag.

STYLE
Be direct and factual. Short, clear answers. Cite the specific data point you're using (e.g. "per their U86 enrolment, they're on Day 13"). This is a testing interface for a developer/founder, not a member-facing chat — clarity and traceability matter more than warmth here.

${PRICING_FACTS}
`.trim();

interface MemberContext {
  not_found: boolean;
  [key: string]: unknown;
}

function extractSourcesUsed(context: MemberContext): string[] {
  const sources: string[] = [];
  if (context.member) sources.push("member/profile");
  if (context.account_status) sources.push("account_status (token_balances)");
  if (context.onboarding) sources.push("onboarding (coaching_profiles)");
  const u86 = context.u86 as { enrolled?: boolean } | undefined;
  if (u86?.enrolled) sources.push("u86 (unbreakable86_enrolments/daily_logs)");
  if (context.university) sources.push("university_progress");
  if (context.engagement) sources.push("engagement (workout_sessions/food_logs/posts/notifications)");
  if (context.signals) sources.push("signals (analytics_events)");
  return sources;
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
  let memberUserId: string | null = null;
  let question = "";

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

    // Defense in depth: re-verify dev role here too, before doing any work or
    // spending an LLM call. The database function below independently
    // re-checks this as well and will refuse regardless.
    const { data: isDev, error: roleError } = await supabaseClient.rpc("has_role", {
      _user_id: requestedBy,
      _role: "dev",
    });
    if (roleError || !isDev) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Customer Success AI is founder/dev-only" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Lightweight rate limit: max 20 questions/min per dev, using the audit
    // log itself rather than a new table.
    const windowStart = new Date(Date.now() - 60_000).toISOString();
    const { count: recentCount } = await svcClient
      .from("customer_success_ai_audit_log")
      .select("*", { count: "exact", head: true })
      .eq("requested_by", requestedBy)
      .gte("created_at", windowStart);
    if ((recentCount ?? 0) >= 20) {
      return new Response(
        JSON.stringify({ error: "rate_limited", message: "Too many requests. Please wait a moment." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" } }
      );
    }

    const body = await req.json();
    memberUserId = body.member_user_id;
    question = String(body.question ?? "").slice(0, 4000);

    if (!memberUserId || typeof memberUserId !== "string") {
      return new Response(
        JSON.stringify({ error: "member_user_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!question.trim()) {
      return new Response(
        JSON.stringify({ error: "question is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the authorised, pre-filtered member context. This is the ONLY
    // data source the model sees for this member — it has no other tool or
    // DB access at inference time.
    const { data: context, error: contextError } = await supabaseClient.rpc(
      "get_customer_success_member_context",
      { p_member_user_id: memberUserId }
    );

    if (contextError) {
      await logAudit(svcClient, {
        requestedBy, memberUserId, question, status: "error",
        errorMessage: contextError.message,
      });
      return new Response(
        JSON.stringify({ error: "Failed to load member context", detail: contextError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const memberContext = context as MemberContext;

    if (memberContext.not_found) {
      const answer = "I don't have enough information to determine that — no member account exists with this ID.";
      await logAudit(svcClient, {
        requestedBy, memberUserId, question, status: "success",
        responseText: answer, dataSources: [],
      });
      return new Response(
        JSON.stringify({ answer, escalate: false, sources_used: [], context, audit_logged: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("AI service is temporarily unavailable");
    }

    const fullSystemPrompt = `${SYSTEM_PROMPT}\n\nMEMBER CONTEXT (JSON, the only data you may reference about this member):\n${JSON.stringify(memberContext, null, 2)}`;

    const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: fullSystemPrompt,
        messages: [{ role: "user", content: question }],
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      await logAudit(svcClient, {
        requestedBy, memberUserId, question, status: "error", errorMessage: errText.slice(0, 2000),
      });
      return new Response(
        JSON.stringify({ error: "AI service error", detail: errText.slice(0, 500) }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiJson = await aiResponse.json();
    let rawText: string = (aiJson.content ?? [])
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("\n")
      .trim();

    // Extract the hidden escalation tag, if present, and strip it from the
    // visible answer (same hidden-tag pattern already used by help-chat's
    // [BUILD_PROGRAMME] etc.)
    let escalate = false;
    let escalationReason: string | null = null;
    const escalateMatch = rawText.match(/\[ESCALATE:([a-zA-Z0-9_-]+)\]\s*$/);
    if (escalateMatch) {
      escalate = true;
      escalationReason = escalateMatch[1];
      rawText = rawText.slice(0, escalateMatch.index).trim();
    }

    const sourcesUsed = extractSourcesUsed(memberContext);

    const { data: auditRow } = await logAudit(svcClient, {
      requestedBy, memberUserId, question, status: "success",
      responseText: rawText, dataSources: sourcesUsed,
      escalate, escalationReason,
    });

    return new Response(
      JSON.stringify({
        answer: rawText,
        escalate,
        escalation_reason: escalationReason,
        sources_used: sourcesUsed,
        context,
        audit_id: auditRow?.id ?? null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("customer-success-ai error:", err);
    if (requestedBy) {
      await logAudit(svcClient, {
        requestedBy, memberUserId, question, status: "error",
        errorMessage: err instanceof Error ? err.message : String(err),
      });
    }
    return new Response(
      JSON.stringify({ error: "Internal error", detail: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function logAudit(
  svcClient: ReturnType<typeof createClient>,
  opts: {
    requestedBy: string | null;
    memberUserId: string | null;
    question: string;
    status: "success" | "error";
    responseText?: string;
    dataSources?: string[];
    escalate?: boolean;
    escalationReason?: string | null;
    errorMessage?: string;
  }
) {
  return svcClient
    .from("customer_success_ai_audit_log")
    .insert({
      requested_by: opts.requestedBy,
      member_user_id: opts.memberUserId,
      question: opts.question,
      response_status: opts.status,
      response_text: opts.responseText ?? null,
      data_sources_accessed: opts.dataSources ?? [],
      model: "claude-sonnet-4-6",
      escalation_flag: opts.escalate ?? false,
      escalation_reason: opts.escalationReason ?? null,
      error_message: opts.errorMessage ?? null,
    })
    .select("id")
    .single();
}
