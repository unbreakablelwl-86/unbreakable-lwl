import { useCallback } from "react";
import { speakViaCoachVoice, stopCoachVoice } from "@/hooks/useJJVoice";

/**
 * Cardio voice updates.
 * Uses the shared ElevenLabs coach voice (same "James" voice as chat and
 * university) so it's always male and always right, on every device — the
 * old on-device Web Speech API picker could land on a female or even a
 * foreign-language voice depending on what the browser happened to expose.
 * A server-side cache in the breathing-tts edge function keeps the cost of
 * these frequent, highly repetitive cues down: each distinct phrase is
 * only ever sent to ElevenLabs once, across every user.
 */
export function useCardioVoice({ enabled }: { enabled: boolean }) {
  const speak = useCallback(async (text: string) => {
    if (!enabled) return;
    await speakViaCoachVoice(text);
  }, [enabled]);

  const stop = useCallback(() => {
    stopCoachVoice();
  }, []);

  const cleanup = useCallback(() => {
    stop();
  }, [stop]);

  return { speak, stop, cleanup };
}
