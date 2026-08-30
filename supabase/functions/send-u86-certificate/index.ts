import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

/**
 * UNBREAKABLE 86 — Certificate email
 * Fired once (fire-and-forget from useUnbreakable86.tsx) the moment an
 * enrolment first crosses day 86. Idempotent on certificate_sent_at so a
 * retry, a slow client, or the tracker continuing past day 86 never sends
 * a second copy.
 */
serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authError } = await authClient.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized - Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = (claimsData.claims as any).sub as string;

    const { enrolment_id } = await req.json();
    if (!enrolment_id) {
      return new Response(JSON.stringify({ error: "enrolment_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: enrolment, error: fetchError } = await supabase
      .from("unbreakable86_enrolments")
      .select("id, user_id, start_date, completed_at, reset_count, certificate_sent_at")
      .eq("id", enrolment_id)
      .maybeSingle();

    if (fetchError || !enrolment) {
      return new Response(JSON.stringify({ error: "Enrolment not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only the enrolment's own owner can trigger their certificate email.
    if (enrolment.user_id !== callerId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Idempotency — never send twice for the same completed run.
    if (enrolment.certificate_sent_at || !enrolment.completed_at) {
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: authData } = await supabase.auth.admin.getUserById(callerId);
    const userEmail = authData?.user?.email;
    const displayName =
      authData?.user?.user_metadata?.full_name ||
      authData?.user?.user_metadata?.display_name ||
      "Athlete";

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey && userEmail) {
      const completedDate = new Date(enrolment.completed_at).toLocaleDateString("en-GB", {
        day: "2-digit", month: "long", year: "numeric",
      });
      const startDate = new Date(enrolment.start_date).toLocaleDateString("en-GB", {
        day: "2-digit", month: "long", year: "numeric",
      });
      const resetLine = enrolment.reset_count > 0
        ? `<p style="color:#a3a3a3;font-size:13px;margin:0 0 20px">Reset ${enrolment.reset_count} time${enrolment.reset_count > 1 ? "s" : ""} along the way — still finished. That's the whole point.</p>`
        : "";

      const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="dark"/>
<title>UNBREAKABLE 86</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e5e5e5;-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden">You did all 86 days. Your Platinum certificate is ready.&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a">
<tr><td align="center" style="padding:24px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto">
<tr><td align="center" style="padding:0 0 24px">
  <a href="https://www.unbreakable-lwl.com" style="text-decoration:none">
    <span style="font-size:28px;font-weight:800;letter-spacing:3px;color:#f97316">UNBREAKABLE</span><br/>
    <span style="font-size:10px;letter-spacing:2px;color:#a3a3a3;text-transform:uppercase">Live Without Limits</span>
  </a>
</td></tr>
<tr><td style="background:#141414;border:1px solid #262626;border-radius:12px;padding:32px 28px">
  <p style="text-align:center;font-size:40px;margin:0 0 8px">🏆</p>
  <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;letter-spacing:1px;color:#e5e5e5;line-height:1.2;text-align:center">
    86 days. Done, <span style="color:#f97316">${displayName}</span>.
  </h1>
  <p style="text-align:center;font-size:12px;letter-spacing:2px;color:#c0c8e0;text-transform:uppercase;margin:0 0 20px">✦ Platinum Tier ✦</p>
  <p style="color:#a3a3a3;font-size:15px;line-height:1.7;margin:0 0 16px">
    Power, Movement, Fuel, Mindset and Education — every day, all the way through. ${startDate} to ${completedDate}. That's not luck, that's showing up.
  </p>
  ${resetLine}
  <p style="color:#e5e5e5;font-size:15px;line-height:1.7;margin:0 0 20px">
    Your Platinum certificate is waiting in the app — and your tracker doesn't stop here. It keeps counting every day you keep showing up, and only resets if you actually miss one.
  </p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center"><a href="https://www.unbreakable-lwl.com/unbreakable-86" style="display:inline-block;background:#f97316;color:#fff;font-weight:700;font-size:14px;letter-spacing:1px;text-decoration:none;padding:14px 32px;border-radius:8px;text-transform:uppercase">VIEW YOUR CERTIFICATE</a></td></tr>
  </table>
</td></tr>
<tr><td align="center" style="padding:24px 0 0;font-size:11px;color:#a3a3a3;line-height:1.6">
  <a href="https://www.unbreakable-lwl.com" style="color:#f97316;text-decoration:none">UNBREAKABLE</a> &middot; Liverpool, UK<br/>
  Built by one person, for real people.
</td></tr>
</table></td></tr></table></body></html>`;

      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "UNBREAKABLE <noreply@mail.unbreakable-lwl.com>",
            to: [userEmail],
            subject: `🏆 You completed UNBREAKABLE 86, ${displayName}`,
            html,
          }),
        });
        if (!res.ok) {
          console.error("U86 certificate email failed:", JSON.stringify(await res.json()));
        }
      } catch (emailErr) {
        console.error("U86 certificate email error (non-critical):", emailErr);
      }
    } else if (!resendKey) {
      console.error("RESEND_API_KEY not set, skipping U86 certificate email");
    }

    // Mark sent regardless of email outcome above — the certificate itself is
    // still viewable in-app either way, and this must never fire twice.
    await supabase
      .from("unbreakable86_enrolments")
      .update({ certificate_sent_at: new Date().toISOString() })
      .eq("id", enrolment_id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-u86-certificate error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
