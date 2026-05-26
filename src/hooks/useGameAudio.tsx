import { useRef, useCallback, useEffect, useState } from "react";

type GameType = "snake" | "alleyway" | "tetris" | "reaction" | "memory" | "pattern" | "flow" | "maths" | "focus";

// Note frequencies for 8-bit melodies
const NOTES: Record<string, number> = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00,
  A4: 440.00, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25,
  F5: 698.46, G5: 783.99, A5: 880.00,
};

// Unique melody patterns per game (note name + duration in 16ths)
const MELODIES: Record<GameType, { notes: string[]; tempo: number }> = {
  snake: {
    tempo: 140,
    notes: [
      "E4", "G4", "A4", "G4", "E4", "D4", "C4", "D4",
      "E4", "E4", "G4", "A4", "C5", "A4", "G4", "E4",
      "D4", "E4", "G4", "E4", "D4", "C4", "D4", "E4",
      "G4", "A4", "G4", "E4", "D4", "C4", "D4", "C4",
    ],
  },
  alleyway: {
    tempo: 160,
    notes: [
      "A4", "C5", "E5", "C5", "A4", "E4", "A4", "C5",
      "D5", "C5", "A4", "G4", "A4", "C5", "D5", "E5",
      "C5", "A4", "G4", "A4", "E4", "G4", "A4", "C5",
      "E5", "D5", "C5", "A4", "G4", "E4", "G4", "A4",
    ],
  },
  tetris: {
    tempo: 150,
    notes: [
      "E5", "B4", "C5", "D5", "C5", "B4", "A4", "A4",
      "C5", "E5", "D5", "C5", "B4", "C5", "D5", "E5",
      "C5", "A4", "A4", "D5", "F5", "A5", "G5", "F5",
      "E5", "C5", "E5", "D5", "C5", "B4", "C5", "D5",
    ],
  },
  reaction: {
    tempo: 170,
    notes: [
      "A4", "E5", "A4", "E5", "D5", "C5", "A4", "G4",
      "A4", "C5", "E5", "G5", "E5", "C5", "A4", "G4",
      "F4", "A4", "C5", "A4", "F4", "E4", "F4", "A4",
      "C5", "E5", "D5", "C5", "A4", "G4", "A4", "E5",
    ],
  },
  memory: {
    tempo: 120,
    notes: [
      "C4", "E4", "G4", "C5", "G4", "E4", "C4", "D4",
      "F4", "A4", "D5", "A4", "F4", "D4", "E4", "G4",
      "B4", "E5", "B4", "G4", "E4", "F4", "A4", "C5",
      "F5", "C5", "A4", "F4", "E4", "G4", "C5", "E5",
    ],
  },
  pattern: {
    tempo: 135,
    notes: [
      "E4", "A4", "C5", "E5", "C5", "A4", "E4", "G4",
      "B4", "D5", "G5", "D5", "B4", "G4", "A4", "C5",
      "E5", "A5", "E5", "C5", "A4", "G4", "E4", "G4",
      "A4", "C5", "D5", "E5", "D5", "C5", "A4", "E4",
    ],
  },
  flow: {
    tempo: 155,
    notes: [
      "A4", "C5", "D5", "E5", "G5", "E5", "D5", "C5",
      "A4", "G4", "A4", "C5", "E5", "G5", "A5", "G5",
      "E5", "D5", "C5", "D5", "E5", "C5", "A4", "G4",
      "A4", "C5", "E5", "D5", "C5", "A4", "G4", "A4",
    ],
  },
  maths: {
    tempo: 180,
    notes: [
      "E5", "E5", "G5", "E5", "C5", "D5", "E5", "D5",
      "C5", "A4", "C5", "E5", "A5", "G5", "E5", "C5",
      "D5", "E5", "G5", "A5", "G5", "E5", "D5", "C5",
      "E5", "C5", "A4", "C5", "D5", "E5", "G5", "E5",
    ],
  },
  focus: {
    tempo: 90,
    notes: [
      "C4", "E4", "G4", "C5", "E5", "C5", "G4", "E4",
      "F4", "A4", "C5", "F5", "C5", "A4", "F4", "E4",
      "G4", "B4", "D5", "G5", "D5", "B4", "G4", "C4",
      "E4", "G4", "C5", "G4", "E4", "C4", "E4", "G4",
    ],
  },
};

export function useGameAudio(gameType: GameType) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const musicIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const noteIndexRef = useRef(0);
  const [isMuted, setIsMuted] = useState(() => {
    try { return localStorage.getItem("game-audio-muted") === "true"; } catch { return false; }
  });

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

  // Play a single 8-bit tone
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

  // SFX: Collision/score hit
  const playHit = useCallback(() => {
    playTone(600, 0.08, 0.12, "square");
    setTimeout(() => playTone(800, 0.06, 0.1, "square"), 30);
  }, [playTone]);

  // SFX: Level up
  const playLevelUp = useCallback(() => {
    const freqs = [523, 659, 784, 1047];
    freqs.forEach((f, i) => setTimeout(() => playTone(f, 0.15, 0.12, "square"), i * 80));
  }, [playTone]);

  // SFX: Game over
  const playGameOver = useCallback(() => {
    const freqs = [440, 370, 311, 261];
    freqs.forEach((f, i) => setTimeout(() => playTone(f, 0.25, 0.1, "sawtooth"), i * 150));
  }, [playTone]);

  // Background music
  const startMusic = useCallback(() => {
    if (musicIntervalRef.current) return;
    noteIndexRef.current = 0;
    const melody = MELODIES[gameType];
    const beatMs = (60 / melody.tempo) * 1000 / 2; // 8th notes

    musicIntervalRef.current = setInterval(() => {
      if (isMuted) return;
      const noteName = melody.notes[noteIndexRef.current % melody.notes.length];
      const freq = NOTES[noteName];
      if (freq) playTone(freq, beatMs / 1000 * 0.8, 0.06, "square");
      noteIndexRef.current++;
    }, beatMs);
  }, [gameType, isMuted, playTone]);

  const stopMusic = useCallback(() => {
    if (musicIntervalRef.current) {
      clearInterval(musicIntervalRef.current);
      musicIntervalRef.current = null;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      try { localStorage.setItem("game-audio-muted", String(next)); } catch {}
      if (gainRef.current) gainRef.current.gain.value = next ? 0 : 0.15;
      return next;
    });
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      stopMusic();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [stopMusic]);

  return { playHit, playLevelUp, playGameOver, startMusic, stopMusic, toggleMute, isMuted };
}
