import type { UnitAssessment } from '../types';

export const sportMMAUnit1Assessment: UnitAssessment = {
  unitNumber: 1,
  title: 'MMA — Unit Assessment',
  passMarkPercent: 80,
  pickCount: 10,
  questions: [
    { type: 'multiple_choice', question: 'How long is a standard MMA round?', options: ['15min', '3min', '5 minutes', '10min'], correctAnswer: 2, explanation: 'MMA rounds are 5 minutes.' },
    { type: 'multiple_choice', question: 'What deadlift target for competitive MMA fighters?', options: ['1.5x BW', '1.0x BW', '3.0x BW', '2.0-2.5x BW'], correctAnswer: 3, explanation: '2.0-2.5x bodyweight.' },
    { type: 'multiple_choice', question: 'Target VO2max for MMA fighters?', options: ['70+', '55-65 mL/kg/min', '35-40', '45-50'], correctAnswer: 1, explanation: '55-65 mL/kg/min.' },
    { type: 'multiple_choice', question: 'Most important flexibility quality for MMA?', options: ['Ankles', 'Shoulders', 'Hamstrings', 'Hip mobility'], correctAnswer: 3, explanation: 'Hips affect kicking, guard, takedowns, and submissions.' },
    { type: 'multiple_choice', question: 'Injuries per 100 fight exposures in pro MMA?', options: ['23-29', '40+', '5-10', '15-20'], correctAnswer: 0, explanation: '23-29 injuries per 100 exposures.' },
    { type: 'multiple_choice', question: 'Recommended protein during fight camp?', options: ['2.0-2.5g/kg', '4.0g/kg', '1.5g/kg', '1.0g/kg'], correctAnswer: 0, explanation: '2.0-2.5g/kg for multi-discipline repair.' },
    { type: 'multiple_choice', question: 'Is fear before a fight weakness?', options: ['Yes', 'No — appropriate response to be managed', 'Always', 'Only for beginners'], correctAnswer: 1, explanation: 'Fear is appropriate and should be managed, not eliminated.' },
    { type: 'multiple_choice', question: 'When does last full spar happen before a fight?', options: ['3 days', 'Day before', '10-14 days before', 'On fight day'], correctAnswer: 2, explanation: '10-14 days allows recovery while maintaining sharpness.' },
    { type: 'multiple_choice', question: 'What grip exercise is vital for MMA?', options: ['Finger extensions', 'Wrist curls', 'Towel pull-ups and fat grip work', 'Hand squeezing only'], correctAnswer: 2, explanation: 'Towel pull-ups and fat grip holds build fight-specific grip.' },
    { type: 'multiple_choice', question: 'How does fatigue affect MMA injury risk?', options: ['Only affects beginners', 'Decreases risk', 'Increases risk 3-4x', 'No effect'], correctAnswer: 2, explanation: 'Fatigue increases injury risk 3-4 times.' },
    { type: 'multiple_choice', question: 'What neuroprotective supplement may help fighters?', options: ['Caffeine', 'BCAAs', 'Creatine monohydrate', 'Vitamin C'], correctAnswer: 2, explanation: 'Creatine may offer neuroprotective benefits.' },
    { type: 'multiple_choice', question: 'Cardinal rule of fight camp final 3 weeks?', options: ['Complete rest', 'Maximum intensity', 'Add new techniques', 'Never try anything new'], correctAnswer: 3, explanation: 'Nothing untested in the final 3 weeks.' },
  ],
};