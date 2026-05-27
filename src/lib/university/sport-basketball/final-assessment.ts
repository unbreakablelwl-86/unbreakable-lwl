import type { UnitAssessment } from '../types';

export const sportBasketballFinalAssessment: UnitAssessment = {
  unitNumber: 0,
  title: 'Basketball — Final Assessment',
  passMarkPercent: 80,
  pickCount: 15,
  questions: [
    { type: 'multiple_choice', question: 'Jumps per game?', options: ['25', '40-60', '100', '10'], correctAnswer: 1, explanation: '40-60 jumps.' },
    { type: 'multiple_choice', question: 'Sprint distance?', options: ['20m', '50m', '100m', '5-10m'], correctAnswer: 3, explanation: '5-10 metres average.' },
    { type: 'multiple_choice', question: 'Squat target?', options: ['0.5x', '3.0x', '1.0x', '1.5-2.0x BW'], correctAnswer: 3, explanation: '1.5-2.0x bodyweight.' },
    { type: 'multiple_choice', question: 'Top basketball injury?', options: ['ACL', 'Hamstring', 'Ankle sprain', 'Concussion'], correctAnswer: 2, explanation: '25-30% of all injuries.' },
    { type: 'multiple_choice', question: 'VO2max target?', options: ['50-60', '30', '70+', '35-40'], correctAnswer: 0, explanation: '50-60 mL/kg/min.' },
    { type: 'multiple_choice', question: 'Protein needs?', options: ['1.2g/kg', '4g/kg', '0.8g/kg', '1.6-2.2g/kg'], correctAnswer: 3, explanation: '1.6-2.2g/kg daily.' },
    { type: 'multiple_choice', question: 'Clutch ability?', options: ['Luck', 'Cannot develop', 'Trained through process focus', 'Born with it'], correctAnswer: 2, explanation: 'Trained, not innate.' },
    { type: 'multiple_choice', question: 'Off-season gym?', options: ['None', 'Daily', '1x', '3-4x/week'], correctAnswer: 3, explanation: '3-4 sessions for development.' },
    { type: 'multiple_choice', question: 'ACL prevention effect?', options: ['30%', '10%', 'None', '50-70% reduction'], correctAnswer: 3, explanation: '50-70% risk reduction.' },
    { type: 'multiple_choice', question: "Jumper\'s knee rate?", options: ['5%', '75%', '30-45%', '15%'], correctAnswer: 2, explanation: '30-45% of players.' },
    { type: 'multiple_choice', question: 'Game-day carb loading?', options: ['Skip carbs', '8-10g/kg for 24-36h', 'Protein only', 'None'], correctAnswer: 1, explanation: 'Pre-game carb loading.' },
    { type: 'multiple_choice', question: 'Playoff taper?', options: ['Max volume', 'No change', 'Complete rest', 'Volume -20-30%'], correctAnswer: 3, explanation: 'Reduce volume 20-30%.' },
    { type: 'multiple_choice', question: 'Plyometric landing forces?', options: ['3-4x BW', '1-2x BW', '5-7x BW', '10x BW'], correctAnswer: 2, explanation: '5-7x bodyweight.' },
    { type: 'multiple_choice', question: 'Short memory means?', options: ['Forgetting plays', 'Amnesia', 'Poor recall', 'Releasing misses, approaching next shot fresh'], correctAnswer: 3, explanation: 'Forget misses immediately.' },
    { type: 'multiple_choice', question: 'Game fluid loss?', options: ['<500mL', '5L', '1-3 litres', 'None'], correctAnswer: 2, explanation: '1-3 litres per game.' },
  ],
};