import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// JJ voice — George, a free/standard (premade) ElevenLabs male voice: warm,
// deep, British. Not a workspace-library or cloned voice — a generic
// catalog voice included with every ElevenLabs account, per JJ's request.
const VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";

/* Cache generated audio by a hash of the exact text in the public
 * "tts-cache" storage bucket. Cardio and breathing cues in particular are
 * drawn from a small set of repeated template phrases ("One kilometre.
 * Nice and steady.", "Breathe in...") spoken constantly across every user's
 * every session — without this, moving those off the free on-device voice
 * and onto ElevenLabs would bill the same phrase over and over, for every
 * user, forever. With it, the whole userbase shares one cached file per
 * distinct phrase, generated once. */

// TEMPORARY diagnostic: best-effort log of the exact upstream failure into
// a private debug table, so the real cause is visible even though the
// project's log query backend has been failing. Never blocks the response.
async function logDebug(storageClient: ReturnType<typeof createClient>, stage: string, status: number | null, detail: string) {
  try {
    await storageClient.from("_tts_debug_log").insert({ stage, status, detail: detail.slice(0, 4000) });
  } catch (_e) {
    // best-effort
  }
}

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized — invalid session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (text.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Text too long (max 5000 chars)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Check the shared cache before paying ElevenLabs for this text again ──
    const cacheKey = `${await sha256Hex(text)}.mp3`;
    const storageClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: cached } = await storageClient.storage.from("tts-cache").download(cacheKey);
    if (cached) {
      return new Response(cached, {
        headers: { ...corsHeaders, "Content-Type": "audio/mpeg", "X-TTS-Cache": "hit" },
      });
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!ELEVENLABS_API_KEY) {
      await logDebug(storageClient, "env", null, "ELEVENLABS_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "ElevenLabs API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let response: Response;
    try {
      response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.6,
            style: 0.2,
            use_speaker_boost: true,
            speed: 0.82,
          },
        }),
      }
      );
    } catch (fetchErr) {
      await logDebug(storageClient, "fetch_exception", null, String(fetchErr));
      throw fetchErr;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", errorText);
      await logDebug(storageClient, "elevenlabs_error", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate speech" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    await logDebug(storageClient, "success", 200, `bytes=${audioBuffer.byteLength}`);

    // Save to the shared cache for next time — best-effort, never blocks the response.
    storageClient.storage
      .from("tts-cache")
      .upload(cacheKey, audioBuffer, { contentType: "audio/mpeg", upsert: true })
      .then(({ error: uploadError }) => {
        if (uploadError) console.error("TTS cache upload error:", uploadError);
      });

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "X-TTS-Cache": "miss",
      },
    });
  } catch (error) {
    console.error("TTS Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
