import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Cardio voice updates.
 * Uses ElevenLabs TTS (James voice) via the breathing-tts edge function.
 * No browser speech fallback — JJ's voice only.
 */
export function useCardioVoice({ enabled }: { enabled: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());
  const pendingRef = useRef<Set<string>>(new Set());
  const ttsAvailableRef = useRef<boolean | null>(null);

  const speak = useCallback(async (text: string) => {
    if (!enabled) return;

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const cacheKey = text;

    // Check cache first
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

    // If we know TTS is unavailable, skip
    if (ttsAvailableRef.current === false) return;

    // Skip if already fetching this text
    if (pendingRef.current.has(cacheKey)) return;
    pendingRef.current.add(cacheKey);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        pendingRef.current.delete(cacheKey);
        ttsAvailableRef.current = false;
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
        console.warn("Cardio TTS failed:", response.status);
        ttsAvailableRef.current = false;
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
      console.warn("Cardio voice error:", error);
      ttsAvailableRef.current = false;
    }
  }, [enabled]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const cleanup = useCallback(() => {
    stop();
    cacheRef.current.forEach(url => URL.revokeObjectURL(url));
    cacheRef.current.clear();
    pendingRef.current.clear();
  }, [stop]);

  return { speak, stop, cleanup };
}
