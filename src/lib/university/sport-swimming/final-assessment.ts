import type { UnitAssessment } from '../types';

export const sportSwimmingFinalAssessment: UnitAssessment = {
  unitNumber: 0,
  title: 'Swimming — Final Assessment',
  passMarkPercent: 80,
  pickCount: 15,
  questions: [
    { type: 'multiple_choice', question: 'Water density vs air?', options: ['10x', '100x', '800x', '2000x'], correctAnswer: 2, explanation: '800 times denser.' },
    { type: 'multiple_choice', question: 'Most swim-specific lift?', options: ['Bench', 'Pull-ups', 'Squat', 'Curl'], correctAnswer: 1, explanation: 'Pull-ups mirror catch and pull.' },
    { type: 'multiple_choice', question: 'Greater impact on speed?', options: ['More propulsion', 'Less drag', 'Bigger muscles', 'Better suit'], correctAnswer: 1, explanation: 'Drag reduction > propulsion increase.' },
    { type: 'multiple_choice', question: 'CSS represents?', options: ['Sprint pace', 'Threshold pace', 'Recovery pace', 'Nothing specific'], correctAnswer: 1, explanation: 'Swimming lactate threshold.' },
    { type: 'multiple_choice', question: 'Shoulder injury prevalence?', options: ['10%', '25%', '40-90%', '<5%'], correctAnswer: 2, explanation: '40-90% of competitive swimmers.' },
    { type: 'multiple_choice', question: 'Male swimmer daily calories?', options: ['2,000', '3,500', '4,000-6,000+', '8,000'], correctAnswer: 2, explanation: 'Very high energy demands.' },
    { type: 'multiple_choice', question: 'Common race management error?', options: ['Too slow', 'Front-loading/fading', 'Wrong stroke', 'Missing walls'], correctAnswer: 1, explanation: 'Starting too fast is the most common error.' },
    { type: 'multiple_choice', question: 'Taper improvement?', options: ['0.5%', '2-3%', '10%', 'None'], correctAnswer: 1, explanation: 'Optimal taper gives 2-3%.' },
    { type: 'multiple_choice', question: 'Freestyle kick contribution?', options: ['<1%', '5%', '10-15%', '50%'], correctAnswer: 2, explanation: '10-15% of propulsion.' },
    { type: 'multiple_choice', question: 'Annual shoulder rotations?', options: ['10K', '100K', '1-2 million', '10M'], correctAnswer: 2, explanation: '1-2 million per year.' },
    { type: 'multiple_choice', question: 'Prehab routine duration?', options: ['30s', '5min', '30min', '1hr'], correctAnswer: 1, explanation: 'Five effective minutes.' },
    { type: 'multiple_choice', question: 'Heavy training carb needs?', options: ['2-3g/kg', '4-5g/kg', '6-10g/kg', '15g/kg'], correctAnswer: 2, explanation: '6-10g/kg daily.' },
    { type: 'multiple_choice', question: 'EVF technique importance?', options: ['Minor', 'Critical for maximising propulsion', 'Only for sprinters', 'Outdated'], correctAnswer: 1, explanation: 'Early Vertical Forearm is the most important technique element.' },
    { type: 'multiple_choice', question: 'Breaststroke knee prevalence?', options: ['10%', '25%', 'Up to 75%', '<5%'], correctAnswer: 2, explanation: 'Up to 75% of breaststroke specialists.' },
    { type: 'multiple_choice', question: 'Taper volume reduction?', options: ['10%', '20%', '40-60%', '90%'], correctAnswer: 2, explanation: '40-60% over 2-3 weeks.' },
  ],
};