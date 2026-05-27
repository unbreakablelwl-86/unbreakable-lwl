/**
 * SamplePlayer — Floating 30-second preview mini player for landing page / non-users.
 * Shows a compact overlay that auto-plays samples from the Un-Tunes library.
 * Designed to hook visitors → sign up CTA.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, X, Music, Lock, Disc3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface SampleTrack {
  id: string;
  title: string;
  artist_name: string;
  cover_url: string | null;
  audio_url: string;
  duration_seconds: number;
}

const PREVIEW_DURATION = 30; // seconds

interface SamplePlayerProps {
  onSignUp?: () => void;
  className?: string;
}

export function SamplePlayer({ onSignUp, className }: SamplePlayerProps) {
  const [tracks, setTracks] = useState<SampleTrack[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadingRef = useRef(false);

  // Load sample tracks
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('un_tunes_tracks')
        .select('id, title, audio_url, cover_url, duration_seconds, un_tunes_artists(artist_name)')
        .not('audio_url', 'is', null)
        .order('play_count', { ascending: false })
        .limit(10);

      if (data && data.length > 0) {
        setTracks(data.map((t: any) => ({
          id: t.id,
          title: t.title,
          artist_name: t.un_tunes_artists?.artist_name || 'UNBREAKABLE',
          cover_url: t.cover_url,
          audio_url: t.audio_url,
          duration_seconds: t.duration_seconds,
        })));
      }
    })();
  }, []);

  // Setup audio
  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.6;
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      nextTrack();
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // 30s preview fade-out
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isPlaying) return;

    const checkPreview = () => {
      if (audio.currentTime >= PREVIEW_DURATION && !fadingRef.current) {
        fadingRef.current = true;
        setShowUnlock(true);
        const startVol = audio.volume;
        let step = 0;
        const fade = setInterval(() => {
          step++;
          audio.volume = Math.max(0, startVol * (1 - step / 20));
          if (step >= 20) {
            clearInterval(fade);
            audio.pause();
            audio.volume = startVol;
            fadingRef.current = false;
            setIsPlaying(false);
          }
        }, 100);
      }
    };

    audio.addEventListener('timeupdate', checkPreview);
    return () => audio.removeEventListener('timeupdate', checkPreview);
  }, [isPlaying]);

  const currentTrack = tracks[currentIdx] || null;

  const play = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    if (!audioRef.current.src || audioRef.current.src !== currentTrack.audio_url) {
      audioRef.current.src = currentTrack.audio_url;
    }
    audioRef.current.play();
    setIsPlaying(true);
    setShowUnlock(false);
    fadingRef.current = false;
  }, [currentTrack]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const nextTrack = useCallback(() => {
    setCurrentIdx(prev => {
      const next = (prev + 1) % Math.max(1, tracks.length);
      return next;
    });
    setCurrentTime(0);
    setShowUnlock(false);
    fadingRef.current = false;
  }, [tracks.length]);

  const prevTrack = useCallback(() => {
    setCurrentIdx(prev => {
      const p = prev - 1 < 0 ? Math.max(0, tracks.length - 1) : prev - 1;
      return p;
    });
    setCurrentTime(0);
    setShowUnlock(false);
    fadingRef.current = false;
  }, [tracks.length]);

  // Auto-load audio on track change
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    audioRef.current.src = currentTrack.audio_url;
    audioRef.current.currentTime = 0;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    }
  }, [currentIdx, currentTrack?.id]);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  }, [isMuted]);

  if (!isOpen || tracks.length === 0) return null;

  const progress = Math.min(currentTime / PREVIEW_DURATION, 1);

  return (
    <AnimatePresence>
      <motion.div
        className={cn(
          'fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-4 md:max-w-sm',
          className,
        )}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-800">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-orange-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-zinc-600 hover:text-zinc-400 transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="px-4 pt-3 pb-1">
            <div className="flex items-center gap-1.5 text-[9px] font-display tracking-[0.2em] text-primary/80 uppercase">
              <Disc3 className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />
              UN-TUNES PREVIEW
            </div>
          </div>

          {/* Track info + controls */}
          <div className="px-4 pb-3 flex items-center gap-3">
            {/* Cover art */}
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800 relative">
              {currentTrack?.cover_url ? (
                <img src={currentTrack.cover_url} alt={currentTrack.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-5 h-5 text-zinc-600" />
                </div>
              )}
              {showUnlock && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-primary" />
                </div>
              )}
            </div>

            {/* Title & artist */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-display tracking-wider text-white truncate">
                {currentTrack?.title || 'Loading…'}
              </p>
              <p className="text-[10px] text-zinc-500 truncate">
                {currentTrack?.artist_name}
              </p>
              <p className="text-[9px] text-zinc-600 mt-0.5">
                {Math.floor(currentTime)}s / {PREVIEW_DURATION}s preview
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
              <button onClick={prevTrack} className="p-1.5 text-zinc-400 hover:text-white transition-colors">
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={isPlaying ? pause : play}
                className="p-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button onClick={nextTrack} className="p-1.5 text-zinc-400 hover:text-white transition-colors">
                <SkipForward className="w-4 h-4" />
              </button>
              <button onClick={toggleMute} className="p-1.5 text-zinc-500 hover:text-white transition-colors">
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Unlock CTA (shown after 30s preview ends) */}
          <AnimatePresence>
            {showUnlock && (
              <motion.div
                className="px-4 pb-3"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <Button
                  onClick={onSignUp}
                  className="w-full bg-gradient-to-r from-primary to-orange-600 text-white font-display tracking-wider text-xs py-2"
                >
                  <Lock className="w-3.5 h-3.5 mr-2" />
                  SIGN UP TO UNLOCK FULL TRACKS
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
