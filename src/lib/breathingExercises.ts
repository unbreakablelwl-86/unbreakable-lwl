export interface BreathingExercise {
  id: string;
  name: string;
  tagline: string;
  description: string;
  phases: {
    inhale: number; // seconds
    hold: number;
    exhale: number;
    rest?: number;
  };
  scripts: {
    intro: string;
    inhale: string;
    hold: string;
    exhale: string;
    rest?: string;
    halfway: string;
    closing: string;
  };
  intensity: "high" | "medium" | "calm";
  color: string;
  isVisible?: boolean;
}

export const DURATION_OPTIONS = [
  { label: "2 MIN", minutes: 2 },
  { label: "3 MIN", minutes: 3 },
  { label: "5 MIN", minutes: 5 },
  { label: "10 MIN", minutes: 10 },
  { label: "15 MIN", minutes: 15 },
  { label: "20 MIN", minutes: 20 },
];

export const BREATHING_EXERCISES: BreathingExercise[] = [
  {
    id: "power-breath",
    name: "POWER BREATH",
    tagline: "4-7-8 Pattern",
    description: "The scientifically-proven 4-7-8 technique. Inhale for 4, hold for 7, release for 8. This pattern activates your parasympathetic nervous system while building mental resilience.",
    phases: {
      inhale: 4,
      hold: 7,
      exhale: 8,
    },
    scripts: {
      intro: "Let's begin.",
      inhale: "Breathe in",
      hold: "Hold",
      exhale: "Breathe out",
      halfway: "Halfway there. Keep going.",
      closing: "Well done. Session complete.",
    },
    intensity: "high",
    color: "from-primary to-[hsl(20,100%,45%)]",
    isVisible: true,
  },
  {
    id: "box-breathing",
    name: "BOX BREATHING",
    tagline: "4-4-4-4 Pattern",
    description: "The Navy SEAL technique for staying calm under fire. Equal phases of inhale, hold, exhale, hold create total nervous system balance and razor-sharp focus.",
    phases: {
      inhale: 4,
      hold: 4,
      exhale: 4,
      rest: 4,
    },
    scripts: {
      intro: "Let's begin.",
      inhale: "Breathe in",
      hold: "Hold",
      exhale: "Breathe out",
      rest: "Rest",
      halfway: "Halfway there. Keep going.",
      closing: "Well done. Session complete.",
    },
    intensity: "medium",
    color: "from-[hsl(30,100%,50%)] to-primary",
    isVisible: true,
  },
  {
    id: "tactical-calm",
    name: "TACTICAL CALM",
    tagline: "4-2-6 Pattern",
    description: "A rapid stress-reset technique. Short inhale, brief hold, extended exhale. Designed to activate your parasympathetic response fast — when you need calm NOW.",
    phases: {
      inhale: 4,
      hold: 2,
      exhale: 6,
    },
    scripts: {
      intro: "Let's begin.",
      inhale: "Breathe in",
      hold: "Hold",
      exhale: "Breathe out",
      halfway: "Halfway there. Keep going.",
      closing: "Well done. Session complete.",
    },
    intensity: "high",
    color: "from-primary to-[hsl(15,100%,45%)]",
    isVisible: true,
  },
  {
    id: "deep-reset",
    name: "DEEP RESET",
    tagline: "4-4-6-2 Pattern",
    description: "Slow, deep breathing for recovery and stress release. Extended exhale with a brief rest activates your parasympathetic nervous system for total restoration.",
    phases: {
      inhale: 4,
      hold: 4,
      exhale: 6,
      rest: 2,
    },
    scripts: {
      intro: "Let's begin.",
      inhale: "Breathe in",
      hold: "Hold",
      exhale: "Breathe out",
      rest: "Rest",
      halfway: "Halfway there. Keep going.",
      closing: "Well done. Session complete.",
    },
    intensity: "calm",
    color: "from-[hsl(35,100%,50%)] to-[hsl(25,100%,45%)]",
    isVisible: true,
  },
  {
    id: "fire-breath",
    name: "FIRE BREATH",
    tagline: "2-0-2-0 Rapid",
    description: "Fast-paced energising breath. Short, sharp inhales and exhales with no holds — designed to fire up your nervous system before training, competition, or any moment you need raw energy.",
    phases: {
      inhale: 2,
      hold: 0,
      exhale: 2,
      rest: 0,
    },
    scripts: {
      intro: "Let's begin.",
      inhale: "Breathe in",
      hold: "",
      exhale: "Breathe out",
      halfway: "Halfway there. Keep going.",
      closing: "Well done. Session complete.",
    },
    intensity: "high",
    color: "from-red-500 to-primary",
    isVisible: true,
  },
  {
    id: "warrior-breath",
    name: "WARRIOR BREATH",
    tagline: "4-4-8 Pattern",
    description: "Extended exhale warrior technique. Double-length exhale forces deep parasympathetic activation while the strong inhale keeps you alert. The breath of a warrior before battle.",
    phases: {
      inhale: 4,
      hold: 4,
      exhale: 8,
    },
    scripts: {
      intro: "Let's begin.",
      inhale: "Breathe in",
      hold: "Hold",
      exhale: "Breathe out",
      halfway: "Halfway there. Keep going.",
      closing: "Well done. Session complete.",
    },
    intensity: "high",
    color: "from-primary to-red-600",
    isVisible: true,
  },
  {
    id: "ocean-breath",
    name: "OCEAN BREATH",
    tagline: "5-0-5-0 Flow",
    description: "Inspired by Ujjayi pranayama. Continuous flowing breath — in for 5, out for 5, no pauses. Like ocean waves. Creates a meditative rhythm that calms the mind and sharpens focus.",
    phases: {
      inhale: 5,
      hold: 0,
      exhale: 5,
      rest: 0,
    },
    scripts: {
      intro: "Let's begin.",
      inhale: "Breathe in",
      hold: "",
      exhale: "Breathe out",
      halfway: "Halfway there. Keep going.",
      closing: "Well done. Session complete.",
    },
    intensity: "calm",
    color: "from-blue-400 to-cyan-500",
    isVisible: true,
  },
  {
    id: "resilience-breath",
    name: "RESILIENCE BREATH",
    tagline: "4-7-4-7 Pattern",
    description: "Extended hold training. Equal inhale and exhale with long holds between. Builds CO2 tolerance, mental toughness, and the ability to stay composed when everything is screaming at you to quit.",
    phases: {
      inhale: 4,
      hold: 7,
      exhale: 4,
      rest: 7,
    },
    scripts: {
      intro: "Let's begin.",
      inhale: "Breathe in",
      hold: "Hold",
      exhale: "Breathe out",
      rest: "Rest",
      halfway: "Halfway there. Keep going.",
      closing: "Well done. Session complete.",
    },
    intensity: "high",
    color: "from-primary to-amber-600",
    isVisible: true,
  },
  {
    id: "sleep-breath",
    name: "SLEEP MODE",
    tagline: "4-7-8 Slow",
    description: "A slower, gentler version of the 4-7-8 designed specifically for winding down. Extended hold and exhale phases signal your brain that it's time to switch off. Use before bed.",
    phases: {
      inhale: 4,
      hold: 7,
      exhale: 8,
    },
    scripts: {
      intro: "Let's begin.",
      inhale: "Breathe in",
      hold: "Hold",
      exhale: "Breathe out",
      halfway: "Halfway there. Keep going.",
      closing: "Well done. Session complete.",
    },
    intensity: "calm",
    color: "from-indigo-500 to-purple-600",
    isVisible: true,
  },
  {
    id: "energise-breath",
    name: "ENERGISE",
    tagline: "3-3-3-3 Quick Box",
    description: "A faster box breathing pattern. Shorter cycles mean more breaths per minute — perfect for a quick energy boost before a meeting, a set, or when the afternoon slump hits.",
    phases: {
      inhale: 3,
      hold: 3,
      exhale: 3,
      rest: 3,
    },
    scripts: {
      intro: "Let's begin.",
      inhale: "Breathe in",
      hold: "Hold",
      exhale: "Breathe out",
      rest: "Rest",
      halfway: "Halfway there. Keep going.",
      closing: "Well done. Session complete.",
    },
    intensity: "medium",
    color: "from-yellow-500 to-primary",
    isVisible: true,
  },
];

export const getVisibleExercises = (): BreathingExercise[] => {
  return BREATHING_EXERCISES.filter((ex) => ex.isVisible !== false);
};

export const getExerciseById = (id: string): BreathingExercise | undefined => {
  return BREATHING_EXERCISES.find((ex) => ex.id === id);
};

export const getCycleDurationSeconds = (exercise: BreathingExercise): number => {
  const { inhale, hold, exhale, rest = 0 } = exercise.phases;
  return inhale + hold + exhale + rest;
};

export const getPhaseText = (
  exercise: BreathingExercise,
  phase: "inhale" | "hold" | "exhale" | "rest" | "idle" | "complete"
): string => {
  switch (phase) {
    case "inhale":
      return exercise.scripts.inhale;
    case "hold":
      return exercise.scripts.hold;
    case "exhale":
      return exercise.scripts.exhale;
    case "rest":
      return exercise.scripts.rest || "REST";
    case "complete":
      return exercise.scripts.closing;
    default:
      return "READY";
  }
};
