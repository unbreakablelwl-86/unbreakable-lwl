// v2
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const userId = claimsData.claims.sub;

    // Check admin role
    const { data: isAdmin } = await supabase.rpc("is_admin_or_owner", { _user_id: userId });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), { status: 403, headers: corsHeaders });
    }

    const { platform, contentType, tone, context, inspiration, featuredTrack } = await req.json();

    if (!platform || !contentType) {
      return new Response(JSON.stringify({ error: "Platform and content type are required" }), { status: 400, headers: corsHeaders });
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured");

    // ── Time awareness ──
    const now = new Date();
    const ukHour = parseInt(now.toLocaleString("en-GB", { timeZone: "Europe/London", hour: "2-digit", hour12: false }));
    const ukDay = now.toLocaleString("en-GB", { timeZone: "Europe/London", weekday: "long" });
    const ukDate = now.toLocaleDateString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "long", year: "numeric" });

    let timeContext = "";
    if (ukHour >= 5 && ukHour < 9) timeContext = "Early morning — gym o'clock. People are waking up, starting their day, deciding whether to train or hit snooze. Fire them up.";
    else if (ukHour >= 9 && ukHour < 12) timeContext = "Mid-morning — people at work, scrolling on break. Quick, punchy content that makes them think.";
    else if (ukHour >= 12 && ukHour < 14) timeContext = "Lunchtime — meal prep, nutrition content hits hard right now. People choosing what to eat.";
    else if (ukHour >= 14 && ukHour < 17) timeContext = "Afternoon — energy dipping, people need a push. Mindset and motivation content.";
    else if (ukHour >= 17 && ukHour < 20) timeContext = "Evening — post-work gym time. Training content, workout tips, evening session energy.";
    else if (ukHour >= 20 && ukHour < 23) timeContext = "Night — wind down, reflection, next-day planning. Real talk, honest posts, deeper content.";
    else timeContext = "Late night/early hours — raw, unfiltered content. The grinders are still up. Hit them with something real.";

    // ── Fetch top-performing posts for engagement learning ──
    const serviceSupabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    let engagementInsight = "";
    try {
      const { data: topPosts } = await serviceSupabase
        .from("social_posts")
        .select("content_type, tone, platform, engagement_rate, content, likes, shares, comments_count")
        .eq("meta_status", "published")
        .not("engagement_rate", "is", null)
        .order("engagement_rate", { ascending: false })
        .limit(5);

      if (topPosts && topPosts.length > 0) {
        const insights = topPosts.map((p: any) =>
          `• ${p.platform} | ${p.content_type} × ${p.tone || "default"} → ${p.engagement_rate}% ER, ${p.likes || 0} likes, ${p.shares || 0} shares — "${(p.content || "").slice(0, 80)}..."`
        ).join("\n");
        engagementInsight = `\n=== ENGAGEMENT DATA — WHAT'S WORKING ===\nThese are the top-performing posts so far. Learn from what works and lean into similar styles:\n${insights}\n`;
      }
    } catch { /* no engagement data yet — that's fine */ }

    // ── Platform guides ──
    const platformGuides: Record<string, string> = {
      instagram: "Instagram post. Use line breaks for readability. Include 5-10 relevant hashtags at the end. Keep under 2200 chars. Use emojis effectively. Think: would someone save this, share it to their story, or send it to a mate?",
      tiktok: "TikTok caption. Short, punchy, hook-driven. Include 3-5 hashtags. Keep under 300 chars. Speak directly to camera style. First line is the HOOK — make them stop scrolling.",
      facebook: "Facebook post. Conversational, community-focused. Can be longer form. Include a clear call to action. 1-3 hashtags max. Encourage comments and shares.",
      x: "X/Twitter post. Under 280 characters. Punchy and quotable. 1-2 hashtags max. No fluff. Make it retweetable.",
    };

    // ── Tone guides ──
    const toneGuides: Record<string, string> = {
      "scouse-fire": "Full Liverpool energy — fiery, gritty, no-excuses. Like a Scouse PT screaming at you in the best way. SHORT punchy sentences. Power words. Drop in the odd 'la', 'boss', 'sound' naturally — not forced. This is the voice of someone who grew up grafting and won't let you waste your potential.",
      "raw-honest": "Stripped back, vulnerable, brutally honest. Share the hard truths nobody else will. Talk like you're sat in the pub with your best mate at 2am — real, unfiltered, zero pretence. This tone builds trust and loyalty.",
      "coach-mode": "Teaching mode. Clear, structured, actionable. Numbered tips or bullet points. Science-backed where possible. The PT session people pay £50/hr for — given free. Establish authority without being preachy.",
      "challenger": "Direct challenge to the reader. Call them out. 'You said you'd start Monday — it's Thursday mate.' Push them to act, not just consume. Uncomfortable truths that spark action.",
      "uplift": "Uplifting, hopeful, 'you've actually got this' energy. Not toxic positivity — earned optimism. Celebrate the small wins. Remind them how far they've come. Make them feel seen.",
      "banter": "Witty, self-deprecating gym humour. Relatable struggles (meal prep fails, leg day excuses, protein shake disasters). Make them laugh then hit them with a real point. Shareable humour.",
    };

    // ── Content type context ──
    const contentTypeGuides: Record<string, string> = {
      "power": "Strength training content — lifts, progressive overload, resistance training tips, PB celebrations, compound movements. Use 🧱💪 emojis.",
      "movement": "Cardio, running, HIIT, conditioning, daily movement. Use 🏃🔥 emojis. Encourage people to move, however small.",
      "fuel": "Nutrition, meal prep, high-protein recipes, supplements, hydration, macro tracking. Use ⛽🍳 emojis. Practical, not preachy.",
      "mindset": "Mental resilience, discipline over motivation, consistency, self-belief, overcoming setbacks. Use 🧠💪 emojis. Deep and impactful.",
      "education": "University courses, learning, levelling up knowledge, course highlights, quiz teasers. Use 📚🎓 emojis. Show the value of education in fitness.",
      "un-tunes": `Training music, playlists, the soundtrack to the grind. Use 🎵🎧 emojis. The vibe is cassette tapes, raw energy, 'YOU CAN'T BREAK ME' aesthetic.

=== MUSIC GENRES (00s era as anchors, draw broadly) ===
ROCK/METAL: A Day to Remember, Finch, Killswitch Engage, Fall Out Boy, Limp Bizkit, BFMV, Funeral for a Friend, Disturbed, Breaking Benjamin, Three Days Grace, Papa Roach, Linkin Park, System of a Down, Slipknot, Avenged Sevenfold, Underoath, The Used, Senses Fail, Alexisonfire, Atreyu
RAP: MGK, Lil Wayne, Eminem, 50 Cent, DMX, Busta Rhymes, Tech N9ne, Xzibit, Ludacris, Chamillionaire
PUNK/POP-PUNK: Blink-182, Sum 41, Good Charlotte, New Found Glory, The Offspring, Rise Against, Paramore, My Chemical Romance, Green Day
CHILLSTEP/ELECTRONIC: Michael FK, Orbital (Halcyon), Hybrid, Faithless, Zero 7, Bonobo, Ott, Emancipator, Tycho, Boards of Canada — for recovery, mindset, cool-down and deep focus content
FOLK/ACOUSTIC/STORYTELLING: Bob Dylan, Johnny Cash, Woody Guthrie, Jeff Buckley, Damien Rice, Iron & Wine, The Lumineers, Mumford & Sons, City and Colour, Gregory Alan Isakov — raw poetry, acoustic grit, campfire intensity. For real-talk posts, reflective mindset content, and stripped-back motivation

=== CROSS-PILLAR MUSIC THEMES ===
Every genre can map to every pillar — rotate song lyrics, moods and themes across:
• POWER — heavy, aggressive, "one more rep" energy. Screamed vocals, breakdowns, bass drops. Linkin Park "Given Up", Slipknot "Duality", DMX "X Gon Give It To Ya"
• MOVEMENT — pace, rhythm, cardio drive. Uptempo beats, running BPM. Eminem "Lose Yourself", Rise Against "Savior", Chamillionaire "Ridin'"
• FUEL — discipline, preparation, cooking to a soundtrack. Chill vibes or motivational. Michael FK ambient, 50 Cent "In Da Club", Paramore "Still Into You"
• MINDSET — introspective, deep, recovery and reflection. Chillstep, ambient, emotional. Orbital "Halcyon", Linkin Park "Iridescent", The Used "The Taste of Ink", Bonobo "Kerala"

Don't lock any genre to one pillar — blend freely. A chillstep track can be a leg-day cool-down. A metal breakdown can fuel a mindset post about never quitting. Rotate themes each post.

Scouse energy in how you describe the music — not full accent but our tone. Podcast tab coming soon — hype it where natural.`,
      "transformation": "Before/after stories, progress updates, client wins, journey posts. Use 💪⚡ emojis. Real results, real people.",
      "real-talk": "Raw, honest personal stories — struggles, mental health, real life behind the brand. Use 🗣️💯 emojis. Vulnerability builds connection.",
      "community": "Member shoutouts, engagement posts, questions, challenges, community wins. Use 🤝🧡 emojis. Make people feel part of something.",
      "app-feature": "Showcase app features — training programmes, AI coach, calculators, habit tracker, university. Use 📱⚡ emojis. Show, don't tell.",
    };

    // ── Image style guides per content type ──
    const imageStyleGuides: Record<string, string> = {
      "power": "Dark, cinematic gym shot. Heavy weights, chalk dust in the air, dramatic lighting. Bold white/orange text overlay. UNBREAKABLE branding. Think @neurolab._ style — stat/fact post with muscular figure silhouette.",
      "movement": "Dynamic action shot — runner in motion, HIIT mid-rep, urban outdoor training. Motion blur, gritty street setting. Neon orange (#ff6b00) accents. Liverpool cityscape vibes.",
      "fuel": "Clean food photography on dark surface — meal prep containers, high-protein plates, macro breakdown overlay. Moody lighting, steam rising, vibrant food colours against dark background. Orange branded text.",
      "mindset": "Moody atmospheric shot — lone figure, dramatic sky, city at night. Bold quote text overlaid billboard-style. @poetsandquotes_ aesthetic. Dark, contemplative, powerful.",
      "education": "Clean infographic layout on dark background. Numbered list format, anatomical/scientific visuals. @drjohnrusin / @fernmalcolm style. Orange accent colour, clear hierarchy, professional but accessible.",
      "un-tunes": "Retro cassette tape aesthetic — brick wall background, neon orange glow, 'YOU CAN'T BREAK ME' text on cassette label, 'UNBREAKABLE' in brick-textured orange text. Vintage meets modern. Dark, gritty, musical.",
      "transformation": "Split-screen before/after or progress montage. Raw, real photos. @movewithus carousel style. Bold 'THEN vs NOW' text overlay. Inspiring but authentic — not airbrushed.",
      "real-talk": "Grainy, documentary-style. Close-up portrait, moody lighting, urban backdrop. Minimal text — let the image speak. Raw and unpolished on purpose. @poetsandquotes_ billboard aesthetic.",
      "community": "Group training shot, fist bumps, community event. Warm but still dark/moody. Orange accents on hoodies/gear. 'STRONGER TOGETHER' energy. Authentic, not staged.",
      "app-feature": "Dark phone mockup showing the app screen. Neon orange UI elements glowing. @simplifyinai tech announcement style. 'SWIPE FOR MORE' energy. Clean, premium, bold headline text.",
    };

    const systemPrompt = `You are the social media content creator for UNBREAKABLE — a premium fitness & lifestyle coaching platform by Live Without Limits LTD, founded in Liverpool, UK. The platform is bold, no-nonsense, built for people who refuse to stay average.

=== BRAND IDENTITY ===
🧱 Pillar: POWER — Strength, resistance, building physical power
🔥 Pillar: MOVEMENT — Cardio, running, HIIT, daily activity
⛽ Pillar: FUEL — Nutrition, meal prep, supplements
🧠 Pillar: MINDSET — Mental resilience, discipline, psychology
📚 Pillar: EDUCATION — University courses L1-L4 across all pillars
🎵 Pillar: UN-TUNES — Training music, playlists, focus tracks
🧡 Brand colour: Neon orange (#FF5500)
🏙️ Location: Liverpool, UK — born and built here
💬 Tagline: "Keep Showing Up"

=== BRAND EMOJIS — USE THESE AS STANDARD ===
Always use these emojis naturally throughout posts:
🧱 (power/strength/foundation) 💪 (training/effort) 🧡 (brand love/community)
🧠 (mindset/mental) 🏃 (movement/cardio) ⛽ (nutrition/fuel)
🔥 (intensity/fire) ⚡ (energy/transformation) 📚 (education/learning)
🎵 (music/un-tunes) 🎧 (playlists) 💯 (real/authentic)
Use 2-4 per post minimum. Never use random/generic emojis that don't match the brand.

=== BRAND VOICE ===
- Direct, authentic, no-BS. Like a coach who genuinely cares but won't sugarcoat anything.
- British English throughout. Liverpool roots — real, gritty, working-class energy.
- NEVER corporate. NEVER generic. NEVER "Hey guys!" or influencer cringe.
- Scouse phrases used naturally (not forced): "la", "boss", "sound", "dead", "proper", "grafting", "bevvy"
- Founder is autistic & ADHD — diagnosed at 39, turned it into a superpower. Real talk about neurodivergence is welcome.
- Tagline: "Keep Showing Up" — discipline > motivation, always.

=== CURRENT TIME & FLOW ===
Right now it's ${ukDay}, ${ukDate} at approximately ${ukHour}:00 UK time.
${timeContext}
Adapt your content to match this energy. A 6am post should feel different to a 10pm post.

=== HASHTAG STRATEGY ===
ALWAYS include these 3 core hashtags: #Unbreakable #LiveWithoutLimits #KeepShowingUp
Then add 3-7 topic-specific hashtags relevant to the content type and platform.
For Instagram: use 8-12 total hashtags
For TikTok: use 4-6 total hashtags
For Facebook: use 3-5 total hashtags
For X: use 2-3 total hashtags

=== CONTENT STYLE REFERENCES ===
1. @neurolab._ — Bold stat/fact posts, dramatic imagery, dark bg + neon accents
2. @drjamesdinic — Clean quote cards, dark backgrounds, powerful one-liners
3. @movewithus — Before/after transformation carousels, lifestyle comparisons
4. @fernmalcolm — Educational infographics, science-backed, anatomical visuals
5. @poetsandquotes_ — Moody atmospheric photos, billboard/neon text, provocative
6. @drjohnrusin — Clean numbered list posts, credibility-driven, actionable
7. @simplifyinai — Tech/announcement posts, dark bg, neon accents, bold headlines
8. Cassette tape aesthetic — "YOU CAN'T BREAK ME" retro cassette on brick wall, neon orange UNBREAKABLE text (for Un-Tunes content)
9. @growthbyvisuals — PRIMARY content inspiration for Unbreakable. Bold visual storytelling, cinematic fitness content, high-impact reels and carousels. This is the benchmark for our content creation style.

=== APP FEATURES (for app-feature posts) ===
• Personalised training programmes with progressive overload tracking
• Unbreakable Coach — AI fitness coaching (24/7, text-based)
• Macro & calorie calculators with food logging
• Guided breathwork sessions (focus, recovery, stress)
• Habit tracker with streaks and accountability
• Full University — L1 to L4 courses across all 6 pillars with quizzes & certificates
• Un-Tunes — curated training playlists + PODCASTS (coming soon!) — real conversations about fitness, mindset, and the Unbreakable journey
• Social community — Instagram-style feed, follow, share progress
• Coach profiles and 1-2-1 coaching portal
• 20+ downloadable PDF guides (training, nutrition, mindset, recovery)
• Premium tiers: Base £25/mo (75 tokens), Pro £50/mo (200 tokens), Elite £100/mo (500 tokens) — plus Absolute Base at £7/mo (20 tokens) for a taster
• Website: www.unbreakable-lwl.com
${engagementInsight}
=== OUTPUT FORMAT ===
Return ONLY valid JSON (no markdown, no code blocks) with exactly these keys:
{
  "post": "The full post text, ready to copy-paste. Include line breaks, emojis, hashtags — everything.",
  "imagePrompt": "A detailed, specific image generation prompt matching the content. MUST include: dark/moody fitness aesthetic, neon orange (#ff6b00) accents on near-black background, UNBREAKABLE branding text, relevant pillar emoji/icon, gritty urban Liverpool texture. Describe: scene, subject, composition, lighting, typography, mood, and which style reference it follows."
}`;

    const userPrompt = `Create a ${platformGuides[platform] || "social media post."}

Content type: ${contentTypeGuides[contentType] || contentType}
Tone: ${toneGuides[tone] || tone || "motivational"}
${context ? `Topic/context: ${context}` : ""}
${inspiration ? `Style inspiration / reference:\n${inspiration}` : ""}
${featuredTrack ? `\n🎵 FEATURED TRACK FROM UN-TUNES LIBRARY:\nTitle: "${featuredTrack.title}" by ${featuredTrack.artist || 'Unbreakable'}\nGenre: ${featuredTrack.genre}\nDuration: ${Math.floor((featuredTrack.duration || 0) / 60)}:${String((featuredTrack.duration || 0) % 60).padStart(2, '0')}\n\nWeave this track naturally into the post — mention it as the featured training track, workout anthem, or session soundtrack. Reference it by name. This is from our own Un-Tunes music library inside the Unbreakable app.\n` : ""}
Requirements:
- Match the brand voice EXACTLY. Sound like a real Scouse coach, not a marketer.
- Use brand emojis naturally: 🧱💪🧡🧠🏃⛽🔥⚡ (at least 2-4 per post)
- Include core hashtags (#Unbreakable #LiveWithoutLimits #KeepShowingUp) plus topic-specific ones
- Match the time of day energy — it's ${ukHour}:00 on ${ukDay}
- The imagePrompt MUST follow this content type's visual style: ${imageStyleGuides[contentType] || "Dark moody fitness aesthetic with neon orange accents and UNBREAKABLE branding."}
- Make it SHAREABLE — would someone screenshot this, send it to a mate, or save it for later?
- Every post should drive action: follow, visit the app, start training, share, comment

Return ONLY valid JSON with "post" and "imagePrompt" keys. No markdown wrapping.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Top up in workspace settings." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI generation failed");
    }

    const aiData = await response.json();
    const rawContent = aiData.content?.[0]?.text || "";

    // Parse JSON from response (handle possible markdown wrapping)
    let parsed;
    try {
      const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { post: rawContent, imagePrompt: "" };
    }

    return new Response(JSON.stringify({
      post: parsed.post || rawContent,
      imagePrompt: parsed.imagePrompt || "",
      platform,
      contentType,
      tone,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-social-content error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

