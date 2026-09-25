/**
 * UNBREAKABLE — Lightweight Product Analytics
 *
 * In-house, append-only event tracking into the `analytics_events` table.
 * See claude/ANALYTICS_ARCHITECTURE.md (project docs) for the full event catalog and
 * design rationale. This is the FIRST implementation increment: the Commercial +
 * Unbreakable 86 event slice only, per that document's recommended sequencing.
 *
 * Design rules (do not violate these when adding new call sites):
 *   - Fire-and-forget. Never `await` this from a call site in a way that blocks a user
 *     action, and never let a tracking failure surface as a user-facing error.
 *   - No PII beyond what's already implicit in `user_id` (which RLS scopes to the
 *     member themselves or an admin). Do not pass free-text member content as a
 *     property.
 *   - Anonymous (pre-signup) events get a random id persisted in localStorage, not a
 *     fingerprint of any kind.
 */

import { supabase } from '@/integrations/supabase/client';

const ANON_ID_KEY = 'ub_anon_id';

function getAnonymousId(): string | null {
  try {
    let id = localStorage.getItem(ANON_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(ANON_ID_KEY, id);
    }
    return id;
  } catch {
    // Private browsing / storage blocked — track this event as untraceable rather
    // than throwing.
    return null;
  }
}

/**
 * Track a product analytics event. Safe to call from anywhere on the client;
 * never throws, never blocks, never awaited by callers.
 */
export function trackEvent(eventName: string, properties: Record<string, unknown> = {}): void {
  void (async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const row: {
        event_name: string;
        properties: Record<string, unknown>;
        source: string;
        user_id?: string;
        anonymous_id?: string;
      } = {
        event_name: eventName,
        properties,
        source: 'client',
      };

      if (user?.id) {
        row.user_id = user.id;
      } else {
        const anonId = getAnonymousId();
        if (!anonId) return; // nothing we can legally attribute this event to
        row.anonymous_id = anonId;
      }

      const { error } = await supabase.from('analytics_events').insert(row);
      if (error) {
        // Table may not exist yet in this environment, or RLS may reject it — either
        // way, this must never affect the calling feature.
        console.warn('[analytics] trackEvent failed', eventName, error.message);
      }
    } catch (err) {
      console.warn('[analytics] trackEvent threw', eventName, err);
    }
  })();
}
