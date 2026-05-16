import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!GOOGLE_AI_API_KEY) {
      return new Response(JSON.stringify({ error: "GOOGLE_AI_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get recipes without images (pack recipes only)
    const { data: recipes, error: fetchError } = await supabase
      .from("recipes")
      .select("id, name, category")
      .is("user_id", null)
      .is("image_url", null)
      .not("pack", "is", null)
      .limit(3); // Process 3 at a time to avoid timeouts

    if (fetchError) throw fetchError;

    if (!recipes || recipes.length === 0) {
      return new Response(JSON.stringify({ message: "All recipes already have images", processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let processed = 0;
    const errors: string[] = [];

    for (const recipe of recipes) {
      try {
        const prompt = `Generate a photorealistic food photograph of "${recipe.name}". Show the actual finished dish as it would appear served on a plate or in its cooking vessel. British home-cooked style, warm natural lighting, overhead angle, shallow depth of field, appetizing, ${recipe.category || 'meal'} dish. IMPORTANT: absolutely NO text, NO labels, NO words, NO titles, NO watermarks, NO overlays of any kind on the image. Pure food photography only. Ultra high resolution.`;

        const aiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GOOGLE_AI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gemini-2.5-flash-preview-05-20",
            messages: [{ role: "user", content: prompt }],
            modalities: ["image", "text"],
          }),
        });

        if (!aiResponse.ok) {
          const errText = await aiResponse.text();
          errors.push(`${recipe.name}: AI error ${aiResponse.status} - ${errText}`);
          continue;
        }

        const aiData = await aiResponse.json();
        const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!imageUrl || !imageUrl.startsWith("data:image")) {
          errors.push(`${recipe.name}: No image returned`);
          continue;
        }

        // Extract base64 data
        const base64Data = imageUrl.split(",")[1];
        const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
        
        // Determine file extension
        const mimeMatch = imageUrl.match(/data:image\/(\w+);/);
        const ext = mimeMatch?.[1] || "png";
        const fileName = `${recipe.id}.${ext}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("recipe-images")
          .upload(fileName, binaryData, {
            contentType: `image/${ext}`,
            upsert: true,
          });

        if (uploadError) {
          errors.push(`${recipe.name}: Upload error - ${uploadError.message}`);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("recipe-images")
          .getPublicUrl(fileName);

        // Update recipe with image URL
        const { error: updateError } = await supabase
          .from("recipes")
          .update({ image_url: urlData.publicUrl })
          .eq("id", recipe.id);

        if (updateError) {
          errors.push(`${recipe.name}: DB update error - ${updateError.message}`);
          continue;
        }

        processed++;
        console.log(`✅ Generated image for: ${recipe.name}`);
      } catch (e) {
        errors.push(`${recipe.name}: ${e instanceof Error ? e.message : "Unknown error"}`);
      }
    }

    const remaining = (await supabase
      .from("recipes")
      .select("id", { count: "exact", head: true })
      .is("user_id", null)
      .is("image_url", null)
      .not("pack", "is", null)).count || 0;

    return new Response(JSON.stringify({ 
      processed, 
      errors: errors.length > 0 ? errors : undefined,
      remaining,
      message: `Generated ${processed} images. ${remaining} recipes still need images.`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
