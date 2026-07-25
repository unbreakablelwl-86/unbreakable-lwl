import { useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseBreathingAudioOptions {
  enabled: boolean;
}

/**
 * Breathing-exercise voice guidance.
 * Uses ElevenLabs TTS (James voice) via the breathing-tts edge function.
 * No browser speech fallback — JJ's voice only.
 */
export function useBreathingAudio({ enabled }: UseBreathingAudioOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsAvailableRef = useRef<boolean | null>(null);
  const ttsCacheRef = useRef<Map<string, string>>(new Map());

  /* ── Try ElevenLabs TTS ── */
  const tryTTS = useCallback(async (text: string): Promise<boolean> => {
    if (ttsAvailableRef.current === false) return false;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) { ttsAvailableRef.current = false; return false; }

      const cacheKey = text;
      if (ttsCacheRef.current.has(cacheKey)) {
        const url = ttsCacheRef.current.get(cacheKey)!;
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
      ttsCacheRef.current.set(cacheKey, url);

      audioRef.current = new Audio(url);
      audioRef.current.volume = 0.8;
      await audioRef.current.play();
      ttsAvailableRef.current = true;
      return true;
    } catch (e) {
      console.warn("TTS error:", e);
      ttsAvailableRef.current = false;
      return false;
    }
  }, []);

  /* ── Play ── */
  const playAudio = useCallback(
    async (text: string) => {
      if (!enabled) return;

      // Stop any ongoing audio
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }

      await tryTTS(text);
    },
    [enabled, tryTTS]
  );

  /* ── Stop ── */
  const stopAudio = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
  }, []);

  /* ── Preload (no-op, kept for API compat) ── */
  const preloadAudio = useCallback((_texts: string[]) => {}, []);

  /* ── Cleanup ── */
  const cleanup = useCallback(() => {
    stopAudio();
    ttsCacheRef.current.forEach(url => URL.revokeObjectURL(url));
    ttsCacheRef.current.clear();
  }, [stopAudio]);

  return { playAudio, stopAudio, preloadAudio, cleanup };
}
