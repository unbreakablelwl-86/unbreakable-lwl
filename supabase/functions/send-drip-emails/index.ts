import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/* ═══════════════════════════════════════════════════════════════════
   BRAND
   ═══════════════════════════════════════════════════════════════════ */
const B = {
  name: "UNBREAKABLE",
  tag: "Live Without Limits",
  url: "https://www.unbreakable-lwl.com",
  from: "noreply@mail.unbreakable-lwl.com",
  fromName: "UNBREAKABLE",
  o: "#f97316",  // orange
  bg: "#0a0a0a",
  card: "#141414",
  bdr: "#262626",
  tx: "#e5e5e5",
  mt: "#a3a3a3",
};

/* ═══════════════════════════════════════════════════════════════════
   HTML HELPERS
   ═══════════════════════════════════════════════════════════════════ */

function wrap(preheader: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="dark"/><meta name="supported-color-schemes" content="dark"/>
<title>${B.name}</title>
<!--[if mso]><style>body,table,td{font-family:Arial,Helvetica,sans-serif!important}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:${B.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${B.tx};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden">${preheader}&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${B.bg}">
<tr><td align="center" style="padding:24px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto">
<tr><td align="center" style="padding:0 0 24px">
  <a href="${B.url}" style="text-decoration:none">
    <span style="font-size:28px;font-weight:800;letter-spacing:3px;color:${B.o}">${B.name}</span><br/>
    <span style="font-size:10px;letter-spacing:2px;color:${B.mt};text-transform:uppercase">${B.tag}</span>
  </a>
</td></tr>
<tr><td style="background:${B.card};border:1px solid ${B.bdr};border-radius:12px;padding:32px 28px">
${body}
</td></tr>
<tr><td align="center" style="padding:24px 0 0;font-size:11px;color:${B.mt};line-height:1.6">
  <a href="${B.url}" style="color:${B.o};text-decoration:none">${B.name}</a> &middot; Liverpool, UK<br/>
  Built by one person, for real people.<br/>
  <span style="font-size:10px;color:#666">You received this because you signed up at unbreakable-lwl.com</span>
</td></tr>
</table></td></tr></table></body></html>`;
}

const btn = (text: string, href: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0">
<tr><td align="center"><a href="${href}" style="display:inline-block;background:${B.o};color:#fff;font-weight:700;font-size:14px;letter-spacing:1px;text-decoration:none;padding:14px 32px;border-radius:8px;text-transform:uppercase">${text}</a></td></tr></table>`;

const h1 = (t: string) =>
  `<h1 style="margin:0 0 16px;font-size:26px;font-weight:800;letter-spacing:1px;color:${B.tx};line-height:1.2">${t}</h1>`;

const ac = (t: string) => `<span style="color:${B.o};font-weight:700">${t}</span>`;

const hr = () => `<hr style="border:none;border-top:1px solid ${B.bdr};margin:24px 0"/>`;

const feat = (emoji: string, title: string, desc: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px">
<tr><td width="36" valign="top" style="font-size:20px;padding:2px 12px 0 0">${emoji}</td>
<td><strong style="color:${B.tx};font-size:14px">${title}</strong><br/>
<span style="color:${B.mt};font-size:13px;line-height:1.5">${desc}</span></td></tr></table>`;

const p = (t: string) => `<p style="color:${B.mt};font-size:15px;line-height:1.7;margin:0 0 20px">${t}</p>`;
const pb = (t: string) => `<p style="color:${B.tx};font-size:15px;line-height:1.7;margin:0 0 20px">${t}</p>`;
const ps = (t: string) => `<p style="color:${B.mt};font-size:13px;line-height:1.6;margin:0">${t}</p>`;

const step = (num: string, title: string, desc: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px">
<tr><td width="40" valign="top">
  <div style="width:32px;height:32px;border-radius:50%;background:${B.o};color:#fff;font-weight:800;font-size:14px;line-height:32px;text-align:center">${num}</div>
</td><td style="padding:2px 0 0">
  <strong style="color:${B.tx};font-size:14px">${title}</strong><br/>
  <span style="color:${B.mt};font-size:13px;line-height:1.5">${desc}</span>
</td></tr></table>`;

/* ═══════════════════════════════════════════════════════════════════
   8 EMAILS  (Day 0, Day 7)
   ═══════════════════════════════════════════════════════════════════ */

interface Email { subject: string; preheader: string; html: string; }

function getEmail(day: number, name: string): Email {
  const n = name || "there";

  switch (day) {

  /* ── DAY 0: WELCOME ── */
  case 0: return {
    subject: `Welcome to ${B.name}, ${n}`,
    preheader: "You're in. Here's what's actually here.",
    html: wrap("You're in. Here's what's actually here.",
      `${h1(`You're in,<br/>${ac(n)}.`)}
${p(`Right — you're set up, and everything on the platform is unlocked already. No paywall, no trial countdown, nothing held back for later.`)}
${pb(`<strong>Here's what you've got, free, permanently:</strong>`)}
${feat("💪","Power","Full workout tracker with exercise library and session logging")}
${feat("🥗","Fuel","295 recipes, meal logging, nutrition calculators")}
${feat("🏃","Movement & Cardio","Cardio tracking, running logs, movement analysis")}
${feat("🧠","Mindset","Breathing exercises, journaling, mental wellness tools")}
${feat("👥","Community","Social feed, posts, follows, your people")}
${feat("✅","Habits","Daily habit tracker to build consistency")}
${hr()}
${ps(`Over the next week I'll send a short note each day pointing at a different part of the app. Nothing spammy — just making sure you know it's there.`)}
${btn("Open Your Dashboard", `${B.url}/hub`)}`)
  };

  /* ── DAY 1: INSTALL THE APP ── */
  case 1: return {
    subject: "Save Unbreakable to your home screen",
    preheader: "Two minutes, then it opens like an app.",
    html: wrap("Get it on your home screen — two minutes, then it opens like any other app.",
      `${h1(`Get it on your<br/>${ac("home screen")}.`)}
${p(`Unbreakable works as a full app on your phone — no App Store, no download, no storage taken up. Add it to your home screen and it opens like anything else you use daily.`)}
${pb(`<strong>Takes about two minutes:</strong>`)}

<!-- iOS Instructions -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background:${B.bg};border:1px solid ${B.bdr};border-radius:8px;padding:20px">
<tr><td>
  <strong style="color:${B.o};font-size:12px;letter-spacing:2px;text-transform:uppercase">iPhone / iPad (Safari)</strong>
  <div style="height:12px"></div>
  ${step("1","Open in Safari","Make sure you're using Safari, not Chrome or another browser. Go to <strong style='color:${B.tx}'>unbreakable-lwl.com</strong>")}
  ${step("2","Tap the Share button","The square icon with the arrow pointing up, at the bottom of Safari")}
  ${step("3","Scroll down and tap \"Add to Home Screen\"","Give it a name (or keep UNBREAKABLE) and tap Add")}
</td></tr></table>

<!-- Android Instructions -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background:${B.bg};border:1px solid ${B.bdr};border-radius:8px;padding:20px">
<tr><td>
  <strong style="color:${B.o};font-size:12px;letter-spacing:2px;text-transform:uppercase">Android (Chrome)</strong>
  <div style="height:12px"></div>
  ${step("1","Open in Chrome","Go to <strong style='color:${B.tx}'>unbreakable-lwl.com</strong> in Chrome")}
  ${step("2","Tap the menu","The three dots in the top-right corner")}
  ${step("3","Tap \"Add to Home Screen\" or \"Install App\"","Chrome might also show an install banner automatically")}
</td></tr></table>

${pb(`<strong>What you get:</strong>`)}
${feat("⚡","Instant access","Opens full-screen, no browser bars, feels like a native app")}
${feat("📱","Home screen icon","UNBREAKABLE icon sits right alongside your other apps")}
${feat("🔔","Always up to date","No app store updates needed, always the latest version")}
${feat("💾","Zero storage","Doesn't take up phone storage like a regular app")}
${hr()}
${ps(`Once it's added, you won't need to type the URL again. One tap and you're in.`)}
${btn("Open Unbreakable Now", B.url)}`)
  };

  /* ── DAY 2: YOUR TOOLKIT ── */
  case 2: return {
    subject: "Power, Fuel, Movement, Mindset",
    preheader: "Four pillars, one system.",
    html: wrap("Four pillars, one system.",
      `${h1(`Four pillars.<br/>${ac("One system.")}`)}
${p(`Unbreakable's built around four core areas. You don't need to use all of them at once — they're designed to work together over time.`)}
${feat("💪","Power","Log workouts, browse 290+ exercises with video demos, track sets/reps/weight. Build your training history.")}
${feat("🥗","Fuel","Log meals, scan barcodes, browse 295 chef-quality recipes. Understand what you're eating and why.")}
${feat("🏃","Movement","Track cardio sessions, running routes, swimming, cycling, anything that gets you moving.")}
${feat("🧠","Mindset","Guided breathing, journaling prompts, and wellness check-ins. Your head matters as much as your body.")}
${hr()}
${pb(`<strong>Quick one for today:</strong> log a single thing. A workout, a meal, two minutes of breathing. Starting is the point, not doing it perfectly.`)}
${btn("Log Your First Session", `${B.url}/hub`)}`)
  };

  /* ── DAY 3: COMMUNITY ── */
  case 3: return {
    subject: "You're not doing this on your own",
    preheader: "Real people, no algorithm pushing content at you.",
    html: wrap("Real people, no algorithm pushing content at you.",
      `${h1(`This isn't<br/>${ac("social media.")}`)}
${p(`There's a feed here, but it's not built to keep you scrolling. No algorithm chasing engagement, no ads, no promoted posts, nothing pushing you to perform for likes.`)}
${pb(`<strong>It's just people sharing where they're actually at.</strong>`)}
${feat("📝","Post Updates","Share workouts, meals, wins, off days, whatever's true that day. Hashtags and mentions work if you want them.")}
${feat("🤝","Follow People","Find people training the way you are. Build your circle.")}
${feat("💬","Comment & Support","Say something real when someone shows up. That's most of what keeps people going.")}
${feat("🔒","Your Privacy","You control who sees your profile. Share what you're comfortable with, nothing more.")}
${hr()}
${pb(`<strong>Quick one:</strong> post something today. Doesn't need to be a transformation, just say you're here.`)}
${btn("Visit the Community", `${B.url}/community`)}`)
  };

  /* ── DAY 4: UNIVERSITY ── */
  case 4: return {
    subject: "Learn how your body actually works",
    preheader: "19 courses, real content, study at your own pace.",
    html: wrap("19 courses, real content, study at your own pace.",
      `${h1(`The ${ac("University")}.`)}
${p(`This is the part of Unbreakable most people miss at first. Proper course content, anatomy, nutrition science, programming, sport-specific training, psychology, broken into pieces you can actually get through.`)}
${pb(`<strong>19 courses across 4 disciplines:</strong>`)}
${feat("🏋️","Power (L2–L4)","Exercise science, programming, strength & conditioning")}
${feat("🥗","Fuel (L2–L4)","Nutrition science, meal planning, dietary analysis")}
${feat("🧠","Mindset (L2–L4)","Psychology, behaviour change, mental performance")}
${feat("⚽","Sport (10 courses)","Football, boxing, rugby, running, swimming, MMA, cycling, tennis, basketball, cricket")}
${ps(`Each course has chapter content, quizzes at an 80% pass mark, unit assessments, and a final exam. Get through all of them and you've earned the certificate.`)}
${hr()}
${ps(`Courses unlock with Unbreakable Tokens, or a bundle if that works out better for you. Either way, you end up actually understanding your own body.`)}
${btn("Browse the University", `${B.url}/university`)}`)
  };

  /* ── DAY 5: AI COACH ── */
  case 5: return {
    subject: "Meet your Unbreakable Coach",
    preheader: "Built into the app, there when you need it.",
    html: wrap("Built into the app, there when you need it.",
      `${h1(`Your training partner<br/>${ac("is built in.")}`)}
${p(`The Unbreakable Coach isn't a chatbot bolted onto the app. It's built to actually know training, nutrition, and programming, and it talks like a coach, not a script.`)}
${pb(`<strong>What it can do:</strong>`)}
${feat("📋","Build Programmes","Full training programmes shaped around your goals, experience, and what equipment you've actually got")}
${feat("🍽️","Create Meal Plans","Nutrition plans based on your targets and what you'll actually eat")}
${feat("💬","Answer Questions","Ask it anything, training, nutrition, recovery, technique. No daft question.")}
${feat("📊","Read Your Progress","Feedback on your training and where it's actually heading")}
${hr()}
${ps(`It runs on Unbreakable Tokens. You get 5 free to try it properly. A quick question costs 0.2, building a full programme costs 1.`)}
${btn("Talk to the Coach", `${B.url}/ai-coach`)}`)
  };

  /* ── DAY 6: TRACKING & TOOLS ── */
  case 6: return {
    subject: "What gets tracked gets improved",
    preheader: "Habits, photos, calculators, the boring stuff that works.",
    html: wrap("Habits, photos, calculators, the boring stuff that works.",
      `${h1(`Track what<br/>${ac("actually matters.")}`)}
${p(`Consistency beats intensity, every time. These tools exist to help you build the habits that actually move things, not to give you more numbers to stare at.`)}
${feat("✅","Habit Tracker","Set your daily habits, water, sleep, training, stretching, and tick them off. Watch the streak build.")}
${feat("📸","Progress Photos","A private timeline. Same pose, different dates. Photos don't lie to you the way the mirror can.")}
${feat("📏","Body Measurements","Track weight and measurements over time, not just one moment.")}
${feat("🧮","Calculators","TDEE, BMR, macros, 1RM, BMI, all built in, no ads, no upsells.")}
${feat("🎮","Games","Snake, Tetris, Alleyway, with leaderboards. Sometimes you just need five minutes off.")}
${hr()}
${pb(`<strong>Quick one:</strong> set up three daily habits. Keep them simple. Tick them off tomorrow morning.`)}
${btn("Set Up Your Habits", `${B.url}/habits`)}`)
  };

  /* ── DAY 7: THE CLOSE ── */
  case 7: return {
    subject: "One week in, that's the whole thing",
    preheader: "Not perfect. Just still here.",
    html: wrap("Not perfect. Just still here.",
      `${h1(`Still here?<br/>${ac("Good.")}`)}
${p(`It's been a week since you joined. Whether you've been through everything or barely started, it doesn't matter much right now. You showed up. That's the part that actually counts.`)}

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px">
<tr><td style="border-left:3px solid ${B.o};padding:16px 20px;background:${B.bg};border-radius:0 8px 8px 0">
  <p style="margin:0;font-size:16px;font-weight:700;color:${B.tx};line-height:1.5">
    Keep showing up. Not perfectly. Not every day. Just again.
  </p>
</td></tr></table>

${pb(`<strong>Here's what you've got:</strong>`)}
${feat("💪","Full fitness toolkit","Training, nutrition, cardio, mindset, all free, permanently")}
${feat("👥","A real community","No algorithm, no ads, just people who get it")}
${feat("🎓","University courses","Real education, so you understand your own body instead of just following instructions")}
${feat("🤖","The Coach","Your training partner, whenever you actually need it")}
${hr()}
${p(`This is the last onboarding email. From here it's your own pace. Use what's useful, skip what isn't, ask when you're stuck.`)}
${pb(`<strong>Welcome to Unbreakable. Keep showing up.</strong>`)}
${btn("Open Unbreakable", `${B.url}/hub`)}`)
  };

  default:
    throw new Error(`Unknown day_number: ${day}`);
  }
}

/* ═══════════════════════════════════════════════════════════════════
   SEND VIA RESEND
   ═══════════════════════════════════════════════════════════════════ */
async function sendEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  if (!RESEND_API_KEY) return { ok: false, error: "RESEND_API_KEY not set" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: `${B.fromName} <${B.from}>`, to: [to], subject, html }),
  });

  if (res.ok) return { ok: true };
  return { ok: false, error: `Resend ${res.status}: ${await res.text()}` };
}

/* ═══════════════════════════════════════════════════════════════════
   HANDLER
   ═══════════════════════════════════════════════════════════════════ */
Deno.serve(async () => {
  try {
    const { data: pending, error: fetchErr } = await supabase
      .from("email_drip")
      .select("id, user_id, email, day_number")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .order("scheduled_for", { ascending: true })
      .limit(50);

    if (fetchErr) {
      console.error("Fetch error:", fetchErr);
      return new Response(JSON.stringify({ error: fetchErr.message }), { status: 500 });
    }

    if (!pending || pending.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No pending emails" }));
    }
    let sent = 0, failed = 0;

    for (const row of pending) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", row.user_id)
        .single();

      try {
        const email = getEmail(row.day_number, profile?.display_name || "");
        const result = await sendEmail(row.email, email.subject, email.html);

        if (result.ok) {
          await supabase.from("email_drip").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", row.id);
          sent++;
        } else {
          await supabase.from("email_drip").update({ status: "failed", error_message: result.error }).eq("id", row.id);
          failed++;
          console.error(`❌ Day ${row.day_number} → ${row.email}: ${result.error}`);
        }
      } catch (err) {
        await supabase.from("email_drip").update({ status: "failed", error_message: String(err) }).eq("id", row.id);
        failed++;
      }
    }

    return new Response(JSON.stringify({ sent, failed, total: pending.length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Handler error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
