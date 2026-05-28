import { useEffect, useCallback, useRef } from 'react';
import { useBlocker } from 'react-router-dom';

/**
 * useUnsavedChanges — guards navigation when a form has unsaved data.
 *
 * Usage:
 *   const { markDirty, markClean } = useUnsavedChanges(isDirty);
 *
 * - Blocks in-app navigation with a confirm dialog
 * - Blocks browser back / tab close with beforeunload
 */
export function useUnsavedChanges(isDirty: boolean) {
  const dirtyRef = useRef(isDirty);
  dirtyRef.current = isDirty;

  // Browser close / back button
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      e.preventDefault();
      // Chrome requires returnValue to be set
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // React Router in-app navigation
  useBlocker(
    useCallback(
      () => {
        if (!dirtyRef.current) return false;
        return !window.confirm(
          'You have unsaved changes. Are you sure you want to leave?'
        );
      },
      []
    )
  );
}
