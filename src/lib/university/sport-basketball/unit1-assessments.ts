import type { UnitAssessment } from '../types';

export const sportBasketballUnit1Assessment: UnitAssessment = {
  unitNumber: 1,
  title: 'Basketball — Unit Assessment',
  passMarkPercent: 80,
  pickCount: 10,
  questions: [
    { type: 'multiple_choice', question: 'Jumps per basketball game?', options: ['20-30', '40-60', '10-15', '100+'], correctAnswer: 1, explanation: '40-60 jumps per game.' },
    { type: 'multiple_choice', question: 'Average sprint distance in basketball?', options: ['100m', '20-30m', '50m', '5-10m'], correctAnswer: 3, explanation: '5-10 metres per sprint.' },
    { type: 'multiple_choice', question: 'Vertical jump squat target?', options: ['1.5-2.0x BW', '1.0x BW', '0.5x BW', '3.0x BW'], correctAnswer: 0, explanation: '1.5-2.0x bodyweight.' },
    { type: 'multiple_choice', question: 'Most common basketball injury?', options: ['Back pain', 'ACL tear', 'Ankle sprain (25-30%)', 'Concussion'], correctAnswer: 2, explanation: 'Ankle sprains account for 25-30%.' },
    { type: 'multiple_choice', question: 'Basketball VO2max target?', options: ['70+', '30', '50-60 mL/kg/min', '35-40'], correctAnswer: 2, explanation: '50-60 mL/kg/min.' },
    { type: 'multiple_choice', question: 'Basketball protein needs?', options: ['4g/kg', '1.6-2.2g/kg', '0.8g/kg', '1.2g/kg'], correctAnswer: 1, explanation: '1.6-2.2g/kg per day.' },
    { type: 'multiple_choice', question: 'Clutch performance is?', options: ['Random luck', 'Innate only', 'Trained through process focus and pressure simulation', 'Only for superstars'], correctAnswer: 2, explanation: 'Trained through deliberate practice.' },
    { type: 'multiple_choice', question: 'Off-season gym frequency?', options: ['3-4x/week', '1x/week', 'None', '7x/week'], correctAnswer: 0, explanation: '3-4 sessions per week for development.' },
    { type: 'multiple_choice', question: 'ACL prevention reduces risk by?', options: ['10%', '100%', '50-70%', '30%'], correctAnswer: 2, explanation: '50-70% reduction.' },
    { type: 'multiple_choice', question: "Jumper\'s knee prevalence?", options: ['5-10%', '15-20%', '70%+', '30-45%'], correctAnswer: 3, explanation: '30-45% of players.' },
    { type: 'multiple_choice', question: 'Pre-game carb loading?', options: ['Only protein', 'Skip carbs', 'No loading needed', '8-10g/kg for 24-36h'], correctAnswer: 3, explanation: '8-10g/kg maximises glycogen.' },
    { type: 'multiple_choice', question: 'Playoff preparation?', options: ['Complete rest', 'No change', 'Max intensity', 'Mini-taper: reduce volume 20-30%'], correctAnswer: 3, explanation: 'Reduced volume, maintained intensity.' },
  ],
};