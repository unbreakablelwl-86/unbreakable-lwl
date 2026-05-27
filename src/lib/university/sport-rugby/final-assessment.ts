import type { UnitAssessment } from '../types';

export const sportRugbyFinalAssessment: UnitAssessment = {
  unitNumber: 0,
  title: 'Rugby — Final Assessment',
  passMarkPercent: 80,
  pickCount: 15,
  questions: [
    { type: 'multiple_choice', question: 'How many injuries per 1,000 match hours in rugby?', options: ['80', '150', '40', '20'], correctAnswer: 0, explanation: 'Rugby: ~80 injuries per 1,000 match hours.' },
    { type: 'multiple_choice', question: 'What squat target for elite rugby forwards?', options: ['3.0x BW', '1.0x BW', '1.5x BW', '2.0-2.5x BW'], correctAnswer: 3, explanation: 'Forwards target 2.0-2.5x bodyweight.' },
    { type: 'multiple_choice', question: 'Most important speed quality in rugby?', options: ['Acceleration (0-10m)', 'Flexibility', 'Speed endurance', 'Top speed'], correctAnswer: 0, explanation: 'Short-distance acceleration drives most decisive actions.' },
    { type: 'multiple_choice', question: 'Target VO2max for rugby backs?', options: ['55-60+', '40', '30', '70+'], correctAnswer: 0, explanation: 'Backs should target 55-60+ mL/kg/min.' },
    { type: 'multiple_choice', question: 'What causes most rugby injuries?', options: ['Scrums', 'Warm-up', 'Running', 'Tackles (50-60%)'], correctAnswer: 3, explanation: 'Tackles cause 50-60% of injuries.' },
    { type: 'multiple_choice', question: 'Recommended protein for rugby players?', options: ['2.0-2.5g/kg', '1.0g/kg', '4.0g/kg', '1.5g/kg'], correctAnswer: 0, explanation: '2.0-2.5g/kg for collision damage repair.' },
    { type: 'multiple_choice', question: 'What defines physical courage in rugby?', options: ['Recklessness', 'Pure anger', 'Controlled aggression for purposeful actions', 'Avoiding contact'], correctAnswer: 2, explanation: 'Controlled, legal, purposeful intensity.' },
    { type: 'multiple_choice', question: 'Effect of cumulative collision on planning?', options: ['Only in pre-season', 'None', 'Makes players tougher', 'Requires load management across the season'], correctAnswer: 3, explanation: 'Collision damage must be monitored and managed.' },
    { type: 'multiple_choice', question: 'Best-evidenced supplement for rugby?', options: ['Pre-workout', 'Creatine monohydrate', 'Vitamin D alone', 'BCAAs'], correctAnswer: 1, explanation: 'Creatine for power, mass, and repeated sprint ability.' },
    { type: 'multiple_choice', question: 'Post-match protein requirement vs non-contact sport?', options: ['None needed', 'Higher (0.4-0.5g/kg) due to collision damage', 'Lower', 'Same'], correctAnswer: 1, explanation: 'Collision increases muscle damage and protein needs.' },
    { type: 'multiple_choice', question: 'Calorie needs for professional rugby forwards?', options: ['3,000-3,500', '4,500-5,500', '2,000-2,500', '7,000+'], correctAnswer: 1, explanation: 'Forwards require 4,500-5,500 kcal/day.' },
    { type: 'multiple_choice', question: 'How should pre-season introduce contact?', options: ['Only in final week', 'Full intensity from day 1', 'Progressively — controlled to opposed', 'No contact until matches'], correctAnswer: 2, explanation: 'Progressive contact builds robustness safely.' },
    { type: 'multiple_choice', question: 'Why are Nordic curls essential for rugby?', options: ['Required by team rules', 'Appearance', 'Improve sprint speed', 'Reduce hamstring injuries by up to 50%'], correctAnswer: 3, explanation: 'Nordic curls are the most effective hamstring injury prevention tool.' },
    { type: 'multiple_choice', question: 'What is the next-job mentality?', options: ['Career planning', 'Job rotation', 'Immediate next action focus after setbacks', 'Next week planning'], correctAnswer: 2, explanation: 'Focus on the next productive action.' },
    { type: 'multiple_choice', question: 'What sled load develops rugby acceleration?', options: ['5-10% BW', '20-30% BW', '50-80% BW', '100%+ BW'], correctAnswer: 2, explanation: 'Heavy sleds at 50-80% bodyweight for horizontal force.' },
  ],
};