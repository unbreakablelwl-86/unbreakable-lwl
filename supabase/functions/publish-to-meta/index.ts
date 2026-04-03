import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const META_GRAPH_URL = "https://graph.facebook.com/v21.0";

const PostSchema = z.object({
  post_id: z.string().uuid().optional(),
  platform: z.enum(["facebook", "instagram", "both"]),
  content: z.string().min(1).max(5000),
  image_url: z.string().url().optional(),
});

async function postToFacebook(
  pageId: string,
  token: string,
  message: string,
  imageUrl?: string
): Promise<{ id: string }> {
  let url: string;
  let body: Record<string, string>;

  if (imageUrl) {
    url = `${META_GRAPH_URL}/${pageId}/photos`;
    body = { message, url: imageUrl, access_token: token };
  } else {
    url = `${META_GRAPH_URL}/${pageId}/feed`;
    body = { message, access_token: token };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `Facebook API error [${res.status}]: ${JSON.stringify(data)}`
    );
  }
  return data;
}

async function postToInstagram(
  igAccountId: string,
  token: string,
  caption: string,
  imageUrl?: string
): Promise<{ id: string }> {
  if (!imageUrl) {
    throw new Error("Instagram requires an image URL to publish a post");
  }

  // Step 1: Create media container
  const containerRes = await fetch(
    `${META_GRAPH_URL}/${igAccountId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        access_token: token,
      }),
    }
  );

  const containerData = await containerRes.json();
  if (!containerRes.ok) {
    throw new Error(
      `Instagram container error [${containerRes.status}]: ${JSON.stringify(containerData)}`
    );
  }

  // Step 2: Wait for container to be ready (poll)
  const containerId = containerData.id;
  let status = "IN_PROGRESS";
  let attempts = 0;

  while (status === "IN_PROGRESS" && attempts < 10) {
    await new Promise((r) => setTimeout(r, 2000));
    const statusRes = await fetch(
      `${META_GRAPH_URL}/${containerId}?fields=status_code&access_token=${token}`
    );
    const statusData = await statusRes.json();
    status = statusData.status_code || "FINISHED";
    attempts++;
  }

  if (status === "ERROR") {
    throw new Error("Instagram media container processing failed");
  }

  // Step 3: Publish
  const publishRes = await fetch(
    `${META_GRAPH_URL}/${igAccountId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: token,
      }),
    }
  );

  const publishData = await publishRes.json();
  if (!publishRes.ok) {
    throw new Error(
      `Instagram publish error [${publishRes.status}]: ${JSON.stringify(publishData)}`
    );
  }

  return publishData;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;

    // Validate input
    const rawBody = await req.json();
    const parsed = PostSchema.safeParse(rawBody);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { platform, content, image_url, post_id } = parsed.data;

    // Fetch coach's Meta credentials
    const serviceSupabase = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: creds, error: credsError } = await serviceSupabase
      .from("coach_meta_credentials")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (credsError || !creds) {
      return new Response(
        JSON.stringify({
          error:
            "Meta credentials not found. Please add your Meta API credentials in Settings.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: Record<string, unknown> = {};
    const errors: string[] = [];

    // Post to Facebook
    if (platform === "facebook" || platform === "both") {
      try {
        const fbResult = await postToFacebook(
          creds.facebook_page_id,
          creds.page_access_token,
          content,
          image_url
        );
        results.facebook = { success: true, post_id: fbResult.id };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown Facebook error";
        errors.push(`Facebook: ${msg}`);
        results.facebook = { success: false, error: msg };
      }
    }

    // Post to Instagram
    if (platform === "instagram" || platform === "both") {
      if (!creds.instagram_account_id) {
        errors.push("Instagram: No Instagram Business Account ID configured");
        results.instagram = {
          success: false,
          error: "No Instagram Business Account ID configured",
        };
      } else {
        try {
          const igResult = await postToInstagram(
            creds.instagram_account_id,
            creds.page_access_token,
            content,
            image_url
          );
          results.instagram = { success: true, post_id: igResult.id };
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "Unknown Instagram error";
          errors.push(`Instagram: ${msg}`);
          results.instagram = { success: false, error: msg };
        }
      }
    }

    // Update social_posts record if post_id provided
    if (post_id) {
      const metaPostIds = [
        results.facebook && (results.facebook as any).success
          ? `fb:${(results.facebook as any).post_id}`
          : null,
        results.instagram && (results.instagram as any).success
          ? `ig:${(results.instagram as any).post_id}`
          : null,
      ]
        .filter(Boolean)
        .join(",");

      await serviceSupabase
        .from("social_posts")
        .update({
          meta_post_id: metaPostIds || null,
          meta_status: errors.length === 0 ? "published" : "partial",
          published_at: new Date().toISOString(),
          publish_error: errors.length > 0 ? errors.join("; ") : null,
        })
        .eq("id", post_id);
    }

    return new Response(
      JSON.stringify({
        success: errors.length === 0,
        results,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: errors.length === 0 ? 200 : 207,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Internal server error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
