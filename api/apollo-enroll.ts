/**
 * Enrols a newly signed-up user into the Apollo onboarding sequence.
 *
 * Runs as a Vercel serverless function (not a Supabase edge function) so it
 * deploys with the normal git push. Requires two Vercel env vars:
 *   APOLLO_API_KEY        - Apollo master API key
 *   APOLLO_SEQUENCE_ID    - emailer_campaign id to enrol into
 *   APOLLO_EMAIL_ACCOUNT_ID - mailbox the sequence sends from
 *
 * Never throws at the caller: a failed enrolment must never block a sign-up.
 */

const APOLLO = 'https://api.apollo.io/api/v1';

const SEQUENCE_ID = process.env.APOLLO_SEQUENCE_ID ?? '6a8f2f7febc5f900148a5474';
const EMAIL_ACCOUNT_ID = process.env.APOLLO_EMAIL_ACCOUNT_ID ?? '6a083ea61fef9a000dfabfba';

type Json = Record<string, unknown>;

async function apollo(path: string, body: Json, apiKey: string): Promise<Json> {
  const res = await fetch(`${APOLLO}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let parsed: Json = {};
  try {
    parsed = text ? (JSON.parse(text) as Json) : {};
  } catch {
    parsed = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`Apollo ${path} ${res.status}: ${text.slice(0, 300)}`);
  }
  return parsed;
}

function splitName(fullName: string | undefined, email: string) {
  const source = (fullName ?? '').trim() || email.split('@')[0];
  const parts = source.split(/\s+/);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.length > 1 ? parts.slice(1).join(' ') : '',
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const apiKey = process.env.APOLLO_API_KEY;
  if (!apiKey) {
    // Not configured yet - succeed quietly so sign-up is never blocked.
    res.status(200).json({ enrolled: false, reason: 'not_configured' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body ?? {});
  const email = String(body.email ?? '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    res.status(400).json({ error: 'invalid_email' });
    return;
  }

  const { firstName, lastName } = splitName(body.fullName, email);

  try {
    const created = (await apollo(
      '/contacts',
      { email, first_name: firstName, last_name: lastName, title: 'UNBREAKABLE member' },
      apiKey,
    )) as { contact?: { id?: string } };

    const contactId = created?.contact?.id;
    if (!contactId) {
      res.status(200).json({ enrolled: false, reason: 'no_contact_id' });
      return;
    }

    await apollo(
      `/emailer_campaigns/${SEQUENCE_ID}/add_contact_ids`,
      {
        contact_ids: [contactId],
        emailer_campaign_id: SEQUENCE_ID,
        send_email_from_email_account_id: EMAIL_ACCOUNT_ID,
        sequence_no_email: false,
        sequence_active_in_other_campaigns: true,
      },
      apiKey,
    );

    res.status(200).json({ enrolled: true, contactId });
  } catch (err) {
    // Log for Vercel, but return 200: onboarding email failing must not break sign-up.
    console.error('apollo-enroll failed', err);
    res.status(200).json({ enrolled: false, reason: 'apollo_error' });
  }
}
