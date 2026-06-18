import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * on-session-complete
 * Called from the frontend after a workout session is marked completed.
 * 1. Auto-fills "train" habit for today in daily_habits
 * 2. Generates rich AI coach feedback via Anthropic (no token deduction, system initiated)
 * 3. Creates an AI coach conversation with session review + follow-up question
 * 4. Creates a notification for the user
 *
 * Body: { sessionId: string, userId: string }
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { sessionId, userId } = await req.json();

    if (!sessionId || !userId) {
      return new Response(
        JSON.stringify({ error: "sessionId and userId required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // ─── 1. Auto-fill habit tracker: mark "train" as true for today ───
    const today = new Date().toISOString().slice(0, 10);
    try {
      const { data: existingHabit } = await supabase
        .from("daily_habits")
        .select("id, train")
        .eq("user_id", userId)
        .eq("habit_date", today)
        .maybeSingle();

      if (existingHabit) {
        await supabase
          .from("daily_habits")
          .update({ train: true })
          .eq("id", existingHabit.id);
      } else {
        await supabase
          .from("daily_habits")
          .insert({
            user_id: userId,
            habit_date: today,
            train: true,
            learn_daily: false,
            water: false,
            do_the_hard_thing: false,
            hit_your_numbers: false,
          });
      }
      console.log("Habit auto-fill: train=true for", today);
    } catch (habitErr) {
      console.error("Habit auto-fill failed (non-blocking):", habitErr);
    }

    // ─── 2. Fetch session info ───
    const { data: session } = await supabase
      .from("workout_sessions")
      .select("id, session_type, day_name, program_id, user_id, started_at, ended_at, duration_seconds, notes")
      .eq("id", sessionId)
      .single();

    if (!session) {
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── 3. Fetch exercise logs ───
    const { data: logs } = await supabase
      .from("exercise_logs")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at");

    if (!logs || logs.length === 0) {
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "session_complete_self",
        title: "💪 Session Logged",
        body: "Your workout session has been recorded. Keep building!",
        data: { session_id: sessionId, link: "/programming/my-programmes" },
      });

      return new Response(
        JSON.stringify({ ok: true, skipped: "no exercise logs", habit_updated: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── 4. Fetch user profile for personalised coaching ───
    let userProfile: any = null;
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, fitness_level, training_goal, preferred_name")
        .eq("user_id", userId)
        .maybeSingle();
      userProfile = profile;
    } catch { /* non-blocking */ }

    // ─── 5. Fetch recent session history for comparison ───
    let recentHistory = "";
    try {
      const { data: recentSessions } = await supabase
        .from("workout_sessions")
        .select("id, session_type, day_name, ended_at")
        .eq("user_id", userId)
        .eq("status", "completed")
        .neq("id", sessionId)
        .order("ended_at", { ascending: false })
        .limit(5);

      if (recentSessions && recentSessions.length > 0) {
        // Get logs for recent sessions to compare volume
        const recentIds = recentSessions.map((s: any) => s.id);
        const { data: recentLogs } = await supabase
          .from("exercise_logs")
          .select("session_id, exercise_name, weight_kg, actual_reps, completed")
          .in("session_id", recentIds);

        if (recentLogs && recentLogs.length > 0) {
          const sessionVolumes = new Map<string, { volume: number; exercises: string[] }>();
          for (const log of recentLogs) {
            if (!log.completed) continue;
            const entry = sessionVolumes.get(log.session_id) || { volume: 0, exercises: [] };
            if (log.weight_kg && log.actual_reps) {
              entry.volume += log.weight_kg * log.actual_reps;
            }
            if (!entry.exercises.includes(log.exercise_name)) {
              entry.exercises.push(log.exercise_name);
            }
            sessionVolumes.set(log.session_id, entry);
          }

          const historyLines = recentSessions.map((s: any) => {
            const sv = sessionVolumes.get(s.id);
            const dateStr = s.ended_at ? new Date(s.ended_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "Unknown";
            return `- ${dateStr}: ${s.day_name || s.session_type || "Session"}, ${sv ? `${sv.volume.toFixed(0)}kg volume, ${sv.exercises.length} exercises` : "no data"}`;
          });
          recentHistory = `\nRecent sessions (last 5):\n${historyLines.join("\n")}`;
        }
      }
    } catch { /* non-blocking */ }

    // ─── 6. Build rich session summary ───
    const completedSets = logs.filter((l: any) => l.completed).length;
    const skippedSets = logs.filter((l: any) => !l.completed).length;
    const totalWeight = logs.reduce(
      (sum: number, l: any) =>
        l.completed && l.weight_kg && l.actual_reps
          ? sum + l.weight_kg * l.actual_reps
          : sum,
      0
    );
    const exercises = [...new Set(logs.map((l: any) => l.exercise_name))];
    const painFlags = logs.filter((l: any) => l.pain_flag);

    // RPE analysis
    const rpeValues = logs.filter((l: any) => l.completed && l.rpe).map((l: any) => l.rpe);
    const avgRpe = rpeValues.length > 0
      ? (rpeValues.reduce((a: number, b: number) => a + b, 0) / rpeValues.length)
      : 0;

    // Rep target analysis
    const missedTargets: string[] = [];
    const exceededTargets: string[] = [];
    for (const log of logs) {
      if (!log.completed || !log.target_reps || !log.actual_reps) continue;
      const targetMin = parseInt(String(log.target_reps).split("-")[0]);
      const targetMax = parseInt(String(log.target_reps).split("-").pop() || String(targetMin));
      if (log.actual_reps < targetMin) {
        missedTargets.push(`${log.exercise_name} set ${log.set_number} (${log.actual_reps}/${log.target_reps})`);
      } else if (log.actual_reps > targetMax) {
        exceededTargets.push(`${log.exercise_name} set ${log.set_number} (${log.actual_reps}/${log.target_reps})`);
      }
    }

    // Exercise-by-exercise detail
    const exerciseDetails = exercises.map((name) => {
      const exLogs = logs.filter((l: any) => l.exercise_name === name && l.completed);
      const sets = exLogs.map(
        (l: any) =>
          `  Set ${l.set_number || "?"}: ${l.actual_reps || 0} reps @ ${l.weight_kg || 0}kg${l.rpe ? ` (RPE ${l.rpe})` : ""}${l.pain_flag ? " ⚠️ PAIN" : ""}`
      );
      return `${name}:\n${sets.join("\n")}`;
    });

    // Duration
    const durationMin = session.duration_seconds
      ? Math.round(session.duration_seconds / 60)
      : session.started_at && session.ended_at
        ? Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 60000)
        : null;

    const sessionLabel =
      (session.session_type || "") +
      (session.day_name ? ` (${session.day_name})` : "");

    // ─── 7. Generate AI coach feedback via Anthropic ───
    let aiCoachFeedback = "";
    let conversationId: string | null = null;

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

    if (ANTHROPIC_API_KEY) {
      try {
        const userName = userProfile?.preferred_name || userProfile?.display_name || "mate";
        const fitnessLevel = userProfile?.fitness_level || "unknown";
        const goal = userProfile?.training_goal || "general fitness";

        const prompt = `You are the Unbreakable AI Coach, a knowledgeable, encouraging, Scouse-rooted strength coach. You talk like a real coach: direct, warm, sometimes funny, always pushing people to be better. You're reviewing a just-completed workout session.

USER CONTEXT:
- Name: ${userName}
- Fitness level: ${fitnessLevel}
- Goal: ${goal}

SESSION: ${sessionLabel}
- Duration: ${durationMin ? 

`${durationMin} minutes` : "not recorded"}
- Sets completed: ${completedSets}/${completedSets + skippedSets}${skippedSets > 0 ? ` (${skippedSets} skipped)` : ""}
- Total volume: ${totalWeight > 0 ? `${totalWeight.toFixed(0)}kg` : "bodyweight/no weight logged"}
- Average RPE: ${avgRpe > 0 ? avgRpe.toFixed(1) + "/10" : "not logged"}

EXERCISE BREAKDOWN:
${exerciseDetails.join("\n\n")}

${painFlags.length > 0 ? `\n⚠️ PAIN FLAGGED on: ${painFlags.map((l: any) => `${l.exercise_name} (set ${l.set_number})`).join(", ")}` : ""}
${missedTargets.length > 0 ? `\nMISSED REP TARGETS: ${missedTargets.join(", ")}` : ""}
${exceededTargets.length > 0 ? `\nEXCEEDED REP TARGETS: ${exceededTargets.join(", ")}` : ""}
${recentHistory}
${session.notes ? `\nUser's session notes: "${session.notes}"` : ""}

YOUR TASK:
Write a proper coaching review. NOT just stats, actual analysis. Cover:
1. What they did well and why it matters for their goal
2. Form/technique observations based on weight vs rep patterns (e.g. if weight dropped but reps stayed, good grinding; if reps dropped sharply, maybe too heavy)
3. If pain was flagged, address it seriously with practical advice
4. If they missed or exceeded targets, explain what that means and what to adjust
5. Compare to recent history if available, are they progressing?
6. One specific, actionable coaching tip for their next session

Keep it conversational, like a real coach talking after a session. Use their name. Be encouraging but honest. No bullet points, just natural coaching talk. 4-6 short paragraphs.

**IMPORTANT: End your response with a specific question that invites them to continue the conversation.** Something like asking how a particular exercise felt, whether they want to adjust their programme, how their recovery has been, etc. Make it relevant to what you just reviewed. This is a conversation, not a report.`;

        const aiResp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (aiResp.ok) {
          const aiData = await aiResp.json();
          aiCoachFeedback =
            (aiData.content?.[0]?.text || "Great session, keep pushing!").replace(/\s*[—–-]\s*/g, ', ');
        } else {
          console.error("Anthropic API error:", aiResp.status, await aiResp.text());
          aiCoachFeedback =
            `Solid work today, ${userName}! ${completedSets} sets across ${exercises.length} exercises${totalWeight > 0 ? `, ${totalWeight.toFixed(0)}kg total volume` : ""}. ${painFlags.length > 0 ? `Keep an eye on that ${painFlags[0].exercise_name}, if the pain sticks around, let's talk about swapping it out.` : "Keep building!"}\n\nHow did that session feel overall? Anything you want to adjust for next time?`;
        }
      } catch (aiErr) {
        console.error("AI feedback generation failed:", aiErr);
        aiCoachFeedback =
          `Session logged, ${completedSets} sets across ${exercises.length} exercises. ${totalWeight > 0 ? `${totalWeight.toFixed(0)}kg total volume. ` : ""}Consistency is king, keep showing up!\n\nHow are you feeling after that? Anything you'd change for next time?`;
      }
    } else {
      aiCoachFeedback =
        `Session recorded, ${completedSets} sets across ${exercises.length} exercises${totalWeight > 0 ? `, ${totalWeight.toFixed(0)}kg total volume` : ""}. Nice work!\n\nHow did that feel? Drop me a message if you want to chat about your programme.`;
    }

    // ─── 7b. Auto-save to workout_feedback table (so AIFeedbackView can find it) ───
    try {
      // Parse performance rating from AI text (heuristic)
      const perfRating = avgRpe >= 9 ? 'excellent'
        : avgRpe >= 7 ? 'good'
        : avgRpe >= 5 ? 'average'
        : avgRpe > 0 ? 'below_average'
        : (completedSets / (completedSets + skippedSets) > 0.9 ? 'good' : 'average');

      const fatigueScore = Math.min(10, Math.max(1, Math.round(avgRpe > 0 ? avgRpe : 5)));

      const suggestions: string[] = [];
      if (painFlags.length > 0) suggestions.push(`Monitor pain on ${painFlags.map((l: any) => l.exercise_name).join(', ')}, consider lighter weight or alternative movements.`);
      if (missedTargets.length > 0) suggestions.push(`Missed rep targets on ${missedTargets.length} set(s), consider reducing weight 5-10% next session.`);
      if (exceededTargets.length > 0) suggestions.push(`Exceeded rep targets on ${exceededTargets.length} set(s), ready to increase weight.`);
      if (suggestions.length === 0) suggestions.push('Solid session, stay consistent and keep progressive overloading.');

      await supabase.from('workout_feedback').insert({
        user_id: userId,
        session_id: sessionId,
        feedback_type: 'session',
        content: aiCoachFeedback,
        performance_rating: perfRating,
        fatigue_score: fatigueScore,
        suggestions,
      });
      console.log('Auto-saved workout_feedback for session', sessionId);
    } catch (fbErr) {
      console.error('workout_feedback insert failed (non-blocking):', fbErr);
    }

    // ─── 8. Create AI coach conversation with the feedback ───
    try {
      const { data: convo } = await supabase
        .from("help_conversations")
        .insert({
          user_id: userId,
          title: `Session Review, ${exercises.slice(0, 3).join(", ")}`,
        })
        .select()
        .single();

      if (convo) {
        conversationId = convo.id;

        // User message (session data, natural phrasing)
        const userMsg = `I just finished my ${sessionLabel || "workout"} session. ${completedSets} sets across ${exercises.join(", ")}${totalWeight > 0 ? `. ${totalWeight.toFixed(0)}kg total volume` : ""}${durationMin ? ` in about ${durationMin} minutes` : ""}.${painFlags.length > 0 ? ` Had some pain on ${painFlags.map((l: any) => l.exercise_name).join(", ")}.` : ""}${session.notes ? ` Notes: ${session.notes}` : ""}\n\nHow did I do, coach?`;

        await supabase.from("help_messages").insert({
          conversation_id: convo.id,
          user_id: userId,
          role: "user",
          content: userMsg,
        });

        // AI coach response
        await supabase.from("help_messages").insert({
          conversation_id: convo.id,
          user_id: userId,
          role: "assistant",
          content: aiCoachFeedback,
        });
      }
    } catch (convoErr) {
      console.error("Conversation creation failed (non-blocking):", convoErr);
    }

    // ─── 9. Create notification ───
    // Truncate for notification but make it enticing
    const notifBody = aiCoachFeedback.length > 140
      ? aiCoachFeedback.slice(0, 137) + "..."
      : aiCoachFeedback;

    await supabase.from("notifications").insert({
      user_id: userId,
      type: "ai_session_feedback",
      title: "🔥 Coach Feedback Ready",
      body: notifBody,
      data: {
        session_id: sessionId,
        conversation_id: conversationId,
        link: "/coach",
      },
    });

    // ─── 10. Auto-award PB Cards for EVERY exercise logged ───
    const awardedCards: Array<{ exercise: string; rarity: string; cardId: string }> = [];
    try {
      // Calculate best e1RM per exercise from this session
      const bestByExercise = new Map<string, { e1rm: number; weight: number; reps: number }>();
      for (const log of logs) {
        if (!log.completed || !log.weight_kg || !log.actual_reps) continue;
        const w = Number(log.weight_kg);
        const r = Number(log.actual_reps);
        if (w <= 0 || r <= 0) continue;
        const e1rm = r === 1 ? w : Math.round(w * (1 + r / 30) * 10) / 10;
        const existing = bestByExercise.get(log.exercise_name);
        if (!existing || e1rm > existing.e1rm) {
          bestByExercise.set(log.exercise_name, { e1rm, weight: w, reps: r });
        }
      }

      for (const [exerciseName, { e1rm }] of bestByExercise) {
        try {
          const { data: cardId } = await supabase.rpc("award_pb_card", {
            p_user_id: userId,
            p_activity_category: "lift",
            p_exercise_name: exerciseName,
            p_value: e1rm,
            p_unit: "kg",
            p_rank: 1,
            p_distance_type: null,
            p_source_run_id: null,
            p_source_session_id: sessionId,
          });

          if (cardId) {
            const { data: cardData } = await supabase
              .from("achievement_cards")
              .select("rarity")
              .eq("id", cardId)
              .single();
            awardedCards.push({
              exercise: exerciseName,
              rarity: cardData?.rarity || "bronze",
              cardId,
            });

            // Fire-and-forget AI bio generation
            supabase.functions.invoke("generate-pb-bio", {
              body: { card_id: cardId, exercise_name: exerciseName, pb_value: e1rm, pb_unit: "kg" },
            }).catch(() => {});
          }
        } catch (cardErr) {
          console.error(`PB card award failed for ${exerciseName}:`, cardErr);
        }
      }

      if (awardedCards.length > 0) {
        console.log(`Awarded ${awardedCards.length} PB cards:`, awardedCards.map(c => `${c.exercise} (${c.rarity})`).join(", "));
      }
    } catch (pbErr) {
      console.error("PB card auto-award failed (non-blocking):", pbErr);
    }

    // ─── 11. Schedule 30-min post-session check-in ───
    try {
      const checkinDue = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      await supabase.from("pending_session_checkins").insert({
        user_id: userId,
        session_id: sessionId,
        checkin_due_at: checkinDue,
      });
      console.log("Scheduled 30-min check-in for", checkinDue);
    } catch (checkinErr) {
      console.error("Check-in scheduling failed (non-blocking):", checkinErr);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        conversation_id: conversationId,
        exercises: exercises.length,
        sets: completedSets,
        habit_updated: true,
        feedback_generated: !!aiCoachFeedback,
        pb_cards_awarded: awardedCards.length,
        pb_cards: awardedCards,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("on-session-complete error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
