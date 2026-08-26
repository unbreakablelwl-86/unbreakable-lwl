import { useState, useEffect, useCallback, useRef, createContext, useContext, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useTokenBalance } from '@/hooks/useTokenBalance';

/* ─── Types ─── */
export interface Artist {
  id: string;
  user_id: string;
  artist_name: string;
  bio: string;
  genre_tags: string[];
  avatar_url: string | null;
  banner_url: string | null;
  social_links: Record<string, string>;
  is_verified: boolean;
  follower_count: number;
  total_plays: number;
  created_at: string;
  subscription_status: 'active' | 'expired' | 'cancelled';
}

export interface Track {
  id: string;
  artist_id: string;
  artist_name?: string;
  artist_avatar?: string | null;
  title: string;
  album_id: string | null;
  album_title?: string;
  audio_url: string;
  cover_url: string | null;
  duration_seconds: number;
  genre: string;
  tags: string[];
  bpm: number | null;
  is_free: boolean;
  price_gbp: number | null;
  play_count: number;
  created_at: string;
  track_type: 'music' | 'podcast';
}

export interface Album {
  id: string;
  artist_id: string;
  artist_name?: string;
  title: string;
  cover_url: string | null;
  description: string;
  album_type: 'album' | 'ep' | 'single' | 'podcast_series';
  is_free: boolean;
  price_gbp: number | null;
  track_count: number;
  created_at: string;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description: string;
  cover_url: string | null;
  is_public: boolean;
  track_count: number;
  created_at: string;
}

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
}

/* ─── Audio Player Context ─── */
const defaultPlayerState: PlayerState = {
  currentTrack: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  shuffle: false,
  repeat: 'off',
};

interface PlayerContextType {
  state: PlayerState;
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (track: Track) => void;
  stop: () => void;
  /** Whether current track is preview-only (30s cap) */
  isPreview: boolean;
  /** Set of owned track IDs (purchased or dev account) */
  ownedTrackIds: Set<string>;
  /** Full access (dev account) */
  hasFullAccess: boolean;
  /** Whether mini player is locked (during pack opening — no skip/close/pause) */
  locked: boolean;
  /** Lock the mini player (used during pack opening) */
  setLocked: (locked: boolean) => void;
  /** Whether mini player is completely hidden (during pack opening) */
  hidden: boolean;
  /** Hide/show the mini player */
  setHidden: (hidden: boolean) => void;
}

export const PlayerContext = createContext<PlayerContextType>({
  state: defaultPlayerState,
  playTrack: () => {},
  togglePlay: () => {},
  nextTrack: () => {},
  prevTrack: () => {},
  seekTo: () => {},
  setVolume: () => {},
  toggleShuffle: () => {},
  toggleRepeat: () => {},
  addToQueue: () => {},
  stop: () => {},
  isPreview: false,
  ownedTrackIds: new Set(),
  hasFullAccess: false,
  locked: false,
  setLocked: () => {},
  hidden: false,
  setHidden: () => {},
});

export function usePlayer() {
  return useContext(PlayerContext);
}

/** Hook: load set of track IDs the user owns (purchased cards) */
function useOwnedTracks() {
  const { user } = useAuth();
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) { setOwnedIds(new Set()); return; }
    (async () => {
      try {
        // Use SECURITY DEFINER RPC to bypass any RLS timing issues
        const { data, error } = await supabase.rpc('get_my_owned_track_ids');
        if (data && !error) {
          setOwnedIds(new Set(data.map((r: any) => r.track_id)));
          return;
        }
        // Fallback: direct table query
        const { data: fallback } = await supabase
          .from('un_tunes_user_cards')
          .select('track_id')
          .eq('user_id', user.id)
          .not('track_id', 'is', null);
        if (fallback) {
          setOwnedIds(new Set(fallback.map((r: any) => r.track_id)));
        }
      } catch (err) {
        console.error('[useOwnedTracks] Error:', err);
      }
    })();
  }, [user]);

  return ownedIds;
}

const PREVIEW_DURATION = 30; // seconds

export function usePlayerProvider() {
  const { user } = useAuth();
  const { isDev, isCoach, loading: roleLoading } = useUserRole();
  const { currentTier, loading: tierLoading } = useTokenBalance();
  const ownedTrackIds = useOwnedTracks();
  const [state, setState] = useState<PlayerState>(defaultPlayerState);
  const [locked, setLocked] = useState(false);
  const [hidden, setHidden] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewFadingRef = useRef(false);
  // Refs for Media Session action handlers (stable references)
  const nextTrackRef = useRef<() => void>(() => {});
  const prevTrackRef = useRef<() => void>(() => {});
  const togglePlayRef = useRef<() => void>(() => {});

  // Full access = dev/coach role, any paying subscriber, OR known dev user IDs
  // While role/tier is loading, fall back to hardcoded IDs to prevent brief 30s cap flash
  const DEV_USER_IDS = ['3a61bd9e-785b-4512-abab-e61b87496c54', 'c219f448-c05a-4fe3-ae11-793222b7dced'];
  const isPaidUser = !tierLoading && currentTier !== 'free';
  const hasFullAccess = isDev || isCoach || isPaidUser || roleLoading || tierLoading || (user?.id ? DEV_USER_IDS.includes(user.id) : false);

  // Is current track a preview?
  const isPreview = useMemo(() => {
    if (hasFullAccess) return false;
    if (!state.currentTrack) return false;
    return !ownedTrackIds.has(state.currentTrack.id);
  }, [hasFullAccess, state.currentTrack?.id, ownedTrackIds]);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = state.volume;
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      setState(s => ({ ...s, currentTime: audio.currentTime, duration: audio.duration || 0 }));
    });

    // 30s preview enforcement handled in a separate effect below

    audio.addEventListener('ended', () => {
      handleTrackEnd();
    });

    // Handle audio errors — auto-skip to next track on load failure
    audio.addEventListener('error', () => {
      console.warn('[UnTunes] Audio error, skipping to next track');
      handleTrackEnd();
    });

    audio.addEventListener('loadedmetadata', () => {
      setState(s => ({ ...s, duration: audio.duration }));
    });

    // ─── Media Session API — lock screen & notification controls ───
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => togglePlayRef.current());
      navigator.mediaSession.setActionHandler('pause', () => togglePlayRef.current());
      navigator.mediaSession.setActionHandler('previoustrack', () => prevTrackRef.current());
      navigator.mediaSession.setActionHandler('nexttrack', () => nextTrackRef.current());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
          setState(s => ({ ...s, currentTime: details.seekTime! }));
        }
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        if (audioRef.current) {
          audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - (details.seekOffset || 10));
        }
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        if (audioRef.current) {
          audioRef.current.currentTime = Math.min(
            audioRef.current.duration || 0,
            audioRef.current.currentTime + (details.seekOffset || 10)
          );
        }
      });
    }

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // ─── Update Media Session metadata on track change ───
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    if (state.currentTrack) {
      const track = state.currentTrack;
      const artwork: MediaImage[] = [];
      if (track.cover_url) {
        artwork.push({ src: track.cover_url, sizes: '512x512', type: 'image/jpeg' });
        artwork.push({ src: track.cover_url, sizes: '256x256', type: 'image/jpeg' });
        artwork.push({ src: track.cover_url, sizes: '128x128', type: 'image/jpeg' });
      }
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist_name || 'Unbreakable',
        album: track.album_title || 'Un-Tunes',
        artwork,
      });
    }
    navigator.mediaSession.playbackState = state.isPlaying ? 'playing' : 'paused';
  }, [state.currentTrack?.id, state.isPlaying]);

  // ─── Update position state for lock screen seek bar ───
  useEffect(() => {
    if (!('mediaSession' in navigator) || !('setPositionState' in navigator.mediaSession)) return;
    if (state.duration > 0 && state.isPlaying) {
      try {
        navigator.mediaSession.setPositionState({
          duration: state.duration,
          playbackRate: 1,
          position: Math.min(state.currentTime, state.duration),
        });
      } catch { /* ignore position state errors */ }
    }
  }, [Math.floor(state.currentTime), state.duration, state.isPlaying]);

  // ─── 30s preview enforcement ───
  useEffect(() => {
    // Belt-and-suspenders: always skip enforcement for hardcoded dev IDs
    // even if role-based hasFullAccess has a timing gap
    const DEV_BYPASS = ['3a61bd9e-785b-4512-abab-e61b87496c54'];
    if (user?.id && DEV_BYPASS.includes(user.id)) return;
    if (!isPreview || !audioRef.current) return;
    const audio = audioRef.current;
    
    const checkPreview = () => {
      if (audio.currentTime >= PREVIEW_DURATION && !previewFadingRef.current) {
        previewFadingRef.current = true;
        // Fade out over 2 seconds
        const startVol = audio.volume;
        const fadeSteps = 20;
        const fadeInterval = 100; // 2s total
        let step = 0;
        const fade = setInterval(() => {
          step++;
          audio.volume = Math.max(0, startVol * (1 - step / fadeSteps));
          if (step >= fadeSteps) {
            clearInterval(fade);
            audio.pause();
            audio.volume = startVol; // restore for next track
            previewFadingRef.current = false;
            setState(s => ({ ...s, isPlaying: false }));
          }
        }, fadeInterval);
      }
    };

    audio.addEventListener('timeupdate', checkPreview);
    return () => audio.removeEventListener('timeupdate', checkPreview);
  }, [isPreview, user?.id]);

  // Reset preview fade flag on track change
  useEffect(() => {
    previewFadingRef.current = false;
  }, [state.currentTrack?.id]);

  const handleTrackEnd = useCallback(() => {
    // Read state synchronously via ref to avoid side effects inside setState
    setState(prev => {
      if (prev.repeat === 'one') {
        // Repeat-one: restart same track
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {
              // Autoplay blocked — set state to paused so UI stays consistent
              setState(s => ({ ...s, isPlaying: false }));
            });
          }
        }, 0);
        return { ...prev, isPlaying: true };
      }

      const nextIdx = prev.shuffle
        ? Math.floor(Math.random() * prev.queue.length)
        : prev.queueIndex + 1;

      if (nextIdx >= prev.queue.length) {
        if (prev.repeat === 'all' && prev.queue.length > 0) {
          const track = prev.queue[0];
          // Play first track in queue outside setState
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.src = track.audio_url;
              audioRef.current.play().catch(() => {
                setState(s => ({ ...s, isPlaying: false }));
              });
            }
          }, 0);
          return { ...prev, currentTrack: track, queueIndex: 0, isPlaying: true };
        }
        return { ...prev, isPlaying: false };
      }

      const track = prev.queue[nextIdx];
      // Play next track outside setState
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = track.audio_url;
          audioRef.current.play().catch(() => {
            setState(s => ({ ...s, isPlaying: false }));
          });
        }
      }, 0);
      return { ...prev, currentTrack: track, queueIndex: nextIdx, isPlaying: true };
    });
  }, []);

  const playTrack = useCallback((track: Track, queue?: Track[]) => {
    const q = queue || [track];
    const idx = q.findIndex(t => t.id === track.id);
    if (audioRef.current) {
      audioRef.current.src = track.audio_url;
      audioRef.current.play().catch(() => {
        setState(s => ({ ...s, isPlaying: false }));
      });
    }
    setState(s => ({
      ...s,
      currentTrack: track,
      queue: q,
      queueIndex: idx >= 0 ? idx : 0,
      isPlaying: true,
    }));
    // Record play in background
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        supabase.from('un_tunes_plays').insert({ user_id: data.user.id, track_id: track.id }).then(() => {
          supabase.rpc('increment_track_plays', { p_track_id: track.id });
        });
      }
    });
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !state.currentTrack) return;
    if (state.isPlaying) {
      audioRef.current.pause();
      setState(s => ({ ...s, isPlaying: false }));
    } else {
      audioRef.current.play().catch(() => {
        setState(s => ({ ...s, isPlaying: false }));
      });
      setState(s => ({ ...s, isPlaying: true }));
    }
  }, [state.isPlaying, state.currentTrack]);

  const nextTrack = useCallback(() => {
    handleTrackEnd();
  }, [handleTrackEnd]);

  const prevTrack = useCallback(() => {
    setState(prev => {
      if (prev.currentTime > 3 && audioRef.current) {
        audioRef.current.currentTime = 0;
        return { ...prev, currentTime: 0 };
      }
      const prevIdx = prev.queueIndex - 1;
      if (prevIdx < 0) return prev;
      const track = prev.queue[prevIdx];
      if (audioRef.current) {
        audioRef.current.src = track.audio_url;
        audioRef.current.play();
      }
      return { ...prev, currentTrack: track, queueIndex: prevIdx, isPlaying: true };
    });
  }, []);

  const seekTo = useCallback((time: number) => {
    // Clamp to preview limit if not owned
    const clampedTime = isPreview ? Math.min(time, PREVIEW_DURATION) : time;
    if (audioRef.current) {
      audioRef.current.currentTime = clampedTime;
    }
    setState(s => ({ ...s, currentTime: clampedTime }));
  }, [isPreview]);

  const setVolume = useCallback((vol: number) => {
    if (audioRef.current) audioRef.current.volume = vol;
    setState(s => ({ ...s, volume: vol }));
  }, []);

  const toggleShuffle = useCallback(() => {
    setState(s => ({ ...s, shuffle: !s.shuffle }));
  }, []);

  const toggleRepeat = useCallback(() => {
    setState(s => ({
      ...s,
      repeat: s.repeat === 'off' ? 'all' : s.repeat === 'all' ? 'one' : 'off',
    }));
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setState(s => ({ ...s, queue: [...s.queue, track] }));
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setState(s => ({ ...s, isPlaying: false, currentTrack: null, queue: [], queueIndex: -1, currentTime: 0, duration: 0 }));
  }, []);

  // Keep Media Session action refs in sync with latest callbacks
  useEffect(() => { nextTrackRef.current = nextTrack; }, [nextTrack]);
  useEffect(() => { prevTrackRef.current = prevTrack; }, [prevTrack]);
  useEffect(() => { togglePlayRef.current = togglePlay; }, [togglePlay]);

  return {
    state,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    addToQueue,
    stop,
    isPreview,
    ownedTrackIds,
    hasFullAccess,
    locked,
    setLocked,
    hidden,
    setHidden,
  };
}

/* ─── Data Hooks ─── */

/** Fetch featured / trending tracks */
export function useFeaturedTracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Trending is driven by real stream counts (play_count, incremented on
      // every play via increment_track_plays). Only playable tracks chart.
      const { data } = await supabase
        .from('un_tunes_tracks')
        .select('*, un_tunes_artists!inner(artist_name, avatar_url)')
        .not('audio_url', 'is', null)
        .order('play_count', { ascending: false })
        .limit(20);

      if (data) {
        setTracks(data.map((t: any) => ({
          ...t,
          artist_name: t.un_tunes_artists?.artist_name,
          artist_avatar: t.un_tunes_artists?.avatar_url,
        })));
      }
      setLoading(false);
    })();
  }, []);

  return { tracks, loading };
}

/** Fetch ALL tracks (full library) */
export function useAllTracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('un_tunes_tracks')
        .select('*, un_tunes_artists!inner(artist_name, avatar_url)')
        .not('audio_url', 'is', null)
        .order('title', { ascending: true });

      if (data) {
        setTracks(data.map((t: any) => ({
          ...t,
          artist_name: t.un_tunes_artists?.artist_name,
          artist_avatar: t.un_tunes_artists?.avatar_url,
        })));
      }
      setLoading(false);
    })();
  }, []);

  return { tracks, loading };
}

/** Fetch tracks by genre */
export function useTracksByGenre(genre: string) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!genre) return;
    (async () => {
      const { data } = await supabase
        .from('un_tunes_tracks')
        .select('*, un_tunes_artists!inner(artist_name, avatar_url)')
        .eq('genre', genre)
        .order('play_count', { ascending: false })
        .limit(30);

      if (data) {
        setTracks(data.map((t: any) => ({
          ...t,
          artist_name: t.un_tunes_artists?.artist_name,
          artist_avatar: t.un_tunes_artists?.avatar_url,
        })));
      }
      setLoading(false);
    })();
  }, [genre]);

  return { tracks, loading };
}

/** Fetch all artists */
export function useArtists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('un_tunes_artists')
        .select('*')
        .eq('subscription_status', 'active')
        .order('follower_count', { ascending: false });

      if (data) setArtists(data as Artist[]);
      setLoading(false);
    })();
  }, []);

  return { artists, loading };
}

/** Check if current user is an artist */
export function useMyArtistProfile() {
  const { user } = useAuth();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from('un_tunes_artists')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setArtist(data as Artist | null);
      setLoading(false);
    })();
  }, [user]);

  return { artist, loading };
}

/** Fetch user's playlists */
export function useMyPlaylists() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from('un_tunes_playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setPlaylists(data as Playlist[]);
      setLoading(false);
    })();
  }, [user]);

  return { playlists, loading };
}

/** Record a play */
export function useRecordPlay() {
  const { user } = useAuth();

  return useCallback(async (trackId: string) => {
    if (!user) return;
    await supabase.from('un_tunes_plays').insert({
      user_id: user.id,
      track_id: trackId,
    });
    // Increment play count
    await supabase.rpc('increment_track_plays', { p_track_id: trackId });
  }, [user]);
}

/** Toggle like on a track (dumbbell button) */
export function useLikeTrack() {
  const { user } = useAuth();
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load user's liked track IDs
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from('un_tunes_likes')
        .select('track_id')
        .eq('user_id', user.id);
      if (data) setLikedIds(new Set(data.map((r: any) => r.track_id)));
      setLoading(false);
    })();
  }, [user]);

  const toggleLike = useCallback(async (trackId: string) => {
    if (!user) return;
    const isLiked = likedIds.has(trackId);
    if (isLiked) {
      setLikedIds(prev => { const s = new Set(prev); s.delete(trackId); return s; });
      await supabase.from('un_tunes_likes').delete().eq('user_id', user.id).eq('track_id', trackId);
    } else {
      setLikedIds(prev => new Set(prev).add(trackId));
      await supabase.from('un_tunes_likes').insert({ user_id: user.id, track_id: trackId });
    }
  }, [user, likedIds]);

  const isLiked = useCallback((trackId: string) => likedIds.has(trackId), [likedIds]);

  return { isLiked, toggleLike, loading };
}

/** Add track to a playlist */
export function usePlaylistActions() {
  const { user } = useAuth();

  const createPlaylist = useCallback(async (name: string, description = '') => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('un_tunes_playlists')
      .insert({ user_id: user.id, name, description, is_public: false, track_count: 0 })
      .select()
      .single();
    if (error) { console.error('Create playlist error:', error); return null; }
    return data as Playlist;
  }, [user]);

  const addToPlaylist = useCallback(async (playlistId: string, trackId: string) => {
    if (!user) return false;
    // Get next position
    const { data: existing } = await supabase
      .from('un_tunes_playlist_items')
      .select('position')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: false })
      .limit(1);
    const nextPos = existing && existing.length > 0 ? (existing[0] as any).position + 1 : 0;

    const { error } = await supabase
      .from('un_tunes_playlist_items')
      .insert({ playlist_id: playlistId, track_id: trackId, position: nextPos });
    if (error) { console.error('Add to playlist error:', error); return false; }

    // Update track count
    await supabase
      .from('un_tunes_playlists')
      .update({ track_count: nextPos + 1 })
      .eq('id', playlistId);
    return true;
  }, [user]);

  return { createPlaylist, addToPlaylist };
}

/** Search tracks */
export function useSearchTracks() {
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('un_tunes_tracks')
      .select('*, un_tunes_artists!inner(artist_name, avatar_url)')
      .or(`title.ilike.%${query}%,genre.ilike.%${query}%`)
      .order('play_count', { ascending: false })
      .limit(20);

    if (data) {
      setResults(data.map((t: any) => ({
        ...t,
        artist_name: t.un_tunes_artists?.artist_name,
        artist_avatar: t.un_tunes_artists?.avatar_url,
      })));
    }
    setLoading(false);
  }, []);

  return { results, loading, search };
}

/* ─── Genre Definitions ─── */
/* ── Genre Categories: 3 pillars with sub-genres ── */
export interface GenreCategory {
  key: string;
  label: string;
  icon: string;
  subGenres: { key: string; label: string }[];
}

export const GENRE_CATEGORIES: GenreCategory[] = [
  {
    key: 'power',
    label: 'POWER',
    icon: 'Zap',
    subGenres: [],
  },
  {
    key: 'movement',
    label: 'MOVEMENT',
    icon: 'Activity',
    subGenres: [],
  },
  {
    key: 'mindset',
    label: 'MINDSET',
    icon: 'Brain',
    subGenres: [],
  },
];

/* Flat list for backwards compat */
export const GENRES = GENRE_CATEGORIES.flatMap(cat =>
  cat.subGenres.map(sg => ({ key: sg.key, label: sg.label, icon: cat.icon, color: '#FF5500' }))
);

/* Legacy array kept for compatibility — re-export from flat list */
export const ALL_GENRE_KEYS = GENRES.map(g => g.key);

// Kept for reference (old shape):
const _LEGACY_GENRES = [
];

/** Fetch full track objects for user's liked tracks */
export function useLikedTracks() {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setTracks([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('un_tunes_likes')
      .select('track_id, liked_at, un_tunes_tracks(*, un_tunes_artists(artist_name, avatar_url))')
      .eq('user_id', user.id)
      .order('liked_at', { ascending: false });

    if (data) {
      setTracks(
        data
          .filter((r: any) => r.un_tunes_tracks)
          .map((r: any) => ({
            ...r.un_tunes_tracks,
            artist_name: r.un_tunes_tracks.un_tunes_artists?.artist_name || 'Unknown',
            artist_avatar: r.un_tunes_tracks.un_tunes_artists?.avatar_url || null,
          }))
      );
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  return { tracks, loading, refresh };
}

/** Fetch recently played tracks via un_tunes_plays */
export function useRecentlyPlayed() {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setTracks([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('un_tunes_plays')
      .select('track_id, played_at, un_tunes_tracks(*, un_tunes_artists(artist_name, avatar_url))')
      .eq('user_id', user.id)
      .order('played_at', { ascending: false })
      .limit(30);

    if (data) {
      // Deduplicate — keep first (most recent) occurrence of each track
      const seen = new Set<string>();
      const unique: Track[] = [];
      for (const r of data as any[]) {
        if (!r.un_tunes_tracks || seen.has(r.track_id)) continue;
        seen.add(r.track_id);
        unique.push({
          ...r.un_tunes_tracks,
          artist_name: r.un_tunes_tracks.un_tunes_artists?.artist_name || 'Unknown',
          artist_avatar: r.un_tunes_tracks.un_tunes_artists?.avatar_url || null,
        });
      }
      setTracks(unique);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  return { tracks, loading, refresh };
}

/** Fetch tracks in a specific playlist */
export function usePlaylistTracks(playlistId: string | null) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!playlistId) { setTracks([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('un_tunes_playlist_items')
      .select('position, un_tunes_tracks(*, un_tunes_artists(artist_name, avatar_url))')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: true });

    if (data) {
      setTracks(
        data
          .filter((r: any) => r.un_tunes_tracks)
          .map((r: any) => ({
            ...r.un_tunes_tracks,
            artist_name: r.un_tunes_tracks.un_tunes_artists?.artist_name || 'Unknown',
            artist_avatar: r.un_tunes_tracks.un_tunes_artists?.avatar_url || null,
          }))
      );
    }
    setLoading(false);
  }, [playlistId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { tracks, loading, refresh };
}

/* ── Albums ── */

export function useAlbums() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('un_tunes_albums')
        .select('*, un_tunes_artists(artist_name)')
        .eq('album_type', 'album')
        .order('release_date', { ascending: true });
      if (data) {
        setAlbums(
          data.map((a: any) => ({
            ...a,
            artist_name: a.un_tunes_artists?.artist_name || 'UNBREAKABLE',
            track_count: a.total_tracks || 0,
          }))
        );
      }
      setLoading(false);
    })();
  }, []);

  return { albums, loading };
}

export function useAlbumTracks(albumId: string | null) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!albumId) { setTracks([]); return; }
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from('un_tunes_tracks')
        .select('*, un_tunes_artists(artist_name, avatar_url)')
        .eq('album_id', albumId)
        .order('track_number', { ascending: true });
      if (data) {
        setTracks(
          data.map((t: any) => ({
            ...t,
            artist_name: t.un_tunes_artists?.artist_name || 'Unknown',
            artist_avatar: t.un_tunes_artists?.avatar_url || null,
          }))
        );
      }
      setLoading(false);
    })();
  }, [albumId]);

  return { tracks, loading };
}
