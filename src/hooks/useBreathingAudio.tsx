import { useCallback, useRef, useEffect, useState } from "react";

interface UseBreathingAudioOptions {
  enabled: boolean;
}

/**
 * Breathing-exercise voice guidance using the browser's built-in
 * SpeechSynthesis API.  Picks the best available female English voice
 * automatically — no external API key required.
 */
export function useBreathingAudio({ enabled }: UseBreathingAudioOptions) {
  const [voicesReady, setVoicesReady] = useState(false);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  /* ── Pick the best female English voice ───────────────────────── */
  const pickVoice = useCallback(() => {
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) return;

    // Preference list (case-insensitive partial match on voice name)
    // These are high-quality female voices across major platforms.
    const preferred = [
      "samantha",       // macOS / iOS  — natural female
      "karen",          // macOS        — Australian female
      "moira",          // macOS        — Irish female
      "tessa",          // macOS        — South African female
      "fiona",          // macOS        — Scottish female
      "google uk english female",
      "google us english",
      "microsoft zira",  // Windows     — female
      "microsoft hazel", // Windows     — UK female
      "microsoft susan", // Windows     — UK female
    ];

    // 1. Try preferred voices first
    for (const pref of preferred) {
      const match = voices.find(
        (v) =>
          v.name.toLowerCase().includes(pref) &&
          v.lang.startsWith("en")
      );
      if (match) {
        selectedVoiceRef.current = match;
        return;
      }
    }

    // 2. Any English voice whose name hints at being female
    const femaleHints = ["female", "woman", "girl", "she"];
    const femaleVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        femaleHints.some((h) => v.name.toLowerCase().includes(h))
    );
    if (femaleVoice) {
      selectedVoiceRef.current = femaleVoice;
      return;
    }

    // 3. Fallback: first English voice available
    const anyEnglish = voices.find((v) => v.lang.startsWith("en"));
    selectedVoiceRef.current = anyEnglish || voices[0];
  }, []);

  useEffect(() => {
    if (typeof speechSynthesis === "undefined") return;

    // Voices may load asynchronously (especially Chrome)
    const handle = () => {
      pickVoice();
      setVoicesReady(true);
    };

    // Try immediately (Safari loads voices synchronously)
    if (speechSynthesis.getVoices().length > 0) {
      handle();
    }

    speechSynthesis.addEventListener("voiceschanged", handle);
    return () => speechSynthesis.removeEventListener("voiceschanged", handle);
  }, [pickVoice]);

  /* ── Play ──────────────────────────────────────────────────────── */
  const playAudio = useCallback(
    (text: string) => {
      if (!enabled || typeof speechSynthesis === "undefined") return;

      // Stop any ongoing speech first
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;          // Calm, slow pace
      utterance.pitch = 1.05;         // Slightly higher for feminine tone
      utterance.volume = 0.8;

      if (selectedVoiceRef.current) {
        utterance.voice = selectedVoiceRef.current;
      }

      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    },
    [enabled]
  );

  /* ── Stop ──────────────────────────────────────────────────────── */
  const stopAudio = useCallback(() => {
    if (typeof speechSynthesis !== "undefined") {
      speechSynthesis.cancel();
    }
  }, []);

  /* ── Preload (no-op for SpeechSynthesis — speech is instant) ── */
  const preloadAudio = useCallback((_texts: string[]) => {
    // SpeechSynthesis doesn't need preloading.
    // Trigger voice resolution if not done yet.
    if (typeof speechSynthesis !== "undefined" && !voicesReady) {
      pickVoice();
    }
  }, [voicesReady, pickVoice]);

  /* ── Cleanup ───────────────────────────────────────────────────── */
  const cleanup = useCallback(() => {
    stopAudio();
    utteranceRef.current = null;
  }, [stopAudio]);

  return {
    playAudio,
    stopAudio,
    preloadAudio,
    cleanup,
  };
}
