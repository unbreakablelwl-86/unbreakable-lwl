import { useCallback, useRef, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseBreathingAudioOptions {
  enabled: boolean;
}

/**
 * Breathing-exercise voice guidance.
 * 
 * Strategy:
 * 1. Try ElevenLabs TTS edge function first (sounds best, works in background)
 * 2. Fall back to browser SpeechSynthesis if ElevenLabs unavailable
 * 3. Warm-up SpeechSynthesis on first enable to satisfy mobile user-gesture requirement
 */
export function useBreathingAudio({ enabled }: UseBreathingAudioOptions) {
  const [voicesReady, setVoicesReady] = useState(false);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsAvailableRef = useRef<boolean | null>(null); // null = untested
  const ttsCacheRef = useRef<Map<string, string>>(new Map());
  const warmedUpRef = useRef(false);

  /* ── Pick the best female English voice for SpeechSynthesis fallback ── */
  const pickVoice = useCallback(() => {
    if (typeof speechSynthesis === "undefined") return;
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) return;

    const preferred = [
      "samantha", "karen", "moira", "tessa", "fiona",
      "google uk english female", "google us english",
      "microsoft zira", "microsoft hazel", "microsoft susan",
    ];

    for (const pref of preferred) {
      const match = voices.find(
        (v) => v.name.toLowerCase().includes(pref) && v.lang.startsWith("en")
      );
      if (match) { selectedVoiceRef.current = match; return; }
    }

    const femaleHints = ["female", "woman", "girl"];
    const femaleVoice = voices.find(
      (v) => v.lang.startsWith("en") && femaleHints.some((h) => v.name.toLowerCase().includes(h))
    );
    if (femaleVoice) { selectedVoiceRef.current = femaleVoice; return; }

    const anyEnglish = voices.find((v) => v.lang.startsWith("en"));
    selectedVoiceRef.current = anyEnglish || voices[0];
  }, []);

  useEffect(() => {
    if (typeof speechSynthesis === "undefined") return;
    const handle = () => { pickVoice(); setVoicesReady(true); };
    if (speechSynthesis.getVoices().length > 0) handle();
    speechSynthesis.addEventListener("voiceschanged", handle);
    return () => speechSynthesis.removeEventListener("voiceschanged", handle);
  }, [pickVoice]);

  /* ── Warm up: speak a silent utterance on first enable (mobile user-gesture requirement) ── */
  useEffect(() => {
    if (enabled && !warmedUpRef.current && typeof speechSynthesis !== "undefined") {
      warmedUpRef.current = true;
      const warmup = new SpeechSynthesisUtterance("");
      warmup.volume = 0;
      speechSynthesis.speak(warmup);
    }
  }, [enabled]);

  /* ── Try ElevenLabs TTS ── */
  const tryTTS = useCallback(async (text: string): Promise<boolean> => {
    // If we already know TTS is unavailable, skip
    if (ttsAvailableRef.current === false) return false;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) { ttsAvailableRef.current = false; return false; }

      // Check cache
      if (ttsCacheRef.current.has(text)) {
        const url = ttsCacheRef.current.get(text)!;
        audioRef.current = new Audio(url);
        audioRef.current.volume = 0.8;
        await audioRef.current.play();
        return true;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/breathing-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        console.warn("TTS edge function returned", response.status);
        ttsAvailableRef.current = false;
        return false;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      ttsCacheRef.current.set(text, url);

      audioRef.current = new Audio(url);
      audioRef.current.volume = 0.8;
      await audioRef.current.play();
      ttsAvailableRef.current = true;
      return true;
    } catch (e) {
      console.warn("TTS error, falling back to SpeechSynthesis:", e);
      ttsAvailableRef.current = false;
      return false;
    }
  }, []);

  /* ── SpeechSynthesis fallback ── */
  const speakFallback = useCallback((text: string) => {
    if (typeof speechSynthesis === "undefined") return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1.05;
    utterance.volume = 0.8;
    if (selectedVoiceRef.current) utterance.voice = selectedVoiceRef.current;
    speechSynthesis.speak(utterance);
  }, []);

  /* ── Play (tries TTS first, then SpeechSynthesis) ── */
  const playAudio = useCallback(
    async (text: string) => {
      if (!enabled) return;

      // Stop any ongoing audio
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
      if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();

      // Try ElevenLabs TTS first
      const ttsWorked = await tryTTS(text);
      if (!ttsWorked) {
        // Fall back to SpeechSynthesis
        speakFallback(text);
      }
    },
    [enabled, tryTTS, speakFallback]
  );

  /* ── Stop ── */
  const stopAudio = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
  }, []);

  /* ── Preload ── */
  const preloadAudio = useCallback((_texts: string[]) => {
    if (typeof speechSynthesis !== "undefined" && !voicesReady) pickVoice();
  }, [voicesReady, pickVoice]);

  /* ── Cleanup ── */
  const cleanup = useCallback(() => {
    stopAudio();
    ttsCacheRef.current.forEach(url => URL.revokeObjectURL(url));
    ttsCacheRef.current.clear();
  }, [stopAudio]);

  return { playAudio, stopAudio, preloadAudio, cleanup };
}
