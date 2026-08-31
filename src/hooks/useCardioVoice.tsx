import { useCallback } from "react";
import { speakOnDevice } from "@/hooks/useJJVoice";

/**
 * Cardio voice updates.
 * Uses the device's own voice (Web Speech API) so live cardio cues —
 * which fire constantly during a session — cost nothing to run.
 * Unbreakable Coach is male only — no gender choice.
 */
export function useCardioVoice({ enabled }: { enabled: boolean }) {
  const speak = useCallback(async (text: string) => {
    if (!enabled) return;
    await speakOnDevice(text);
  }, [enabled]);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const cleanup = useCallback(() => {
    stop();
  }, [stop]);

  return { speak, stop, cleanup };
}
