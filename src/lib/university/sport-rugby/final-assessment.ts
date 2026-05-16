import type { UnitAssessment } from '../types';

export const sportRugbyFinalAssessment: UnitAssessment = {
  unitNumber: 0,
  title: 'Rugby — Final Assessment',
  passMarkPercent: 80,
  pickCount: 15,
  questions: [
    { type: 'multiple_choice', question: 'How many injuries per 1,000 match hours in rugby?', options: ['20', '40', '80', '150'], correctAnswer: 2, explanation: 'Rugby: ~80 injuries per 1,000 match hours.' },
    { type: 'multiple_choice', question: 'What squat target for elite rugby forwards?', options: ['1.0x BW', '1.5x BW', '2.0-2.5x BW', '3.0x BW'], correctAnswer: 2, explanation: 'Forwards target 2.0-2.5x bodyweight.' },
    { type: 'multiple_choice', question: 'Most important speed quality in rugby?', options: ['Top speed', 'Acceleration (0-10m)', 'Speed endurance', 'Flexibility'], correctAnswer: 1, explanation: 'Short-distance acceleration drives most decisive actions.' },
    { type: 'multiple_choice', question: 'Target VO2max for rugby backs?', options: ['40', '55-60+', '70+', '30'], correctAnswer: 1, explanation: 'Backs should target 55-60+ mL/kg/min.' },
    { type: 'multiple_choice', question: 'What causes most rugby injuries?', options: ['Scrums', 'Tackles (50-60%)', 'Running', 'Warm-up'], correctAnswer: 1, explanation: 'Tackles cause 50-60% of injuries.' },
    { type: 'multiple_choice', question: 'Recommended protein for rugby players?', options: ['1.0g/kg', '1.5g/kg', '2.0-2.5g/kg', '4.0g/kg'], correctAnswer: 2, explanation: '2.0-2.5g/kg for collision damage repair.' },
    { type: 'multiple_choice', question: 'What defines physical courage in rugby?', options: ['Recklessness', 'Controlled aggression for purposeful actions', 'Avoiding contact', 'Pure anger'], correctAnswer: 1, explanation: 'Controlled, legal, purposeful intensity.' },
    { type: 'multiple_choice', question: 'Effect of cumulative collision on planning?', options: ['None', 'Requires load management across the season', 'Makes players tougher', 'Only in pre-season'], correctAnswer: 1, explanation: 'Collision damage must be monitored and managed.' },
    { type: 'multiple_choice', question: 'Best-evidenced supplement for rugby?', options: ['BCAAs', 'Pre-workout', 'Creatine monohydrate', 'Vitamin D alone'], correctAnswer: 2, explanation: 'Creatine for power, mass, and repeated sprint ability.' },
    { type: 'multiple_choice', question: 'Post-match protein requirement vs non-contact sport?', options: ['Same', 'Higher (0.4-0.5g/kg) due to collision damage', 'Lower', 'None needed'], correctAnswer: 1, explanation: 'Collision increases muscle damage and protein needs.' },
    { type: 'multiple_choice', question: 'Calorie needs for professional rugby forwards?', options: ['2,000-2,500', '3,000-3,500', '4,500-5,500', '7,000+'], correctAnswer: 2, explanation: 'Forwards require 4,500-5,500 kcal/day.' },
    { type: 'multiple_choice', question: 'How should pre-season introduce contact?', options: ['Full intensity from day 1', 'Progressively — controlled to opposed', 'No contact until matches', 'Only in final week'], correctAnswer: 1, explanation: 'Progressive contact builds robustness safely.' },
    { type: 'multiple_choice', question: 'Why are Nordic curls essential for rugby?', options: ['Appearance', 'Reduce hamstring injuries by up to 50%', 'Improve sprint speed', 'Required by team rules'], correctAnswer: 1, explanation: 'Nordic curls are the most effective hamstring injury prevention tool.' },
    { type: 'multiple_choice', question: 'What is the next-job mentality?', options: ['Next week planning', 'Immediate next action focus after setbacks', 'Career planning', 'Job rotation'], correctAnswer: 1, explanation: 'Focus on the next productive action.' },
    { type: 'multiple_choice', question: 'What sled load develops rugby acceleration?', options: ['5-10% BW', '20-30% BW', '50-80% BW', '100%+ BW'], correctAnswer: 2, explanation: 'Heavy sleds at 50-80% bodyweight for horizontal force.' },
  ],
};