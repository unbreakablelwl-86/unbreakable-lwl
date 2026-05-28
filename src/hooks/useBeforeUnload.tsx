/**
 * useBeforeUnload — Warns users about unsaved changes before navigating away.
 * Uses both browser beforeunload (for tab close/refresh) and React Router blocker.
 */
import { useEffect, useCallback } from 'react';

export function useBeforeUnload(hasUnsavedChanges: boolean, message?: string) {
  const msg = message || 'You have unsaved changes. Are you sure you want to leave?';

  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (!hasUnsavedChanges) return;
    e.preventDefault();
    e.returnValue = msg;
    return msg;
  }, [hasUnsavedChanges, msg]);

  useEffect(() => {
    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [hasUnsavedChanges, handleBeforeUnload]);
}
