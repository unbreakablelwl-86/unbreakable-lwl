import type { UnitAssessment } from '../types';

export const sportRugbyUnit1Assessment: UnitAssessment = {
  unitNumber: 1,
  title: 'Rugby — Unit Assessment',
  passMarkPercent: 80,
  pickCount: 10,
  questions: [
    { type: 'multiple_choice', question: 'How many injuries per 1,000 match hours occur in professional rugby?', options: ['20', '40', '80', '150'], correctAnswer: 2, explanation: 'Rugby averages approximately 80 injuries per 1,000 match hours.' },
    { type: 'multiple_choice', question: 'What squat target should elite rugby forwards aim for?', options: ['1.5x BW', '2.0-2.5x BW', '3.0x BW', '1.0x BW'], correctAnswer: 1, explanation: 'Elite forwards target 2.0-2.5x bodyweight squat.' },
    { type: 'multiple_choice', question: 'What is the most important speed quality in rugby?', options: ['Top speed', 'Acceleration (0-10m)', 'Speed endurance', 'Flexibility'], correctAnswer: 1, explanation: 'Most decisive rugby runs cover short distances.' },
    { type: 'multiple_choice', question: 'What VO2max should rugby backs target?', options: ['40 mL/kg/min', '55-60+ mL/kg/min', '70 mL/kg/min', '30 mL/kg/min'], correctAnswer: 1, explanation: 'Backs should target 55-60+ mL/kg/min.' },
    { type: 'multiple_choice', question: 'What causes 50-60% of rugby injuries?', options: ['Scrums', 'Tackles', 'Running', 'Training drills'], correctAnswer: 1, explanation: 'The tackle situation causes 50-60% of all rugby injuries.' },
    { type: 'multiple_choice', question: 'What protein intake is recommended for rugby?', options: ['1.0g/kg', '1.5g/kg', '2.0-2.5g/kg', '4.0g/kg'], correctAnswer: 2, explanation: '2.0-2.5g/kg supports collision-related muscle damage repair.' },
    { type: 'multiple_choice', question: 'What is controlled aggression in rugby?', options: ['Reckless behaviour', 'Intensity channelled into purposeful, legal actions', 'Avoiding contact', 'Only tackling when necessary'], correctAnswer: 1, explanation: 'Controlled aggression is purposeful and legal intensity.' },
    { type: 'multiple_choice', question: 'How does cumulative collision affect season planning?', options: ['It has no effect', 'It creates accumulated damage requiring load management', 'It makes players stronger', 'It only affects forwards'], correctAnswer: 1, explanation: 'Collision damage accumulates and requires careful monitoring.' },
    { type: 'multiple_choice', question: 'What supplement has the strongest evidence for rugby?', options: ['Pre-workout', 'BCAAs', 'Creatine monohydrate', 'Caffeine pills'], correctAnswer: 2, explanation: 'Creatine increases power, lean mass, and repeated sprint ability.' },
    { type: 'multiple_choice', question: 'Why is neck strengthening mandatory for rugby?', options: ['Appearance', 'Reduces concussion risk during tackles', 'Improves breathing', 'Required by rules'], correctAnswer: 1, explanation: 'Strong necks decelerate the head during impacts.' },
    { type: 'multiple_choice', question: 'When should heavy lifting resume post-match?', options: ['Same day', 'Next morning', '48-72 hours later', 'One week later'], correctAnswer: 2, explanation: 'Collision sports require 48-72 hours before heavy lifting.' },
    { type: 'multiple_choice', question: 'What is the next-job mentality?', options: ['Planning for next week', 'Focusing on the immediate next action after setbacks', 'Job searching', 'Next training session focus'], correctAnswer: 1, explanation: 'Direct energy to the next productive action.' },
  ],
};