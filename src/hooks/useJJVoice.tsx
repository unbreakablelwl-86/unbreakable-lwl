import { useCallback, useRef, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/* ── Granular voice setting keys ── */
export type VoiceFeature = 'chat' | 'mindset' | 'cardio' | 'notifications' | 'university';

const STORAGE_KEY = 'unbreakable-voice-settings';

interface VoiceSettings {
  master: boolean;
  chat: boolean;
  mindset: boolean;
  cardio: boolean;
  notifications: boolean;
  university: boolean;
}

const DEFAULT_SETTINGS: VoiceSettings = {
  master: true,
  chat: true,
  mindset: true,
  cardio: true,
  notifications: false,
  university: true,
};

function loadSettings(): VoiceSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // 'gender' is a legacy key from when cardio/mindset offered a male/female
      // choice — Unbreakable is a male coach everywhere now, so it's dropped
      // on read rather than carried forward.
      delete parsed.gender;
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(s: VoiceSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

/* ──────────────────────────────────────────────────────────────
 * The on-device Web Speech API voice picker that used to live here has
 * been retired. It was never reliable: different browsers/OSes expose
 * wildly different voice lists, so no amount of name-hint matching could
 * guarantee a male English voice — it surfaced a female voice on some
 * devices, and even a completely different-language (German) voice on
 * others when no good match existed on that device at all. Cardio and
 * breathwork cues now go through the same single ElevenLabs "James" voice
 * as everything else (see speakViaCoachVoice below), so the voice is
 * always right, everywhere, on every device — no per-browser guessing.
 *
 * The obvious worry with that switch is cost: cardio and breathing cues
 * fire constantly and used to be free specifically to avoid billing
 * ElevenLabs per character for that volume. speakViaCoachVoice covers
 * this with a *shared, server-side* cache — the breathing-tts edge
 * function caches generated audio by a hash of the exact text in a public
 * Supabase Storage bucket, so a phrase like "One kilometre. Nice and
 * steady." is only ever sent to ElevenLabs once, ever, across every user
 * and every session — not once per device the way a client-side cache
 * would be.
 * ────────────────────────────────────────────────────────────── */

/* Track whatever coach-voice audio is currently playing so a new cue can
 * cut off a stale one, and so stop() (used across chat/cardio/breathwork)
 * has one thing to pause regardless of which feature started it. */
let currentAudio: HTMLAudioElement | null = null;

export function stopCoachVoice() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

/**
 * Speak text through the shared ElevenLabs coach voice (with server-side
 * caching for repeated phrases). Returns true once playback has started;
 * `onDone` fires when playback ends or errors, for callers that track an
 * "is speaking" state.
 */
export async function speakViaCoachVoice(text: string, onDone?: () => void): Promise<boolean> {
  const cleanText = text.trim();
  if (!cleanText) return false;

  try {
    stopCoachVoice();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const res = await supabase.functions.invoke('breathing-tts', {
      body: { text: cleanText.slice(0, 5000) },
    });

    if (res.error || !res.data) {
      console.error('Coach voice TTS error:', res.error);
      return false;
    }

    const blob = new Blob([res.data], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentAudio = audio;
    const cleanup = () => {
      if (currentAudio === audio) currentAudio = null;
      URL.revokeObjectURL(url);
      onDone?.();
    };
    audio.onended = cleanup;
    audio.onerror = cleanup;
    await audio.play();
    return true;
  } catch (e) {
    console.error('Coach voice playback error:', e);
    onDone?.();
    return false;
  }
}

/* ── Hook ── */
export function useJJVoice() {
  const [settings, setSettings] = useState<VoiceSettings>(loadSettings);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Persist on change
  useEffect(() => { saveSettings(settings); }, [settings]);

  /* Unlock audio for mobile — call on user gesture */
  const unlockAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    const silent = audioCtxRef.current.createBuffer(1, 1, 22050);
    const src = audioCtxRef.current.createBufferSource();
    src.buffer = silent;
    src.connect(audioCtxRef.current.destination);
    src.start();
  }, []);

  /* Check if a feature is enabled */
  const isEnabled = useCallback((feature: VoiceFeature) => {
    return settings.master && settings[feature];
  }, [settings]);

  /* Update a single setting */
  const setSetting = useCallback((key: keyof VoiceSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  /* Speak text via ElevenLabs TTS (James voice) */
  const speak = useCallback(async (text: string, feature?: VoiceFeature): Promise<void> => {
    // Check if feature is enabled
    if (feature && !settings.master) return;
    if (feature && !settings[feature]) return;

    // Clean text
    const cleanText = text
      .replace(/[#*_~`>]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/[\u{1F600}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1FA00}-\u{1FAFF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!cleanText) return;

    setIsSpeaking(true);
    const ok = await speakViaCoachVoice(cleanText, () => setIsSpeaking(false));
    if (!ok) setIsSpeaking(false);
  }, [settings]);

  const stop = useCallback(() => {
    stopCoachVoice();
    setIsSpeaking(false);
  }, []);

  return {
    settings,
    setSetting,
    isEnabled,
    unlockAudio,
    speak,
    stop,
    isSpeaking,
  };
}
