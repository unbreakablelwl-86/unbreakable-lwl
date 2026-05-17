import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Renders post/comment text with clickable @mentions and #hashtags.
 *
 * @mentions  → link to /user/:id  (looks up username → user_id)
 * #hashtags  → link to /?tag=<tag> (or could filter feed in future)
 */

// Simple cache so we don't look up the same username repeatedly
const usernameCache = new Map<string, string | null>();

async function resolveUsername(username: string): Promise<string | null> {
  const lower = username.toLowerCase();
  if (usernameCache.has(lower)) return usernameCache.get(lower) ?? null;

  const { data } = await supabase
    .from('profiles')
    .select('user_id')
    .ilike('username', lower)
    .limit(1)
    .maybeSingle();

  const userId = data?.user_id ?? null;
  usernameCache.set(lower, userId);
  return userId;
}

interface RichContentProps {
  text: string;
  className?: string;
}

// Split text into segments: plain text, @mentions, and #hashtags
type Segment =
  | { type: 'text'; value: string }
  | { type: 'mention'; username: string }
  | { type: 'hashtag'; tag: string };

function parseContent(text: string): Segment[] {
  // Match @username or #hashtag
  const regex = /(@(\w{1,30}))|(#(\w{1,50}))/g;
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add any text before this match
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }

    if (match[1]) {
      // @mention
      segments.push({ type: 'mention', username: match[2] });
    } else if (match[3]) {
      // #hashtag
      segments.push({ type: 'hashtag', tag: match[4] });
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments;
}

function MentionLink({ username }: { username: string }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    resolveUsername(username).then((id) => {
      setUserId(id);
      setResolved(true);
    });
  }, [username]);

  if (!resolved) {
    return <span className="text-primary font-semibold">@{username}</span>;
  }

  if (!userId) {
    // Username doesn't exist — show as plain styled text
    return <span className="text-primary font-semibold">@{username}</span>;
  }

  return (
    <Link
      to={`/user/${userId}`}
      className="text-primary font-semibold hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      @{username}
    </Link>
  );
}

function HashtagLink({ tag }: { tag: string }) {
  return (
    <Link
      to={`/?tag=${encodeURIComponent(tag)}`}
      className="text-primary font-semibold hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      #{tag}
    </Link>
  );
}

export function RichContent({ text, className = '' }: RichContentProps) {
  const segments = parseContent(text);

  return (
    <p className={`whitespace-pre-wrap ${className}`}>
      {segments.map((seg, i) => {
        switch (seg.type) {
          case 'text':
            return <span key={i}>{seg.value}</span>;
          case 'mention':
            return <MentionLink key={i} username={seg.username} />;
          case 'hashtag':
            return <HashtagLink key={i} tag={seg.tag} />;
        }
      })}
    </p>
  );
}
