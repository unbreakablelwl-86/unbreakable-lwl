import type { UnitAssessment } from '../types';

export const sportSwimmingUnit1Assessment: UnitAssessment = {
  unitNumber: 1,
  title: 'Swimming — Unit Assessment',
  passMarkPercent: 80,
  pickCount: 10,
  questions: [
    { type: 'multiple_choice', question: 'How much denser is water than air?', options: ['100x', '2000x', '10x', '800x'], correctAnswer: 3, explanation: 'Water is ~800x denser.' },
    { type: 'multiple_choice', question: 'What is the most swim-specific strength exercise?', options: ['Squats', 'Bench press', 'Bicep curls', 'Pull-ups'], correctAnswer: 3, explanation: 'Pull-ups mirror the catch and pull phases.' },
    { type: 'multiple_choice', question: 'What reduces drag most effectively?', options: ['Swimming harder', 'Improving streamlining and technique', 'Bigger muscles', 'Better swimsuit'], correctAnswer: 1, explanation: 'Drag reduction has greater impact than increased propulsion.' },
    { type: 'multiple_choice', question: 'What pace defines CSS?', options: ['Sprint pace', 'Swimming lactate threshold pace', 'Random pace', 'Walking pace'], correctAnswer: 1, explanation: 'CSS is the swimming threshold equivalent.' },
    { type: 'multiple_choice', question: 'What percentage of swimmers experience shoulder problems?', options: ['40-90%', 'Less than 5%', '25%', '10%'], correctAnswer: 0, explanation: '40-90% at some point in their career.' },
    { type: 'multiple_choice', question: 'Daily calories for male competitive swimmers?', options: ['3,500', '8,000', '2,000', '4,000-6,000+'], correctAnswer: 3, explanation: 'High-volume training demands 4,000-6,000+ kcal.' },
    { type: 'multiple_choice', question: 'Most common race error in swimming?', options: ['Too slow start', 'Wrong stroke', 'Front-loading and fading', 'Missing turns'], correctAnswer: 2, explanation: 'Starting too fast leads to dramatic fading.' },
    { type: 'multiple_choice', question: 'Taper performance improvement?', options: ['2-3%', '0.5%', 'None', '10%'], correctAnswer: 0, explanation: '2-3% from optimal tapering.' },
    { type: 'multiple_choice', question: 'Kick contribution to freestyle propulsion?', options: ['Less than 1%', '10-15%', '50%', '5%'], correctAnswer: 1, explanation: '10-15% of propulsive force.' },
    { type: 'multiple_choice', question: 'How many shoulder rotations per year?', options: ['1-2 million', '10,000', '10 million', '100,000'], correctAnswer: 0, explanation: '1-2 million repetitive rotations.' },
    { type: 'multiple_choice', question: 'Pre-swim prehab takes how long?', options: ['1 hour', '30 minutes', '5 minutes', '30 seconds'], correctAnswer: 2, explanation: '5 minutes of targeted work.' },
    { type: 'multiple_choice', question: 'What carb intake for swimmers in heavy training?', options: ['2-3g/kg', '4-5g/kg', '6-10g/kg', '15g/kg'], correctAnswer: 2, explanation: '6-10g/kg/day supports glycogen demands.' },
  ],
};