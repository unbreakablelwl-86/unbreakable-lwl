import type { UnitAssessment } from '../types';

export const sportCricketFinalAssessment: UnitAssessment = {
  unitNumber: 0,
  title: 'Cricket — Final Assessment',
  passMarkPercent: 80,
  pickCount: 15,
  questions: [
    { type: 'multiple_choice', question: 'Fast bowling delivery forces?', options: ['1-2x', '3-4x', '5-10x BW', '20x'], correctAnswer: 2, explanation: '5-10x bodyweight.' },
    { type: 'multiple_choice', question: 'Key batting strength?', options: ['Arms', 'Rotational power', 'Grip', 'Core only'], correctAnswer: 1, explanation: 'Rotational power.' },
    { type: 'multiple_choice', question: 'Run-up speed affects?', options: ['Accuracy', 'Bowling velocity', 'Economy', 'Nothing'], correctAnswer: 1, explanation: 'Ball speed.' },
    { type: 'multiple_choice', question: 'Cricket VO2max?', options: ['30-35', '45-55', '70+', '80+'], correctAnswer: 1, explanation: '45-55 mL/kg/min.' },
    { type: 'multiple_choice', question: 'Bowler stress fracture rate?', options: ['1-5%', '10%', '15-25%', '50%'], correctAnswer: 2, explanation: '15-25% of young bowlers.' },
    { type: 'multiple_choice', question: 'Test match bowler calories?', options: ['2,000', '3,000', '4,500+', '6,000+'], correctAnswer: 2, explanation: '4,500+ kcal daily.' },
    { type: 'multiple_choice', question: 'Core mental skill?', options: ['Aggression', 'Concentration management', 'Relaxation', 'Anger'], correctAnswer: 1, explanation: 'Concentration management.' },
    { type: 'multiple_choice', question: 'Off-season break?', options: ['Not needed', 'Complete rest from cricket', '1 day only', 'Light cricket'], correctAnswer: 1, explanation: 'Full break for recovery.' },
    { type: 'multiple_choice', question: 'Nordic curls reduce hamstring injuries by?', options: ['10%', '25%', '50%', 'No effect'], correctAnswer: 2, explanation: 'Up to 50% reduction.' },
    { type: 'multiple_choice', question: 'Max bowling load increase weekly?', options: ['50%', '20% max', '100%', 'Unlimited'], correctAnswer: 1, explanation: 'No more than 20%.' },
    { type: 'multiple_choice', question: 'Between-delivery reset?', options: ['Nothing', 'Movement, breath, focus cue', 'Chat', 'Practice swing'], correctAnswer: 1, explanation: 'Structured three-step reset.' },
    { type: 'multiple_choice', question: 'Rest between multi-day games?', options: ['1 day', '2 days', '4+ days for bowlers', '1 week'], correctAnswer: 2, explanation: 'Minimum 4 days.' },
    { type: 'multiple_choice', question: 'Pitch sprint distance?', options: ['10m', '17.68m', '22m', '30m'], correctAnswer: 1, explanation: '17.68 metres (22 yards).' },
    { type: 'multiple_choice', question: 'T20 impact on cricket?', options: ['None', 'Increased explosive athletic demands', 'Reduced demands', 'Only batting changed'], correctAnswer: 1, explanation: 'Shifted toward explosive athleticism.' },
    { type: 'multiple_choice', question: 'Pressure source in cricket?', options: ['Opposition', 'Self-generated outcome thinking', 'Crowd', 'Conditions'], correctAnswer: 1, explanation: 'Self-generated from outcome focus.' },
  ],
};