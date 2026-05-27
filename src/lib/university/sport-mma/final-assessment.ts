import type { UnitAssessment } from '../types';

export const sportMMAFinalAssessment: UnitAssessment = {
  unitNumber: 0,
  title: 'MMA — Final Assessment',
  passMarkPercent: 80,
  pickCount: 15,
  questions: [
    { type: 'multiple_choice', question: 'MMA round length?', options: ['15min', '3min', '10min', '5min'], correctAnswer: 3, explanation: '5 minutes per round.' },
    { type: 'multiple_choice', question: 'Deadlift target for MMA?', options: ['2.0-2.5x BW', '3.0x BW', '1.0x BW', '1.5x BW'], correctAnswer: 0, explanation: '2.0-2.5x bodyweight.' },
    { type: 'multiple_choice', question: 'MMA VO2max target?', options: ['40', '50', '70+', '55-65'], correctAnswer: 3, explanation: '55-65 mL/kg/min.' },
    { type: 'multiple_choice', question: 'Key flexibility area for MMA?', options: ['Hamstrings', 'Shoulders', 'Hips', 'Ankles'], correctAnswer: 2, explanation: 'Hip mobility is paramount.' },
    { type: 'multiple_choice', question: 'Pro MMA injury rate per 100 exposures?', options: ['5-10', '40+', '23-29', '15-20'], correctAnswer: 2, explanation: '23-29 per 100 exposures.' },
    { type: 'multiple_choice', question: 'Fight camp protein needs?', options: ['2.0-2.5g/kg', '1.5g/kg', '4.0g/kg', '1.0g/kg'], correctAnswer: 0, explanation: '2.0-2.5g/kg for recovery.' },
    { type: 'multiple_choice', question: 'Fear before fighting?', options: ['Should be eliminated', 'Weakness', 'Normal, appropriate response', 'Rare'], correctAnswer: 2, explanation: 'Appropriate and manageable.' },
    { type: 'multiple_choice', question: 'Last full spar before fight?', options: ['1 day', '10-14 days', '3 days', 'Fight day'], correctAnswer: 1, explanation: '10-14 days out.' },
    { type: 'multiple_choice', question: 'Most common MMA injury?', options: ['Shoulder', 'Knee', 'Hand and wrist', 'Neck'], correctAnswer: 2, explanation: 'Hand and wrist from striking.' },
    { type: 'multiple_choice', question: 'Fatigue increases MMA injury risk by?', options: ['10x', '3-4x', 'None', '2x'], correctAnswer: 1, explanation: '3-4 times increase.' },
    { type: 'multiple_choice', question: 'Creatine benefit for fighters?', options: ['Weight gain only', 'Performance + neuroprotective', 'No benefit', 'Banned'], correctAnswer: 1, explanation: 'Both performance and brain protection.' },
    { type: 'multiple_choice', question: 'Fight camp final 3 weeks rule?', options: ['Change coach', 'Nothing new', 'Go harder', 'Rest completely'], correctAnswer: 1, explanation: 'Never introduce untested elements.' },
    { type: 'multiple_choice', question: 'What controls clinch dominance?', options: ['Grip strength', 'Height', 'Cardio', 'Speed'], correctAnswer: 0, explanation: 'Grip strength underlies clinch control.' },
    { type: 'multiple_choice', question: 'How build functional fighting courage?', options: ['Born with it', 'Watching fights', 'Progressive exposure', 'Reading'], correctAnswer: 2, explanation: 'Graduated exposure at each level.' },
    { type: 'multiple_choice', question: 'Fight week training?', options: ['Minimal — shadow, light pads, mental prep', 'Nothing', 'Hard sparring', 'Heavy weights'], correctAnswer: 0, explanation: 'Conservative, energy-preserving work.' },
  ],
};