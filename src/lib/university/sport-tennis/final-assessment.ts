import type { UnitAssessment } from '../types';

export const sportTennisFinalAssessment: UnitAssessment = {
  unitNumber: 0,
  title: 'Tennis — Final Assessment',
  passMarkPercent: 80,
  pickCount: 15,
  questions: [
    { type: 'multiple_choice', question: 'Direction changes per set?', options: ['300-600', '1,000', '150', '50'], correctAnswer: 0, explanation: '300-600 direction changes.' },
    { type: 'multiple_choice', question: 'Key tennis strength quality?', options: ['Rotational power', 'Arms', 'Core only', 'Grip'], correctAnswer: 0, explanation: 'Rotational power through kinetic chain.' },
    { type: 'multiple_choice', question: 'Split step purpose?', options: ['Pre-load for explosive first step', 'Style', 'Rest', 'Balance only'], correctAnswer: 0, explanation: 'Pre-loads muscles for reactive movement.' },
    { type: 'multiple_choice', question: 'Tennis VO2max target?', options: ['30', '50-60', '35-40', '70+'], correctAnswer: 1, explanation: '50-60 mL/kg/min.' },
    { type: 'multiple_choice', question: 'Tennis elbow rate?', options: ['40-50%', '25%', '10%', '75%'], correctAnswer: 0, explanation: '40-50% of recreational players.' },
    { type: 'multiple_choice', question: 'Fluid per changeover?', options: ['1L', 'Sip', '200-400mL', 'None'], correctAnswer: 2, explanation: '200-400mL each time.' },
    { type: 'multiple_choice', question: 'Between-point routine?', options: ['Random', 'Coach talk', 'Release → reflect → prepare', 'Eat'], correctAnswer: 2, explanation: 'Three structured steps.' },
    { type: 'multiple_choice', question: 'Off-season duration?', options: ['None needed', '4-6 weeks', '3 months', '1 week'], correctAnswer: 1, explanation: '4-6 weeks.' },
    { type: 'multiple_choice', question: 'Serve shoulder rotation speed?', options: ['500°/s', '5,000°/s', '1,000°/s', '2,500°/s'], correctAnswer: 3, explanation: '2,500 degrees/second.' },
    { type: 'multiple_choice', question: 'Proper tennis footwear?', options: ['Court-specific with lateral support', 'Barefoot', 'Running shoes', 'Any trainers'], correctAnswer: 0, explanation: 'Court-specific shoes.' },
    { type: 'multiple_choice', question: 'Match carb intake?', options: ['None', '30-60g/hour', '200g/hour', 'Only water'], correctAnswer: 1, explanation: '30-60g per hour.' },
    { type: 'multiple_choice', question: 'Source of match pressure?', options: ['Self-created (outcome focus)', 'Crowd', 'Weather', 'Opponent'], correctAnswer: 0, explanation: 'Self-generated from results focus.' },
    { type: 'multiple_choice', question: 'Ankle sprain prevention?', options: ['Nothing', 'Proprioceptive training and proper shoes', 'Tape only', 'More running'], correctAnswer: 1, explanation: 'Balance training and court-specific shoes.' },
    { type: 'multiple_choice', question: 'Priority tournaments per season?', options: ['All events', 'None', 'Only 1', '4-6 key events'], correctAnswer: 3, explanation: '4-6 for strategic peaking.' },
    { type: 'multiple_choice', question: 'Jet lag adaptation rule?', options: ['1 week always', '1 day per time zone crossed', 'No effect', 'Caffeine fixes it'], correctAnswer: 1, explanation: '1 day per time zone.' },
  ],
};