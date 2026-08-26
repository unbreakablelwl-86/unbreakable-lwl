import { useCallback } from "react";
import { speakOnDevice, useJJVoice } from "@/hooks/useJJVoice";

/**
 * Cardio voice updates.
 * Uses the device's own voice (Web Speech API) so live cardio cues —
 * which fire constantly during a session — cost nothing to run.
 * Members pick male or female in Coach Voice settings.
 */
export function useCardioVoice({ enabled }: { enabled: boolean }) {
  const { settings } = useJJVoice();

  const speak = useCallback(async (text: string) => {
    if (!enabled) return;
    speakOnDevice(text, settings.gender);
  }, [enabled, settings.gender]);



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
