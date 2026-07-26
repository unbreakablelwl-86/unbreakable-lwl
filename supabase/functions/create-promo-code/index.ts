import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
const CH = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (d: any, s = 200) => new Response(JSON.stringify(d), { headers: { ...CH, "Content-Type": "application/json" }, status: s });
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CH });
  const sc = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", { auth: { persistSession: false } });
  try {
    const { action } = await req.json();
    if (action === "rls_audit") {
      // Check RLS status on all tables
      const { data } = await sc.rpc("pg_catalog" as any) // won't work, use raw SQL
      // Use direct SQL via service role
      const tables = [
        'profiles', 'email_drip', 'ai_token_balances', 'ai_token_transactions',
        'posts', 'post_media', 'post_kudos', 'comments',
        'conversations', 'messages', 'conversation_participants',
        'follows', 'notifications', 'user_roles',
        'coaching_profiles', 'habits_logs', 'exercise_logs',
        'un_tunes_tracks', 'un_tunes_artists',
        'auction_items', 'auction_bids',
        'achievement_cards', 'university_progress',
        'unbreakable86_enrolments', 'unbreakable86_daily_logs',
        'social_posts', 'course_purchases',
      ];
      
      const results: any[] = [];
      for (const table of tables) {
        try {
          // Try to read 1 row as anon (no auth) - if RLS is on, should get 0 or error
          const { data: rows, error, count } = await sc
            .from(table)
            .select('*', { count: 'exact', head: true });
          results.push({ table, exists: !error, row_count: count, error: error?.message || null });
        } catch (e) {
          results.push({ table, exists: false, error: String(e) });
        }
      }
      return json(results);
    }
    if (action === "pen_test") {
      // Try accessing another user's data with anon key
      const anonClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "");
      const JOHN_ID = "c219f448-c05a-4fe3-ae11-793222b7dced";
      
      const tests: any[] = [];
      // Try reading John's token balance as anon
      const { data: t1, error: e1 } = await anonClient.from("ai_token_balances").select("balance").eq("user_id", JOHN_ID);
      tests.push({ test: "Read John's token balance as anon", blocked: !t1 || t1.length === 0, data_returned: t1?.length || 0, error: e1?.message });
      
      // Try reading all profiles as anon
      const { data: t2, error: e2 } = await anonClient.from("profiles").select("display_name,user_id").limit(5);
      tests.push({ test: "Read profiles as anon", data_returned: t2?.length || 0, error: e2?.message });
      
      // Try reading email_drip as anon
      const { data: t3, error: e3 } = await anonClient.from("email_drip").select("email,user_id").limit(5);
      tests.push({ test: "Read email_drip as anon", blocked: !t3 || t3.length === 0, data_returned: t3?.length || 0, error: e3?.message });
      
      // Try reading notifications as anon
      const { data: t4, error: e4 } = await anonClient.from("notifications").select("*").limit(5);
      tests.push({ test: "Read notifications as anon", blocked: !t4 || t4.length === 0, data_returned: t4?.length || 0, error: e4?.message });
      
      return json(tests);
    }
    return json({ error: "Unknown" }, 400);
  } catch (e) { return json({ error: String(e) }, 500); }
});
