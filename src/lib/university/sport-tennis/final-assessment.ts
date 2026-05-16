import type { UnitAssessment } from '../types';

export const sportTennisFinalAssessment: UnitAssessment = {
  unitNumber: 0,
  title: 'Tennis — Final Assessment',
  passMarkPercent: 80,
  pickCount: 15,
  questions: [
    { type: 'multiple_choice', question: 'Direction changes per set?', options: ['50', '150', '300-600', '1,000'], correctAnswer: 2, explanation: '300-600 direction changes.' },
    { type: 'multiple_choice', question: 'Key tennis strength quality?', options: ['Arms', 'Rotational power', 'Grip', 'Core only'], correctAnswer: 1, explanation: 'Rotational power through kinetic chain.' },
    { type: 'multiple_choice', question: 'Split step purpose?', options: ['Rest', 'Pre-load for explosive first step', 'Style', 'Balance only'], correctAnswer: 1, explanation: 'Pre-loads muscles for reactive movement.' },
    { type: 'multiple_choice', question: 'Tennis VO2max target?', options: ['35-40', '50-60', '70+', '30'], correctAnswer: 1, explanation: '50-60 mL/kg/min.' },
    { type: 'multiple_choice', question: 'Tennis elbow rate?', options: ['10%', '25%', '40-50%', '75%'], correctAnswer: 2, explanation: '40-50% of recreational players.' },
    { type: 'multiple_choice', question: 'Fluid per changeover?', options: ['Sip', '200-400mL', '1L', 'None'], correctAnswer: 1, explanation: '200-400mL each time.' },
    { type: 'multiple_choice', question: 'Between-point routine?', options: ['Random', 'Release → reflect → prepare', 'Eat', 'Coach talk'], correctAnswer: 1, explanation: 'Three structured steps.' },
    { type: 'multiple_choice', question: 'Off-season duration?', options: ['1 week', '4-6 weeks', '3 months', 'None needed'], correctAnswer: 1, explanation: '4-6 weeks.' },
    { type: 'multiple_choice', question: 'Serve shoulder rotation speed?', options: ['500°/s', '1,000°/s', '2,500°/s', '5,000°/s'], correctAnswer: 2, explanation: '2,500 degrees/second.' },
    { type: 'multiple_choice', question: 'Proper tennis footwear?', options: ['Running shoes', 'Court-specific with lateral support', 'Any trainers', 'Barefoot'], correctAnswer: 1, explanation: 'Court-specific shoes.' },
    { type: 'multiple_choice', question: 'Match carb intake?', options: ['None', '30-60g/hour', '200g/hour', 'Only water'], correctAnswer: 1, explanation: '30-60g per hour.' },
    { type: 'multiple_choice', question: 'Source of match pressure?', options: ['Opponent', 'Self-created (outcome focus)', 'Crowd', 'Weather'], correctAnswer: 1, explanation: 'Self-generated from results focus.' },
    { type: 'multiple_choice', question: 'Ankle sprain prevention?', options: ['Nothing', 'Proprioceptive training and proper shoes', 'More running', 'Tape only'], correctAnswer: 1, explanation: 'Balance training and court-specific shoes.' },
    { type: 'multiple_choice', question: 'Priority tournaments per season?', options: ['All events', '4-6 key events', 'Only 1', 'None'], correctAnswer: 1, explanation: '4-6 for strategic peaking.' },
    { type: 'multiple_choice', question: 'Jet lag adaptation rule?', options: ['No effect', '1 day per time zone crossed', '1 week always', 'Caffeine fixes it'], correctAnswer: 1, explanation: '1 day per time zone.' },
  ],
};