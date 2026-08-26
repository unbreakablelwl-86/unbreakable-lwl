import { useCallback } from "react";
import { speakOnDevice, useJJVoice } from "@/hooks/useJJVoice";

interface UseBreathingAudioOptions {
  enabled: boolean;
}

/**
 * Breathing-exercise voice guidance.
 * Uses the device's own voice (Web Speech API) rather than billed TTS —
 * breathing cues are short, highly repetitive and fire many times per
 * session, so metered speech here would cost real money per member.
 * Members choose male or female in Coach Voice settings.
 */
export function useBreathingAudio({ enabled }: UseBreathingAudioOptions) {
  const { settings } = useJJVoice();

  /* ── Play ── */
  const playAudio = useCallback(
    async (text: string) => {
      if (!enabled) return;
      speakOnDevice(text, settings.gender);
    },
    [enabled, settings.gender]
  );

  /* ── Stop ── */
  const stopAudio = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  /* ── Preload (no-op, kept for API compat) ── */
  const preloadAudio = useCallback((_texts: string[]) => {}, []);

  /* ── Cleanup ── */
  const cleanup = useCallback(() => {
    stopAudio();
  }, [stopAudio]);

  return { playAudio, stopAudio, preloadAudio, cleanup };
}
