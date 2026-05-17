import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Legacy Plans page — coaching subscription removed.
 * Redirects to AI Tokens page (the new credit-based system).
 */
export default function Plans() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/ai-tokens', { replace: true });
  }, [navigate]);

  return null;
}
