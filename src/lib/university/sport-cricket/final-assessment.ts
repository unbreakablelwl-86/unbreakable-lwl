import type { UnitAssessment } from '../types';

export const sportCricketFinalAssessment: UnitAssessment = {
  unitNumber: 0,
  title: 'Cricket — Final Assessment',
  passMarkPercent: 80,
  pickCount: 15,
  questions: [
    { type: 'multiple_choice', question: 'Fast bowling delivery forces?', options: ['20x', '1-2x', '5-10x BW', '3-4x'], correctAnswer: 2, explanation: '5-10x bodyweight.' },
    { type: 'multiple_choice', question: 'Key batting strength?', options: ['Rotational power', 'Grip', 'Core only', 'Arms'], correctAnswer: 0, explanation: 'Rotational power.' },
    { type: 'multiple_choice', question: 'Run-up speed affects?', options: ['Economy', 'Nothing', 'Bowling velocity', 'Accuracy'], correctAnswer: 2, explanation: 'Ball speed.' },
    { type: 'multiple_choice', question: 'Cricket VO2max?', options: ['70+', '30-35', '45-55', '80+'], correctAnswer: 2, explanation: '45-55 mL/kg/min.' },
    { type: 'multiple_choice', question: 'Bowler stress fracture rate?', options: ['50%', '15-25%', '10%', '1-5%'], correctAnswer: 1, explanation: '15-25% of young bowlers.' },
    { type: 'multiple_choice', question: 'Test match bowler calories?', options: ['3,000', '4,500+', '2,000', '6,000+'], correctAnswer: 1, explanation: '4,500+ kcal daily.' },
    { type: 'multiple_choice', question: 'Core mental skill?', options: ['Aggression', 'Concentration management', 'Anger', 'Relaxation'], correctAnswer: 1, explanation: 'Concentration management.' },
    { type: 'multiple_choice', question: 'Off-season break?', options: ['1 day only', 'Light cricket', 'Complete rest from cricket', 'Not needed'], correctAnswer: 2, explanation: 'Full break for recovery.' },
    { type: 'multiple_choice', question: 'Nordic curls reduce hamstring injuries by?', options: ['25%', '50%', 'No effect', '10%'], correctAnswer: 1, explanation: 'Up to 50% reduction.' },
    { type: 'multiple_choice', question: 'Max bowling load increase weekly?', options: ['Unlimited', '100%', '50%', '20% max'], correctAnswer: 3, explanation: 'No more than 20%.' },
    { type: 'multiple_choice', question: 'Between-delivery reset?', options: ['Nothing', 'Chat', 'Movement, breath, focus cue', 'Practice swing'], correctAnswer: 2, explanation: 'Structured three-step reset.' },
    { type: 'multiple_choice', question: 'Rest between multi-day games?', options: ['2 days', '1 day', '1 week', '4+ days for bowlers'], correctAnswer: 3, explanation: 'Minimum 4 days.' },
    { type: 'multiple_choice', question: 'Pitch sprint distance?', options: ['10m', '22m', '17.68m', '30m'], correctAnswer: 2, explanation: '17.68 metres (22 yards).' },
    { type: 'multiple_choice', question: 'T20 impact on cricket?', options: ['Reduced demands', 'None', 'Increased explosive athletic demands', 'Only batting changed'], correctAnswer: 2, explanation: 'Shifted toward explosive athleticism.' },
    { type: 'multiple_choice', question: 'Pressure source in cricket?', options: ['Opposition', 'Crowd', 'Self-generated outcome thinking', 'Conditions'], correctAnswer: 2, explanation: 'Self-generated from outcome focus.' },
  ],
};