import type { UnitAssessment } from '../types';

export const sportMMAUnit1Assessment: UnitAssessment = {
  unitNumber: 1,
  title: 'MMA — Unit Assessment',
  passMarkPercent: 80,
  pickCount: 10,
  questions: [
    { type: 'multiple_choice', question: 'How long is a standard MMA round?', options: ['3min', '5 minutes', '10min', '15min'], correctAnswer: 1, explanation: 'MMA rounds are 5 minutes.' },
    { type: 'multiple_choice', question: 'What deadlift target for competitive MMA fighters?', options: ['1.5x BW', '2.0-2.5x BW', '3.0x BW', '1.0x BW'], correctAnswer: 1, explanation: '2.0-2.5x bodyweight.' },
    { type: 'multiple_choice', question: 'Target VO2max for MMA fighters?', options: ['35-40', '45-50', '55-65 mL/kg/min', '70+'], correctAnswer: 2, explanation: '55-65 mL/kg/min.' },
    { type: 'multiple_choice', question: 'Most important flexibility quality for MMA?', options: ['Hamstrings', 'Hip mobility', 'Shoulders', 'Ankles'], correctAnswer: 1, explanation: 'Hips affect kicking, guard, takedowns, and submissions.' },
    { type: 'multiple_choice', question: 'Injuries per 100 fight exposures in pro MMA?', options: ['5-10', '15-20', '23-29', '40+'], correctAnswer: 2, explanation: '23-29 injuries per 100 exposures.' },
    { type: 'multiple_choice', question: 'Recommended protein during fight camp?', options: ['1.0g/kg', '1.5g/kg', '2.0-2.5g/kg', '4.0g/kg'], correctAnswer: 2, explanation: '2.0-2.5g/kg for multi-discipline repair.' },
    { type: 'multiple_choice', question: 'Is fear before a fight weakness?', options: ['Yes', 'No — appropriate response to be managed', 'Only for beginners', 'Always'], correctAnswer: 1, explanation: 'Fear is appropriate and should be managed, not eliminated.' },
    { type: 'multiple_choice', question: 'When does last full spar happen before a fight?', options: ['Day before', '3 days', '10-14 days before', 'On fight day'], correctAnswer: 2, explanation: '10-14 days allows recovery while maintaining sharpness.' },
    { type: 'multiple_choice', question: 'What grip exercise is vital for MMA?', options: ['Wrist curls', 'Towel pull-ups and fat grip work', 'Finger extensions', 'Hand squeezing only'], correctAnswer: 1, explanation: 'Towel pull-ups and fat grip holds build fight-specific grip.' },
    { type: 'multiple_choice', question: 'How does fatigue affect MMA injury risk?', options: ['No effect', 'Increases risk 3-4x', 'Decreases risk', 'Only affects beginners'], correctAnswer: 1, explanation: 'Fatigue increases injury risk 3-4 times.' },
    { type: 'multiple_choice', question: 'What neuroprotective supplement may help fighters?', options: ['BCAAs', 'Creatine monohydrate', 'Caffeine', 'Vitamin C'], correctAnswer: 1, explanation: 'Creatine may offer neuroprotective benefits.' },
    { type: 'multiple_choice', question: 'Cardinal rule of fight camp final 3 weeks?', options: ['Maximum intensity', 'Never try anything new', 'Complete rest', 'Add new techniques'], correctAnswer: 1, explanation: 'Nothing untested in the final 3 weeks.' },
  ],
};