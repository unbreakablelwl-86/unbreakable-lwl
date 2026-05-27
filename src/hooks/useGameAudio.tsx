import { useRef, useCallback, useEffect, useState } from "react";
import { usePlayer, Track } from "@/hooks/useUnTunes";
import { supabase } from "@/integrations/supabase/client";

type GameType = "snake" | "alleyway" | "tetris" | "reaction" | "memory" | "pattern" | "flow" | "maths" | "focus" | "wordchain" | "flappy";

// ═══════════════════════════════════════════════════════════════
// Game Audio — SFX via Web Audio oscillators, Music via Un-Tunes
// ═══════════════════════════════════════════════════════════════

export function useGameAudio(gameType: GameType) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const [isMuted, setIsMuted] = useState(() => {
    try { return localStorage.getItem("game-audio-muted") === "true"; } catch { return false; }
  });

  // ─── Un-Tunes player for background music ───
  const { state: playerState, playTrack, togglePlay: playerToggle } = usePlayer();

  // Keep refs for stable callbacks (avoid dependency churn in game effects)
  const playTrackRef = useRef(playTrack);
  const playerToggleRef = useRef(playerToggle);
  const playerStateRef = useRef(playerState);
  const startedByGameRef = useRef(false);

  playTrackRef.current = playTrack;
  playerToggleRef.current = playerToggle;
  playerStateRef.current = playerState;

  // ─── Web Audio context for SFX oscillators ───
  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
      gainRef.current = audioCtxRef.current.createGain();
      gainRef.current.gain.value = isMuted ? 0 : 0.15;
      gainRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return { ctx: audioCtxRef.current, gain: gainRef.current! };
  }, [isMuted]);

  const playTone = useCallback((freq: number, duration: number, volume = 0.15, type: OscillatorType = "square") => {
    if (isMuted) return;
    const { ctx, gain } = getCtx();
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    oscGain.gain.setValueAtTime(volume, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(oscGain);
    oscGain.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }, [isMuted, getCtx]);

  // ─── SFX ───
  const playHit = useCallback(() => {
    playTone(600, 0.08, 0.12, "square");
    setTimeout(() => playTone(800, 0.06, 0.1, "square"), 30);
  }, [playTone]);

  const playLevelUp = useCallback(() => {
    const freqs = [523, 659, 784, 1047];
    freqs.forEach((f, i) => setTimeout(() => playTone(f, 0.15, 0.12, "square"), i * 80));
  }, [playTone]);

  const playGameOver = useCallback(() => {
    const freqs = [440, 370, 311, 261];
    freqs.forEach((f, i) => setTimeout(() => playTone(f, 0.25, 0.1, "sawtooth"), i * 150));
  }, [playTone]);

  // ─── Music — Un-Tunes library via global player ───
  const startMusic = useCallback(async () => {
    // If Un-Tunes is already playing (user started music themselves), don't interrupt
    if (playerStateRef.current.isPlaying && playerStateRef.current.currentTrack) return;

    try {
      const { data } = await supabase
        .from("un_tunes_tracks")
        .select("*, un_tunes_artists!inner(artist_name, avatar_url)")
        .not("audio_url", "is", null)
        .order("title");

      if (!data || data.length === 0) return;

      const tracks: Track[] = data.map((t: any) => ({
        ...t,
        artist_name: t.un_tunes_artists?.artist_name,
        artist_avatar: t.un_tunes_artists?.avatar_url,
      }));

      // Shuffle the queue so each session feels fresh
      for (let i = tracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
      }

      startedByGameRef.current = true;
      playTrackRef.current(tracks[0], tracks);
    } catch {
      // Silently fail — games work fine without music
    }
  }, []);

  const stopMusic = useCallback(() => {
    if (startedByGameRef.current && playerStateRef.current.isPlaying) {
      playerToggleRef.current();
    }
    startedByGameRef.current = false;
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      try { localStorage.setItem("game-audio-muted", String(next)); } catch {}
      if (gainRef.current) gainRef.current.gain.value = next ? 0 : 0.15;
      return next;
    });
  }, []);

  // Cleanup SFX context on unmount (music keeps playing via FloatingMiniPlayer)
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  return { playHit, playLevelUp, playGameOver, startMusic, stopMusic, toggleMute, isMuted };
}
