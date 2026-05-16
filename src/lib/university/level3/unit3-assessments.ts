import type { UnitAssessment } from '../types';

export const level3Unit3Assessment: UnitAssessment = {
  unitNumber: 3,
  title: 'Programme Design — Unit Assessment',
  passMarkPercent: 80,
  questions: [
    // ─── CH1: Periodisation Models ───
    {
      type: 'multiple_choice',
      question: 'Linear periodisation involves:',
      options: ['Randomly changing variables each week', 'Gradually increasing intensity while decreasing volume over a training block', 'Only using bodyweight exercises', 'Training the same way every session'],
      correctAnswer: 1,
      explanation: 'Linear (or classical) periodisation progressively increases intensity and reduces volume across a mesocycle — moving from higher-rep, lower-load phases to lower-rep, higher-load phases.',
    },
    {
      type: 'multiple_choice',
      question: 'Daily Undulating Periodisation (DUP) differs from linear because:',
      options: ['It varies rep ranges and intensity within the same week', 'It only works for beginners', 'It never changes intensity', 'It requires daily maximal effort'],
      correctAnswer: 0,
      explanation: 'DUP manipulates training variables (load, volume, intensity) across different sessions within a single week rather than across longer phases.',
    },
    {
      type: 'multiple_choice',
      question: 'Block periodisation concentrates training into focused phases called:',
      options: ['Warm-up blocks', 'Microcycles', 'Recovery phases only', 'Mesocycles with a singular dominant quality'],
      correctAnswer: 3,
      explanation: 'Block periodisation dedicates each mesocycle to developing one primary quality (e.g. accumulation → transmutation → realisation).',
    },
    // ─── CH2: Exercise Selection ───
    {
      type: 'multiple_choice',
      question: 'The Stimulus-to-Fatigue Ratio (SFR) helps determine:',
      options: ['The ideal rest period between sets', 'How many calories an exercise burns', 'How much muscle stimulus an exercise provides relative to the systemic fatigue it creates', 'Whether an exercise is safe'],
      correctAnswer: 2,
      explanation: 'SFR evaluates whether an exercise delivers sufficient training stimulus relative to the recovery cost it imposes — helping you choose efficient exercises.',
    },
    {
      type: 'multiple_choice',
      question: 'Compound exercises should generally be placed:',
      options: ['Only on rest days', 'Early in a session when fresh', 'Exclusively in warm-ups', 'At the end of a session when fatigued'],
      correctAnswer: 1,
      explanation: 'Compound movements require the most neural drive and energy, so placing them early maximises performance and reduces injury risk.',
    },
    // ─── CH3: Training Splits ───
    {
      type: 'multiple_choice',
      question: 'A Push/Pull/Legs split typically trains each muscle group how many times per week?',
      options: ['Twice (over 6 sessions)', 'Once', 'Three times', 'Four times'],
      correctAnswer: 0,
      explanation: 'A classic PPL split run twice per week (6 sessions) hits each muscle group approximately twice, which aligns well with hypertrophy research.',
    },
    {
      type: 'multiple_choice',
      question: 'For a beginner with 3 days available, which split is generally most appropriate?',
      options: ['Twice-daily sessions', 'Push/Pull/Legs', 'Body-part bro split', 'Full-body programme'],
      correctAnswer: 3,
      explanation: 'Full-body training 3 days per week allows beginners to practice movements frequently and accumulate sufficient volume with adequate recovery.',
    },
    // ─── CH4: Auto-Regulation ───
    {
      type: 'multiple_choice',
      question: 'RPE 9 means approximately:',
      options: ['3 reps in reserve', 'A warm-up intensity', '1 rep in reserve', 'Maximum effort, no reps left'],
      correctAnswer: 2,
      explanation: 'RPE 9 corresponds to roughly 1 repetition in reserve — a very challenging set where you could have completed one more rep.',
    },
    {
      type: 'multiple_choice',
      question: 'The main advantage of auto-regulation over fixed percentages is:',
      options: ['It eliminates the need for progressive overload', 'It accounts for daily readiness and fatigue fluctuations', 'It always results in heavier loads', 'It requires no thinking'],
      correctAnswer: 1,
      explanation: 'Auto-regulation adjusts training intensity to your actual capacity on any given day, rather than relying on percentages that assume consistent readiness.',
    },
    // ─── CH5: Weak Point Training ───
    {
      type: 'multiple_choice',
      question: 'The first step in addressing a weak muscle group is:',
      options: ['Identifying the weakness through assessment, then prioritising it in programming', 'Using machines exclusively', 'Ignoring it and focusing on strengths', 'Adding 10 sets immediately'],
      correctAnswer: 0,
      explanation: 'Effective weak-point training starts with honest assessment, then prioritises the lagging area through strategic exercise selection and volume placement.',
    },
    {
      type: 'multiple_choice',
      question: 'Prioritisation in programming typically means:',
      options: ['Replacing all other exercises', 'Only training it once per month', 'Always training it last', 'Training the weak muscle group first in a session when neural drive is highest'],
      correctAnswer: 3,
      explanation: 'Placing the priority muscle group early in a session ensures maximum energy, focus, and neural activation — increasing the quality of the training stimulus.',
    },
    // ─── CH6: Peaking & Tapering ───
    {
      type: 'multiple_choice',
      question: 'A taper before a strength test typically involves:',
      options: ['Switching to cardio-only training', 'Dramatically increasing volume', 'Maintaining or slightly increasing intensity while reducing volume', 'Complete rest for two weeks'],
      correctAnswer: 2,
      explanation: 'Tapering preserves intensity to maintain neural readiness while reducing volume to shed accumulated fatigue — allowing peak performance.',
    },
    {
      type: 'multiple_choice',
      question: 'Peaking is most appropriate for:',
      options: ['Beginners in their first month', 'Competitions, tests, or milestone performances', 'Deload weeks', 'Everyday gym sessions'],
      correctAnswer: 1,
      explanation: 'Peaking strategies are designed to maximise short-term performance for a specific event or test, not for routine training.',
    },
    // ─── CH7: Training Age ───
    {
      type: 'multiple_choice',
      question: 'A "training age" of 2 years means:',
      options: ['They have been training consistently for approximately 2 years', 'They need a personal trainer', 'The person is 2 years old', 'They can only train twice per week'],
      correctAnswer: 0,
      explanation: 'Training age refers to the total duration of consistent, structured resistance training — not chronological age.',
    },
    {
      type: 'multiple_choice',
      question: 'As training age increases, a lifter typically requires:',
      options: ['Less volume and simpler programming', 'No changes — the same programme works forever', 'Only bodyweight training', 'More volume, more variation, and more sophisticated periodisation'],
      correctAnswer: 3,
      explanation: 'Advanced lifters have higher thresholds for adaptation, requiring greater volume, strategic variation, and structured periodisation to continue progressing.',
    },
    // ─── CH8: Putting It Together ───
    {
      type: 'multiple_choice',
      question: 'When building a 12-week programme, the first step should be:',
      options: ['Copying someone else\'s programme exactly', 'Choosing exercises randomly', 'Defining the primary goal and identifying the training phase structure', 'Jumping straight into week 1'],
      correctAnswer: 2,
      explanation: 'Effective programme design starts with a clear goal and structured phases — everything else (exercise selection, volume, intensity) flows from that foundation.',
    },
    {
      type: 'scenario',
      question: 'You are designing a programme for someone who has been training for 3 years, trains 5 days per week, and wants to improve their bench press for a charity event in 10 weeks. What approach makes the most sense?',
      scenario: 'They currently bench 90 kg for 3 reps and want to hit 100 kg on the day.',
      options: [
        'Switching to a full-body programme with no bench pressing',
        'A linear periodisation plan moving from volume to intensity with a taper in weeks 9–10',
        'Only training bench press every day',
        'Random training with no structure',
      ],
      correctAnswer: 1,
      explanation: 'A structured linear periodisation with progressive intensity increases and a taper into the event is the textbook approach for peaking a specific lift over a defined timeline.',
    },
    {
      type: 'scenario',
      question: 'A lifter reports that their shoulders are growing well but their back is lagging despite training both equally. What programming adjustment is most appropriate?',
      scenario: 'They currently train back and shoulders in the same session with equal sets.',
      options: [
        'Prioritise back by training it first in the session and adding 2–3 extra weekly sets while slightly reducing shoulder volume',
        'Do nothing and hope it resolves itself',
        'Add a second daily session just for back',
        'Remove all shoulder work entirely',
      ],
      correctAnswer: 0,
      explanation: 'Prioritising the lagging muscle group earlier in the session and allocating additional volume — while slightly reducing the dominant group — is the most balanced approach.',
    },
  ],
};
