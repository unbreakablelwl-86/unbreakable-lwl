import type { UnitAssessment } from '../types';

export const sportBasketballFinalAssessment: UnitAssessment = {
  unitNumber: 0,
  title: 'Basketball — Final Assessment',
  passMarkPercent: 80,
  pickCount: 15,
  questions: [
    { type: 'multiple_choice', question: 'Jumps per game?', options: ['10', '25', '40-60', '100'], correctAnswer: 2, explanation: '40-60 jumps.' },
    { type: 'multiple_choice', question: 'Sprint distance?', options: ['20m', '50m', '5-10m', '100m'], correctAnswer: 2, explanation: '5-10 metres average.' },
    { type: 'multiple_choice', question: 'Squat target?', options: ['1.0x', '1.5-2.0x BW', '3.0x', '0.5x'], correctAnswer: 1, explanation: '1.5-2.0x bodyweight.' },
    { type: 'multiple_choice', question: 'Top basketball injury?', options: ['ACL', 'Concussion', 'Ankle sprain', 'Hamstring'], correctAnswer: 2, explanation: '25-30% of all injuries.' },
    { type: 'multiple_choice', question: 'VO2max target?', options: ['35-40', '50-60', '70+', '30'], correctAnswer: 1, explanation: '50-60 mL/kg/min.' },
    { type: 'multiple_choice', question: 'Protein needs?', options: ['0.8g/kg', '1.2g/kg', '1.6-2.2g/kg', '4g/kg'], correctAnswer: 2, explanation: '1.6-2.2g/kg daily.' },
    { type: 'multiple_choice', question: 'Clutch ability?', options: ['Born with it', 'Trained through process focus', 'Luck', 'Cannot develop'], correctAnswer: 1, explanation: 'Trained, not innate.' },
    { type: 'multiple_choice', question: 'Off-season gym?', options: ['None', '1x', '3-4x/week', 'Daily'], correctAnswer: 2, explanation: '3-4 sessions for development.' },
    { type: 'multiple_choice', question: 'ACL prevention effect?', options: ['10%', '30%', '50-70% reduction', 'None'], correctAnswer: 2, explanation: '50-70% risk reduction.' },
    { type: 'multiple_choice', question: 'Jumper\'s knee rate?', options: ['5%', '15%', '30-45%', '75%'], correctAnswer: 2, explanation: '30-45% of players.' },
    { type: 'multiple_choice', question: 'Game-day carb loading?', options: ['None', '8-10g/kg for 24-36h', 'Skip carbs', 'Protein only'], correctAnswer: 1, explanation: 'Pre-game carb loading.' },
    { type: 'multiple_choice', question: 'Playoff taper?', options: ['Max volume', 'Volume -20-30%', 'Complete rest', 'No change'], correctAnswer: 1, explanation: 'Reduce volume 20-30%.' },
    { type: 'multiple_choice', question: 'Plyometric landing forces?', options: ['1-2x BW', '3-4x BW', '5-7x BW', '10x BW'], correctAnswer: 2, explanation: '5-7x bodyweight.' },
    { type: 'multiple_choice', question: 'Short memory means?', options: ['Forgetting plays', 'Releasing misses, approaching next shot fresh', 'Poor recall', 'Amnesia'], correctAnswer: 1, explanation: 'Forget misses immediately.' },
    { type: 'multiple_choice', question: 'Game fluid loss?', options: ['<500mL', '1-3 litres', '5L', 'None'], correctAnswer: 1, explanation: '1-3 litres per game.' },
  ],
};