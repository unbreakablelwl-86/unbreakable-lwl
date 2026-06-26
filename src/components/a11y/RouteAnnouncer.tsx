import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Announces route changes to screen readers via a live region.
 */
export function RouteAnnouncer() {
  const location = useLocation();
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const path = location.pathname.replace(/^\//, '') || 'home';
    const pageName = path
      .split('/')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' \u2014 ');
    setAnnouncement(`Navigated to ${pageName}`);
  }, [location.pathname]);

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement}
    </div>
  );
}
