import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
const CH = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (d: any, s = 200) => new Response(JSON.stringify(d), { headers: { ...CH, "Content-Type": "application/json" }, status: s });
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CH });
  try {
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    const { action, imageBase64 } = await req.json();

    if (action === "upload_hero") {
      const bytes = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0));
      const { data, error } = await serviceClient.storage
        .from("site-assets")
        .upload("misc/jj-hero-welcome.webp", bytes, {
          contentType: "image/webp",
          upsert: true,
        });
      if (error) return json({ error: error.message }, 500);
      const { data: urlData } = serviceClient.storage.from("site-assets").getPublicUrl("misc/jj-hero-welcome.webp");
      return json({ path: data?.path, url: urlData?.publicUrl });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) { return json({ error: String(e) }, 500); }
});
