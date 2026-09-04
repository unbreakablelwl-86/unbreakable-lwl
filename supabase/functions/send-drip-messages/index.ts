import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const FOUNDER_ID = "c219f448-c05a-4fe3-ae11-793222b7dced"; // John's user ID — same account as founder-welcome's DM

/* ═══════════════════════════════════════════════════════════════════
   THE 7 DRIP MESSAGES — same content arc as the email drip, reworded
   for a real DM from John rather than a formatted email. Short, plain,
   first person, no HTML, no subject lines. Day 0 isn't here — that's
   already sent as the instant welcome DM in founder-welcome.
   ═══════════════════════════════════════════════════════════════════ */

function getMessage(day: number, name: string): string {
  const n = name || "there";

  switch (day) {
  case 1:
    return `Quick one, ${n} — get Unbreakable on your home screen and it opens like a proper app, no download needed. iPhone: open in Safari, tap Share, then "Add to Home Screen". Android: open in Chrome, tap the three dots, then "Add to Home Screen". Two minutes, tops.`;

  case 2:
    return `You've got four main areas in there — Power (workouts), Fuel (nutrition), Movement (cardio) and Mindset (breathing/journaling). Don't try and do all of it at once. Log one thing today, whatever's easiest, and go from there.`;

  case 3:
    return `Have a look at the community tab when you get a sec. It's not like other social feeds — no algorithm, no ads, just people actually training. Post something if you fancy it, even just to say hello.`;

  case 4:
    return `Worth knowing this is in there — the University. Level 2 & 3 courses on training, nutrition and mindset, included with your membership, real content not fluff. No rush, it's there whenever you want to dig in.`;

  case 5:
    return `Give the AI Coach a go if you haven't already. It can build you a full programme, sort a meal plan, or just answer whatever you're wondering about. Your membership includes 1,000 tokens a month to use on it.`;

  case 6:
    return `Set up a few daily habits if you haven't — water, sleep, training, whatever's relevant. Small stuff tracked daily adds up more than people expect.`;

  case 7:
    return `You've been here a week now. However it's gone, you've shown up, and that's most of the battle. Keep going. And give me a shout any time if you need anything — I'm right here.`;

  default:
    throw new Error(`Unknown day_number: ${day}`);
  }
}

/* ═══════════════════════════════════════════════════════════════════
   Find (or create) the 1:1 conversation between John and the user.
   founder-welcome already creates this at signup, so this is normally
   just a lookup — the create path is a fallback for anyone onboarded
   before this existed.
   ═══════════════════════════════════════════════════════════════════ */
async function getOrCreateConversation(userId: string): Promise<string | null> {
  const { data: founderRows } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", FOUNDER_ID);

  const { data: userRows } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", userId);

  const founderConvos = new Set((founderRows || []).map((r) => r.conversation_id));
  const shared = (userRows || []).find((r) => founderConvos.has(r.conversation_id));
  if (shared) return shared.conversation_id;

  const { data: convo, error: convoError } = await supabase
    .from("conversations")
    .insert({})
    .select("id")
    .single();

  if (convoError || !convo) {
    console.error("Conversation create error:", convoError);
    return null;
  }

  await supabase.from("conversation_participants").insert([
    { conversation_id: convo.id, user_id: FOUNDER_ID },
    { conversation_id: convo.id, user_id: userId },
  ]);

  return convo.id;
}

/* ═══════════════════════════════════════════════════════════════════
   HANDLER
   ═══════════════════════════════════════════════════════════════════ */
Deno.serve(async () => {
  try {
    const { data: pending, error: fetchErr } = await supabase
      .from("message_drip")
      .select("id, user_id, day_number")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .order("scheduled_for", { ascending: true })
      .limit(50);

    if (fetchErr) {
      console.error("Fetch error:", fetchErr);
      return new Response(JSON.stringify({ error: fetchErr.message }), { status: 500 });
    }

    if (!pending || pending.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No pending drip messages" }));
    }

    let sent = 0, failed = 0;

    for (const row of pending) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", row.user_id)
          .single();

        const content = getMessage(row.day_number, profile?.display_name || "");
        const conversationId = await getOrCreateConversation(row.user_id);

        if (!conversationId) {
          throw new Error("Could not find or create conversation");
        }

        const { error: insertErr } = await supabase.from("messages").insert({
          conversation_id: conversationId,
          sender_id: FOUNDER_ID,
          content,
        });

        if (insertErr) throw insertErr;

        await supabase
          .from("conversations")
          .update({ last_message_at: new Date().toISOString() })
          .eq("id", conversationId);

        await supabase.from("message_drip").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", row.id);
        sent++;
      } catch (err) {
        await supabase.from("message_drip").update({ status: "failed", error_message: String(err) }).eq("id", row.id);
        failed++;
        console.error(`❌ Day ${row.day_number} → user ${row.user_id}: ${err}`);
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
