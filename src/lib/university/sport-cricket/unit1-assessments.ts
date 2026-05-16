import type { UnitAssessment } from '../types';

export const sportCricketUnit1Assessment: UnitAssessment = {
  unitNumber: 1,
  title: 'Cricket — Unit Assessment',
  passMarkPercent: 80,
  pickCount: 10,
  questions: [
    { type: 'multiple_choice', question: 'Forces during fast bowling delivery?', options: ['1-2x BW', '3-4x BW', '5-10x BW', '20x BW'], correctAnswer: 2, explanation: '5-10x bodyweight.' },
    { type: 'multiple_choice', question: 'Primary batting strength quality?', options: ['Arm strength', 'Rotational power', 'Grip', 'Calves'], correctAnswer: 1, explanation: 'Rotational power drives shots.' },
    { type: 'multiple_choice', question: 'Bowler run-up correlates with?', options: ['Accuracy', 'Bowling velocity', 'Economy', 'Fielding'], correctAnswer: 1, explanation: 'Faster run-up = more ball speed.' },
    { type: 'multiple_choice', question: 'Cricket VO2max target?', options: ['30-35', '45-55 mL/kg/min', '70+', '80+'], correctAnswer: 1, explanation: '45-55 mL/kg/min.' },
    { type: 'multiple_choice', question: 'Lumbar stress fracture rate in young bowlers?', options: ['1-5%', '5-10%', '15-25%', '50%+'], correctAnswer: 2, explanation: '15-25% of young fast bowlers.' },
    { type: 'multiple_choice', question: 'Test match bowler calorie needs?', options: ['1,500-2,000', '2,500-3,000', '4,000-4,500+', '6,000+'], correctAnswer: 2, explanation: '4,500+ kcal per day.' },
    { type: 'multiple_choice', question: 'Foundational mental skill in cricket?', options: ['Aggression', 'Concentration management', 'Positive thinking', 'Ignoring pressure'], correctAnswer: 1, explanation: 'Sustained selective attention.' },
    { type: 'multiple_choice', question: 'Off-season cricket break needed?', options: ['No break', 'Complete break for recovery', 'Only 1 day', 'Keep practising'], correctAnswer: 1, explanation: 'Body and mind need full recovery.' },
    { type: 'multiple_choice', question: 'Nordic curls benefit?', options: ['Speed increase', 'Reduce hamstring injuries by 50%', 'Improve batting', 'No benefit'], correctAnswer: 1, explanation: '50% reduction in hamstring injuries.' },
    { type: 'multiple_choice', question: 'Max weekly bowling workload increase?', options: ['50%', 'No more than 20%', '100%', 'No limit'], correctAnswer: 1, explanation: 'Never increase by more than 20%.' },
    { type: 'multiple_choice', question: 'Between-delivery routine includes?', options: ['Nothing', 'Structured reset: movement, breath, focus cue', 'Talking to fielders only', 'Practice shots'], correctAnswer: 1, explanation: 'Reset with trigger movement, breath, cue.' },
    { type: 'multiple_choice', question: 'Minimum rest between multi-day games?', options: ['1 day', '2 days', '4 days for bowlers', '1 week'], correctAnswer: 2, explanation: '4 days minimum for fast bowlers.' },
  ],
};