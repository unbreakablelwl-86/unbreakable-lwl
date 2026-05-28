import { createClient } from "npm:@supabase/supabase-js@2.57.2";

/**
 * AUTO-SHARE TO META — Cron Edge Function
 * 
 * Runs on a schedule (e.g. every 15 minutes).
 * Finds new Unbreakable timeline posts that haven't been shared to connected
 * Meta (Facebook/Instagram) accounts yet, and publishes them.
 * 
 * Only processes posts from users who have Meta credentials configured.
 */

const META_GRAPH_URL = "https://graph.facebook.com/v21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
  imageUrl: string
): Promise<{ id: string }> {
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

  // Wait for processing
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

  // Publish
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Find unshared posts from users who have Meta credentials
    // Only posts from the last 24 hours to avoid bulk-sharing old content
    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: unsharedPosts, error: postsError } = await supabase
      .from("posts")
      .select("id, user_id, content, image_url, video_url, created_at")
      .eq("meta_shared", false)
      .eq("visibility", "public")
      .gte("created_at", twentyFourHoursAgo)
      .order("created_at", { ascending: true })
      .limit(10);

    if (postsError) {
      console.error("Error fetching posts:", postsError);
      return new Response(
        JSON.stringify({ error: postsError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!unsharedPosts || unsharedPosts.length === 0) {
      return new Response(
        JSON.stringify({ message: "No new posts to share", shared: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get unique user IDs
    const userIds = [...new Set(unsharedPosts.map((p) => p.user_id))];

    // Fetch Meta credentials for these users
    const { data: allCreds } = await supabase
      .from("coach_meta_credentials")
      .select("*")
      .in("user_id", userIds);

    if (!allCreds || allCreds.length === 0) {
      // Mark posts as shared so we don't keep retrying
      return new Response(
        JSON.stringify({
          message: "No Meta credentials found for post authors",
          shared: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const credsByUser = new Map(allCreds.map((c) => [c.user_id, c]));

    let shared = 0;
    const results: Array<{
      post_id: string;
      facebook?: { success: boolean; id?: string; error?: string };
      instagram?: { success: boolean; id?: string; error?: string };
    }> = [];

    for (const post of unsharedPosts) {
      const creds = credsByUser.get(post.user_id);
      if (!creds) continue;

      const content = post.content || "";
      // Skip empty posts with no content and no image
      if (!content && !post.image_url) continue;

      // Add Unbreakable branding to the post
      const brandedContent = content
        ? `${content}\n\n🧱 Posted via Unbreakable — Live Without Limits™`
        : "🧱 Posted via Unbreakable — Live Without Limits™";

      const result: (typeof results)[number] = { post_id: post.id };

      // Post to Facebook
      try {
        const fbResult = await postToFacebook(
          creds.facebook_page_id,
          creds.page_access_token,
          brandedContent,
          post.image_url || undefined
        );
        result.facebook = { success: true, id: fbResult.id };
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Unknown Facebook error";
        result.facebook = { success: false, error: msg };
        console.error(`FB share failed for post ${post.id}:`, msg);
      }

      // Post to Instagram (only if image available + IG configured)
      if (creds.instagram_account_id && post.image_url) {
        try {
          const igResult = await postToInstagram(
            creds.instagram_account_id,
            creds.page_access_token,
            brandedContent,
            post.image_url
          );
          result.instagram = { success: true, id: igResult.id };
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "Unknown Instagram error";
          result.instagram = { success: false, error: msg };
          console.error(`IG share failed for post ${post.id}:`, msg);
        }
      }

      // Mark post as shared regardless of outcome (to avoid retry loops)
      await supabase
        .from("posts")
        .update({
          meta_shared: true,
          meta_shared_at: new Date().toISOString(),
        })
        .eq("id", post.id);

      shared++;
      results.push(result);
    }

    return new Response(
      JSON.stringify({ success: true, shared, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Auto-share error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Internal server error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
