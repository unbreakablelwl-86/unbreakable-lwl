import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
});

export function usePlayer() {
  return useContext(PlayerContext);
}

export function usePlayerProvider() {
  const [state, setState] = useState<PlayerState>(defaultPlayerState);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = state.volume;
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      setState(s => ({ ...s, currentTime: audio.currentTime, duration: audio.duration || 0 }));
    });

    audio.addEventListener('ended', () => {
      handleTrackEnd();
    });

    audio.addEventListener('loadedmetadata', () => {
      setState(s => ({ ...s, duration: audio.duration }));
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const handleTrackEnd = useCallback(() => {
    setState(prev => {
      if (prev.repeat === 'one') {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
        return prev;
      }
      const nextIdx = prev.shuffle
        ? Math.floor(Math.random() * prev.queue.length)
        : prev.queueIndex + 1;

      if (nextIdx >= prev.queue.length) {
        if (prev.repeat === 'all' && prev.queue.length > 0) {
          const track = prev.queue[0];
          if (audioRef.current) {
            audioRef.current.src = track.audio_url;
            audioRef.current.play();
          }
          return { ...prev, currentTrack: track, queueIndex: 0, isPlaying: true };
        }
        return { ...prev, isPlaying: false };
      }

      const track = prev.queue[nextIdx];
      if (audioRef.current) {
        audioRef.current.src = track.audio_url;
        audioRef.current.play();
      }
      return { ...prev, currentTrack: track, queueIndex: nextIdx, isPlaying: true };
    });
  }, []);

  const playTrack = useCallback((track: Track, queue?: Track[]) => {
    const q = queue || [track];
    const idx = q.findIndex(t => t.id === track.id);
    if (audioRef.current) {
      audioRef.current.src = track.audio_url;
      audioRef.current.play();
    }
    setState(s => ({
      ...s,
      currentTrack: track,
      queue: q,
      queueIndex: idx >= 0 ? idx : 0,
      isPlaying: true,
    }));
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !state.currentTrack) return;
    if (state.isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setState(s => ({ ...s, isPlaying: !s.isPlaying }));
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
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setState(s => ({ ...s, currentTime: time }));
  }, []);

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
  };
}

/* ─── Data Hooks ─── */

/** Fetch featured / trending tracks */
export function useFeaturedTracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('un_tunes_tracks')
        .select('*, un_tunes_artists!inner(artist_name, avatar_url)')
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
    await supabase.rpc('increment_track_plays', { track_id: trackId });
  }, [user]);
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
export const GENRES = [
  { key: 'workout', label: 'Workout', emoji: '💪', color: '#FF5500' },
  { key: 'running', label: 'Running', emoji: '🏃', color: '#22C55E' },
  { key: 'hip-hop', label: 'Hip Hop', emoji: '🎤', color: '#8B5CF6' },
  { key: 'electronic', label: 'Electronic', emoji: '🎧', color: '#06B6D4' },
  { key: 'rock', label: 'Rock', emoji: '🎸', color: '#EF4444' },
  { key: 'motivation', label: 'Motivation', emoji: '🔥', color: '#F59E0B' },
  { key: 'chill', label: 'Chill', emoji: '🌊', color: '#3B82F6' },
  { key: 'podcast', label: 'Podcasts', emoji: '🎙️', color: '#EC4899' },
  { key: 'boxing', label: 'Boxing', emoji: '🥊', color: '#DC2626' },
  { key: 'drum-and-bass', label: 'Drum & Bass', emoji: '🥁', color: '#7C3AED' },
];
