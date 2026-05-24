/**
 * useSpotify — Spotify OAuth PKCE flow + Web API integration
 * Connect user's Spotify account, fetch playlists, play tracks
 */
import { useState, useEffect, useCallback } from 'react';

const SPOTIFY_CLIENT_ID = '3d28eae161cd4213bc02640e994d7bb0';
// Must match EXACTLY what's in Spotify Developer Dashboard → Settings → Redirect URIs
const SPOTIFY_REDIRECT_URI = 'https://unbreakable-lwl.com/callback/spotify';
const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
  'user-read-recently-played',
  'user-top-read',
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state',
].join(' ');

const STORAGE_KEY = 'unbreakable_spotify_token';
const VERIFIER_KEY = 'unbreakable_spotify_verifier';

/* ── PKCE Helpers ── */
function generateRandomString(length: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + chars[x % chars.length], '');
}

async function sha256(plain: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

function base64encode(input: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/* ── Token Storage ── */
interface SpotifyToken {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  token_type: string;
}

function getStoredToken(): SpotifyToken | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const token = JSON.parse(raw) as SpotifyToken;
    if (Date.now() > token.expires_at) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

function storeToken(token: SpotifyToken) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(token));
}

function clearToken() {
  localStorage.removeItem(STORAGE_KEY);
}

/* ── Spotify API Helpers ── */
async function spotifyFetch(endpoint: string, token: string) {
  const res = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Spotify API ${res.status}`);
  return res.json();
}

/* ── Types ── */
export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  tracks: { total: number };
  owner: { display_name: string };
  external_urls: { spotify: string };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  duration_ms: number;
  preview_url: string | null;
  external_urls: { spotify: string };
}

export interface SpotifyProfile {
  id: string;
  display_name: string;
  email: string;
  images: { url: string }[];
  product: string; // 'premium' | 'free' | 'open'
}

/* ── Main Hook ── */
export function useSpotify() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<SpotifyProfile | null>(null);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [recentTracks, setRecentTracks] = useState<SpotifyTrack[]>([]);
  const [token, setToken] = useState<SpotifyToken | null>(null);

  /* Check for existing token on mount */
  useEffect(() => {
    const stored = getStoredToken();
    if (stored) {
      setToken(stored);
      setIsConnected(true);
    }
    setIsLoading(false);
  }, []);

  /* Fetch profile + playlists when connected */
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [profileData, playlistData, recentData] = await Promise.all([
          spotifyFetch('/me', token.access_token),
          spotifyFetch('/me/playlists?limit=20', token.access_token),
          spotifyFetch('/me/player/recently-played?limit=10', token.access_token).catch(() => ({ items: [] })),
        ]);
        setProfile(profileData);
        setPlaylists(playlistData.items || []);
        setRecentTracks(
          (recentData.items || []).map((item: any) => item.track).filter(Boolean)
        );
      } catch (err) {
        console.error('Spotify fetch error:', err);
        // Token might be expired
        clearToken();
        setIsConnected(false);
        setToken(null);
      }
    })();
  }, [token]);

  /* ── Connect (start PKCE flow) ── */
  const connect = useCallback(async () => {
    const verifier = generateRandomString(128);
    localStorage.setItem(VERIFIER_KEY, verifier);

    const challenge = base64encode(await sha256(verifier));

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID,
      scope: SPOTIFY_SCOPES,
      code_challenge_method: 'S256',
      code_challenge: challenge,
      redirect_uri: SPOTIFY_REDIRECT_URI,
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
  }, []);

  /* ── Handle callback (exchange code for token) ── */
  const handleCallback = useCallback(async (code: string) => {
    const verifier = localStorage.getItem(VERIFIER_KEY);
    if (!verifier) throw new Error('No PKCE verifier found');

    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        code_verifier: verifier,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error_description || 'Token exchange failed');
    }

    const data = await res.json();
    const tokenObj: SpotifyToken = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000,
      token_type: data.token_type,
    };

    storeToken(tokenObj);
    localStorage.removeItem(VERIFIER_KEY);
    setToken(tokenObj);
    setIsConnected(true);

    return tokenObj;
  }, []);

  /* ── Disconnect ── */
  const disconnect = useCallback(() => {
    clearToken();
    setToken(null);
    setIsConnected(false);
    setProfile(null);
    setPlaylists([]);
    setRecentTracks([]);
  }, []);

  /* ── Fetch playlist tracks ── */
  const getPlaylistTracks = useCallback(
    async (playlistId: string): Promise<SpotifyTrack[]> => {
      if (!token) return [];
      const data = await spotifyFetch(`/playlists/${playlistId}/tracks?limit=50`, token.access_token);
      return (data.items || []).map((item: any) => item.track).filter(Boolean);
    },
    [token]
  );

  return {
    isConnected,
    isLoading,
    profile,
    playlists,
    recentTracks,
    connect,
    handleCallback,
    disconnect,
    getPlaylistTracks,
  };
}
