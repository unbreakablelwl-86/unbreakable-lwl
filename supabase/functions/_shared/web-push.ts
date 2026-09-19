/**
 * Web Push sender — shared helper for edge functions that need to put a
 * real OS/browser push notification on a user's device, not just a row in
 * the in-app `notifications` table.
 *
 * The client side of this has existed for a while (usePushNotifications.tsx
 * subscribes the browser and stores the subscription in push_subscriptions;
 * public/sw.js's 'push' listener shows the native notification when one
 * arrives) but nothing server-side ever actually sent one — this is that
 * missing half (JJ, Sept 2026: "daily notification of upcoming planned
 * sessions for the day").
 *
 * Requires three Supabase Edge Function secrets, generated once with
 * `npx web-push generate-vapid-keys` and set via the Supabase dashboard
 * (Project Settings -> Edge Functions -> Secrets) or `supabase secrets set`:
 *   VAPID_PUBLIC_KEY   — also set as VITE_VAPID_PUBLIC_KEY in Vercel's
 *                        client build env, so the browser subscribes with
 *                        the matching key (usePushNotifications.tsx reads it).
 *   VAPID_PRIVATE_KEY  — server-side only, never exposed to the client.
 *   VAPID_SUBJECT       — a mailto: or https: contact URL, required by the
 *                         Web Push protocol. Defaults below if unset.
 *
 * Until those secrets are set, sendPushToUser is a silent no-op — it does
 * NOT throw — so the daily cron that calls it keeps working (in-app
 * notifications keep being written) even before push is configured.
 */
import webpush from "npm:web-push@3.6.7";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:support@unbreakable-lwl.com";

let configured = false;
function ensureConfigured() {
  if (configured) return;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  configured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

/**
 * Push `payload` to every device `userId` has subscribed from. Prunes any
 * subscription the push service reports as gone (404/410 — the browser
 * unsubscribed, cleared site data, or the endpoint expired) instead of
 * leaving it to fail forever on every future run.
 */
export async function sendPushToUser(
  supabase: any,
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; pruned: number }> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    // Not configured yet — caller's in-app notification row is still written;
    // this just skips the real push half silently.
    return { sent: 0, pruned: 0 };
  }
  ensureConfigured();

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth_key")
    .eq("user_id", userId);

  if (!subs || subs.length === 0) return { sent: 0, pruned: 0 };

  let sent = 0;
  let pruned = 0;

  await Promise.all(
    subs.map(async (sub: any) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth_key },
          },
          JSON.stringify(payload)
        );
        sent++;
      } catch (err: any) {
        const status = err?.statusCode;
        if (status === 404 || status === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
          pruned++;
        } else {
          console.error(`Push failed for subscription ${sub.id}:`, err?.message || err);
        }
      }
    })
  );

  return { sent, pruned };
}
