/**
 * UNBREAKABLE — Lightweight Error Tracking
 *
 * Captures unhandled errors + promise rejections and logs them
 * to the Supabase `error_logs` table and console.
 */

interface ErrorReport {
  message: string;
  stack?: string;
  source?: string;
  url: string;
  userAgent: string;
  timestamp: string;
}

const ERROR_QUEUE: ErrorReport[] = [];
let isFlushScheduled = false;

function reportError(report: ErrorReport) {
  // Always log to console for dev visibility
  console.error('[UNBREAKABLE ERROR]', report.message, report);

  // Queue for batch flush
  ERROR_QUEUE.push(report);

  if (!isFlushScheduled) {
    isFlushScheduled = true;
    // Batch flush after 2s to avoid spamming during cascading errors
    setTimeout(flushErrors, 2000);
  }
}

async function flushErrors() {
  isFlushScheduled = false;
  if (ERROR_QUEUE.length === 0) return;

  const batch = ERROR_QUEUE.splice(0, 10); // Max 10 per flush

  try {
    const { supabase } = await import('@/integrations/supabase/client');
    await supabase.from('error_logs').insert(
      batch.map(e => ({
        message: e.message,
        stack: e.stack?.substring(0, 2000),
        source: e.source,
        url: e.url,
        user_agent: e.userAgent,
      }))
    );
  } catch (flushErr) {
    // Silently fail — don't recurse errors
    console.warn('[Error flush failed]', flushErr);
  }
}

/**
 * Call once at app startup (e.g. in main.tsx) to install global listeners.
 */
export function initErrorTracking() {
  // Unhandled errors
  window.addEventListener('error', (event) => {
    reportError({
      message: event.message || 'Unknown error',
      stack: event.error?.stack,
      source: `${event.filename}:${event.lineno}:${event.colno}`,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    reportError({
      message: reason?.message || String(reason) || 'Unhandled promise rejection',
      stack: reason?.stack,
      source: 'unhandledrejection',
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  });
}
