import type { UnitAssessment } from '../types';

export const sportSwimmingFinalAssessment: UnitAssessment = {
  unitNumber: 0,
  title: 'Swimming — Final Assessment',
  passMarkPercent: 80,
  pickCount: 15,
  questions: [
    { type: 'multiple_choice', question: 'Water density vs air?', options: ['800x', '10x', '2000x', '100x'], correctAnswer: 0, explanation: '800 times denser.' },
    { type: 'multiple_choice', question: 'Most swim-specific lift?', options: ['Bench', 'Pull-ups', 'Squat', 'Curl'], correctAnswer: 1, explanation: 'Pull-ups mirror catch and pull.' },
    { type: 'multiple_choice', question: 'Greater impact on speed?', options: ['Bigger muscles', 'More propulsion', 'Better suit', 'Less drag'], correctAnswer: 3, explanation: 'Drag reduction > propulsion increase.' },
    { type: 'multiple_choice', question: 'CSS represents?', options: ['Nothing specific', 'Sprint pace', 'Threshold pace', 'Recovery pace'], correctAnswer: 2, explanation: 'Swimming lactate threshold.' },
    { type: 'multiple_choice', question: 'Shoulder injury prevalence?', options: ['40-90%', '10%', '<5%', '25%'], correctAnswer: 0, explanation: '40-90% of competitive swimmers.' },
    { type: 'multiple_choice', question: 'Male swimmer daily calories?', options: ['2,000', '4,000-6,000+', '8,000', '3,500'], correctAnswer: 1, explanation: 'Very high energy demands.' },
    { type: 'multiple_choice', question: 'Common race management error?', options: ['Wrong stroke', 'Too slow', 'Front-loading/fading', 'Missing walls'], correctAnswer: 2, explanation: 'Starting too fast is the most common error.' },
    { type: 'multiple_choice', question: 'Taper improvement?', options: ['0.5%', '10%', '2-3%', 'None'], correctAnswer: 2, explanation: 'Optimal taper gives 2-3%.' },
    { type: 'multiple_choice', question: 'Freestyle kick contribution?', options: ['<1%', '5%', '50%', '10-15%'], correctAnswer: 3, explanation: '10-15% of propulsion.' },
    { type: 'multiple_choice', question: 'Annual shoulder rotations?', options: ['1-2 million', '10M', '10K', '100K'], correctAnswer: 0, explanation: '1-2 million per year.' },
    { type: 'multiple_choice', question: 'Prehab routine duration?', options: ['1hr', '30s', '30min', '5min'], correctAnswer: 3, explanation: 'Five effective minutes.' },
    { type: 'multiple_choice', question: 'Heavy training carb needs?', options: ['2-3g/kg', '6-10g/kg', '4-5g/kg', '15g/kg'], correctAnswer: 1, explanation: '6-10g/kg daily.' },
    { type: 'multiple_choice', question: 'EVF technique importance?', options: ['Minor', 'Only for sprinters', 'Outdated', 'Critical for maximising propulsion'], correctAnswer: 3, explanation: 'Early Vertical Forearm is the most important technique element.' },
    { type: 'multiple_choice', question: 'Breaststroke knee prevalence?', options: ['25%', '<5%', 'Up to 75%', '10%'], correctAnswer: 2, explanation: 'Up to 75% of breaststroke specialists.' },
    { type: 'multiple_choice', question: 'Taper volume reduction?', options: ['90%', '20%', '10%', '40-60%'], correctAnswer: 3, explanation: '40-60% over 2-3 weeks.' },
  ],
};