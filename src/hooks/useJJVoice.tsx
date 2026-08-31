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
 * Device voice (Web Speech API).
 * Free and unmetered — every cardio/mindset cue spoken this way
 * costs nothing, unlike the ElevenLabs coach voice which bills
 * per character. Used for short, repetitive cues.
 *
 * Unbreakable Coach is male, always — no gender choice. Voices are
 * matched by name against MALE_HINTS, with FEMALE_EXCLUDE names
 * filtered out first. That exclusion step matters: the old matcher
 * checked for the bare substring "male", and "female" itself
 * contains "male" ("fe-MALE"), so it would happily match a voice
 * named e.g. "Google UK English Female" and hand back a female
 * voice whenever one happened to be listed before the male one.
 * ────────────────────────────────────────────────────────────── */
const FEMALE_EXCLUDE = ['female', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona', 'serena', 'zira', 'hazel', 'amelie', 'joana', 'susan', 'kate', 'emma', 'olivia', 'zoe'];
const MALE_HINTS = ['male', 'daniel', 'alex', 'fred', 'david', 'george', 'oliver', 'thomas', 'rishi', 'aaron', 'arthur', 'james', 'ryan', 'nathan', 'brian', 'guy'];

/* getVoices() commonly returns an empty list the first time it's called —
 * most browsers (mobile Chrome/Safari especially) load the voice list
 * asynchronously in the background and only fire 'voiceschanged' once it's
 * ready. Breathwork and cardio cues are often the very first speech request
 * of a session, so they were hitting that empty window: no voice ever got
 * set on the utterance, and the browser fell back to its own system
 * default — which on iOS Safari, for one, is a female voice (Samantha).
 * That's what made it look like "male voice everywhere except breathwork
 * and cardio". This caches the list and, when it's not ready yet, waits
 * (briefly, with a timeout) for it before picking a voice. */
let cachedVoices: SpeechSynthesisVoice[] = [];

function getVoicesReady(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !window.speechSynthesis) return Promise.resolve([]);
  const existing = window.speechSynthesis.getVoices();
  if (existing.length) {
    cachedVoices = existing;
    return Promise.resolve(existing);
  }
  if (cachedVoices.length) return Promise.resolve(cachedVoices);

  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      const voices = window.speechSynthesis.getVoices();
      cachedVoices = voices;
      resolve(voices);
    };
    window.speechSynthesis.addEventListener('voiceschanged', finish, { once: true });
    // Some browsers never fire voiceschanged (voices were already available
    // some other way) — don't hang the first cue of a session waiting.
    setTimeout(finish, 350);
  });
}

function pickMaleDeviceVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  const notFemale = (v: SpeechSynthesisVoice) => !FEMALE_EXCLUDE.some(h => v.name.toLowerCase().includes(h));
  const isMaleHint = (v: SpeechSynthesisVoice) => MALE_HINTS.some(h => v.name.toLowerCase().includes(h));
  const isGB = (v: SpeechSynthesisVoice) => v.lang?.toLowerCase().includes('gb');
  const isEn = (v: SpeechSynthesisVoice) => v.lang?.toLowerCase().startsWith('en');

  // Every tier below is filtered through notFemale first — a female-named
  // voice is only ever returned if literally no other voice exists on the
  // device at all, which the old fallback chain didn't guarantee.
  const nonFemale = voices.filter(notFemale);
  const tiers = [
    nonFemale.filter(v => isGB(v) && isMaleHint(v)),
    nonFemale.filter(v => isEn(v) && isMaleHint(v)),
    nonFemale.filter(isMaleHint),
    nonFemale.filter(isGB),
    nonFemale.filter(isEn),
    nonFemale,
    voices.filter(isGB),
    voices.filter(isEn),
  ];
  for (const list of tiers) {
    if (list.length) return list[0];
  }
  return voices[0] ?? null;
}

export async function speakOnDevice(text: string): Promise<boolean> {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  try {
    const voices = await getVoicesReady();
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const voice = pickMaleDeviceVoice(voices);
    if (voice) utter.voice = voice;
    utter.lang = voice?.lang || 'en-GB';
    utter.rate = 1.0;
    utter.pitch = 0.9;
    window.speechSynthesis.speak(utter);
    return true;
  } catch {
    return false;
  }
}

/* ── Hook ── */
export function useJJVoice() {
  const [settings, setSettings] = useState<VoiceSettings>(loadSettings);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
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

    // Stop current playback
    if (ttsAudioRef.current) { ttsAudioRef.current.pause(); ttsAudioRef.current = null; }

    // Cardio and mindset cues use the free device voice, not billed TTS.
    if (feature === 'cardio' || feature === 'mindset') {
      if (await speakOnDevice(cleanText)) return;
    }

    setIsSpeaking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setIsSpeaking(false); return; }

      const res = await supabase.functions.invoke('breathing-tts', {
        body: { text: cleanText.slice(0, 5000) },
      });

      if (res.error || !res.data) {
        console.error('TTS error:', res.error);
        setIsSpeaking(false);
        return;
      }

      const blob = new Blob([res.data], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      ttsAudioRef.current = audio;
      audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(url); ttsAudioRef.current = null; };
      audio.onerror = () => { setIsSpeaking(false); URL.revokeObjectURL(url); ttsAudioRef.current = null; };
      await audio.play();
    } catch (e) {
      console.error('TTS playback error:', e);
      setIsSpeaking(false);
    }
  }, [settings]);

  const stop = useCallback(() => {
    if (ttsAudioRef.current) { ttsAudioRef.current.pause(); ttsAudioRef.current = null; }
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
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
