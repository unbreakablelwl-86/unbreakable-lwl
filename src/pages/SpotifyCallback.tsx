/**
 * SpotifyCallback — handles the OAuth redirect from Spotify
 * Exchanges the code for an access token, then redirects to /untunes
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpotify } from '@/hooks/useSpotify';
import { Loader2, Music, CheckCircle, XCircle } from 'lucide-react';

export default function SpotifyCallback() {
  const navigate = useNavigate();
  const { handleCallback } = useSpotify();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error) {
      setStatus('error');
      setErrorMsg(error === 'access_denied' ? 'You denied access to Spotify' : error);
      setTimeout(() => navigate('/untunes'), 2000);
      return;
    }

    if (!code) {
      setStatus('error');
      setErrorMsg('No authorization code received');
      setTimeout(() => navigate('/untunes'), 2000);
      return;
    }

    handleCallback(code)
      .then(() => {
        setStatus('success');
        setTimeout(() => navigate('/untunes'), 1200);
      })
      .catch((err) => {
        setStatus('error');
        setErrorMsg(err.message || 'Failed to connect');
        setTimeout(() => navigate('/untunes'), 2500);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 rounded-full bg-[#1DB954]/20 flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-[#1DB954] animate-spin" />
            </div>
            <p className="font-display text-sm tracking-wider text-foreground">CONNECTING SPOTIFY...</p>
            <p className="text-xs text-muted-foreground">Exchanging authorization</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-[#1DB954]/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-[#1DB954]" />
            </div>
            <p className="font-display text-sm tracking-wider text-foreground">SPOTIFY CONNECTED!</p>
            <p className="text-xs text-muted-foreground">Redirecting to Un-Tunes...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <p className="font-display text-sm tracking-wider text-foreground">CONNECTION FAILED</p>
            <p className="text-xs text-muted-foreground">{errorMsg}</p>
          </>
        )}
      </div>
    </div>
  );
}
