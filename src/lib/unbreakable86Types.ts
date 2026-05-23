/**
 * UNBREAKABLE 86 — Type Definitions
 * 86-day challenge across 5 pillars: Power, Movement, Fuel, Mindset, Education
 */

export type U86Status = 'active' | 'reset' | 'completed' | 'abandoned';

export interface U86Enrolment {
  id: string;
  user_id: string;
  status: U86Status;
  current_day: number;
  start_date: string;
  reset_count: number;
  quiz_answers: U86QuizAnswers | null;
  programme_id: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface U86DailyLog {
  id: string;
  enrolment_id: string;
  user_id: string;
  day_number: number;
  log_date: string;
  habit_train: boolean;
  habit_learn: boolean;
  habit_hydrate: boolean;
  habit_numbers: boolean;
  habit_breathwork: boolean;
  habit_sauna: boolean;
  habit_cold_shower: boolean;
  water_glasses: number;
  education_completed: boolean;
  education_content_id: string | null;
  all_habits_done: boolean;
  journal: string;
  created_at: string;
  updated_at: string;
}

export interface U86Programme {
  id: string;
  user_id: string;
  enrolment_id: string;
  programme_data: U86ProgrammeData;
  pillar_config: U86PillarConfig;
  created_at: string;
  updated_at: string;
}

/* ─── Quiz ─── */

export interface U86QuizAnswers {
  experience: 'beginner' | 'intermediate' | 'advanced';
  equipment: 'gym' | 'home' | 'minimal';
  training_days: number; // 3-6
  dietary_preference: string;
  goals: string[];
  current_habits: {
    sleep_quality: number; // 1-10
    water_intake: number;  // 1-10
    stress_level: number;  // 1-10
  };
  injuries: string;
}

/* ─── Programme Structure ─── */

export interface U86PillarConfig {
  power: { sessions_per_week: number; focus: string };
  movement: { sessions_per_week: number; focus: string };
  fuel: { daily_calories: number; protein_target: number; approach: string };
  mindset: { focus_areas: string[] };
  education: { track: string; weekly_lessons: number };
}

export interface U86ProgrammeData {
  phases: U86Phase[];
  weekly_schedule: U86WeeklySchedule;
}

export interface U86Phase {
  name: string;
  weeks: [number, number]; // [start, end]
  focus: string;
  power_focus: string;
  movement_focus: string;
  fuel_focus: string;
  mindset_focus: string;
  education_focus: string;
  upsell?: {
    course_key: string;
    course_name: string;
    message: string;
  };
}

export interface U86WeeklySchedule {
  monday: U86DayPlan;
  tuesday: U86DayPlan;
  wednesday: U86DayPlan;
  thursday: U86DayPlan;
  friday: U86DayPlan;
  saturday: U86DayPlan;
  sunday: U86DayPlan;
}

export interface U86DayPlan {
  power?: { type: string; description: string };
  movement?: { type: string; description: string };
  fuel: { focus: string };
  mindset: { task: string };
  education: { lesson: string; content_id?: string };
}

/* ─── UI State ─── */

export type U86Tab = 'dashboard' | 'programme' | 'progress' | 'education';

export const U86_PILLARS = [
  { id: 'power', label: 'POWER', emoji: '🏋️', colour: '#FF5500' },
  { id: 'movement', label: 'MOVEMENT', emoji: '🏃', colour: '#FF5500' },
  { id: 'fuel', label: 'FUEL', emoji: '🍎', colour: '#FF5500' },
  { id: 'mindset', label: 'MINDSET', emoji: '🧠', colour: '#FF5500' },
  { id: 'education', label: 'EDUCATION', emoji: '📚', colour: '#FF5500' },
] as const;

export const U86_PHASES: U86Phase[] = [
  {
    name: 'FOUNDATION',
    weeks: [1, 4],
    focus: 'Build habits, learn the basics, establish your baseline',
    power_focus: 'Movement patterns & technique',
    movement_focus: 'Base cardio & mobility',
    fuel_focus: 'Track everything, learn portions',
    mindset_focus: 'Daily breathwork & journaling',
    education_focus: 'Level 1 fundamentals',
    upsell: { course_key: 'gym_l2', course_name: 'Power Level 2', message: 'Want to understand WHY this programme works?' },
  },
  {
    name: 'BUILD',
    weeks: [5, 8],
    focus: 'Progressive overload, deeper knowledge, stronger habits',
    power_focus: 'Strength progression & volume',
    movement_focus: 'Interval training & flexibility',
    fuel_focus: 'Meal prep mastery, macro targets',
    mindset_focus: 'Cold exposure progression, stress management',
    education_focus: 'Nutrition science deep-dive',
    upsell: { course_key: 'nutrition_l2', course_name: 'Fuel Level 2', message: 'Master the science behind your nutrition' },
  },
  {
    name: 'PEAK',
    weeks: [9, 12],
    focus: 'Push limits, advanced techniques, full integration',
    power_focus: 'Peak strength & advanced splits',
    movement_focus: 'Performance cardio & sport-specific',
    fuel_focus: 'Fine-tuning & performance nutrition',
    mindset_focus: 'Advanced mental performance, full protocols',
    education_focus: 'Mindset mastery & leadership',
    upsell: { course_key: 'mindset_l2', course_name: 'Mindset Level 2', message: 'Go deeper on mental performance' },
  },
];
