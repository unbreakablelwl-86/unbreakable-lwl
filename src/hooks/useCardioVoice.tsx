import { useCallback, useRef, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Cardio voice updates.
 * 
 * Strategy:
 * 1. Try ElevenLabs TTS via edge function (best quality, works in background)
 * 2. Fall back to browser SpeechSynthesis if TTS unavailable
 * 3. Warm-up SpeechSynthesis on enable to satisfy mobile user-gesture requirement
 */
export function useCardioVoice({ enabled }: { enabled: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());
  const pendingRef = useRef<Set<string>>(new Set());
  const ttsAvailableRef = useRef<boolean | null>(null); // null = untested
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const warmedUpRef = useRef(false);

  /* ── Pick best voice for SpeechSynthesis fallback ── */
  const pickVoice = useCallback(() => {
    if (typeof speechSynthesis === "undefined") return;
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) return;

    const preferred = [
      "samantha", "karen", "moira", "google uk english female",
      "google us english", "microsoft zira", "microsoft hazel",
    ];
    for (const pref of preferred) {
      const match = voices.find(v => v.name.toLowerCase().includes(pref) && v.lang.startsWith("en"));
      if (match) { selectedVoiceRef.current = match; return; }
    }
    const anyEnglish = voices.find(v => v.lang.startsWith("en"));
    selectedVoiceRef.current = anyEnglish || voices[0];
  }, []);

  useEffect(() => {
    if (typeof speechSynthesis === "undefined") return;
    const handle = () => pickVoice();
    if (speechSynthesis.getVoices().length > 0) handle();
    speechSynthesis.addEventListener("voiceschanged", handle);
    return () => speechSynthesis.removeEventListener("voiceschanged", handle);
  }, [pickVoice]);

  /* ── Warm up SpeechSynthesis on enable ── */
  useEffect(() => {
    if (enabled && !warmedUpRef.current && typeof speechSynthesis !== "undefined") {
      warmedUpRef.current = true;
      const warmup = new SpeechSynthesisUtterance("");
      warmup.volume = 0;
      speechSynthesis.speak(warmup);
    }
  }, [enabled]);

  /* ── SpeechSynthesis fallback ── */
  const speakFallback = useCallback((text: string) => {
    if (typeof speechSynthesis === "undefined") return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1;
    if (selectedVoiceRef.current) utterance.voice = selectedVoiceRef.current;
    speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!enabled) return;

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const cacheKey = text;

    // Check cache first (TTS audio)
    if (cacheRef.current.has(cacheKey)) {
      try {
        audioRef.current = new Audio(cacheRef.current.get(cacheKey)!);
        audioRef.current.volume = 1;
        await audioRef.current.play();
        return;
      } catch (e) {
        console.error("Cardio voice playback error:", e);
      }
    }

    // If we know TTS is unavailable, use fallback immediately
    if (ttsAvailableRef.current === false) {
      speakFallback(text);
      return;
    }

    // Skip if already fetching this text
    if (pendingRef.current.has(cacheKey)) return;
    pendingRef.current.add(cacheKey);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        pendingRef.current.delete(cacheKey);
        ttsAvailableRef.current = false;
        speakFallback(text);
        return;
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

      pendingRef.current.delete(cacheKey);

      if (!response.ok) {
        console.warn("Cardio TTS failed:", response.status, "— using SpeechSynthesis fallback");
        ttsAvailableRef.current = false;
        speakFallback(text);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      cacheRef.current.set(cacheKey, url);
      ttsAvailableRef.current = true;

      audioRef.current = new Audio(url);
      audioRef.current.volume = 1;
      await audioRef.current.play();
    } catch (error) {
      pendingRef.current.delete(cacheKey);
      console.warn("Cardio voice error, falling back:", error);
      ttsAvailableRef.current = false;
      speakFallback(text);
    }
  }, [enabled, speakFallback]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
  }, []);

  const cleanup = useCallback(() => {
    stop();
    cacheRef.current.forEach(url => URL.revokeObjectURL(url));
    cacheRef.current.clear();
    pendingRef.current.clear();
  }, [stop]);

  return { speak, stop, cleanup };
}
