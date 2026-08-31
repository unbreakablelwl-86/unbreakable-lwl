import { useCallback } from "react";
import { speakOnDevice } from "@/hooks/useJJVoice";

interface UseBreathingAudioOptions {
  enabled: boolean;
}

/**
 * Breathing-exercise voice guidance.
 * Uses the device's own voice (Web Speech API) rather than billed TTS —
 * breathing cues are short, highly repetitive and fire many times per
 * session, so metered speech here would cost real money per member.
 * Unbreakable Coach is male only — no gender choice.
 */
export function useBreathingAudio({ enabled }: UseBreathingAudioOptions) {
  /* ── Play ── */
  const playAudio = useCallback(
    async (text: string) => {
      if (!enabled) return;
      await speakOnDevice(text);
    },
    [enabled]
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
