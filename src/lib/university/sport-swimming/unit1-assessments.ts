import type { UnitAssessment } from '../types';

export const sportSwimmingUnit1Assessment: UnitAssessment = {
  unitNumber: 1,
  title: 'Swimming — Unit Assessment',
  passMarkPercent: 80,
  pickCount: 10,
  questions: [
    { type: 'multiple_choice', question: 'How much denser is water than air?', options: ['10x', '100x', '800x', '2000x'], correctAnswer: 2, explanation: 'Water is ~800x denser.' },
    { type: 'multiple_choice', question: 'What is the most swim-specific strength exercise?', options: ['Bench press', 'Pull-ups', 'Squats', 'Bicep curls'], correctAnswer: 1, explanation: 'Pull-ups mirror the catch and pull phases.' },
    { type: 'multiple_choice', question: 'What reduces drag most effectively?', options: ['Swimming harder', 'Improving streamlining and technique', 'Bigger muscles', 'Better swimsuit'], correctAnswer: 1, explanation: 'Drag reduction has greater impact than increased propulsion.' },
    { type: 'multiple_choice', question: 'What pace defines CSS?', options: ['Sprint pace', 'Swimming lactate threshold pace', 'Walking pace', 'Random pace'], correctAnswer: 1, explanation: 'CSS is the swimming threshold equivalent.' },
    { type: 'multiple_choice', question: 'What percentage of swimmers experience shoulder problems?', options: ['10%', '25%', '40-90%', 'Less than 5%'], correctAnswer: 2, explanation: '40-90% at some point in their career.' },
    { type: 'multiple_choice', question: 'Daily calories for male competitive swimmers?', options: ['2,000', '3,500', '4,000-6,000+', '8,000'], correctAnswer: 2, explanation: 'High-volume training demands 4,000-6,000+ kcal.' },
    { type: 'multiple_choice', question: 'Most common race error in swimming?', options: ['Too slow start', 'Front-loading and fading', 'Wrong stroke', 'Missing turns'], correctAnswer: 1, explanation: 'Starting too fast leads to dramatic fading.' },
    { type: 'multiple_choice', question: 'Taper performance improvement?', options: ['0.5%', '2-3%', '10%', 'None'], correctAnswer: 1, explanation: '2-3% from optimal tapering.' },
    { type: 'multiple_choice', question: 'Kick contribution to freestyle propulsion?', options: ['Less than 1%', '5%', '10-15%', '50%'], correctAnswer: 2, explanation: '10-15% of propulsive force.' },
    { type: 'multiple_choice', question: 'How many shoulder rotations per year?', options: ['10,000', '100,000', '1-2 million', '10 million'], correctAnswer: 2, explanation: '1-2 million repetitive rotations.' },
    { type: 'multiple_choice', question: 'Pre-swim prehab takes how long?', options: ['30 seconds', '5 minutes', '30 minutes', '1 hour'], correctAnswer: 1, explanation: '5 minutes of targeted work.' },
    { type: 'multiple_choice', question: 'What carb intake for swimmers in heavy training?', options: ['2-3g/kg', '4-5g/kg', '6-10g/kg', '15g/kg'], correctAnswer: 2, explanation: '6-10g/kg/day supports glycogen demands.' },
  ],
};