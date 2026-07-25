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
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(s: VoiceSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
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
