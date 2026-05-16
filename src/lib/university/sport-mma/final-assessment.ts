import type { UnitAssessment } from '../types';

export const sportMMAFinalAssessment: UnitAssessment = {
  unitNumber: 0,
  title: 'MMA — Final Assessment',
  passMarkPercent: 80,
  pickCount: 15,
  questions: [
    { type: 'multiple_choice', question: 'MMA round length?', options: ['3min', '5min', '10min', '15min'], correctAnswer: 1, explanation: '5 minutes per round.' },
    { type: 'multiple_choice', question: 'Deadlift target for MMA?', options: ['1.5x BW', '2.0-2.5x BW', '3.0x BW', '1.0x BW'], correctAnswer: 1, explanation: '2.0-2.5x bodyweight.' },
    { type: 'multiple_choice', question: 'MMA VO2max target?', options: ['40', '50', '55-65', '70+'], correctAnswer: 2, explanation: '55-65 mL/kg/min.' },
    { type: 'multiple_choice', question: 'Key flexibility area for MMA?', options: ['Hamstrings', 'Hips', 'Shoulders', 'Ankles'], correctAnswer: 1, explanation: 'Hip mobility is paramount.' },
    { type: 'multiple_choice', question: 'Pro MMA injury rate per 100 exposures?', options: ['5-10', '15-20', '23-29', '40+'], correctAnswer: 2, explanation: '23-29 per 100 exposures.' },
    { type: 'multiple_choice', question: 'Fight camp protein needs?', options: ['1.0g/kg', '1.5g/kg', '2.0-2.5g/kg', '4.0g/kg'], correctAnswer: 2, explanation: '2.0-2.5g/kg for recovery.' },
    { type: 'multiple_choice', question: 'Fear before fighting?', options: ['Weakness', 'Normal, appropriate response', 'Should be eliminated', 'Rare'], correctAnswer: 1, explanation: 'Appropriate and manageable.' },
    { type: 'multiple_choice', question: 'Last full spar before fight?', options: ['1 day', '3 days', '10-14 days', 'Fight day'], correctAnswer: 2, explanation: '10-14 days out.' },
    { type: 'multiple_choice', question: 'Most common MMA injury?', options: ['Knee', 'Hand and wrist', 'Shoulder', 'Neck'], correctAnswer: 1, explanation: 'Hand and wrist from striking.' },
    { type: 'multiple_choice', question: 'Fatigue increases MMA injury risk by?', options: ['None', '2x', '3-4x', '10x'], correctAnswer: 2, explanation: '3-4 times increase.' },
    { type: 'multiple_choice', question: 'Creatine benefit for fighters?', options: ['Weight gain only', 'Performance + neuroprotective', 'No benefit', 'Banned'], correctAnswer: 1, explanation: 'Both performance and brain protection.' },
    { type: 'multiple_choice', question: 'Fight camp final 3 weeks rule?', options: ['Go harder', 'Nothing new', 'Rest completely', 'Change coach'], correctAnswer: 1, explanation: 'Never introduce untested elements.' },
    { type: 'multiple_choice', question: 'What controls clinch dominance?', options: ['Cardio', 'Grip strength', 'Speed', 'Height'], correctAnswer: 1, explanation: 'Grip strength underlies clinch control.' },
    { type: 'multiple_choice', question: 'How build functional fighting courage?', options: ['Born with it', 'Progressive exposure', 'Reading', 'Watching fights'], correctAnswer: 1, explanation: 'Graduated exposure at each level.' },
    { type: 'multiple_choice', question: 'Fight week training?', options: ['Hard sparring', 'Minimal — shadow, light pads, mental prep', 'Nothing', 'Heavy weights'], correctAnswer: 1, explanation: 'Conservative, energy-preserving work.' },
  ],
};